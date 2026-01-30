interface MetaAPIClientConfig {
  accessToken: string;
}

interface CampaignInsight {
  spend?: string;
  impressions?: string;
  clicks?: string;
  actions?: Array<{
    action_type: string;
    value: string;
  }>;
  cpc?: string;
  cpm?: string;
  ctr?: string;
  frequency?: string;
}

export class MetaAPIClient {
  private baseURL = 'https://graph.facebook.com/v19.0';
  private accessToken: string;

  constructor(config: MetaAPIClientConfig) {
    this.accessToken = config.accessToken;
  }

  async getAccountInfo(accountId: string) {
    const url = `${this.baseURL}/act_${accountId}`;
    const params = new URLSearchParams({
      access_token: this.accessToken,
      fields: 'name,currency,timezone_name,account_status',
    });

    const response = await fetch(`${url}?${params}`);
    if (!response.ok) {
      throw new Error(`Meta API error: ${response.statusText}`);
    }
    return response.json();
  }

  async getCampaigns(accountId: string, fields?: string[]) {
    const defaultFields = [
      'id',
      'name',
      'status',
      'objective',
      'daily_budget',
      'lifetime_budget',
    ];

    const url = `${this.baseURL}/act_${accountId}/campaigns`;
    const params = new URLSearchParams({
      access_token: this.accessToken,
      fields: (fields || defaultFields).join(','),
      limit: '500',
    });

    const response = await fetch(`${url}?${params}`);
    if (!response.ok) {
      throw new Error(`Meta API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data || [];
  }

  async getCampaignInsights(
    campaignId: string,
    datePreset: string = 'yesterday'
  ): Promise<CampaignInsight | null> {
    const url = `${this.baseURL}/${campaignId}/insights`;
    const params = new URLSearchParams({
      access_token: this.accessToken,
      date_preset: datePreset,
      fields: 'spend,impressions,clicks,actions,cpc,cpm,ctr,frequency',
    });

    const response = await fetch(`${url}?${params}`);
    if (!response.ok) {
      throw new Error(`Meta API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data?.[0] || null;
  }

  async getAdsets(campaignId: string) {
    const url = `${this.baseURL}/${campaignId}/adsets`;
    const params = new URLSearchParams({
      access_token: this.accessToken,
      fields: 'id,name,status,optimization_goal,billing_event,daily_budget,targeting',
      limit: '500',
    });

    const response = await fetch(`${url}?${params}`);
    if (!response.ok) {
      throw new Error(`Meta API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data || [];
  }

  async getAds(adsetId: string) {
    const url = `${this.baseURL}/${adsetId}/ads`;
    const params = new URLSearchParams({
      access_token: this.accessToken,
      fields: 'id,name,status,creative',
      limit: '500',
    });

    const response = await fetch(`${url}?${params}`);
    if (!response.ok) {
      throw new Error(`Meta API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data || [];
  }

  async getCreativeDetails(creativeId: string) {
    const url = `${this.baseURL}/${creativeId}`;
    const params = new URLSearchParams({
      access_token: this.accessToken,
      fields: 'name,title,body,image_url,video_id,thumbnail_url,call_to_action_type,link_url',
    });

    const response = await fetch(`${url}?${params}`);
    if (!response.ok) {
      throw new Error(`Meta API error: ${response.statusText}`);
    }
    return response.json();
  }

  // Утилита для извлечения конверсий
  extractConversions(insight: CampaignInsight): number {
    const actions = insight.actions || [];
    for (const action of actions) {
      if (['lead', 'purchase', 'complete_registration'].includes(action.action_type)) {
        return parseInt(action.value, 10) || 0;
      }
    }
    return 0;
  }
}
