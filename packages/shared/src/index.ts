export type GitHubEventType =
  | "opened"
  | "reopened"
  | "ready_for_review"
  | "synchronize"
  | "review_requested"
  | "review_request_removed"
  | "review_submitted"
  | "converted_to_draft"
  | "closed"
  | "merged"
  | "edited";

export type AttentionLevel = "low" | "medium" | "high";
export type AnalysisStrategy = "shallow" | "normal" | "deep" | "partial";
export type DeliveryChannel = "github" | "slack" | "discord";

export interface PullRequestFile {
  path: string;
  patch: string;
  additions: number;
  deletions: number;
  language?: string;
}

export interface PullRequestSnapshot {
  repoId: string;
  repoName: string;
  prNumber: number;
  title: string;
  author: string;
  url: string;
  baseBranch: string;
  headBranch: string;
  eventType: GitHubEventType;
  labels: string[];
  reviewers: string[];
  body?: string;
  files: PullRequestFile[];
  headSha?: string;
  installationId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RepoConfig {
  repoId: string;
  repoName: string;
  notifySlack: boolean;
  notifyDiscord: boolean;
  quietHours: { startHour: number; endHour: number } | null;
  maxFilesPerAnalysis: number;
  maxChunksPerAnalysis: number;
  maxRunsPerHour: number;
}

export interface RepoMemory {
  repoId: string;
  sensitivePaths: string[];
  noisyPaths: string[];
  preferredSummaryStyle: "compact" | "balanced" | "detailed";
  highRiskModules: string[];
}

export interface WebhookEvent {
  deliveryId: string;
  receivedAt: string;
  snapshot: PullRequestSnapshot;
}

export interface SecurityFinding {
  path: string;
  kind: "masked-secret" | "sensitive-module" | "config-risk";
  detail: string;
}

export interface FileSummary {
  path: string;
  summary: string;
  businessIntent: string;
  reviewerFocus: string;
}

export interface RiskFinding {
  path: string;
  severity: AttentionLevel;
  category: "logic" | "security" | "performance" | "breaking-change" | "configuration";
  summary: string;
}

export interface TestFinding {
  path: string;
  recommendation: string;
  testType: "unit" | "integration" | "manual" | "regression";
}

export interface CanonicalBrief {
  title: string;
  whatChanged: string[];
  whyItMatters: string[];
  reviewerFocus: string[];
  attentionLevel: AttentionLevel;
  testImpact: string[];
  confidence: number;
  missingContext: string[];
  importantFiles: string[];
  disclaimer: string;
  managementSummary: string;
  technicalSummary: string;
}

export interface NotificationPayload {
  channel: DeliveryChannel;
  heading: string;
  summary: string[];
  attentionLevel: AttentionLevel;
  confidence: number;
  links: { label: string; url: string }[];
}

export interface AnalysisResult {
  snapshot: PullRequestSnapshot;
  strategy: AnalysisStrategy;
  securityFindings: SecurityFinding[];
  fileSummaries: FileSummary[];
  riskFindings: RiskFinding[];
  testFindings: TestFinding[];
  brief: CanonicalBrief;
  githubPayload: NotificationPayload;
  slackPayload: NotificationPayload | null;
  discordPayload: NotificationPayload | null;
}

export interface DeliveryRecord {
  channel: DeliveryChannel;
  status: "sent" | "skipped" | "failed";
  target: string;
  timestamp: string;
  message: string;
}

export interface AnalyticsSnapshot {
  totalEvents: number;
  totalAnalyses: number;
  avgConfidence: number;
  avgFilesPerPr: number;
  attentionDistribution: Record<AttentionLevel, number>;
  totalCorrections: number;
}

export interface CorrectionEntry {
  repoId: string;
  prNumber: number;
  author: string;
  originalDescription: string;
  revisedDescription: string;
  timestamp: string;
}

export interface IntegrationCredentialsInput {
  slackWebhookUrl?: string;
  discordWebhookUrl?: string;
}

export interface IntegrationCredentialsStatus {
  githubAppConfigured: boolean;
  githubOAuthConfigured: boolean;
  githubWebhookSecretConfigured: boolean;
  slackConfigured: boolean;
  discordConfigured: boolean;
  groqConfigured: boolean;
  githubApiUrl: string;
  groqModelId: string;
  aiProviderMode: "heuristic" | "groq";
}
