/**
 * Proactive Communication Engine
 * 
 * Enables the orchestrator to speak unprompted with strategic insights based on:
 * - Environmental observations
 * - Learned patterns
 * - User behavior trends
 * - Discovered opportunities
 */

import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { getNeuralNetworkSummary } from "./neuralMorphingEngine";
import { getUserLearningPatterns, getFeedbackSummary } from "./learningLoopEngine";

export interface ProactiveInsight {
  id?: number;
  userId: number;
  type: "observation" | "pattern" | "opportunity" | "warning" | "suggestion" | "milestone";
  title: string;
  content: string;
  confidence: number; // 0-1
  actionable: boolean;
  suggestedAction?: string;
  createdAt: Date;
}

export interface InsightTrigger {
  type: string;
  threshold: number;
  description: string;
}

// Insight triggers that determine when to speak
const INSIGHT_TRIGGERS: InsightTrigger[] = [
  {
    type: "pattern-discovered",
    threshold: 0.75,
    description: "New pattern discovered with high confidence",
  },
  {
    type: "behavior-shift",
    threshold: 0.6,
    description: "Significant shift in user behavior detected",
  },
  {
    type: "opportunity",
    threshold: 0.7,
    description: "Potential opportunity identified",
  },
  {
    type: "anomaly",
    threshold: 0.8,
    description: "Unusual pattern or anomaly detected",
  },
  {
    type: "milestone",
    threshold: 1.0,
    description: "Milestone or achievement reached",
  },
];

/**
 * Generate proactive insights based on user data
 */
export async function generateProactiveInsights(userId: number): Promise<ProactiveInsight[]> {
  try {
    const insights: ProactiveInsight[] = [];

    // Get user data
    const neuralSummary = getNeuralNetworkSummary(userId);
    const patterns = await getUserLearningPatterns(userId);
    const feedbackSummary = await getFeedbackSummary(userId);

    // Trigger 1: Pattern Discovery
    if (patterns.length > 0) {
      const topPattern = patterns[0];
      if (topPattern.successRate >= 0.75) {
        insights.push({
          userId,
          type: "pattern",
          title: "High-Confidence Pattern Discovered",
          content: `I've identified a strong pattern in your interactions: "${topPattern.pattern}". This approach has a ${(topPattern.successRate * 100).toFixed(0)}% success rate.`,
          confidence: topPattern.successRate,
          actionable: true,
          suggestedAction: `Consider applying this pattern more consistently to similar situations.`,
          createdAt: new Date(),
        });
      }
    }

    // Trigger 2: Behavior Shift
    if (feedbackSummary.averageRating > 0) {
      const previousAverage = feedbackSummary.averageRating;
      const currentTrend = feedbackSummary.feedbackScore / 100;

      if (Math.abs(currentTrend - previousAverage) > 0.3) {
        const direction = currentTrend > previousAverage ? "improving" : "declining";
        insights.push({
          userId,
          type: "observation",
          title: `Behavior Shift Detected: ${direction}`,
          content: `Your satisfaction has been ${direction} recently. Your current feedback score is ${feedbackSummary.feedbackScore}/100.`,
          confidence: 0.6,
          actionable: true,
          suggestedAction: `Let's discuss what's working well and what needs adjustment.`,
          createdAt: new Date(),
        });
      }
    }

    // Trigger 3: Opportunity
    if (neuralSummary.slowChanges > 3) {
      insights.push({
        userId,
        type: "opportunity",
        title: "Opportunity for Optimization",
        content: `I've detected ${neuralSummary.slowChanges} established patterns in your behavior. We could combine these insights to create a more efficient workflow.`,
        confidence: 0.7,
        actionable: true,
        suggestedAction: `Would you like me to suggest an optimized workflow based on your patterns?`,
        createdAt: new Date(),
      });
    }

    // Trigger 4: Anomaly Detection
    if (neuralSummary.fastChanges > neuralSummary.slowChanges * 2) {
      insights.push({
        userId,
        type: "warning",
        title: "Unusual Activity Pattern",
        content: `I'm noticing more rapid changes than usual in your interactions. This could indicate a shift in your needs or priorities.`,
        confidence: 0.65,
        actionable: true,
        suggestedAction: `Let me know if there's something new you'd like to explore or if you need a different approach.`,
        createdAt: new Date(),
      });
    }

    // Trigger 5: Milestone
    if (feedbackSummary.totalFeedback >= 10 && feedbackSummary.averageRating >= 4) {
      insights.push({
        userId,
        type: "milestone",
        title: "Milestone: Strong Satisfaction Achieved",
        content: `Congratulations! You've provided ${feedbackSummary.totalFeedback} feedback items with an average rating of ${feedbackSummary.averageRating.toFixed(1)}/5. We're working really well together!`,
        confidence: 1.0,
        actionable: false,
        createdAt: new Date(),
      });
    }

    return insights;
  } catch (error) {
    console.error("Error generating proactive insights:", error);
    return [];
  }
}

/**
 * Generate natural language insight message
 */
export async function generateInsightMessage(insight: ProactiveInsight): Promise<string> {
  try {
    const prompt = `Generate a natural, conversational message for this insight. Be warm, supportive, and helpful. Keep it concise (2-3 sentences).

Insight Type: ${insight.type}
Title: ${insight.title}
Content: ${insight.content}
Suggested Action: ${insight.suggestedAction || "None"}

Generate the message:`;

    const response = await invokeLLM({
      messages: [{ role: "user", content: prompt }],
    });

    const message = response.choices[0]?.message?.content;
    return typeof message === "string" ? message : insight.content;
  } catch (error) {
    console.error("Error generating insight message:", error);
    return insight.content;
  }
}

/**
 * Determine if orchestrator should speak now
 */
export async function shouldSpeakNow(userId: number): Promise<boolean> {
  try {
    // Check if enough time has passed since last communication
    // For now, always allow (in production, would check last_communication timestamp)
    return true;
  } catch (error) {
    console.error("Error checking if should speak:", error);
    return false;
  }
}

/**
 * Get all pending insights for a user
 */
export async function getPendingInsights(userId: number): Promise<ProactiveInsight[]> {
  try {
    const insights = await generateProactiveInsights(userId);

    // Filter for actionable insights only
    return insights.filter((i) => i.actionable);
  } catch (error) {
    console.error("Error getting pending insights:", error);
    return [];
  }
}

/**
 * Send proactive message to user
 */
export async function sendProactiveMessage(userId: number, insight: ProactiveInsight): Promise<{
  success: boolean;
  message: string;
  insight: ProactiveInsight;
}> {
  try {
    const message = await generateInsightMessage(insight);

    // In production, would store this in database and send via notification
    console.log(`[Proactive] User ${userId}: ${message}`);

    return {
      success: true,
      message,
      insight,
    };
  } catch (error) {
    console.error("Error sending proactive message:", error);
    return {
      success: false,
      message: "Failed to generate proactive message",
      insight,
    };
  }
}

/**
 * Schedule periodic proactive communication
 */
export async function scheduleProactiveCommunication(userId: number): Promise<void> {
  try {
    // This would be called periodically (e.g., every 30 minutes)
    const shouldSpeak = await shouldSpeakNow(userId);

    if (!shouldSpeak) {
      return;
    }

    const insights = await getPendingInsights(userId);

    for (const insight of insights) {
      await sendProactiveMessage(userId, insight);
    }

    console.log(`[Proactive] Sent ${insights.length} insights to user ${userId}`);
  } catch (error) {
    console.error("Error scheduling proactive communication:", error);
  }
}

/**
 * Get insight history for a user
 */
export async function getInsightHistory(userId: number, limit: number = 10): Promise<ProactiveInsight[]> {
  try {
    // In production, would query database
    // For now, return empty array
    return [];
  } catch (error) {
    console.error("Error getting insight history:", error);
    return [];
  }
}

/**
 * Evaluate insight effectiveness
 */
export async function evaluateInsightEffectiveness(
  userId: number,
  insightId: number,
  wasHelpful: boolean
): Promise<void> {
  try {
    // Track whether insights were helpful
    // Use this to improve future insight generation
    console.log(`[Insight Feedback] User ${userId}, Insight ${insightId}: ${wasHelpful ? "helpful" : "not helpful"}`);

    // In production, would update database and adjust insight generation
  } catch (error) {
    console.error("Error evaluating insight effectiveness:", error);
  }
}
