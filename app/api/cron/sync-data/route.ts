import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { SyncService } from '@/lib/services/sync-service';

export async function GET(request: NextRequest) {
  // Проверяем секрет для защиты от несанкционированного доступа
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const accounts = await prisma.metaAccount.findMany({
      where: { isActive: true },
    });

    const syncService = new SyncService();
    const results = [];

    for (const account of accounts) {
      try {
        await syncService.syncAccountData(account.id);
        results.push({ accountId: account.accountId, status: 'success' });
      } catch (error: any) {
        console.error(`Failed to sync account ${account.accountId}:`, error);
        results.push({ accountId: account.accountId, status: 'error', error: error.message });
      }
    }

    return NextResponse.json({
      message: 'Sync completed',
      results,
    });
  } catch (error: any) {
    console.error('Cron sync-data error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
