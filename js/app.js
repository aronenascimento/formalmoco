// Elementos DOM
const formScreen = document.getElementById('formScreen');
const confirmationScreen = document.getElementById('confirmationScreen');
const calendarsScreen = document.getElementById('calendarsScreen');
const form = document.getElementById('lunchForm');
const dateSelect = document.getElementById('date');
const coupleSelection = document.getElementById('coupleSelection');
const availabilityMessage = document.getElementById('availabilityMessage');

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    await loadBookings();
    populateDateOptions();
    setupEventListeners();
    setupRealtimeSubscription();
});

// Carregar agendamentos do Supabase
async function loadBookings() {
    try {
        const { data, error } = await supabase
            .from('lunch_bookings')
            .select('*');
        
        if (error) throw error;
        bookings = data || [];
    } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
        bookings = [];
    }
}

// Preencher opções de data
function populateDateOptions() {
    dateSelect.innerHTML = '<option value="">Selecione uma data</option>';
    
    septemberDates.forEach(date => {
        const dateBookings = bookings.filter(b => b.date === date.value);
        const hasDoubleBooking = dateBookings.some(b => b.couples === 'duas');
        const singleBookings = dateBookings.filter(b => b.couples === 'uma');
        const isFullyBooked = hasDoubleBooking || singleBookings.length >= 2;
        
        // Só não mostra a data se estiver completamente ocupada (duas duplas ou uma pessoa para duas duplas)
        if (!isFullyBooked) {
            const option = document.createElement('option');
            option.value = date.value;
            option.textContent = date.text;
            dateSelect.appendChild(option);
        }
    });
}

// Configurar event listeners
function setupEventListeners() {
    // Mostrar/ocultar seleção de dupla
    document.querySelectorAll('input[name="couples"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'uma') {
                coupleSelection.classList.remove('hidden');
            } else {
                coupleSelection.classList.add('hidden');
                availabilityMessage.classList.add('hidden');
            }
        });
    });

    // Verificar disponibilidade ao selecionar data
    dateSelect.addEventListener('change', checkDateAvailability);

    // Submissão do formulário
    form.addEventListener('submit', handleFormSubmit);

    // Botões de navegação
    document.getElementById('viewCalendarsBtn').addEventListener('click', showCalendars);
    document.getElementById('viewCalendarsFromConfirmation').addEventListener('click', showCalendars);
    document.getElementById('backToForm').addEventListener('click', showForm);
}

// Verificar disponibilidade da data
function checkDateAvailability() {
    const selectedDate = dateSelect.value;
    const couplesSection = document.querySelector('input[name="couples"]').closest('div').parentElement;
    
    if (selectedDate) {
        const dateBookings = bookings.filter(b => b.date === selectedDate);
        const hasDoubleBooking = dateBookings.some(b => b.couples === 'duas');
        const singleBookings = dateBookings.filter(b => b.couples === 'uma');
        
        if (hasDoubleBooking || singleBookings.length >= 2) {
            // Data completamente ocupada - não deveria aparecer na lista
            availabilityMessage.classList.add('hidden');
            couplesSection.classList.remove('hidden');
            coupleSelection.classList.add('hidden');
        } else if (singleBookings.length === 1) {
            // Uma dupla já reservada
            const bookedCouple = singleBookings[0].which_couple;
            const availableCouple = bookedCouple === 'sisteres' ? 'Elderes' : 'Sisteres';
            
            // Mostrar apenas a mensagem informativa
            availabilityMessage.classList.remove('hidden');
            availabilityMessage.querySelector('p').textContent = 
                `Essa data está disponível para almoço apenas com ${availableCouple}`;
            
            // Esconder TODAS as opções de seleção
            couplesSection.classList.add('hidden');
            coupleSelection.classList.add('hidden');
            
            // Pré-selecionar automaticamente nos bastidores
            document.querySelector('input[name="couples"][value="uma"]').checked = true;
            const availableCoupleValue = bookedCouple === 'sisteres' ? 'elderes' : 'sisteres';
            document.querySelector(`input[name="whichCouple"][value="${availableCoupleValue}"]`).checked = true;
        } else {
            // Data completamente livre
            availabilityMessage.classList.add('hidden');
            couplesSection.classList.remove('hidden');
            coupleSelection.classList.add('hidden');
            
            // Limpar seleções
            document.querySelectorAll('input[name="couples"]').forEach(radio => radio.checked = false);
            document.querySelectorAll('input[name="whichCouple"]').forEach(radio => radio.checked = false);
        }
    }
}

// Submissão do formulário
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    const name = formData.get('name');
    const date = formData.get('date');
    const couples = formData.get('couples');
    const whichCouple = formData.get('whichCouple');
    
    // Validação
    if (!name || !date || !couples) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    if (couples === 'uma' && !whichCouple) {
        alert('Por favor, selecione para qual dupla você quer dar almoço.');
        return;
    }
    
    try {
        const booking = {
            name: name,
            date: date,
            couples: couples,
            which_couple: couples === 'duas' ? null : whichCouple,
            created_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from('lunch_bookings')
            .insert([booking])
            .select();
        
        if (error) throw error;
        
        // Atualizar lista local
        bookings.push(data[0]);
        
        // Mostrar confirmação
        showConfirmation(booking);
        
    } catch (error) {
        console.error('Erro ao salvar agendamento:', error);
        alert('Erro ao agendar almoço. Tente novamente.');
    }
}

// Mostrar tela de confirmação
function showConfirmation(booking) {
    const dateText = septemberDates.find(d => d.value === booking.date)?.text || booking.date;
    const coupleText = booking.couples === 'duas' ? 'Ambas as duplas (Sisteres e Elderes)' : 
                      booking.which_couple === 'sisteres' ? 'Sisteres' : 'Elderes';
    
    document.getElementById('confirmationDetails').innerHTML = `
        <div class="space-y-2">
            <p><strong>Nome:</strong> ${booking.name}</p>
            <p><strong>Data:</strong> ${dateText}</p>
            <p><strong>Dupla(s):</strong> ${coupleText}</p>
        </div>
    `;
    
    formScreen.classList.add('hidden');
    confirmationScreen.classList.remove('hidden');
    calendarsScreen.classList.add('hidden');
}

// Mostrar calendários
function showCalendars() {
    updateCalendars();
    formScreen.classList.add('hidden');
    confirmationScreen.classList.add('hidden');
    calendarsScreen.classList.remove('hidden');
}

// Mostrar formulário
function showForm() {
    formScreen.classList.remove('hidden');
    confirmationScreen.classList.add('hidden');
    calendarsScreen.classList.add('hidden');
    
    // Limpar formulário
    form.reset();
    coupleSelection.classList.add('hidden');
    availabilityMessage.classList.add('hidden');
    populateDateOptions();
}

// Atualizar calendários
function updateCalendars() {
    const sisteresCalendar = document.getElementById('sisteresCalendar');
    const elderesCalendar = document.getElementById('elderesCalendar');
    
    sisteresCalendar.innerHTML = '';
    elderesCalendar.innerHTML = '';
    
    septemberDates.forEach(date => {
        const dateBookings = bookings.filter(b => b.date === date.value);
        
        // Calendário Sisteres
        const sisteresBooking = dateBookings.find(b => 
            b.couples === 'duas' || (b.couples === 'uma' && b.which_couple === 'sisteres')
        );
        
        const sisteresDiv = document.createElement('div');
        sisteresDiv.className = `p-3 rounded-lg border ${sisteresBooking ? 'bg-pink-50 border-pink-200' : 'bg-gray-50 border-gray-200'}`;
        sisteresDiv.innerHTML = `
            <div class="text-sm font-medium">${date.text.split(',')[1].trim()}</div>
            <div class="text-xs ${sisteresBooking ? 'text-pink-700' : 'text-gray-500'}">
                ${sisteresBooking ? `${sisteresBooking.name}` : 'Disponível'}
            </div>
        `;
        sisteresCalendar.appendChild(sisteresDiv);
        
        // Calendário Elderes
        const elderesBooking = dateBookings.find(b => 
            b.couples === 'duas' || (b.couples === 'uma' && b.which_couple === 'elderes')
        );
        
        const elderesDiv = document.createElement('div');
        elderesDiv.className = `p-3 rounded-lg border ${elderesBooking ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`;
        elderesDiv.innerHTML = `
            <div class="text-sm font-medium">${date.text.split(',')[1].trim()}</div>
            <div class="text-xs ${elderesBooking ? 'text-blue-700' : 'text-gray-500'}">
                ${elderesBooking ? `${elderesBooking.name}` : 'Disponível'}
            </div>
        `;
        elderesCalendar.appendChild(elderesDiv);
    });
}

// Configurar subscription em tempo real
function setupRealtimeSubscription() {
    supabase
        .channel('lunch_bookings_changes')
        .on('postgres_changes', 
            { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'lunch_bookings' 
            },
            (payload) => {
                console.log('Novo agendamento:', payload);
                const newBooking = payload.new;
                bookings.push(newBooking);
                populateDateOptions();
                checkDateAvailability();
                if (!calendarsScreen.classList.contains('hidden')) {
                    updateCalendars();
                }
            }
        )
        .on('postgres_changes', 
            { 
                event: 'UPDATE', 
                schema: 'public', 
                table: 'lunch_bookings' 
            },
            (payload) => {
                console.log('Agendamento atualizado:', payload);
                const updatedBooking = payload.new;
                const index = bookings.findIndex(b => b.id === updatedBooking.id);
                if (index !== -1) {
                    bookings[index] = updatedBooking;
                    populateDateOptions();
                    checkDateAvailability();
                    if (!calendarsScreen.classList.contains('hidden')) {
                        updateCalendars();
                    }
                }
            }
        )
        .on('postgres_changes', 
            { 
                event: 'DELETE', 
                schema: 'public', 
                table: 'lunch_bookings' 
            },
            (payload) => {
                console.log('Agendamento removido:', payload);
                const deletedId = payload.old.id;
                bookings = bookings.filter(b => b.id !== deletedId);
                populateDateOptions();
                checkDateAvailability();
                if (!calendarsScreen.classList.contains('hidden')) {
                    updateCalendars();
                }
            }
        )
        .subscribe((status) => {
            console.log('Status da conexão realtime:', status);
        });
}

