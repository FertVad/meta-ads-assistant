import { Decimal } from '@prisma/client/runtime/library';

export enum Severity {
  OK = 'ok',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export enum ActionType {
  WAIT = 'wait',
  STOP = 'stop',
  DUPLICATE = 'duplicate',
  CHANGE_CREATIVE = 'change_creative',
  INCREASE_BUDGET = 'increase_budget',
}

export interface Issue {
  type: string;
  severity: Severity;
  description: string;
  metricValue?: number;
}

export interface Recommendation {
  action: ActionType;
  reason: string;
  priority: number; // 1-5
  parameters?: Record<string, any>;
}

interface CampaignData {
  dailyBudget?: Decimal | null;
  spend?: Decimal | null;
  cpa?: Decimal | null;
  conversions?: number | null;
  impressions?: number | null;
  clicks?: number | null;
}

interface HistoricalData {
  cpa?: Decimal | null;
  spend?: Decimal | null;
}

export class RulesEngine {
  /**
   * Анализ кампании по правилам META ADS PLAYBOOK
   */
  analyzeCampaign(
    campaignData: CampaignData,
    historicalData: HistoricalData[]
  ): {
    status: Severity;
    issues: Issue[];
    recommendations: Recommendation[];
  } {
    const issues: Issue[] = [];
    const recommendations: Recommendation[] = [];

    const budget = campaignData.dailyBudget ? parseFloat(campaignData.dailyBudget.toString()) : 0;
    const spend = campaignData.spend ? parseFloat(campaignData.spend.toString()) : 0;
    const cpa = campaignData.cpa ? parseFloat(campaignData.cpa.toString()) : 0;
    const conversions = campaignData.conversions || 0;

    // ПРАВИЛО 2.3: Learning Phase
    // IF spend < CPA × 2 THEN не оптимизировать
    if (spend > 0 && cpa > 0 && spend < cpa * 2) {
      issues.push({
        type: 'learning_phase',
        severity: Severity.WARNING,
        description: 'Кампания в фазе обучения. Недостаточно данных для оптимизации.',
        metricValue: spend,
      });
      recommendations.push({
        action: ActionType.WAIT,
        reason: 'Правило 2.3: Нужно минимум CPA × 2 расходов перед оптимизацией',
        priority: 5,
      });
    }

    // ПРАВИЛО 7: Временные окна (минимум 72 часа)
    const daysRunning = historicalData.length;
    if (daysRunning < 3) {
      issues.push({
        type: 'insufficient_data',
        severity: Severity.WARNING,
        description: `Кампания работает ${daysRunning} дн. Минимум 72ч для выводов.`,
      });
      recommendations.push({
        action: ActionType.WAIT,
        reason: 'Правило 7: минимум 72 часа для анализа',
        priority: 5,
      });
    }

    // ПРАВИЛО: Проверка роста CPA 3 дня подряд
    if (cpa > 0 && conversions > 0 && this.checkCPATrend(historicalData, true, 3)) {
      issues.push({
        type: 'cpa_increasing',
        severity: Severity.CRITICAL,
        description: `CPA растёт 3 дня подряд. Текущий: $${cpa.toFixed(2)}`,
        metricValue: cpa,
      });
      recommendations.push({
        action: ActionType.CHANGE_CREATIVE,
        reason: 'Креатив выгорает (CPA растёт). Правило 4.4: Меняй хук (первые 1-3 сек)',
        priority: 1,
        parameters: { test_new_hook: true },
      });
    }

    // Определяем общий статус
    let status = Severity.OK;
    if (issues.some((i) => i.severity === Severity.CRITICAL)) {
      status = Severity.CRITICAL;
    } else if (issues.some((i) => i.severity === Severity.WARNING)) {
      status = Severity.WARNING;
    }

    return { status, issues, recommendations };
  }

  /**
   * Анализ креатива по правилам 4.*
   */
  analyzeCreative(
    creativeData: {
      stopRate?: number;
      metaNative?: boolean;
      formatType?: string | null;
    },
    performanceData: any[]
  ): {
    status: Severity;
    issues: Issue[];
    recommendations: Recommendation[];
  } {
    const issues: Issue[] = [];
    const recommendations: Recommendation[] = [];

    // ПРАВИЛО 4.5.1: Stop Rate
    const stopRate = creativeData.stopRate || 0;
    if (stopRate < 0.3) {
      issues.push({
        type: 'low_stop_rate',
        severity: Severity.CRITICAL,
        description: `Stop Rate ${(stopRate * 100).toFixed(1)}% < 30%. Проблема в хуке.`,
        metricValue: stopRate,
      });
      recommendations.push({
        action: ActionType.CHANGE_CREATIVE,
        reason: 'Правило 4.5.1: менять ТОЛЬКО первые 1-3 секунды',
        priority: 1,
        parameters: { change_hook_only: true },
      });
    }

    // ПРАВИЛО 4.3: Meta-native контент
    if (creativeData.metaNative === false) {
      issues.push({
        type: 'not_meta_native',
        severity: Severity.WARNING,
        description: 'Креатив выглядит как реклама, не как органика',
      });
    }

    // ПРАВИЛО 4.6.1: UGC приоритет
    const formatType = creativeData.formatType;
    if (formatType && !['ugc', 'expert_talking'].includes(formatType)) {
      recommendations.push({
        action: ActionType.CHANGE_CREATIVE,
        reason: 'Правило 4.3: UGC/self-shot video показывают лучшие результаты',
        priority: 3,
        parameters: { suggested_format: 'ugc' },
      });
    }

    let status = Severity.OK;
    if (issues.some((i) => i.severity === Severity.CRITICAL)) {
      status = Severity.CRITICAL;
    } else if (issues.length > 0) {
      status = Severity.WARNING;
    }

    return { status, issues, recommendations };
  }

  /**
   * Проверка тренда CPA (рост или падение)
   */
  private checkCPATrend(
    historicalData: HistoricalData[],
    increasing: boolean,
    days: number
  ): boolean {
    if (historicalData.length < days) return false;

    const recent = historicalData.slice(-days);
    const cpas = recent
      .map((d) => (d.cpa ? parseFloat(d.cpa.toString()) : 0))
      .filter((v) => v > 0);

    if (cpas.length < days) return false;

    if (increasing) {
      return cpas.every((val, i) => i === 0 || val > cpas[i - 1]);
    } else {
      return cpas.every((val, i) => i === 0 || val < cpas[i - 1]);
    }
  }
}
