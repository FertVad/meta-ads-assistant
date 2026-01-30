import { prisma } from '@/lib/db/prisma';
import { MetaAPIClient } from './meta-api';
import { subDays } from 'date-fns';

export class SyncService {
  async syncAccountData(metaAccountId: string) {
    const account = await prisma.metaAccount.findUnique({
      where: { id: metaAccountId },
    });

    if (!account || !account.isActive) {
      throw new Error('Account not found or inactive');
    }

    const client = new MetaAPIClient({
      accessToken: account.accessToken,
    });

    const yesterday = subDays(new Date(), 1);
    yesterday.setHours(0, 0, 0, 0);

    // 1. Синхронизируем кампании
    const campaigns = await client.getCampaigns(account.accountId);

    for (const campaign of campaigns) {
      // Получаем метрики за вчера
      const insights = await client.getCampaignInsights(campaign.id, 'yesterday');

      if (!insights) continue;

      // Сохраняем snapshot
      await prisma.campaignSnapshot.upsert({
        where: {
          campaignId_snapshotDate: {
            campaignId: campaign.id,
            snapshotDate: yesterday,
          },
        },
        create: {
          metaAccountId: account.id,
          campaignId: campaign.id,
          campaignName: campaign.name,
          status: campaign.status,
          objective: campaign.objective,
          dailyBudget: campaign.daily_budget,
          lifetimeBudget: campaign.lifetime_budget,
          spend: insights.spend,
          impressions: insights.impressions ? parseInt(insights.impressions) : null,
          clicks: insights.clicks ? parseInt(insights.clicks) : null,
          conversions: client.extractConversions(insights),
          cpa: this.calculateCPA(insights.spend, client.extractConversions(insights)),
          ctr: insights.ctr,
          cpm: insights.cpm,
          snapshotDate: yesterday,
        },
        update: {
          campaignName: campaign.name,
          status: campaign.status,
          spend: insights.spend,
          impressions: insights.impressions ? parseInt(insights.impressions) : null,
          clicks: insights.clicks ? parseInt(insights.clicks) : null,
          conversions: client.extractConversions(insights),
          cpa: this.calculateCPA(insights.spend, client.extractConversions(insights)),
        },
      });

      // 2. Синхронизируем ad sets
      const adsets = await client.getAdsets(campaign.id);
      for (const adset of adsets) {
        // Получаем инсайты для adset
        const adsetInsights = await client.getCampaignInsights(adset.id, 'yesterday');

        if (adsetInsights) {
          await prisma.adsetSnapshot.upsert({
            where: {
              adsetId_snapshotDate: {
                adsetId: adset.id,
                snapshotDate: yesterday,
              },
            },
            create: {
              metaAccountId: account.id,
              campaignId: campaign.id,
              adsetId: adset.id,
              adsetName: adset.name,
              status: adset.status,
              optimizationGoal: adset.optimization_goal,
              billingEvent: adset.billing_event,
              dailyBudget: adset.daily_budget,
              targeting: adset.targeting,
              spend: adsetInsights.spend,
              impressions: adsetInsights.impressions ? parseInt(adsetInsights.impressions) : null,
              clicks: adsetInsights.clicks ? parseInt(adsetInsights.clicks) : null,
              conversions: client.extractConversions(adsetInsights),
              cpa: this.calculateCPA(adsetInsights.spend, client.extractConversions(adsetInsights)),
              snapshotDate: yesterday,
            },
            update: {
              adsetName: adset.name,
              status: adset.status,
              spend: adsetInsights.spend,
              impressions: adsetInsights.impressions ? parseInt(adsetInsights.impressions) : null,
              clicks: adsetInsights.clicks ? parseInt(adsetInsights.clicks) : null,
              conversions: client.extractConversions(adsetInsights),
              cpa: this.calculateCPA(adsetInsights.spend, client.extractConversions(adsetInsights)),
            },
          });
        }

        // 3. Синхронизируем ads
        const ads = await client.getAds(adset.id);
        for (const ad of ads) {
          const adInsights = await client.getCampaignInsights(ad.id, 'yesterday');

          if (adInsights) {
            await prisma.adSnapshot.upsert({
              where: {
                adId_snapshotDate: {
                  adId: ad.id,
                  snapshotDate: yesterday,
                },
              },
              create: {
                metaAccountId: account.id,
                adsetId: adset.id,
                adId: ad.id,
                adName: ad.name,
                status: ad.status,
                creativeId: ad.creative?.id,
                spend: adInsights.spend,
                impressions: adInsights.impressions ? parseInt(adInsights.impressions) : null,
                clicks: adInsights.clicks ? parseInt(adInsights.clicks) : null,
                conversions: client.extractConversions(adInsights),
                cpa: this.calculateCPA(adInsights.spend, client.extractConversions(adInsights)),
                ctr: adInsights.ctr,
                snapshotDate: yesterday,
              },
              update: {
                adName: ad.name,
                status: ad.status,
                spend: adInsights.spend,
                impressions: adInsights.impressions ? parseInt(adInsights.impressions) : null,
                clicks: adInsights.clicks ? parseInt(adInsights.clicks) : null,
                conversions: client.extractConversions(adInsights),
                cpa: this.calculateCPA(adInsights.spend, client.extractConversions(adInsights)),
              },
            });
          }

          // Синхронизируем креативы
          if (ad.creative?.id) {
            try {
              const creativeDetails = await client.getCreativeDetails(ad.creative.id);

              await prisma.creative.upsert({
                where: {
                  creativeId: ad.creative.id,
                },
                create: {
                  metaAccountId: account.id,
                  creativeId: ad.creative.id,
                  creativeName: creativeDetails.name,
                  imageUrl: creativeDetails.image_url,
                  videoUrl: creativeDetails.video_id,
                  thumbnailUrl: creativeDetails.thumbnail_url,
                  title: creativeDetails.title,
                  body: creativeDetails.body,
                  callToAction: creativeDetails.call_to_action_type,
                  linkUrl: creativeDetails.link_url,
                },
                update: {
                  creativeName: creativeDetails.name,
                  title: creativeDetails.title,
                  body: creativeDetails.body,
                },
              });
            } catch (error) {
              console.error(`Failed to sync creative ${ad.creative.id}:`, error);
            }
          }
        }
      }
    }

    console.log(`✅ Synced data for account ${account.accountId}`);
  }

  private calculateCPA(spend?: string, conversions?: number): string | null {
    if (!spend || !conversions || conversions === 0) return null;
    const spendNum = parseFloat(spend);
    return (spendNum / conversions).toFixed(2);
  }
}
