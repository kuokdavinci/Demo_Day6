import type {
  AnalysisStrategy,
  PullRequestFile,
  RepoConfig,
  RepoMemory,
  SecurityFinding
} from "../../shared/src/index";

const SECRET_PATTERNS = [
  /ghp_[A-Za-z0-9_]{30,}/g, // Updated GitHub
  /sk-[A-Za-z0-9]{20,}/g, // Updated OpenAI
  /AIza[0-9A-Za-z\-_]{30,}/g, // Google
  /AKIA[0-9A-Z]{16}/g, // AWS Access Key
  /sk_live_[0-9a-zA-Z]{24}/g, // Stripe
  /-----BEGIN [A-Z ]+PRIVATE KEY-----/g,
  /password\s*[:=]\s*["'][^"']+["']/gi,
  /token\s*[:=]\s*["'][^"']+["']/gi,
  /secret\s*[:=]\s*["'][^"']+["']/gi
];

const IRRELEVANT_PATTERNS = [
  /package-lock\.json$/,
  /pnpm-lock\.yaml$/,
  /yarn\.lock$/,
  /\.(svg|png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot)$/,
  /\.map$/
];

export function filterRelevantFiles(files: PullRequestFile[], memory: RepoMemory) {
  return files.filter((file) => {
    if (memory.noisyPaths.some((pattern) => file.path.includes(pattern))) {
      return false;
    }
    return !IRRELEVANT_PATTERNS.some((pattern) => pattern.test(file.path));
  });
}

export function maskSensitiveTokens(files: PullRequestFile[], memory: RepoMemory) {
  const findings: SecurityFinding[] = [];
  const maskedFiles = files.map((file) => {
    let patch = file.patch;
    for (const pattern of SECRET_PATTERNS) {
      if (pattern.test(patch)) {
        findings.push({
          path: file.path,
          kind: "masked-secret",
          detail: "Sensitive token-like content was masked before analysis."
        });
        patch = patch.replace(pattern, "[MASKED]");
      }
      pattern.lastIndex = 0;
    }

    if (memory.sensitivePaths.some((segment) => file.path.includes(segment))) {
      findings.push({
        path: file.path,
        kind: "sensitive-module",
        detail: "Changed file is inside a sensitive module and should receive human review."
      });
    }

    return { ...file, patch };
  });

  return { maskedFiles, findings };
}

export function estimateTokenBudget(files: PullRequestFile[]) {
  const charCount = files.reduce((sum, file) => sum + file.patch.length, 0);
  return Math.ceil(charCount / 4);
}

export function chooseStrategy(files: PullRequestFile[], config: RepoConfig): AnalysisStrategy {
  if (files.length > config.maxFilesPerAnalysis) {
    return "partial";
  }
  const tokenBudget = estimateTokenBudget(files);
  if (tokenBudget > 12000) {
    return "deep";
  }
  if (tokenBudget > 6000) {
    return "normal";
  }
  return "shallow";
}

export function chunkFiles(files: PullRequestFile[], config: RepoConfig) {
  const chunks: PullRequestFile[][] = [];
  const limit = Math.max(1, Math.ceil(files.length / config.maxChunksPerAnalysis));
  for (let i = 0; i < files.length; i += limit) {
    chunks.push(files.slice(i, i + limit));
  }
  return chunks;
}

export function rankImportantFiles(files: PullRequestFile[], memory: RepoMemory) {
  return [...files]
    .sort((a, b) => scoreFile(b, memory) - scoreFile(a, memory))
    .slice(0, 5)
    .map((file) => file.path);
}

function scoreFile(file: PullRequestFile, memory: RepoMemory) {
  let score = file.additions + file.deletions;
  if (memory.highRiskModules.some((item) => file.path.includes(item))) {
    score += 50;
  }
  if (/auth|payment|billing|migration|config/i.test(file.path)) {
    score += 30;
  }
  return score;
}
