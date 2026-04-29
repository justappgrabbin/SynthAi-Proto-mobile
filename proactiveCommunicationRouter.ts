/**
 * Proactive Communication Router
 * 
 * tRPC router for proactive insight generation and communication
 */

import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  generateProactiveInsights,
  generateInsightMessage,
  getPendingInsights,
  sendProactiveMessage,
  getInsightHistory,
  evaluateInsightEffectiveness,
  scheduleProactiveCommunication,
} from "./proactiveCommunicationEngine";

export const proactiveCommunicationRouter = router({
  /**
   * Generate proactive insights for user
   */
  generateInsights: protectedProcedure.query(async ({ ctx }) => {
    try {
      const insights = await generateProactiveInsights(ctx.user.id);

      return {
        success: true,
        count: insights.length,
        insights,
      };
    } catch (error) {
      console.error("Error generating insights:", error);
      throw new Error("Failed to generate insights");
    }
  }),

  /**
   * Get pending actionable insights
   */
  getPending: protectedProcedure.query(async ({ ctx }) => {
    try {
      const insights = await getPendingInsights(ctx.user.id);

      return {
        success: true,
        count: insights.length,
        insights,
      };
    } catch (error) {
      console.error("Error getting pending insights:", error);
      throw new Error("Failed to get pending insights");
    }
  }),

  /**
   * Generate natural language message for an insight
   */
  generateMessage: protectedProcedure
    .input(
      z.object({
        type: z.enum(["observation", "pattern", "opportunity", "warning", "suggestion", "milestone"]),
        title: z.string(),
        content: z.string(),
        suggestedAction: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const insight = {
          userId: ctx.user.id,
          type: input.type,
          title: input.title,
          content: input.content,
          confidence: 0.7,
          actionable: true,
          suggestedAction: input.suggestedAction,
          createdAt: new Date(),
        };

        const message = await generateInsightMessage(insight);

        return {
          success: true,
          message,
        };
      } catch (error) {
        console.error("Error generating message:", error);
        throw new Error("Failed to generate message");
      }
    }),

  /**
   * Send proactive message to user
   */
  send: protectedProcedure
    .input(
      z.object({
        type: z.enum(["observation", "pattern", "opportunity", "warning", "suggestion", "milestone"]),
        title: z.string(),
        content: z.string(),
        confidence: z.number().min(0).max(1),
        actionable: z.boolean(),
        suggestedAction: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const insight = {
          userId: ctx.user.id,
          type: input.type,
          title: input.title,
          content: input.content,
          confidence: input.confidence,
          actionable: input.actionable,
          suggestedAction: input.suggestedAction,
          createdAt: new Date(),
        };

        const result = await sendProactiveMessage(ctx.user.id, insight);

        return result;
      } catch (error) {
        console.error("Error sending proactive message:", error);
        throw new Error("Failed to send proactive message");
      }
    }),

  /**
   * Get insight history
   */
  getHistory: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      try {
        const history = await getInsightHistory(ctx.user.id, input.limit || 10);

        return {
          success: true,
          count: history.length,
          history,
        };
      } catch (error) {
        console.error("Error getting insight history:", error);
        throw new Error("Failed to get insight history");
      }
    }),

  /**
   * Evaluate insight effectiveness
   */
  evaluateEffectiveness: protectedProcedure
    .input(
      z.object({
        insightId: z.number(),
        wasHelpful: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await evaluateInsightEffectiveness(ctx.user.id, input.insightId, input.wasHelpful);

        return {
          success: true,
          message: "Insight feedback recorded",
        };
      } catch (error) {
        console.error("Error evaluating insight effectiveness:", error);
        throw new Error("Failed to evaluate insight effectiveness");
      }
    }),

  /**
   * Schedule proactive communication
   */
  schedule: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      await scheduleProactiveCommunication(ctx.user.id);

      return {
        success: true,
        message: "Proactive communication scheduled",
      };
    } catch (error) {
      console.error("Error scheduling proactive communication:", error);
      throw new Error("Failed to schedule proactive communication");
    }
  }),
});
