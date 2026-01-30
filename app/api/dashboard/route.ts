import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { subDays } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const metaAccountId = searchParams.get('metaAccountId');

    if (!metaAccountId) {
      return NextResponse.json({ error: 'metaAccountId required' }, { status: 400 });
    }

    // Проверяем, что аккаунт существует
    const account = await prisma.metaAccount.findFirst({
      where: {
        id: metaAccountId,
      },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const yesterday = subDays(new Date(), 1);
    yesterday.setHours(0, 0, 0, 0);

    // Получаем последние анализы
    const analyses = await prisma.analysis.findMany({
      where: {
        metaAccountId,
        analyzedAt: {
          gte: yesterday,
        },
      },
    });

    // Подсчёт статусов
    const statusCounts = {
      ok: 0,
      warning: 0,
      critical: 0,
    };

    analyses.forEach((a) => {
      if (a.status in statusCounts) {
        statusCounts[a.status as keyof typeof statusCounts]++;
      }
    });

    // Топ проблем
    const issueTypes: Record<string, number> = {};
    analyses.forEach((a) => {
      const issues = a.issues as any[];
      issues.forEach((issue) => {
        const type = issue.type || 'unknown';
        issueTypes[type] = (issueTypes[type] || 0) + 1;
      });
    });

    const topIssues = Object.entries(issueTypes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));

    return NextResponse.json({
      status_summary: statusCounts,
      top_issues: topIssues,
      total_campaigns: analyses.length,
    });
  } catch (error: any) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
