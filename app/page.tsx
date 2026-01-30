export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold mb-4">
          Meta Ads AI Assistant
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Автоматический анализ и оптимизация рекламных кампаний Meta Ads
        </p>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Проект в разработке. Следующие шаги:
          </p>
          <ul className="text-left text-sm text-gray-600 space-y-2">
            <li>✅ Инициализация Next.js проекта</li>
            <li>⏳ Настройка Prisma и Supabase</li>
            <li>⏳ Интеграция с Meta Marketing API</li>
            <li>⏳ Rules Engine на основе META ADS PLAYBOOK</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
