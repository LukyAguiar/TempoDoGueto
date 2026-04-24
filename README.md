# AgendaFácil — SaaS de Agendamentos

Sistema de agendamento online para salões e barbearias. Cada negócio tem uma página pública com fluxo completo de agendamento.

---

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **PostgreSQL** + **Prisma ORM**
- **Auth.js v5** (Credentials)
- **Zod** + **React Hook Form**

---

## Primeiros passos

### 1. Instale as dependências

```bash
npm install
```

> O `npm install` já roda `prisma generate` automaticamente via `postinstall`.

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env   # Linux/Mac
copy .env.example .env  # Windows
```

O `.env` já vem pré-configurado para o Docker abaixo. Só altere o `AUTH_SECRET`:

```
AUTH_SECRET="qualquer-string-longa-e-aleatoria-aqui"
```

### 3. Suba o banco de dados com Docker

Requer [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado.

```bash
docker-compose up -d
```

Isso sobe um PostgreSQL na porta 5432 com usuário `postgres` / senha `postgres`.

### 4. Execute as migrations

```bash
npm run db:migrate
# quando perguntar o nome da migration, escreva: init
```

### 5. (Opcional) Popule com dados de teste

```bash
npm run db:seed
```

Cria:
- Usuário: `joao@teste.com` / senha: `senha123`
- Negócio com 4 serviços e disponibilidade configurada
- Página pública acessível em `http://localhost:3000/barbearia-do-joao`

### 6. Inicie o servidor

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

---

## Estrutura do projeto

```
src/
├── app/
│   ├── (auth)/              # Login e registro
│   ├── (dashboard)/         # Área privada do dono
│   ├── (public)/[slug]/     # Página pública do negócio
│   └── api/
│       ├── auth/            # Handler do Auth.js
│       └── slots/           # GET /api/slots?slug=&serviceId=&date=
│
├── components/
│   ├── ui/                  # Input, Button, Textarea, Sidebar
│   ├── forms/               # LoginForm, RegisterForm, BusinessForm, ServiceForm
│   ├── business/            # AvailabilityGrid, BlockedSlotManager, ServiceList, AppointmentList
│   └── booking/             # BookingFlow (fluxo público de agendamento)
│
├── lib/
│   ├── auth/                # Configuração Auth.js
│   ├── prisma/              # Singleton PrismaClient
│   ├── utils/               # cn(), formatCurrency(), slugify()
│   └── dates/               # timeToMinutes, generateTimeSlots, hasTimeOverlap...
│
├── server/
│   ├── actions/             # Server Actions (auth, business, service, availability, appointment)
│   ├── repositories/        # Queries Prisma isoladas por entidade
│   └── services/            # slots.service.ts (lógica de cálculo de slots)
│
├── schemas/                 # Schemas Zod (auth, business, service, appointment)
└── types/                   # Types globais, enums e labels
```

---

## Fluxo principal

### Dono do negócio
1. `/register` → cria conta
2. `/login` → autentica
3. `/business` → cadastra nome, slug, endereço, bio
4. `/services` → adiciona serviços (nome, duração, preço)
5. `/availability` → configura horários semanais + bloqueios manuais
6. `/appointments` → visualiza e gerencia agendamentos

### Cliente final
1. Acessa `/{slug}` (ex: `/barbearia-do-joao`)
2. Escolhe um serviço
3. Escolhe uma data
4. Escolhe um horário disponível
5. Preenche nome e telefone
6. Confirma o agendamento

---

## Regras de negócio implementadas

- Cada usuário tem no máximo 1 negócio
- Slug único por negócio, usado na URL pública
- Disponibilidade semanal configurável (por dia da semana)
- Bloqueios manuais por data/hora
- Slots calculados com base na duração do serviço
- Sem sobreposição com agendamentos existentes (status != CANCELED)
- Sem slots no passado
- Revalidação do slot no momento do envio (evita race condition)
- Status do agendamento: PENDING → CONFIRMED → COMPLETED / CANCELED

---

## Próximas evoluções (pós-MVP)

- [ ] Notificações por WhatsApp/email (Twilio, Resend)
- [ ] Múltiplos profissionais por negócio
- [ ] Upload de imagem para logo
- [ ] Painel de relatórios (receita, serviços mais populares)
- [ ] Planos e cobrança (Stripe)
- [ ] App mobile (React Native)
