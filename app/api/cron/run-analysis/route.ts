import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { RulesEngine } from '@/lib/services/rules-engine';
import { subDays } from 'date-fns';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const accounts = await prisma.metaAccount.findMany({
      where: { isActive: true },
    });

    const engine = new RulesEngine();
    const results = [];

    for (const account of accounts) {
      const yesterday = subDays(new Date(), 1);
      yesterday.setHours(0, 0, 0, 0);

      // Получаем кампании за вчера
      const campaigns = await prisma.campaignSnapshot.findMany({
        where: {
          metaAccountId: account.id,
          snapshotDate: yesterday,
        },
      });

      for (const campaign of campaigns) {
        // Получаем историю за 7 дней
        const historical = await prisma.campaignSnapshot.findMany({
          where: {
            campaignId: campaign.campaignId,
            snapshotDate: {
              gte: subDays(yesterday, 7),
            },
          },
          orderBy: { snapshotDate: 'asc' },
        });

        // Применяем правила
        const { status, issues, recommendations } = engine.analyzeCampaign(
          campaign,
          historical
        );

        // Сохраняем результат
        await prisma.analysis.create({
          data: {
            metaAccountId: account.id,
            entityType: 'campaign',
            entityId: campaign.campaignId,
            status,
            issues: issues as any,
            recommendations: recommendations as any,
            appliedRules: ['rules_engine_v1'],
          },
        });

        results.push({
          campaignId: campaign.campaignId,
          status,
          issuesCount: issues.length,
        });
      }
    }

    return NextResponse.json({
      message: 'Analysis completed',
      results,
    });
  } catch (error: any) {
    console.error('Cron run-analysis error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
