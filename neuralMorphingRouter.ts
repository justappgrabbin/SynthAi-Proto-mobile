/**
 * Neural Morphing Router
 * 
 * tRPC router for neural morphing and system adaptation
 */

import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  applyFastMorphing,
  applySlowMorphing,
  applyStableMorphing,
  calculateMorphingRecommendation,
  getNeuralNetworkSummary,
  getMorphingHistory,
  decayFastWeights,
  promoteSlowToStable,
} from "./neuralMorphingEngine";

export const neuralMorphingRouter = router({
  /**
   * Apply fast morphing (real-time adjustment)
   */
  applyFast: protectedProcedure
    .input(
      z.object({
        changeType: z.string(),
        newValue: z.string(),
        confidence: z.number().min(0).max(1).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await applyFastMorphing(
          ctx.user.id,
          input.changeType,
          input.newValue,
          input.confidence || 0.8
        );

        return {
          success: true,
          message: "Fast morphing applied",
          morphingState: result,
        };
      } catch (error) {
        console.error("Error applying fast morphing:", error);
        throw new Error("Failed to apply fast morphing");
      }
    }),

  /**
   * Apply slow morphing (long-term pattern evolution)
   */
  applySlow: protectedProcedure
    .input(
      z.object({
        changeType: z.string(),
        newValue: z.string(),
        successRate: z.number().min(0).max(1).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await applySlowMorphing(
          ctx.user.id,
          input.changeType,
          input.newValue,
          input.successRate || 0.5
        );

        return {
          success: true,
          message: "Slow morphing applied",
          morphingState: result,
        };
      } catch (error) {
        console.error("Error applying slow morphing:", error);
        throw new Error("Failed to apply slow morphing");
      }
    }),

  /**
   * Apply stable morphing (canonical knowledge update)
   */
  applyStable: protectedProcedure
    .input(
      z.object({
        changeType: z.string(),
        newValue: z.string(),
        confidence: z.number().min(0.9).max(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await applyStableMorphing(
          ctx.user.id,
          input.changeType,
          input.newValue,
          input.confidence
        );

        return {
          success: true,
          message: "Stable morphing applied",
          morphingState: result,
        };
      } catch (error) {
        console.error("Error applying stable morphing:", error);
        throw new Error("Failed to apply stable morphing");
      }
    }),

  /**
   * Calculate morphing recommendation based on feedback
   */
  calculateRecommendation: protectedProcedure
    .input(
      z.object({
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
        context: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const recommendation = await calculateMorphingRecommendation(ctx.user.id, {
          rating: input.rating,
          comment: input.comment,
          context: input.context,
        });

        return recommendation;
      } catch (error) {
        console.error("Error calculating morphing recommendation:", error);
        throw new Error("Failed to calculate morphing recommendation");
      }
    }),

  /**
   * Get neural network summary
   */
  getSummary: protectedProcedure.query(async ({ ctx }) => {
    try {
      const summary = getNeuralNetworkSummary(ctx.user.id);
      return summary;
    } catch (error) {
      console.error("Error getting neural network summary:", error);
      throw new Error("Failed to get neural network summary");
    }
  }),

  /**
   * Get morphing history
   */
  getHistory: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      try {
        const history = await getMorphingHistory(ctx.user.id, input.limit || 20);
        return history;
      } catch (error) {
        console.error("Error getting morphing history:", error);
        throw new Error("Failed to get morphing history");
      }
    }),

  /**
   * Decay fast weights (called periodically)
   */
  decayFastWeights: protectedProcedure
    .input(z.object({ decayRate: z.number().min(0).max(1).optional() }))
    .mutation(async ({ input, ctx }) => {
      try {
        decayFastWeights(ctx.user.id, input.decayRate || 0.95);

        return {
          success: true,
          message: "Fast weights decayed",
        };
      } catch (error) {
        console.error("Error decaying fast weights:", error);
        throw new Error("Failed to decay fast weights");
      }
    }),

  /**
   * Promote slow weights to stable
   */
  promoteToStable: protectedProcedure
    .input(z.object({ threshold: z.number().optional() }))
    .mutation(async ({ input, ctx }) => {
      try {
        promoteSlowToStable(ctx.user.id, input.threshold || 85);

        return {
          success: true,
          message: "Slow weights promoted to stable",
        };
      } catch (error) {
        console.error("Error promoting weights:", error);
        throw new Error("Failed to promote weights");
      }
    }),
});
