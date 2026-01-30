/**
 * Абстракция для AI провайдера
 * Позволяет легко переключаться между Anthropic Claude, OpenAI, и т.д.
 */

export interface AIAnalysisResult {
  explanation: string;
  confidence?: number;
}

export interface CreativeVisionResult {
  description: string;
  formatType: 'ugc' | 'expert_talking' | 'dialog' | 'static' | 'unknown';
  hookQuality: 'good' | 'poor' | 'unknown';
  metaNative: boolean | null;
  firstThreeSeconds?: string;
  issues: string[];
  strengths: string[];
}

export interface AIServiceConfig {
  provider: 'anthropic' | 'openai' | 'none';
  apiKey?: string;
}

export abstract class AIService {
  protected config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  abstract explainAnalysis(
    campaignData: any,
    issues: any[],
    recommendations: any[],
    playbookContext: string
  ): Promise<AIAnalysisResult>;

  abstract analyzeCreativeVision(
    imageUrl: string,
    creativeMetadata: any
  ): Promise<CreativeVisionResult>;
}

/**
 * Заглушка для случая когда AI не настроен
 */
export class NoAIService extends AIService {
  async explainAnalysis(): Promise<AIAnalysisResult> {
    return {
      explanation: 'AI анализ не настроен. Используйте rule-based рекомендации.',
    };
  }

  async analyzeCreativeVision(): Promise<CreativeVisionResult> {
    return {
      description: 'AI анализ креатива не настроен',
      formatType: 'unknown',
      hookQuality: 'unknown',
      metaNative: null,
      issues: [],
      strengths: [],
    };
  }
}

/**
 * Anthropic Claude Implementation (будущая)
 */
export class AnthropicAIService extends AIService {
  async explainAnalysis(
    campaignData: any,
    issues: any[],
    recommendations: any[],
    playbookContext: string
  ): Promise<AIAnalysisResult> {
    // TODO: Реализовать когда выберем Anthropic
    // const anthropic = new Anthropic({ apiKey: this.config.apiKey });
    // const response = await anthropic.messages.create({ ... });

    throw new Error('Anthropic integration not implemented yet');
  }

  async analyzeCreativeVision(
    imageUrl: string,
    creativeMetadata: any
  ): Promise<CreativeVisionResult> {
    // TODO: Реализовать vision через Claude
    throw new Error('Anthropic vision not implemented yet');
  }
}

/**
 * OpenAI Implementation (будущая)
 */
export class OpenAIService extends AIService {
  async explainAnalysis(): Promise<AIAnalysisResult> {
    // TODO: Реализовать когда выберем OpenAI
    throw new Error('OpenAI integration not implemented yet');
  }

  async analyzeCreativeVision(): Promise<CreativeVisionResult> {
    // TODO: Реализовать vision через GPT-4V
    throw new Error('OpenAI vision not implemented yet');
  }
}

/**
 * Factory для создания нужного AI сервиса
 */
export function createAIService(config?: AIServiceConfig): AIService {
  const provider = config?.provider || (process.env.AI_PROVIDER as any) || 'none';

  switch (provider) {
    case 'anthropic':
      return new AnthropicAIService({
        provider: 'anthropic',
        apiKey: config?.apiKey || process.env.ANTHROPIC_API_KEY,
      });
    case 'openai':
      return new OpenAIService({
        provider: 'openai',
        apiKey: config?.apiKey || process.env.OPENAI_API_KEY,
      });
    default:
      return new NoAIService({ provider: 'none' });
  }
}
