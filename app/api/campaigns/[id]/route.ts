import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { subDays } from 'date-fns';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const metaAccountId = searchParams.get('metaAccountId');

    if (!metaAccountId) {
      return NextResponse.json({ error: 'metaAccountId required' }, { status: 400 });
    }

    const { id: campaignId } = await params;

    // Получаем последний анализ
    const analysis = await prisma.analysis.findFirst({
      where: {
        metaAccountId,
        entityType: 'campaign',
        entityId: campaignId,
      },
      orderBy: {
        analyzedAt: 'desc',
      },
    });

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    // Получаем историю метрик (7 дней)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const history = await prisma.campaignSnapshot.findMany({
      where: {
        campaignId,
        snapshotDate: {
          gte: subDays(today, 7),
        },
      },
      orderBy: {
        snapshotDate: 'asc',
      },
    });

    return NextResponse.json({
      status: analysis.status,
      issues: analysis.issues,
      recommendations: analysis.recommendations,
      llm_explanation: analysis.llmAnalysis,
      metrics_history: history.map((h) => ({
        date: h.snapshotDate.toISOString().split('T')[0],
        spend: h.spend ? parseFloat(h.spend.toString()) : 0,
        conversions: h.conversions,
        cpa: h.cpa ? parseFloat(h.cpa.toString()) : 0,
      })),
    });
  } catch (error: any) {
    console.error('Campaign detail API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
