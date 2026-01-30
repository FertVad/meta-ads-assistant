# Meta Ads AI Assistant

AI-powered сервис для автоматического анализа и оптимизации рекламных кампаний Meta Ads (Facebook/Instagram).

## 🎯 Основные возможности

- **Rule-based анализ** кампаний по правилам META ADS PLAYBOOK
- **Автоматическая синхронизация** данных из Meta Marketing API
- **Dashboard** с визуализацией проблем и метрик
- **Рекомендации по оптимизации** на основе performance data
- **Готовность к AI интеграции** (Anthropic Claude / OpenAI)

## 🛠 Технологический стек

- **Frontend & Backend**: Next.js 14+ (App Router), TypeScript
- **Database**: Neon PostgreSQL
- **ORM**: Prisma
- **State Management**: React Query (TanStack Query)
- **Styling**: Tailwind CSS v4
- **Deployment**: Vercel (с Cron Jobs)

## 📦 Установка

### 1. Клонирование и установка зависимостей

```bash
cd meta-ads-assistant
npm install
```

### 2. Настройка переменных окружения

Скопируйте `.env.example` в `.env.local`:

```bash
cp .env.example .env.local
```

Заполните необходимые переменные:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://..."

# Meta API
META_APP_ID="your-app-id"
META_APP_SECRET="your-app-secret"
META_REDIRECT_URI="http://localhost:3000/api/meta/oauth/callback"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="[generate-with: openssl rand -base64 32]"

# AI Service (опционально)
AI_PROVIDER="none"  # или "anthropic" / "openai"

# Vercel Cron Secret
CRON_SECRET="[random-string]"
```

### 3. Создание таблиц в базе данных

```bash
npx prisma db push
npx prisma generate
```

### 4. Запуск development сервера

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## 📐 Структура проекта

```
meta-ads-assistant/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Dashboard pages
│   ├── api/                # API routes
│   │   ├── campaigns/      # Campaigns API
│   │   ├── dashboard/      # Dashboard API
│   │   └── cron/           # Cron jobs
│   └── providers.tsx       # React Query provider
├── components/             # React компоненты
│   ├── dashboard/
│   └── ui/
├── lib/
│   ├── db/                 # Prisma client
│   ├── services/           # Business logic
│   │   ├── meta-api.ts     # Meta Marketing API client
│   │   ├── rules-engine.ts # Rule-based analysis
│   │   ├── sync-service.ts # Data synchronization
│   │   └── ai-service.ts   # AI abstraction
│   └── types.ts
└── prisma/
    └── schema.prisma       # Database schema
```

## 🔄 Prisma Schema

База данных содержит следующие модели:

- **User** - пользователи системы
- **MetaAccount** - Meta рекламные аккаунты
- **CampaignSnapshot** - снимки кампаний (временные ряды)
- **AdsetSnapshot** - снимки ad sets
- **AdSnapshot** - снимки ads
- **Creative** - креативы
- **Analysis** - результаты анализа и рекомендации

## 🤖 Автоматическая синхронизация (Vercel Cron)

Сервис использует Vercel Cron Jobs для автоматической работы:

- **Sync Data** (`/api/cron/sync-data`) - каждый день в 2:00 AM
- **Run Analysis** (`/api/cron/run-analysis`) - каждый день в 3:00 AM

Защита cron endpoints через `CRON_SECRET`.

## 📊 API Endpoints

### Dashboard
```
GET /api/dashboard?metaAccountId=xxx
```

### Campaigns
```
GET /api/campaigns?metaAccountId=xxx&status=critical
GET /api/campaigns/[id]?metaAccountId=xxx
```

## 🚀 Deployment на Vercel

1. Подключите проект к Vercel:
```bash
vercel
```

2. Добавьте Environment Variables в Vercel Dashboard:
   - `DATABASE_URL`
   - `META_APP_ID`
   - `META_APP_SECRET`
   - `NEXTAUTH_SECRET`
   - `CRON_SECRET`

3. Deploy:
```bash
vercel --prod
```

## 🔮 Будущие интеграции

### AI Service (готово к подключению)

Сервис готов к интеграции с AI провайдерами:

```typescript
// Для включения Anthropic Claude
AI_PROVIDER="anthropic"
ANTHROPIC_API_KEY="sk-ant-..."

// Для включения OpenAI
AI_PROVIDER="openai"
OPENAI_API_KEY="sk-..."
```

## 📝 Доступные команды

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Prisma
npm run db:push      # Применить schema к БД
npm run db:migrate   # Создать миграцию
npm run db:studio    # Prisma Studio GUI
```

## 📖 META ADS PLAYBOOK Rules

Движок анализа работает на основе правил из META ADS PLAYBOOK:

- **Правило 2.3**: Learning Phase - минимум CPA × 2 расходов
- **Правило 7**: Временные окна - минимум 72 часа для анализа
- **Правило 4.4**: Анализ креативов - проверка hook quality
- **Правило 4.5.1**: Stop Rate - минимум 30%
- **Правило 4.3**: Meta-native контент

## 🤝 Contribution

Для разработки:

1. Создайте feature branch
2. Сделайте изменения
3. Запустите тесты (когда будут добавлены)
4. Создайте Pull Request

## 📄 License

MIT

## 🆘 Поддержка

Если у вас возникли вопросы:
- Откройте issue в GitHub
- Посмотрите документацию META ADS PLAYBOOK
- Проверьте логи в Vercel Dashboard

---

**Построено с ❤️ используя Next.js, Prisma и Neon**
