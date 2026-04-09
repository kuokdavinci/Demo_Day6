import type { AnalysisResult, DeliveryRecord } from "../../shared/src/index";

export interface DiscordAdapter {
  send(result: AnalysisResult): Promise<DeliveryRecord>;
}

export class FakeDiscordAdapter implements DiscordAdapter {
  public messages: string[] = [];

  async send(result: AnalysisResult): Promise<DeliveryRecord> {
    if (!result.discordPayload) {
      return {
        channel: "discord",
        status: "skipped",
        target: "disabled",
        timestamp: new Date().toISOString(),
        message: "Discord is disabled for this repository."
      };
    }
    this.messages.push(result.discordPayload.summary.join(" | "));
    return {
      channel: "discord",
      status: "sent",
      target: "mock-discord-channel",
      timestamp: new Date().toISOString(),
      message: "Discord summary delivered."
    };
  }
}

export class RealDiscordAdapter implements DiscordAdapter {
  constructor(private readonly webhookUrl: string) {}

  async send(result: AnalysisResult): Promise<DeliveryRecord> {
    if (!result.discordPayload) {
      return {
        channel: "discord",
        status: "skipped",
        target: "disabled",
        timestamp: new Date().toISOString(),
        message: "Discord is disabled for this repository."
      };
    }

    const attentionEmoji = result.brief.attentionLevel === "high" ? "🚨" : result.brief.attentionLevel === "medium" ? "⚠️" : "📘";

    const response = await fetch(this.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `${attentionEmoji} **PR Analysis: ${result.snapshot.repoName} #${result.snapshot.prNumber}**`,
        embeds: [
          {
            title: result.snapshot.title,
            url: result.snapshot.url,
            description: result.brief.managementSummary,
            color: result.brief.attentionLevel === "high" ? 15158332 : result.brief.attentionLevel === "medium" ? 15844367 : 3066993,
            fields: [
              { name: "Author", value: result.snapshot.author, inline: true },
              { name: "Attention", value: `${attentionEmoji} ${result.brief.attentionLevel.toUpperCase()}`, inline: true },
              { name: "Confidence", value: `${Math.round(result.brief.confidence * 100)}%`, inline: true },
              {
                name: "Technical Summary",
                value:
                  result.brief.technicalSummary.length > 1024
                    ? result.brief.technicalSummary.slice(0, 1021) + "..."
                    : result.brief.technicalSummary
              }
            ],
            footer: {
              text: "PR Intelligence Agent · AI Powered"
            },
            timestamp: new Date().toISOString()
          }
        ]
      })
    });

    if (!response.ok) {
      return {
        channel: "discord",
        status: "failed",
        target: this.webhookUrl,
        timestamp: new Date().toISOString(),
        message: `Discord webhook failed: ${response.status}`
      };
    }

    return {
      channel: "discord",
      status: "sent",
      target: this.webhookUrl,
      timestamp: new Date().toISOString(),
      message: "Discord summary delivered."
    };
  }
}
