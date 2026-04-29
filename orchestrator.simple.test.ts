import { describe, it, expect } from "vitest";
import * as db from "./db";

describe("Orchestrator Database Operations", () => {
  describe("Module Creation", () => {
    it("should create a GNN module successfully", async () => {
      const result = await db.createModule(1, "GNN", "Graph Neural Network");
      expect(result).toBeDefined();
    });

    it("should create a Resonance module successfully", async () => {
      const result = await db.createModule(1, "Resonance", "Harmonic Network");
      expect(result).toBeDefined();
    });

    it("should create an Embodied Reality module successfully", async () => {
      const result = await db.createModule(1, "Embodied Reality", "Physical Grounding");
      expect(result).toBeDefined();
    });

    it("should retrieve modules by user ID", async () => {
      await db.createModule(1, "GNN", "Test");
      const modules = await db.getModulesByUserId(1);
      expect(Array.isArray(modules)).toBe(true);
    });
  });

  describe("Agent Creation", () => {
    it("should create an agent with role", async () => {
      const result = await db.createAgent(1, "CodeAssembler", "code-assembler", "Organize code");
      expect(result).toBeDefined();
    });

    it("should retrieve agents by user ID", async () => {
      await db.createAgent(1, "TestAgent", "architect", "Design");
      const agents = await db.getAgentsByUserId(1);
      expect(Array.isArray(agents)).toBe(true);
    });
  });

  describe("Material Ingestion", () => {
    it("should ingest a material with module mapping", async () => {
      const result = await db.addIngestedMaterial(1, "test.ts", "code", "const x = 1;", ["GNN"]);
      expect(result).toBeDefined();
    });

    it("should retrieve ingested materials by user ID", async () => {
      await db.addIngestedMaterial(1, "file.ts", "code", "code", ["GNN"]);
      const materials = await db.getIngestedMaterialsByUserId(1);
      expect(Array.isArray(materials)).toBe(true);
    });
  });

  describe("Assembly Tasks", () => {
    it("should create an assembly task", async () => {
      const result = await db.createAssemblyTask(1, "code-organization", "Organize", "Refactor");
      expect(result).toBeDefined();
    });

    it("should retrieve assembly tasks by user ID", async () => {
      await db.createAssemblyTask(1, "module-integration", "Task", "Suggestion");
      const tasks = await db.getAssemblyTasksByUserId(1);
      expect(Array.isArray(tasks)).toBe(true);
    });
  });

  describe("Diagram Generation", () => {
    it("should create a diagram record", async () => {
      const result = await db.createDiagram(1, "GNN topology", "topology");
      expect(result).toBeDefined();
    });

    it("should retrieve diagrams by user ID", async () => {
      await db.createDiagram(1, "Test diagram", "concept-art");
      const diagrams = await db.getDiagramsByUserId(1);
      expect(Array.isArray(diagrams)).toBe(true);
    });
  });

  describe("Research References", () => {
    it("should add a research reference", async () => {
      const result = await db.addResearchReference(
        1,
        "GNN Paper",
        "https://example.com",
        "Summary",
        "high"
      );
      expect(result).toBeDefined();
    });

    it("should retrieve research references by user ID", async () => {
      await db.addResearchReference(1, "Paper", "url", "Summary", "medium");
      const refs = await db.getResearchReferencesByUserId(1);
      expect(Array.isArray(refs)).toBe(true);
    });
  });

  describe("Conversation Management", () => {
    it("should create a conversation", async () => {
      const result = await db.createConversation(1, "Test Session");
      expect(result).toBeDefined();
    });

    it("should retrieve conversations by user ID", async () => {
      await db.createConversation(1, "Session 1");
      const conversations = await db.getConversationsByUserId(1);
      expect(Array.isArray(conversations)).toBe(true);
    });
  });

  describe("Core Orchestrator Capabilities", () => {
    it("should support the three core modules: GNN, Resonance, Embodied Reality", async () => {
      await db.createModule(1, "GNN", "Graph Neural Network");
      await db.createModule(1, "Resonance", "Harmonic Network");
      await db.createModule(1, "Embodied Reality", "Physical Grounding");

      const modules = await db.getModulesByUserId(1);
      const moduleNames = modules.map((m) => m.name);

      expect(moduleNames).toContain("GNN");
      expect(moduleNames).toContain("Resonance");
      expect(moduleNames).toContain("Embodied Reality");
    });

    it("should support material ingestion with auto-mapping", async () => {
      const result = await db.addIngestedMaterial(
        1,
        "gnn-code.ts",
        "code",
        "Graph neural network implementation",
        ["GNN"]
      );
      expect(result).toBeDefined();

      const materials = await db.getIngestedMaterialsByUserId(1);
      const gnnMaterial = materials.find((m) => m.fileName === "gnn-code.ts");
      expect(gnnMaterial?.mappedModules).toContain("GNN");
    });

    it("should support autonomous assembly suggestions", async () => {
      const result = await db.createAssemblyTask(
        1,
        "code-organization",
        "Organize GNN module",
        "Refactor into smaller components"
      );
      expect(result).toBeDefined();

      const tasks = await db.getAssemblyTasksByUserId(1);
      expect(tasks.length).toBeGreaterThan(0);
    });

    it("should support agent training pipeline", async () => {
      const result = await db.createAgent(
        1,
        "CodeAssembler",
        "code-assembler",
        "Autonomously organize and assemble code"
      );
      expect(result).toBeDefined();

      const agents = await db.getAgentsByUserId(1);
      expect(agents.length).toBeGreaterThan(0);
    });

    it("should support diagram and concept art generation", async () => {
      const result = await db.createDiagram(1, "GNN topology with 3 layers", "topology");
      expect(result).toBeDefined();

      const diagrams = await db.getDiagramsByUserId(1);
      expect(diagrams.length).toBeGreaterThan(0);
    });

    it("should support live research integration", async () => {
      const result = await db.addResearchReference(
        1,
        "Graph Neural Networks: A Review",
        "https://example.com/gnn-review",
        "Comprehensive overview of GNN architectures and applications",
        "high"
      );
      expect(result).toBeDefined();

      const refs = await db.getResearchReferencesByUserId(1);
      expect(refs.length).toBeGreaterThan(0);
    });
  });
});
