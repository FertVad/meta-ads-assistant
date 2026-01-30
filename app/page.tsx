export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-3xl mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Meta Ads AI Assistant
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Автоматический анализ и оптимизация рекламных кампаний Meta Ads
          </p>
          <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            MVP Ready
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Реализованные компоненты</h2>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>✅ Next.js 16 проект с TypeScript и Tailwind CSS v4</li>
            <li>✅ Neon PostgreSQL с Prisma ORM (8 моделей данных)</li>
            <li>✅ Meta Marketing API v19.0 клиент</li>
            <li>✅ Rules Engine на основе META ADS PLAYBOOK</li>
            <li>✅ Sync Service для автоматической синхронизации данных</li>
            <li>✅ AI Service абстракция (NoAI/Anthropic/OpenAI)</li>
            <li>✅ API endpoints для Dashboard и Campaigns</li>
            <li>✅ Vercel Cron Jobs (sync: 2:00 AM, analysis: 3:00 AM)</li>
            <li>✅ GitHub интеграция с auto-deployment</li>
          </ul>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3 text-blue-900">Следующие шаги для активации</h2>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li>Настроить Meta OAuth Redirect URI в Meta for Developers</li>
            <li>Отключить Vercel Deployment Protection (если нужен публичный доступ)</li>
            <li>Подключить Meta рекламный аккаунт через OAuth</li>
            <li>Дождаться первой автоматической синхронизации (или запустить вручную)</li>
          </ol>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3">Доступные API Endpoints</h2>
          <div className="text-sm text-gray-600 space-y-1 font-mono">
            <div>GET /api/dashboard?metaAccountId=xxx</div>
            <div>GET /api/campaigns?metaAccountId=xxx</div>
            <div>GET /api/campaigns/[id]?metaAccountId=xxx</div>
            <div>POST /api/cron/sync-data</div>
            <div>POST /api/cron/run-analysis</div>
          </div>
        </div>
      </div>
    </div>
  );
}
