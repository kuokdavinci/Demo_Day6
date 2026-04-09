import type { AnalysisContext } from "./provider";
import type { CanonicalBrief, FileSummary, RiskFinding, TestFinding } from "../../shared/src/index";

export interface AgentMessage {
  role: "system" | "user";
  content: string;
}

export const PROMPT_VERSION = "v1";

function jsonOnlyInstruction() {
  return "Return valid JSON only. Do not wrap the JSON in markdown.";
}

export function fileSummaryMessages(context: AnalysisContext): AgentMessage[] {
  return [
    {
      role: "system",
      content: [
        "You are a senior reviewer.",
        jsonOnlyInstruction(),
        "Summarize file changes for a pull request.",
        "Focus on what changed, why it matters, and what the reviewer should inspect."
      ].join(" ")
    },
    {
      role: "user",
      content: JSON.stringify({
        task: "Produce an array of file summaries.",
        promptVersion: PROMPT_VERSION,
        schema: [{ path: "string", summary: "string", businessIntent: "string", reviewerFocus: "string" }],
        repo: context.snapshot.repoName,
        prTitle: context.snapshot.title,
        files: context.files.map((file) => ({ path: file.path, patch: file.patch }))
      })
    }
  ];
}

export function riskMessages(context: AnalysisContext, fileSummaries: FileSummary[]): AgentMessage[] {
  return [
    {
      role: "system",
      content: [
        "You are a careful code reviewer.",
        jsonOnlyInstruction(),
        "Never claim code is safe.",
        "Only rank attention needed and name the concrete area of concern."
      ].join(" ")
    },
    {
      role: "user",
      content: JSON.stringify({
        task: "Produce an array of risk findings.",
        promptVersion: PROMPT_VERSION,
        schema: [
          {
            path: "string",
            severity: "low|medium|high",
            category: "logic|security|performance|breaking-change|configuration",
            summary: "string"
          }
        ],
        repo: context.snapshot.repoName,
        summaries: fileSummaries,
        securityFindings: context.securityFindings
      })
    }
  ];
}

export function testingMessages(context: AnalysisContext, fileSummaries: FileSummary[]): AgentMessage[] {
  return [
    {
      role: "system",
      content: [
        "You are a pragmatic QA-minded engineer.",
        jsonOnlyInstruction(),
        "Suggest targeted test impact for the pull request."
      ].join(" ")
    },
    {
      role: "user",
      content: JSON.stringify({
        task: "Produce an array of test findings.",
        promptVersion: PROMPT_VERSION,
        schema: [{ path: "string", recommendation: "string", testType: "unit|integration|manual|regression" }],
        repo: context.snapshot.repoName,
        summaries: fileSummaries
      })
    }
  ];
}

export function synthesisMessages(
  context: AnalysisContext,
  fileSummaries: FileSummary[],
  riskFindings: RiskFinding[],
  testFindings: TestFinding[]
): AgentMessage[] {
  return [
    {
      role: "system",
      content: [
        "You are a senior tech lead summarizing a pull request for reviewers.",
        jsonOnlyInstruction(),
        "Never claim approval or safety.",
        "Keep the summary concise, explicit, and grounded in the provided findings."
      ].join(" ")
    },
    {
      role: "user",
      content: JSON.stringify({
        task: "Produce a canonical brief.",
        promptVersion: PROMPT_VERSION,
        schema: {
          title: "string",
          whatChanged: ["string"],
          whyItMatters: ["string"],
          reviewerFocus: ["string"],
          attentionLevel: "low|medium|high",
          testImpact: ["string"],
          confidence: "number 0-1",
          missingContext: ["string"],
          importantFiles: ["string"],
          managementSummary: "string (1-2 sentences high-level business impact)",
          technicalSummary: "string (detailed engineering changes and logic flow)",
          disclaimer: "string"
        },
        repo: context.snapshot.repoName,
        prTitle: context.snapshot.title,
        importantFiles: context.importantFiles,
        fileSummaries,
        riskFindings,
        testFindings
      })
    }
  ];
}
