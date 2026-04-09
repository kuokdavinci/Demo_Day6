import type {
  AttentionLevel,
  CanonicalBrief,
  FileSummary,
  RiskFinding,
  TestFinding
} from "../../shared/src/index";
import type { AiProvider, AnalysisContext } from "./provider";

function inferBusinessIntent(path: string, patch: string) {
  const normalized = `${path}\n${patch}`.toLowerCase();
  if (/auth|token|session|permission/.test(normalized)) return "Strengthens authentication or authorization flow.";
  if (/fix|bug|guard|null/.test(normalized)) return "Mitigates a bug or adds guard rails.";
  if (/test|spec/.test(normalized)) return "Improves verification coverage.";
  if (/config|env|deploy/.test(normalized)) return "Changes application or deployment configuration.";
  return "Updates application behavior in the touched module.";
}

function inferReviewerFocus(path: string, patch: string) {
  const normalized = `${path}\n${patch}`.toLowerCase();
  if (/auth|permission|role/.test(normalized)) return "Verify permission boundaries and fallback flows.";
  if (/config|env/.test(normalized)) return "Validate environment defaults and rollout safety.";
  if (/db|migration/.test(normalized)) return "Check schema compatibility and backward-safe rollout.";
  return "Review changed branches and edge cases introduced by the diff.";
}

function severityFromContext(path: string, patch: string): AttentionLevel {
  const normalized = `${path}\n${patch}`.toLowerCase();
  if (/auth|secret|permission|billing|migration|delete/.test(normalized)) return "high";
  if (/config|cache|queue|retry|state|concurrency/.test(normalized)) return "medium";
  return "low";
}

export class HeuristicAiProvider implements AiProvider {
  name = "heuristic-groq-compatible";

  async analyzeFiles(context: AnalysisContext): Promise<FileSummary[]> {
    return context.files.map((file) => ({
      path: file.path,
      summary: `Touches ${file.path} with ${file.additions} additions and ${file.deletions} deletions.`,
      businessIntent: inferBusinessIntent(file.path, file.patch),
      reviewerFocus: inferReviewerFocus(file.path, file.patch)
    }));
  }

  async reviewRisks(context: AnalysisContext, fileSummaries: FileSummary[]): Promise<RiskFinding[]> {
    const results: RiskFinding[] = [];
    for (const summary of fileSummaries) {
      const source = context.files.find((file) => file.path === summary.path);
      if (!source) continue;
      const severity = severityFromContext(source.path, source.patch);
      if (severity === "low" && !context.securityFindings.some((item) => item.path === source.path)) {
        continue;
      }
      results.push({
        path: source.path,
        severity,
        category: source.path.includes("auth") ? "security" : source.path.includes("config") ? "configuration" : "logic",
        summary:
          severity === "high"
            ? "This change touches a sensitive path and should be reviewed carefully for regressions."
            : "This change modifies important logic and deserves focused review."
      });
    }
    return results;
  }

  async planTesting(context: AnalysisContext, _fileSummaries?: FileSummary[]): Promise<TestFinding[]> {
    return context.files.slice(0, 5).map((file) => ({
      path: file.path,
      recommendation: file.path.includes("auth")
        ? "Exercise login, logout, invalid token and role downgrade scenarios."
        : "Cover the changed branches with focused regression tests and one manual sanity check.",
      testType: file.path.includes("test") ? "regression" : "integration"
    }));
  }

  async synthesize(
    context: AnalysisContext,
    fileSummaries: FileSummary[],
    riskFindings: RiskFinding[],
    testFindings: TestFinding[]
  ): Promise<CanonicalBrief> {
    const attentionLevel: AttentionLevel = riskFindings.some((item) => item.severity === "high")
      ? "high"
      : riskFindings.some((item) => item.severity === "medium")
        ? "medium"
        : "low";
    const missingContext =
      context.files.length > 10 ? ["Large PR: some lower-priority files were summarized more coarsely."] : [];
    const confidenceBase = Math.max(0.45, 0.92 - context.files.length * 0.03 - missingContext.length * 0.08);

    return {
      title: `${context.snapshot.repoName} PR #${context.snapshot.prNumber}: ${context.snapshot.title}`,
      whatChanged: fileSummaries.slice(0, 5).map((item) => `${item.path}: ${item.summary}`),
      whyItMatters: fileSummaries.slice(0, 3).map((item) => item.businessIntent),
      reviewerFocus: fileSummaries.slice(0, 4).map((item) => `${item.path}: ${item.reviewerFocus}`),
      attentionLevel,
      testImpact: testFindings.slice(0, 4).map((item) => `${item.path}: ${item.recommendation}`),
      confidence: Number(confidenceBase.toFixed(2)),
      missingContext,
      importantFiles: context.importantFiles,
      managementSummary: `Summary of changes for ${context.snapshot.title}. Potential impact on ${fileSummaries.length} files.`,
      technicalSummary: `Engineered changes in ${context.snapshot.repoName}. Files touched: ${context.importantFiles.join(", ")}.`,
      disclaimer: "AI-generated summary. Use it to triage the review, not to replace human code review."
    };
  }
}
