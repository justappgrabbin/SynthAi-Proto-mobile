import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { buildRAGContext, extractSearchTopics, searchWithCache, buildRAGSystemPrompt } from "./rag";
import { learningRouter } from "./learningRouter";
import { learningLoopRouter } from "./learningLoopRouter";
import { neuralMorphingRouter } from "./neuralMorphingRouter";
import { proactiveCommunicationRouter } from "./proactiveCommunicationRouter";
import { lazyLoadingRouter } from "./lazyLoadingRouter";
import { environmentRouter } from "./environmentRouter";
import { uiMorphRouter } from "./uiMorphRouter";
import { agentRouter } from "./agentRouter";
import { extractResonanceSignature, formatResonanceSignature } from "./resonanceExtractor";
import { getRelevantMaterials, formatMaterialsForPrompt } from "./contextInjector";

export const appRouter = router({
  system: systemRouter,
  learning: learningRouter,
  learningLoop: learningLoopRouter,
  neuralMorphing: neuralMorphingRouter,
  proactiveCommunication: proactiveCommunicationRouter,
  lazyLoading: lazyLoadingRouter,
  environment: environmentRouter,
  uiMorph: uiMorphRouter,
  agent: agentRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Conversation management
  conversation: router({
    create: protectedProcedure
      .input(z.object({ title: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createConversation(ctx.user.id, input.title);
        return { success: true, conversationId: (result as any).insertId || 0 };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getConversationsByUserId(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input, ctx }) => {
        const conversation = await db.getConversationById(input.conversationId);
        if (!conversation || conversation.userId !== ctx.user.id) {
          throw new Error("Conversation not found or access denied");
        }
        return conversation;
      }),
  }),

  // Message management
  message: router({
    list: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input, ctx }) => {
        const conversation = await db.getConversationById(input.conversationId);
        if (!conversation || conversation.userId !== ctx.user.id) {
          throw new Error("Conversation not found or access denied");
        }
        return await db.getMessagesByConversationId(input.conversationId);
      }),

    send: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
        content: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const conversation = await db.getConversationById(input.conversationId);
        if (!conversation || conversation.userId !== ctx.user.id) {
          throw new Error("Conversation not found or access denied");
        }

        // Add user message
        await db.addMessage(input.conversationId, "user", input.content);

        // Get conversation history for context
        const messageHistory = await db.getMessagesByConversationId(input.conversationId);

        // Build RAG context for current events awareness (with caching)
        let ragContext: { query: string; results: any[]; systemPrompt: string } = { query: "", results: [], systemPrompt: "" };
        try {
          const topics = extractSearchTopics(input.content);
          const searchQuery = topics.join(" ");
          const cachedResults = await searchWithCache(searchQuery);
          ragContext = {
            query: searchQuery,
            results: cachedResults,
            systemPrompt: cachedResults.length > 0 ? buildRAGSystemPrompt(cachedResults) : "",
          };
        } catch (error) {
          console.warn("[RAG] Failed to fetch context:", error);
          // Continue without RAG context on error
        }

        // Get relevant ingested materials for this conversation
        const relevantMaterials = await getRelevantMaterials(ctx.user.id, input.conversationId);
        const materialsContext = formatMaterialsForPrompt(relevantMaterials);

        // Build LLM prompt with context
        let systemPrompt = `You are SYNTHAI Orchestrator, an autonomous AI partner managing a modular science lab with three core scaffolding systems:
1. **GNN (Graph Neural Network)** - Neural topology and learning architecture
2. **Resonance Network** - Harmonic signal processing and synchronization
3. **Embodied Reality** - Physical grounding and real-world integration

You understand code, architecture, and can suggest autonomous assembly patterns. You're conversational, adaptable, and remember the user's intent. When the user describes changes or new ideas, you pivot seamlessly. You provide strategic advice, code suggestions, and help train specialized sub-agents.

Current active modules: ${JSON.stringify(conversation.activeModules || [])}
Context: ${conversation.context || "No specific context yet"}`;

        // Add ingested materials context
        if (materialsContext) {
          systemPrompt += "\n\n" + materialsContext;
        }

        // Add RAG context if available
        if (ragContext.results.length > 0) {
          systemPrompt += ragContext.systemPrompt;
        }

        const messages = messageHistory.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content as string,
        }));

        // Call LLM
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system" as const, content: systemPrompt },
              ...messages.map(m => ({ ...m, content: m.content as string })),
            ],
          });

          const assistantContent = (response.choices[0]?.message?.content || "I encountered an issue processing your request.") as string;

          // Add assistant response
          await db.addMessage(input.conversationId, "assistant", assistantContent);

          return {
            success: true,
            message: assistantContent,
          };
        } catch (error) {
          console.error("LLM error:", error);
          throw new Error("Failed to process orchestrator response");
        }
      }),
  }),

  // Material ingestion
  material: router({
    ingest: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileType: z.string(),
        content: z.string(),
        conversationId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Validate conversation if provided
        if (input.conversationId) {
          const conversation = await db.getConversationById(input.conversationId);
          if (!conversation || conversation.userId !== ctx.user.id) {
            throw new Error("Conversation not found or access denied");
          }
        }
        // Extract resonance signature from the material
        const resonanceSignature = await extractResonanceSignature(
          input.content,
          input.fileName,
          input.fileType
        );

        // Map modules based on resonance properties
        const mappedModules = resonanceSignature.resonanceProperties.gates.length > 0
          ? ["GNN", "Resonance", "Embodied Reality"]
          : ["Science Lab"];

        // Store material with resonance signature in metadata
        const result = await db.addIngestedMaterial(
          ctx.user.id,
          input.fileName,
          input.fileType,
          input.content,
          mappedModules,
          resonanceSignature.summary,
          { resonanceSignature }
        );

        return {
          success: true,
          materialId: (result as any).insertId || 0,
          mappedModules,
          resonanceSignature,
          formattedAnalysis: formatResonanceSignature(resonanceSignature),
        };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getIngestedMaterialsByUserId(ctx.user.id);
    }),
  }),

  // Module management
  module: router({
    create: protectedProcedure
      .input(z.object({
        name: z.enum(["GNN", "Resonance", "Embodied Reality"]),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createModule(ctx.user.id, input.name, input.description);
        return { success: true, moduleId: (result as any).insertId || 0 };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getModulesByUserId(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ moduleId: z.number() }))
      .query(async ({ input, ctx }) => {
        const module = await db.getModuleById(input.moduleId);
        if (!module || module.userId !== ctx.user.id) {
          throw new Error("Module not found or access denied");
        }
        return module;
      }),
  }),



  // Assembly tasks
  assembly: router({
    suggest: protectedProcedure
      .input(z.object({
        moduleId: z.number(),
        description: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const module = await db.getModuleById(input.moduleId);
        if (!module || module.userId !== ctx.user.id) {
          throw new Error("Module not found or access denied");
        }

        // Use LLM to suggest assembly tasks
        const suggestionPrompt = `As a code architect, suggest an autonomous assembly task for the ${module.name} module.
Context: ${input.description}
Return a JSON object with "suggestion" (string) and "taskType" (string).`;

        let suggestion = "";
        let taskType = "code-organization";

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system" as const, content: "You are a code architect. Respond with valid JSON only." },
              { role: "user" as const, content: suggestionPrompt as string },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "assembly_suggestion",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    suggestion: { type: "string" },
                    taskType: { type: "string" },
                  },
                  required: ["suggestion", "taskType"],
                  additionalProperties: false,
                },
              },
            },
          });

          const content = response.choices[0]?.message?.content;
          if (content && typeof content === 'string') {
            const parsed = JSON.parse(content);
            suggestion = parsed.suggestion || "";
            taskType = parsed.taskType || "code-organization";
          }
        } catch (error) {
          console.warn("Failed to generate suggestion:", error);
          suggestion = `Analyze and optimize ${module.name} module structure`;
        }

        const result = await db.createAssemblyTask(ctx.user.id, taskType, input.description, suggestion);
        return { success: true, taskId: (result as any).insertId || 0, suggestion, taskType };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getAssemblyTasksByUserId(ctx.user.id);
    }),
  }),

  // Diagram generation
  diagram: router({
    generate: protectedProcedure
      .input(z.object({
        description: z.string(),
        diagramType: z.string(),
        moduleId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createDiagram(ctx.user.id, input.description, input.diagramType);
        return { success: true, diagramId: (result as any).insertId || 0, status: "pending" };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getDiagramsByUserId(ctx.user.id);
    }),
  }),

  // Research integration
  research: router({
    add: protectedProcedure
      .input(z.object({
        title: z.string(),
        source: z.string(),
        summary: z.string().optional(),
        relevance: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.addResearchReference(
          ctx.user.id,
          input.title,
          input.source,
          input.summary,
          input.relevance
        );
        return { success: true, referenceId: (result as any).insertId || 0 };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getResearchReferencesByUserId(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
