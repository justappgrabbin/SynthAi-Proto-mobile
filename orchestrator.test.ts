import { describe, it, expect, beforeEach, vi } from "vitest";
import * as db from "./db";

describe("Orchestrator Core Functionality", () => {
  describe("Conversation Management", () => {
    it("should create a conversation for a user", async () => {
      const result = await db.createConversation(1, "Test Session");
      expect(result).toBeDefined();
    });

    it("should retrieve conversations by user ID", async () => {
      await db.createConversation(1, "Session 1");
      await db.createConversation(1, "Session 2");
      
      const conversations = await db.getConversationsByUserId(1);
      expect(conversations.length).toBeGreaterThanOrEqual(2);
    });

    it("should retrieve a specific conversation by ID", async () => {
      const createResult = await db.createConversation(1, "Test");
      const conversationId = (createResult as any).insertId;
      
      const conversation = await db.getConversationById(conversationId);
      expect(conversation).toBeDefined();
      expect(conversation?.userId).toBe(1);
    });
  });

  describe("Message Management", () => {
    it("should add a user message to a conversation", async () => {
      const createResult = await db.createConversation(1, "Test");
      const conversationId = (createResult as any).insertId;
      
      const result = await db.addMessage(conversationId, "user", "Hello orchestrator");
      expect(result).toBeDefined();
    });

    it("should add an assistant message to a conversation", async () => {
      const createResult = await db.createConversation(1, "Test");
      const conversationId = (createResult as any).insertId;
      
      const result = await db.addMessage(conversationId, "assistant", "Response from orchestrator");
      expect(result).toBeDefined();
    });

    it("should retrieve all messages from a conversation", async () => {
      const createResult = await db.createConversation(1, "Test");
      const conversationId = (createResult as any).insertId;
      
      await db.addMessage(conversationId, "user", "Message 1");
      await db.addMessage(conversationId, "assistant", "Response 1");
      
      const messages = await db.getMessagesByConversationId(conversationId);
      expect(messages.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Material Ingestion", () => {
    it("should ingest a material and map to modules", async () => {
      const result = await db.addIngestedMaterial(
        1,
        "test.ts",
        "code",
        "const x = 1;",
        ["GNN"]
      );
      expect(result).toBeDefined();
    });

    it("should retrieve ingested materials by user ID", async () => {
      await db.addIngestedMaterial(1, "file1.ts", "code", "code1", ["GNN"]);
      await db.addIngestedMaterial(1, "file2.ts", "code", "code2", ["Resonance"]);
      
      const materials = await db.getIngestedMaterialsByUserId(1);
      expect(materials.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Module Management", () => {
    it("should create a GNN module", async () => {
      const result = await db.createModule(1, "GNN", "Graph Neural Network");
      expect(result).toBeDefined();
    });

    it("should create a Resonance module", async () => {
      const result = await db.createModule(1, "Resonance", "Harmonic Network");
      expect(result).toBeDefined();
    });

    it("should create an Embodied Reality module", async () => {
      const result = await db.createModule(1, "Embodied Reality", "Physical Grounding");
      expect(result).toBeDefined();
    });

    it("should retrieve modules by user ID", async () => {
      await db.createModule(1, "GNN", "Graph Neural Network");
      await db.createModule(1, "Resonance", "Harmonic Network");
      
      const modules = await db.getModulesByUserId(1);
      expect(modules.length).toBeGreaterThanOrEqual(2);
    });

    it("should retrieve a specific module by ID", async () => {
      const createResult = await db.createModule(1, "GNN", "Test");
      const moduleId = (createResult as any).insertId;
      
      const module = await db.getModuleById(moduleId);
      expect(module).toBeDefined();
      expect(module?.name).toBe("GNN");
    });
  });

  describe("Agent Management", () => {
    it("should create an agent with a role", async () => {
      const result = await db.createAgent(
        1,
        "CodeAssembler",
        "code-assembler",
        "Organize and assemble code modules"
      );
      expect(result).toBeDefined();
    });

    it("should retrieve agents by user ID", async () => {
      await db.createAgent(1, "Agent1", "architect", "Design");
      await db.createAgent(1, "Agent2", "researcher", "Research");
      
      const agents = await db.getAgentsByUserId(1);
      expect(agents.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Assembly Tasks", () => {
    it("should create an assembly task", async () => {
      const result = await db.createAssemblyTask(
        1,
        "code-organization",
        "Organize GNN module",
        "Refactor into smaller components"
      );
      expect(result).toBeDefined();
    });

    it("should retrieve assembly tasks by user ID", async () => {
      await db.createAssemblyTask(1, "code-organization", "Task 1", "Suggestion 1");
      await db.createAssemblyTask(1, "module-integration", "Task 2", "Suggestion 2");
      
      const tasks = await db.getAssemblyTasksByUserId(1);
      expect(tasks.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Diagram Generation", () => {
    it("should create a diagram record", async () => {
      const result = await db.createDiagram(
        1,
        "GNN topology with 3 layers",
        "topology"
      );
      expect(result).toBeDefined();
    });

    it("should retrieve diagrams by user ID", async () => {
      await db.createDiagram(1, "Diagram 1", "topology");
      await db.createDiagram(1, "Diagram 2", "concept-art");
      
      const diagrams = await db.getDiagramsByUserId(1);
      expect(diagrams.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Research References", () => {
    it("should add a research reference", async () => {
      const result = await db.addResearchReference(
        1,
        "Graph Neural Networks: A Review",
        "https://example.com/paper",
        "Overview of GNN architectures",
        "high"
      );
      expect(result).toBeDefined();
    });

    it("should retrieve research references by user ID", async () => {
      await db.addResearchReference(1, "Paper 1", "url1", "Summary 1", "high");
      await db.addResearchReference(1, "Paper 2", "url2", "Summary 2", "medium");
      
      const references = await db.getResearchReferencesByUserId(1);
      expect(references.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Integration Scenarios", () => {
    it("should handle a complete workflow: conversation -> materials -> modules", async () => {
      // Create conversation
      const convResult = await db.createConversation(1, "Workflow Test");
      const conversationId = (convResult as any).insertId || 1;
      
      // Add messages
      if (conversationId) {
        await db.addMessage(conversationId, "user", "I want to organize my GNN module");
        await db.addMessage(conversationId, "assistant", "I'll help you organize the GNN module");
      }
      
      // Ingest material
      await db.addIngestedMaterial(1, "gnn.ts", "code", "GNN implementation", ["GNN"]);
      
      // Create module
      const modResult = await db.createModule(1, "GNN", "Graph Neural Network");
      const moduleId = (modResult as any).insertId;
      
      // Create assembly task
      await db.createAssemblyTask(1, "code-organization", "Organize GNN", "Refactor GNN");
      
      // Verify all data was stored
      const messages = await db.getMessagesByConversationId(conversationId);
      const materials = await db.getIngestedMaterialsByUserId(1);
      const module = await db.getModuleById(moduleId);
      
      expect(messages.length).toBeGreaterThanOrEqual(2);
      expect(materials.length).toBeGreaterThanOrEqual(1);
      expect(module?.name).toBe("GNN");
    });
  });
});
