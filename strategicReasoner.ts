/**
 * Strategic Reasoner - Determines when and what to communicate proactively
 * The orchestrator thinks continuously and speaks strategically
 */

import { invokeLLM } from "./_core/llm";
import { observer, type EnvironmentalState } from "./environmentalObserver";

export interface StrategicInsight {
  priority: "critical" | "high" | "medium" | "low";
  category: "opportunity" | "risk" | "conflict" | "pattern" | "optimization";
  title: string;
  description: string;
  recommendation: string;
  confidence: number; // 0-100
  shouldCommunicate: boolean;
  timing: "immediate" | "soon" | "monitor"; // When to communicate
}

class StrategicReasoner {
  private lastInsights: StrategicInsight[] = [];
  private communicationHistory: Map<string, Date> = new Map(); // Track what we've already said

  /**
   * Analyze current state and generate strategic insights
   */
  async generateInsights(userId: number): Promise<StrategicInsight[]> {
    const envState = observer.getEnvironmentalState();

    if (envState.recentActions.length === 0) {
      return [];
    }

    const insights = await this.analyzeEnvironment(userId, envState);
    this.lastInsights = insights;

    return insights;
  }

  /**
   * Determine if we should communicate right now
   */
  async shouldCommunicate(userId: number): Promise<StrategicInsight | null> {
    const insights = await this.generateInsights(userId);
    const criticalInsights = insights.filter(
      (i) => i.shouldCommunicate && i.priority === "critical"
    );

    if (criticalInsights.length > 0) {
      return criticalInsights[0];
    }

    // Check if we have high-priority insights we haven't communicated yet
    const newInsights = insights.filter((i) => {
      const key = `${i.category}-${i.title}`;
      const lastCommunicated = this.communicationHistory.get(key);
      return (
        i.shouldCommunicate &&
        (!lastCommunicated || Date.now() - lastCommunicated.getTime() > 300000)
      ); // 5 minutes
    });

    if (newInsights.length > 0) {
      return newInsights[0];
    }

    return null;
  }

  /**
   * Generate proactive message based on insight
   */
  async generateProactiveMessage(insight: StrategicInsight): Promise<string> {
    const prompt = `Generate a brief, conversational message to communicate this insight:

Title: ${insight.title}
Description: ${insight.description}
Recommendation: ${insight.recommendation}
Priority: ${insight.priority}

The message should:
1. Be casual and natural (not robotic)
2. Explain the insight clearly
3. Include the recommendation
4. Be 2-3 sentences max
5. Feel like a genuine observation, not a warning

Generate the message now:`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are the orchestrator speaking to your user. You observe the system and share insights naturally and conversationally.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const message = response.choices?.[0]?.message?.content as string;
    const key = `${insight.category}-${insight.title}`;
    this.communicationHistory.set(key, new Date());

    return message || insight.recommendation;
  }

  /**
   * Analyze environment and generate insights
   */
  private async analyzeEnvironment(
    userId: number,
    envState: EnvironmentalState
  ): Promise<StrategicInsight[]> {
    const prompt = `You are observing a multi-agent system in real-time. Analyze this state:

System Health: ${envState.systemHealth}
Active Agents: ${envState.activeAgents.length}
Recent Actions: ${envState.recentActions.length}

Recent Patterns:
${envState.patterns.slice(0, 5).join("\n")}

Anomalies Detected:
${envState.anomalies.slice(0, 5).join("\n")}

Generate 2-3 strategic insights. For each, provide:
1. PRIORITY: critical/high/medium/low
2. CATEGORY: opportunity/risk/conflict/pattern/optimization
3. TITLE: Short title
4. DESCRIPTION: What's happening
5. RECOMMENDATION: What to do about it
6. CONFIDENCE: 0-100
7. SHOULD_COMMUNICATE: true/false (is this important enough to tell the user?)
8. TIMING: immediate/soon/monitor

Format as JSON array.`;

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are a strategic observer of multi-agent systems. Generate actionable insights.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "insights",
            strict: true,
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
                  category: {
                    type: "string",
                    enum: ["opportunity", "risk", "conflict", "pattern", "optimization"],
                  },
                  title: { type: "string" },
                  description: { type: "string" },
                  recommendation: { type: "string" },
                  confidence: { type: "number" },
                  shouldCommunicate: { type: "boolean" },
                  timing: { type: "string", enum: ["immediate", "soon", "monitor"] },
                },
                required: [
                  "priority",
                  "category",
                  "title",
                  "description",
                  "recommendation",
                  "confidence",
                  "shouldCommunicate",
                  "timing",
                ],
                additionalProperties: false,
              },
            },
          },
        },
      });

      const content = response.choices?.[0]?.message?.content as string;
      if (!content) return [];

      const insights = JSON.parse(content) as StrategicInsight[];
      return insights;
    } catch (error) {
      console.error("[Strategic Reasoner] Error generating insights:", error);
      return [];
    }
  }

  /**
   * Get last generated insights
   */
  getLastInsights(): StrategicInsight[] {
    return [...this.lastInsights];
  }

  /**
   * Clear communication history (for testing)
   */
  clearCommunicationHistory(): void {
    this.communicationHistory.clear();
  }
}

// Singleton instance
export const strategicReasoner = new StrategicReasoner();
