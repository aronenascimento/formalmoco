# Sistema de Agendamento de Almoços

Um sistema web para agendamento de almoços para duplas de missionários, desenvolvido para o mês de setembro de 2025.

## 📋 Funcionalidades

- **Agendamento de Almoços**: Permite que membros agendem almoços para uma ou duas duplas
- **Calendários Visuais**: Visualização separada dos calendários das Sisteres e Elderes
- **Verificação de Disponibilidade**: Sistema inteligente que verifica disponibilidade em tempo real
- **Atualizações em Tempo Real**: Interface atualizada automaticamente quando novos agendamentos são feitos
- **Interface Responsiva**: Design adaptável para desktop e dispositivos móveis

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Estilização**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Real-time subscriptions)
- **Fontes**: Google Fonts (Inter)

## 📁 Estrutura do Projeto

```
agendamento-almocos/
├── index.html          # Página principal
├── js/
│   ├── config.js       # Configurações do Supabase
│   ├── data.js         # Dados das datas e variáveis globais
│   └── app.js          # Lógica principal da aplicação
├── README.md           # Documentação
└── .gitignore          # Arquivos ignorados pelo Git
```

## 🚀 Como Usar

### Pré-requisitos

- Navegador web moderno
- Conexão com a internet (para CDNs e Supabase)

### Instalação

1. Clone este repositório:
```bash
git clone https://github.com/seu-usuario/agendamento-almocos.git
```

2. Navegue até o diretório:
```bash
cd agendamento-almocos
```

3. Abra o arquivo `index.html` em seu navegador ou use um servidor local:
```bash
# Usando Python
python -m http.server 8000

# Usando Node.js (npx)
npx serve .

# Usando PHP
php -S localhost:8000
```

4. Acesse `http://localhost:8000` no seu navegador

## ⚙️ Configuração do Banco de Dados

O projeto utiliza Supabase como backend. A tabela `lunch_bookings` deve ter a seguinte estrutura:

```sql
CREATE TABLE lunch_bookings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    couples VARCHAR(10) NOT NULL CHECK (couples IN ('uma', 'duas')),
    which_couple VARCHAR(10) CHECK (which_couple IN ('sisteres', 'elderes')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Configuração das Credenciais

As credenciais do Supabase estão no arquivo `js/config.js`. Para usar em produção, considere:

1. Criar um novo projeto no Supabase
2. Atualizar as credenciais no arquivo `config.js`
3. Configurar as políticas de segurança (RLS) no Supabase

## 📱 Como Funciona

### Agendamento

1. **Nome**: Usuário informa seu nome
2. **Data**: Seleciona uma data disponível em setembro de 2025
3. **Duplas**: Escolhe se pode dar almoço para uma ou duas duplas
4. **Seleção Específica**: Se escolher "uma dupla", seleciona entre Sisteres ou Elderes

### Lógica de Disponibilidade

- **Data Livre**: Todas as opções disponíveis
- **Uma Dupla Ocupada**: Mostra apenas a dupla disponível
- **Ambas Ocupadas**: Data não aparece na lista

### Calendários

- **Sisteres**: Calendário em tons de rosa
- **Elderes**: Calendário em tons de azul
- **Status Visual**: Diferenciação clara entre datas ocupadas e disponíveis

## 🎨 Design

- **Paleta de Cores**: Azul e rosa para diferenciação das duplas
- **Tipografia**: Inter (Google Fonts)
- **Layout**: Design limpo e moderno com gradientes suaves
- **Responsividade**: Adaptável a diferentes tamanhos de tela

## 🔄 Atualizações em Tempo Real

O sistema utiliza as funcionalidades de real-time do Supabase para:
- Atualizar a lista de datas disponíveis
- Refresh automático dos calendários
- Sincronização entre múltiplos usuários

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte ou dúvidas, abra uma issue no repositório do GitHub.

---

Desenvolvido com ❤️ para facilitar o agendamento de almoços missionários.

