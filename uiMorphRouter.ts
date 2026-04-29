import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";

const componentMap: Record<string, string> = {
  "material-upload": "Material Ingestion",
  "agent-config": "Agent Configuration",
  "module-map": "Module Topology",
  "message-feedback": "Message Feedback",
  "research-context": "Research Context",
  "learning-analytics": "Learning Analytics",
  "autonomous-suggestions": "Autonomous Suggestions",
  "environmental-observer": "Environmental Observer",
};

export const uiMorphRouter = router({
  // Analyze user request and determine which component to show
  analyzeRequest: protectedProcedure
    .input(
      z.object({
        userMessage: z.string(),
        conversationContext: z.string().optional(),
        currentModule: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const systemPrompt = `You are an AI assistant that determines which UI component to show based on user requests.

Available components:
${Object.entries(componentMap)
  .map(([id, name]) => `- ${id}: ${name}`)
  .join("\n")}

Analyze the user's request and respond with ONLY a JSON object in this format:
{
  "componentId": "component-id-here",
  "shouldShow": true/false,
  "title": "Display title for the component",
  "description": "Brief description of what this component does",
  "contextData": {
    "key": "value"
  }
}

If no component is needed, set "shouldShow" to false.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `User request: "${input.userMessage}"${
              input.conversationContext ? `\n\nContext: ${input.conversationContext}` : ""
            }${input.currentModule ? `\n\nCurrent module: ${input.currentModule}` : ""}`,
          },
        ],
      });

      try {
        const content = response.choices[0]?.message.content;
        if (typeof content !== "string") {
          return {
            componentId: null,
            shouldShow: false,
            error: "Invalid response format",
          };
        }

        // Extract JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          return {
            componentId: null,
            shouldShow: false,
            error: "No JSON found in response",
          };
        }

        const parsed = JSON.parse(jsonMatch[0]);

        // Validate component exists
        if (parsed.shouldShow && !componentMap[parsed.componentId]) {
          return {
            componentId: null,
            shouldShow: false,
            error: `Component ${parsed.componentId} not found`,
          };
        }

        return {
          componentId: parsed.componentId,
          shouldShow: parsed.shouldShow,
          title: parsed.title,
          description: parsed.description,
          contextData: parsed.contextData || {},
        };
      } catch (error) {
        return {
          componentId: null,
          shouldShow: false,
          error: "Failed to parse component decision",
        };
      }
    }),

  // Get available components
  listComponents: protectedProcedure.query(() => {
    return Object.entries(componentMap).map(([id, name]) => ({
      id,
      name,
    }));
  }),

  // Generate contextual props for a component
  getComponentContext: protectedProcedure
    .input(
      z.object({
        componentId: z.string(),
        conversationId: z.number().optional(),
        moduleId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      // Return context based on component type
      const context: Record<string, any> = {};

      if (input.componentId === "material-upload" && input.moduleId) {
        context.defaultModule = input.moduleId;
      }

      if (input.componentId === "agent-config" && input.moduleId) {
        context.moduleId = input.moduleId;
      }

      return context;
    }),
});
