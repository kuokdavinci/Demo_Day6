import type {
  AnalysisResult,
  AnalyticsSnapshot,
  DeliveryRecord,
  IntegrationCredentialsInput,
  IntegrationCredentialsStatus,
  RepoConfig,
  RepoMemory,
  WebhookEvent,
  CorrectionEntry
} from "../../shared/src/index";
import { decryptSecret, encryptSecret } from "./secrets";

interface StoredCredentials {
  slackWebhookUrl?: string;
  discordWebhookUrl?: string;
}

function defaultConfig(repoId: string, repoName: string): RepoConfig {
  return {
    repoId,
    repoName,
    notifySlack: true,
    notifyDiscord: true,
    quietHours: null,
    maxFilesPerAnalysis: 25,
    maxChunksPerAnalysis: 12,
    maxRunsPerHour: 20
  };
}

function defaultMemory(repoId: string): RepoMemory {
  return {
    repoId,
    sensitivePaths: ["auth/", "security/", "permissions/"],
    noisyPaths: ["package-lock.json", "pnpm-lock.yaml", "yarn.lock", "dist/"],
    preferredSummaryStyle: "balanced",
    highRiskModules: ["auth", "billing", "payments", "migrations"]
  };
}

export class MemoryStore {
  private configs = new Map<string, RepoConfig>();
  private memories = new Map<string, RepoMemory>();
  private webhookEvents: WebhookEvent[] = [];
  private analyses: AnalysisResult[] = [];
  private deliveries: DeliveryRecord[] = [];
  private credentials: StoredCredentials = {};
  private corrections: CorrectionEntry[] = [];

  ensureRepository(repoId: string, repoName: string) {
    if (!this.configs.has(repoId)) {
      this.configs.set(repoId, defaultConfig(repoId, repoName));
    }
    if (!this.memories.has(repoId)) {
      this.memories.set(repoId, defaultMemory(repoId));
    }
  }

  getConfig(repoId: string, repoName: string) {
    this.ensureRepository(repoId, repoName);
    return this.configs.get(repoId)!;
  }

  getAllConfigs() {
    return Array.from(this.configs.values());
  }

  updateConfig(repoId: string, config: Partial<RepoConfig>) {
    const current = this.configs.get(repoId);
    if (!current) return null;
    
    const next = { ...current };

    // Chỉ cập nhật nếu trường đó được gửi lên và không phải undefined
    if (typeof config.slackWebhookUrl !== "undefined") {
      if (config.slackWebhookUrl === "" || config.slackWebhookUrl === null) {
        next.slackWebhookUrl = undefined; // Xóa nếu gửi chuỗi rỗng
      } else {
        next.slackWebhookUrl = encryptSecret(config.slackWebhookUrl); // Mã hóa nếu có nội dung
      }
    }

    if (typeof config.discordWebhookUrl !== "undefined") {
      if (config.discordWebhookUrl === "" || config.discordWebhookUrl === null) {
        next.discordWebhookUrl = undefined; // Xóa nếu gửi chuỗi rỗng
      } else {
        next.discordWebhookUrl = encryptSecret(config.discordWebhookUrl); // Mã hóa nếu có nội dung
      }
    }

    // Các trường khác (notify, quietHours...)
    if (typeof config.notifySlack !== "undefined") next.notifySlack = config.notifySlack;
    if (typeof config.notifyDiscord !== "undefined") next.notifyDiscord = config.notifyDiscord;

    this.configs.set(repoId, next);
    return next;
  }

  getMemory(repoId: string, repoName: string) {
    this.ensureRepository(repoId, repoName);
    return this.memories.get(repoId)!;
  }

  updateMemory(repoId: string, memory: Partial<RepoMemory>) {
    const current = this.getMemory(repoId, repoId);
    const next = { ...current, ...memory };
    this.memories.set(repoId, next);
    return next;
  }

  saveWebhookEvent(event: WebhookEvent) {
    if (this.webhookEvents.some((item) => item.deliveryId === event.deliveryId)) {
      return false;
    }
    this.webhookEvents.push(event);
    return true;
  }

  saveAnalysis(result: AnalysisResult) {
    this.analyses.push(result);
  }

  saveDeliveries(records: DeliveryRecord[]) {
    this.deliveries.push(...records);
  }

  saveCredentials(input: IntegrationCredentialsInput) {
    const next: StoredCredentials = { ...this.credentials };
    if (typeof input.slackWebhookUrl !== "undefined") {
      next.slackWebhookUrl = input.slackWebhookUrl ? encryptSecret(input.slackWebhookUrl) : undefined;
    }
    if (typeof input.discordWebhookUrl !== "undefined") {
      next.discordWebhookUrl = input.discordWebhookUrl ? encryptSecret(input.discordWebhookUrl) : undefined;
    }
    this.credentials = next;
  }

  getCredentials() {
    return {
      slackWebhookUrl: decryptSecret(this.credentials.slackWebhookUrl),
      discordWebhookUrl: decryptSecret(this.credentials.discordWebhookUrl)
    };
  }

  getCredentialsStatus(): IntegrationCredentialsStatus {
    const current = this.getCredentials();
    return {
      githubAppConfigured: Boolean(process.env.GITHUB_APP_ID && process.env.GITHUB_APP_PRIVATE_KEY),
      githubOAuthConfigured: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
      githubWebhookSecretConfigured: Boolean(process.env.GITHUB_WEBHOOK_SECRET),
      slackConfigured: Boolean(current.slackWebhookUrl),
      discordConfigured: Boolean(current.discordWebhookUrl),
      groqConfigured: Boolean(process.env.GROQ_API_KEY),
      githubApiUrl: process.env.GITHUB_API_URL ?? "https://api.github.com",
      groqModelId: process.env.GROQ_MODEL_ID ?? "llama-3.3-70b-versatile",
      aiProviderMode: (process.env.AI_PROVIDER_MODE as "heuristic" | "groq") ?? "heuristic"
    };
  }

  getRecentActivity(limit = 10) {
    return this.analyses.slice(-limit).reverse();
  }

  getCorrections(limit = 10) {
    if (!this.corrections) this.corrections = [];
    return this.corrections.slice(-limit).reverse();
  }

  saveCorrection(correction: CorrectionEntry) {
    if (!this.corrections) this.corrections = [];
    this.corrections.push(correction);
  }

  getAnalytics(): AnalyticsSnapshot {
    const totalAnalyses = this.analyses.length;
    const avgConfidence =
      totalAnalyses === 0
        ? 0
        : this.analyses.reduce((sum, item) => sum + item.brief.confidence, 0) / totalAnalyses;
    const avgFilesPerPr =
      totalAnalyses === 0
        ? 0
        : this.analyses.reduce((sum, item) => sum + item.snapshot.files.length, 0) / totalAnalyses;
    const attentionDistribution = this.analyses.reduce(
      (acc, item) => {
        acc[item.brief.attentionLevel] += 1;
        return acc;
      },
      { low: 0, medium: 0, high: 0 }
    );

    return {
      totalEvents: (this.webhookEvents ?? []).length,
      totalAnalyses,
      avgConfidence: Number(avgConfidence.toFixed(2)),
      avgFilesPerPr: Number(avgFilesPerPr.toFixed(2)),
      attentionDistribution,
      totalCorrections: (this.corrections ?? []).length
    };
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __prIntelStore: MemoryStore | undefined;
}

export function getStore() {
  if (!globalThis.__prIntelStore) {
    globalThis.__prIntelStore = new MemoryStore();
  }
  return globalThis.__prIntelStore;
}
