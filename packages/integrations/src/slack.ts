import type { AnalysisResult, DeliveryRecord } from "../../shared/src/index";

export interface SlackAdapter {
  send(result: AnalysisResult): Promise<DeliveryRecord>;
}

export class FakeSlackAdapter implements SlackAdapter {
  public messages: string[] = [];
  constructor(private readonly failOnce = false) {}
  private hasFailed = false;

  async send(result: AnalysisResult): Promise<DeliveryRecord> {
    if (!result.slackPayload) {
      return {
        channel: "slack",
        status: "skipped",
        target: "disabled",
        timestamp: new Date().toISOString(),
        message: "Slack is disabled for this repository."
      };
    }
    if (this.failOnce && !this.hasFailed) {
      this.hasFailed = true;
      return {
        channel: "slack",
        status: "failed",
        target: "mock-slack-channel",
        timestamp: new Date().toISOString(),
        message: "Injected Slack failure for retry testing."
      };
    }
    this.messages.push(result.slackPayload.summary.join(" | "));
    return {
      channel: "slack",
      status: "sent",
      target: "mock-slack-channel",
      timestamp: new Date().toISOString(),
      message: "Slack summary delivered."
    };
  }
}

export class RealSlackAdapter implements SlackAdapter {
  constructor(private readonly webhookUrl: string) {}

  async send(result: AnalysisResult): Promise<DeliveryRecord> {
    if (!result.slackPayload) {
      return {
        channel: "slack",
        status: "skipped",
        target: "disabled",
        timestamp: new Date().toISOString(),
        message: "Slack is disabled for this repository."
      };
    }

    const attentionEmoji = result.brief.attentionLevel === "high" ? "🚨" : result.brief.attentionLevel === "medium" ? "⚠️" : "📘";

    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `${attentionEmoji} PR Intelligence: ${result.snapshot.repoName} #${result.snapshot.prNumber}`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Title:* ${result.snapshot.title}\n*Author:* ${result.snapshot.author}\n*Attention Level:* ${attentionEmoji} \`${result.brief.attentionLevel.toUpperCase()}\``
        }
      },
      {
        type: "divider"
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*💡 Overview*\n${result.brief.managementSummary}`
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Confidence:* ${Math.round(result.brief.confidence * 100)}%`
          },
          {
            type: "mrkdwn",
            text: `*Files Changed:* ${result.snapshot.files.length}`
          }
        ]
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "🔍 Review Now",
              emoji: true
            },
            url: result.snapshot.url,
            style: "primary"
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "📁 View Files",
              emoji: true
            },
            url: `${result.snapshot.url}/files`
          }
        ]
      }
    ];

    const response = await fetch(this.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `${attentionEmoji} PR Analysis for ${result.snapshot.repoName} #${result.snapshot.prNumber}`,
        blocks
      })
    });

    if (!response.ok) {
      return {
        channel: "slack",
        status: "failed",
        target: this.webhookUrl,
        timestamp: new Date().toISOString(),
        message: `Slack webhook failed: ${response.status}`
      };
    }

    return {
      channel: "slack",
      status: "sent",
      target: this.webhookUrl,
      timestamp: new Date().toISOString(),
      message: "Slack summary delivered."
    };
  }
}
