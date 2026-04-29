import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { fiveLevelMorphSystem } from "./fiveLevelMorphSystem";

export const morphRouter = router({
  /**
   * Morph INTENT level
   */
  morphIntent: publicProcedure
    .input(z.object({
      traits: z.record(z.string(), z.number()),
      intensity: z.number().default(0.7),
    }))
    .mutation(({ input }: any) => {
      fiveLevelMorphSystem.morphIntent(input.traits, input.intensity);
      return { success: true, state: fiveLevelMorphSystem.getState() };
    }),

  /**
   * Morph UPLOAD level
   */
  morphUpload: publicProcedure
    .input(z.object({
      fileCount: z.number(),
      totalSize: z.number(),
    }))
    .mutation(({ input }: any) => {
      fiveLevelMorphSystem.morphUpload(input.fileCount, input.totalSize);
      return { success: true, state: fiveLevelMorphSystem.getState() };
    }),

  /**
   * Morph ENVIRONMENT level
   */
  morphEnvironment: publicProcedure
    .input(z.object({
      nodeCount: z.number(),
      tension: z.number(),
      geometry: z.string(),
    }))
    .mutation(({ input }: any) => {
      fiveLevelMorphSystem.morphEnvironment(input.nodeCount, input.tension, input.geometry);
      return { success: true, state: fiveLevelMorphSystem.getState() };
    }),

  /**
   * Morph TRANSPERSONAL level
   */
  morphTranspersonal: publicProcedure
    .input(z.object({
      resonance: z.number(),
      awareness: z.number(),
    }))
    .mutation(({ input }: any) => {
      fiveLevelMorphSystem.morphTranspersonal(input.resonance, input.awareness);
      return { success: true, state: fiveLevelMorphSystem.getState() };
    }),

  /**
   * Morph SOCIAL level
   */
  morphSocial: publicProcedure
    .input(z.object({
      agentCount: z.number(),
      interactionCount: z.number(),
    }))
    .mutation(({ input }: any) => {
      fiveLevelMorphSystem.morphSocial(input.agentCount, input.interactionCount);
      return { success: true, state: fiveLevelMorphSystem.getState() };
    }),

  /**
   * Get current system state
   */
  getState: publicProcedure.query(() => {
    return fiveLevelMorphSystem.getState();
  }),

  /**
   * Get specific level
   */
  getLevel: publicProcedure
    .input(z.object({
      level: z.enum(["intent", "upload", "environment", "transpersonal", "social"]),
    }))
    .query(({ input }: any) => {
      return fiveLevelMorphSystem.getLevel(input.level);
    }),

  /**
   * Get system metrics
   */
  getMetrics: publicProcedure.query(() => {
    return fiveLevelMorphSystem.getMetrics();
  }),

  /**
   * Get morph history
   */
  getHistory: publicProcedure
    .input(z.object({
      limit: z.number().default(100),
    }))
    .query(({ input }: any) => {
      return fiveLevelMorphSystem.getHistory(input.limit);
    }),

  /**
   * Update environmental influence on all levels
   */
  updateEnvironmentalInfluence: publicProcedure
    .input(z.object({
      intensity: z.number(),
    }))
    .mutation(({ input }: any) => {
      fiveLevelMorphSystem.updateEnvironmentalInfluence(input.intensity);
      return { success: true };
    }),

  /**
   * Reset system
   */
  reset: publicProcedure.mutation(() => {
    fiveLevelMorphSystem.reset();
    return { success: true };
  }),
});
