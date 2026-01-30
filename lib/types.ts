// Типы для Next.js API routes
export interface APIResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// Типы для Dashboard
export interface DashboardData {
  status_summary: {
    ok: number;
    warning: number;
    critical: number;
  };
  top_issues: Array<{
    type: string;
    count: number;
  }>;
  total_campaigns: number;
}

// Типы для Campaign
export interface CampaignListItem {
  id: string;
  name: string;
  status: string;
  spend: number;
  conversions: number | null;
  cpa: number;
  analysis: {
    status: string;
    issues_count: number;
    recommendations_count: number;
  } | null;
}

export interface CampaignDetail {
  status: string;
  issues: any[];
  recommendations: any[];
  llm_explanation: string | null;
  metrics_history: Array<{
    date: string;
    spend: number;
    conversions: number | null;
    cpa: number;
  }>;
}
