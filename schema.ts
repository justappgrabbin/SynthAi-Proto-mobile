import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Conversation table for storing chat history and context.
 * Each conversation is a session with the orchestrator.
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }),
  activeModules: json("activeModules").$type<string[]>().default([]).notNull(), // ["GNN", "Resonance", "Embodied Reality"]
  context: text("context"), // Persistent context about current work
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Messages table for storing individual chat messages.
 * Supports both user and assistant messages with metadata.
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  metadata: json("metadata").$type<Record<string, unknown>>().default({}).notNull(), // For storing streaming state, references, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Ingested materials table for storing uploaded files, code snippets, and documents.
 * Each material is tagged with modules and processing metadata.
 */
export const ingestedMaterials = mysqlTable("ingestedMaterials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  conversationId: int("conversationId"),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileType: varchar("fileType", { length: 64 }).notNull(), // "code", "document", "image", "audio", etc.
  content: text("content"), // Raw or processed content
  summary: text("summary"), // AI-generated summary
  mappedModules: json("mappedModules").$type<string[]>().default([]).notNull(), // Which modules this belongs to
  tags: json("tags").$type<string[]>().default([]).notNull(),
  metadata: json("metadata").$type<Record<string, any>>().default({}).notNull(), // Resonance signature and other metadata
  s3Url: varchar("s3Url", { length: 512 }), // S3 storage URL for large files
  processingStatus: mysqlEnum("processingStatus", ["pending", "processing", "complete", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IngestedMaterial = typeof ingestedMaterials.$inferSelect;
export type InsertIngestedMaterial = typeof ingestedMaterials.$inferInsert;

/**
 * Modules table for representing the three core scaffolding modules.
 * GNN (Graph Neural Network), Resonance Network, and Embodied Reality.
 */
export const modules = mysqlTable("modules", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(), // "GNN", "Resonance", "Embodied Reality"
  description: text("description"),
  status: mysqlEnum("status", ["idle", "active", "processing", "error"]).default("idle").notNull(),
  architecture: json("architecture").$type<Record<string, unknown>>().default({}).notNull(), // Module topology/structure
  dependencies: json("dependencies").$type<string[]>().default([]).notNull(), // Other modules this depends on
  metadata: json("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Module = typeof modules.$inferSelect;
export type InsertModule = typeof modules.$inferInsert;

/**
 * Agents table for storing configured sub-agents.
 * Each agent can be trained and instructed to perform specific tasks.
 */
export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(), // e.g., "code-assembler", "architect", "researcher"
  instructions: text("instructions"), // System prompt for the agent
  trainingData: json("trainingData").$type<Record<string, unknown>>().default({}).notNull(),
  status: mysqlEnum("status", ["idle", "active", "training"]).default("idle").notNull(),
  assignedModules: json("assignedModules").$type<string[]>().default([]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

/**
 * Assembly tasks table for tracking autonomous assembly operations.
 * Stores suggestions, applied changes, and assembly history.
 */
export const assemblyTasks = mysqlTable("assemblyTasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  conversationId: int("conversationId"),
  moduleId: int("moduleId"),
  taskType: varchar("taskType", { length: 255 }).notNull(), // "code-organization", "module-integration", etc.
  description: text("description"),
  suggestion: text("suggestion"), // The proposed change
  applied: boolean("applied").default(false).notNull(),
  result: text("result"), // Result of applying the suggestion
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AssemblyTask = typeof assemblyTasks.$inferSelect;
export type InsertAssemblyTask = typeof assemblyTasks.$inferInsert;

/**
 * Diagrams table for storing generated diagrams and concept art.
 * Stores both the description and the generated image URL.
 */
export const diagrams = mysqlTable("diagrams", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  conversationId: int("conversationId"),
  moduleId: int("moduleId"),
  description: text("description").notNull(),
  diagramType: varchar("diagramType", { length: 255 }).notNull(), // "topology", "resonance-map", "concept-art", etc.
  imageUrl: varchar("imageUrl", { length: 512 }),
  generationStatus: mysqlEnum("generationStatus", ["pending", "generating", "complete", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Diagram = typeof diagrams.$inferSelect;
export type InsertDiagram = typeof diagrams.$inferInsert;

/**
 * Research references table for storing live research pulls and contextual data.
 * Links research to specific modules and conversations.
 */
export const researchReferences = mysqlTable("researchReferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  conversationId: int("conversationId"),
  moduleId: int("moduleId"),
  title: varchar("title", { length: 512 }).notNull(),
  source: varchar("source", { length: 512 }).notNull(), // URL or source identifier
  summary: text("summary"),
  relevance: varchar("relevance", { length: 255 }), // "high", "medium", "low"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ResearchReference = typeof researchReferences.$inferSelect;
export type InsertResearchReference = typeof researchReferences.$inferInsert;


/**
 * Feedback table for storing user ratings and feedback on orchestrator responses.
 * Enables learning and self-improvement based on what works.
 */
export const feedback = mysqlTable("feedback", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  messageId: int("messageId").notNull(),
  conversationId: int("conversationId").notNull(),
  rating: mysqlEnum("rating", ["good", "meh", "bad"]).notNull(),
  notes: text("notes"), // User's detailed feedback
  context: json("context").$type<Record<string, unknown>>().default({}).notNull(), // Context about what was being discussed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = typeof feedback.$inferInsert;

/**
 * Learning patterns table for tracking what types of responses work best.
 * Stores patterns detected from feedback analysis.
 */
export const learningPatterns = mysqlTable("learningPatterns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  patternType: varchar("patternType", { length: 255 }).notNull(), // "response-style", "module-focus", "code-quality", etc.
  description: text("description"),
  effectivenessScore: int("effectivenessScore").default(0).notNull(), // 0-100 score
  occurrences: int("occurrences").default(0).notNull(), // How many times this pattern was observed
  context: json("context").$type<Record<string, unknown>>().default({}).notNull(), // Context where pattern works best
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LearningPattern = typeof learningPatterns.$inferSelect;
export type InsertLearningPattern = typeof learningPatterns.$inferInsert;

/**
 * Self-modification history table for tracking changes the orchestrator makes to itself.
 * Stores all prompt rewrites and configuration changes for audit and rollback.
 */
export const selfModifications = mysqlTable("selfModifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  agentId: int("agentId"),
  modificationType: varchar("modificationType", { length: 255 }).notNull(), // "prompt-rewrite", "agent-config", "module-update", etc.
  oldValue: text("oldValue"), // Previous state
  newValue: text("newValue"), // New state
  rationale: text("rationale"), // Why this change was made
  impactScore: int("impactScore").default(0).notNull(), // Measured impact on effectiveness (0-100)
  approved: boolean("approved").default(false).notNull(), // User approval status
  appliedAt: timestamp("appliedAt"), // When the modification was applied
  rolledBackAt: timestamp("rolledBackAt"), // If rolled back, when
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SelfModification = typeof selfModifications.$inferSelect;
export type InsertSelfModification = typeof selfModifications.$inferInsert;

/**
 * Autonomous suggestions table for storing improvement proposals.
 * The orchestrator generates these based on pattern analysis.
 */
export const autonomousSuggestions = mysqlTable("autonomousSuggestions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  conversationId: int("conversationId"),
  suggestionType: varchar("suggestionType", { length: 255 }).notNull(), // "agent-improvement", "module-optimization", "workflow-change", etc.
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  proposedChange: text("proposedChange"), // What the orchestrator suggests
  rationale: text("rationale"), // Why this would help
  confidenceScore: int("confidenceScore").default(0).notNull(), // 0-100 confidence
  status: mysqlEnum("status", ["pending", "approved", "rejected", "applied"]).default("pending").notNull(),
  approvedAt: timestamp("approvedAt"),
  appliedAt: timestamp("appliedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AutonomousSuggestion = typeof autonomousSuggestions.$inferSelect;
export type InsertAutonomousSuggestion = typeof autonomousSuggestions.$inferInsert;

/**
 * Inter-agent communication table for multi-agent coordination.
 * Agents share knowledge and learn from each other.
 */
export const agentCommunications = mysqlTable("agentCommunications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fromAgentId: int("fromAgentId").notNull(),
  toAgentId: int("toAgentId").notNull(),
  messageType: varchar("messageType", { length: 255 }).notNull(), // "knowledge-share", "request-help", "report-success", etc.
  message: text("message").notNull(),
  metadata: json("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentCommunication = typeof agentCommunications.$inferSelect;
export type InsertAgentCommunication = typeof agentCommunications.$inferInsert;
