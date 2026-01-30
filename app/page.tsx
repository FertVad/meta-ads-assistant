'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();

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

        {/* Auth Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-center">
          {status === 'loading' && (
            <p className="text-gray-500">Загрузка...</p>
          )}

          {status === 'unauthenticated' && (
            <div>
              <p className="text-gray-600 mb-4">
                Подключите свой рекламный аккаунт Meta для начала работы
              </p>
              <button
                onClick={() => signIn('facebook')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Войти через Meta
              </button>
            </div>
          )}

          {status === 'authenticated' && session?.user && (
            <div>
              <div className="flex items-center justify-center gap-3 mb-4">
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div className="text-left">
                  <p className="font-semibold">{session.user.name}</p>
                  <p className="text-sm text-gray-500">{session.user.email}</p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Выйти
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Реализованные компоненты</h2>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>✅ Next.js 16 проект с TypeScript и Tailwind CSS v4</li>
            <li>✅ Neon PostgreSQL с Prisma ORM (12 моделей данных)</li>
            <li>✅ Meta Marketing API v19.0 клиент</li>
            <li>✅ NextAuth с Meta OAuth интеграцией</li>
            <li>✅ Rules Engine на основе META ADS PLAYBOOK</li>
            <li>✅ Sync Service для автоматической синхронизации данных</li>
            <li>✅ AI Service абстракция (NoAI/Anthropic/OpenAI)</li>
            <li>✅ API endpoints для Dashboard и Campaigns</li>
            <li>✅ Vercel Cron Jobs (sync: 2:00 AM, analysis: 3:00 AM)</li>
            <li>✅ GitHub интеграция с auto-deployment</li>
          </ul>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3 text-blue-900">Следующие шаги</h2>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li>Войдите через Meta для подключения рекламного аккаунта</li>
            <li>Система автоматически синхронизирует данные кампаний</li>
            <li>Анализ выполняется автоматически каждый день в 3:00 AM</li>
            <li>Просматривайте результаты через API endpoints</li>
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
