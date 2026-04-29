import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { nodeStateMachine, Message } from "./nodeStateMachine";

export const nodeRouter = router({
  /**
   * Create a new node
   */
  create: publicProcedure
    .input(z.object({ id: z.string(), gate: z.number().min(1).max(64) }))
    .mutation(({ input }: any) => {
      const node = nodeStateMachine.createNode(input.id, input.gate);
      return node;
    }),

  /**
   * Get all nodes
   */
  getAll: publicProcedure.query(() => {
    return nodeStateMachine.getAllNodes();
  }),

  /**
   * Get node by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }: any) => {
      return nodeStateMachine.getNode(input.id);
    }),

  /**
   * Get nodes by state
   */
  getByState: publicProcedure
    .input(z.object({ state: z.enum(["dormant", "listening", "processing", "resonating", "integrating", "morphing"]) }))
    .query(({ input }: any) => {
      return nodeStateMachine.getNodesByState(input.state);
    }),

  /**
   * Send a message between nodes
   */
  sendMessage: publicProcedure
    .input(z.object({
      from: z.string(),
      to: z.string(),
      type: z.enum(["intent", "upload", "environment", "transpersonal", "social", "interaction"]),
      payload: z.any(),
    }))
    .mutation(({ input }: any) => {
      const message: Message = {
        from: input.from,
        to: input.to,
        type: input.type,
        payload: input.payload,
        timestamp: Date.now(),
      };
      nodeStateMachine.sendMessage(message);
      return { success: true, message };
    }),

  /**
   * Get message history
   */
  getMessageHistory: publicProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(({ input }: any) => {
      return nodeStateMachine.getMessageHistory(input.limit);
    }),

  /**
   * Get state transition statistics
   */
  getTransitionStats: publicProcedure.query(() => {
    return nodeStateMachine.getTransitionStats();
  }),

  /**
   * Process one cycle (advance all nodes)
   */
  processCycle: publicProcedure.mutation(() => {
    nodeStateMachine.processCycle();
    return { success: true, nodes: nodeStateMachine.getAllNodes() };
  }),

  /**
   * Broadcast a message to all nodes
   */
  broadcast: publicProcedure
    .input(z.object({
      type: z.enum(["intent", "upload", "environment", "transpersonal", "social", "interaction"]),
      payload: z.any(),
    }))
    .mutation(({ input }: any) => {
      const nodes = nodeStateMachine.getAllNodes();
      const messages: Message[] = [];
      
      nodes.forEach(node => {
        const message: Message = {
          from: "system",
          to: node.id,
          type: input.type,
          payload: input.payload,
          timestamp: Date.now(),
        };
        nodeStateMachine.sendMessage(message);
        messages.push(message);
      });

      return { success: true, messageCount: messages.length };
    }),

  /**
   * Get system status
   */
  getStatus: publicProcedure.query(() => {
    const nodes = nodeStateMachine.getAllNodes();
    const states = {
      dormant: nodes.filter(n => n.state === "dormant").length,
      listening: nodes.filter(n => n.state === "listening").length,
      processing: nodes.filter(n => n.state === "processing").length,
      resonating: nodes.filter(n => n.state === "resonating").length,
      integrating: nodes.filter(n => n.state === "integrating").length,
      morphing: nodes.filter(n => n.state === "morphing").length,
    };

    const avgResonance = nodes.length > 0 
      ? nodes.reduce((sum, n) => sum + n.resonance, 0) / nodes.length 
      : 0;

    return {
      totalNodes: nodes.length,
      states,
      avgResonance,
      messageCount: nodeStateMachine.getMessageHistory(1).length,
    };
  }),
});
