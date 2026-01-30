import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { subDays } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const metaAccountId = searchParams.get('metaAccountId');
    const statusFilter = searchParams.get('status');

    if (!metaAccountId) {
      return NextResponse.json({ error: 'metaAccountId required' }, { status: 400 });
    }

    const yesterday = subDays(new Date(), 1);
    yesterday.setHours(0, 0, 0, 0);

    // Получаем кампании
    const campaigns = await prisma.campaignSnapshot.findMany({
      where: {
        metaAccountId,
        snapshotDate: yesterday,
      },
      orderBy: {
        spend: 'desc',
      },
    });

    const result = [];

    for (const campaign of campaigns) {
      // Получаем последний анализ
      const analysis = await prisma.analysis.findFirst({
        where: {
          metaAccountId,
          entityType: 'campaign',
          entityId: campaign.campaignId,
        },
        orderBy: {
          analyzedAt: 'desc',
        },
      });

      if (statusFilter && (!analysis || analysis.status !== statusFilter)) {
        continue;
      }

      result.push({
        id: campaign.campaignId,
        name: campaign.campaignName,
        status: campaign.status,
        spend: campaign.spend ? parseFloat(campaign.spend.toString()) : 0,
        conversions: campaign.conversions,
        cpa: campaign.cpa ? parseFloat(campaign.cpa.toString()) : 0,
        analysis: analysis
          ? {
              status: analysis.status,
              issues_count: (analysis.issues as any[]).length,
              recommendations_count: (analysis.recommendations as any[]).length,
            }
          : null,
      });
    }

    return NextResponse.json({ campaigns: result });
  } catch (error: any) {
    console.error('Campaigns API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
