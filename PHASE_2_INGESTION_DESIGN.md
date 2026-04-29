# Phase 2: Smart Material Ingestion System Design

## Overview

The smart material ingestion system will:
1. **Extract resonance properties** from uploaded materials (code, docs, simulations)
2. **Analyze their Human Design signatures** (what gates/lines/codons they embody)
3. **Route them to the correct storage** (Neo4j for canonical, Supabase for dynamic)
4. **Inject them into orchestrator reasoning** so the AI actually uses them
5. **Learn from feedback** to improve classification over time

## Architecture

### Layer 1: Material Analysis Engine

**Purpose**: Understand what a material is and what it contains.

**Inputs**:
- File content (code, docs, text, JSON, YAML, etc.)
- File metadata (name, type, size)
- User context (what they're working on)

**Process**:
1. **Content Classification**: Is this code? Documentation? Data? Simulation?
2. **Domain Detection**: What domain does it belong to? (FSO, Resonance Network, social media, etc.)
3. **Resonance Extraction**: What gates/lines/codons does it embody?
4. **Significance Scoring**: How important is this material?

**Output**:
```typescript
{
  materialId: string;
  classification: "code" | "documentation" | "data" | "simulation" | "social-media";
  domain: "fso" | "resonance-network" | "social-media" | "science-lab" | "other";
  resonanceSignature: {
    gates: number[]; // Which gates does this embody?
    lines: number[]; // Which lines?
    codons: string[]; // Which amino acids?
    elementalQualities: string[]; // C, H, O, N, S, P, etc.
    designProperties: Record<string, any>; // Human Design properties
  };
  significance: number; // 0-100 score
  suggestedStorage: "neo4j" | "supabase"; // Where should this go?
  summary: string; // AI-generated summary
  keyInsights: string[]; // What's important about this?
}
```

### Layer 2: Resonance Signature Engine

**Purpose**: Extract the "design DNA" of a material.

**How it works**:
1. **Parse the material** - Extract key concepts, functions, structures
2. **Map to Human Design** - What gates/lines/codons does each concept represent?
3. **Build signature** - Aggregate into a resonance profile
4. **Score relevance** - How strongly does each property apply?

**Example**:
- FSO code with "agent behavior" → Gate 25 (Innocence), Line 1 (Survival)
- Social media connection logic → Gate 13 (Listening), Line 3 (Acceptance)
- Neural network training → Gate 3 (Difficulty), Line 2 (Chaos)

### Layer 3: Context Injection Engine

**Purpose**: Make materials available to the orchestrator when they're needed.

**How it works**:
1. **Store resonance signature** in Supabase (dynamic) or Neo4j (canonical)
2. **Index by gates/lines/codons** so agents can query by design
3. **On chat message**: Extract user's design properties
4. **Retrieve relevant materials**: Find materials that match or complement user's design
5. **Inject into prompt**: Add material summaries to orchestrator context

**Example prompt injection**:
```
You are SYNTHAI Orchestrator...

RELEVANT MATERIALS FOR THIS USER:
- FSO Simulation Code (Gate 25, Line 1): Handles agent survival behaviors
- Social Media Network (Gate 13, Line 3): Connection logic based on resonance
- Neural Training Data (Gate 3, Line 2): Chaos-based learning patterns

These materials are relevant to your user's design and current conversation.
```

### Layer 4: Learning & Refinement

**Purpose**: Get smarter at classification over time.

**How it works**:
1. **User provides feedback**: "This material should go to Neo4j" or "This is more important than you thought"
2. **System learns**: Adjust resonance extraction and routing logic
3. **Improve over time**: Each correction makes the next classification better

## Database Schema Extensions

### New Tables

```sql
-- Store resonance signatures
CREATE TABLE resonanceSignatures (
  id INT PRIMARY KEY AUTO_INCREMENT,
  materialId INT NOT NULL,
  gateNumbers JSON, -- [25, 13, 3, ...]
  lineNumbers JSON, -- [1, 3, 2, ...]
  codons JSON, -- ["Histidine", "Leucine", ...]
  elementalQualities JSON, -- ["C", "H", "O", ...]
  designProperties JSON, -- {determination: "...", cognition: "..."}
  significanceScore INT, -- 0-100
  suggestedStorage ENUM('neo4j', 'supabase'),
  createdAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (materialId) REFERENCES ingestedMaterials(id)
);

-- Track what materials are relevant to which users
CREATE TABLE userMaterialRelevance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  materialId INT NOT NULL,
  relevanceScore FLOAT, -- 0-1
  lastRetrieved TIMESTAMP,
  userFeedback ENUM('helpful', 'neutral', 'not-helpful'),
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (materialId) REFERENCES ingestedMaterials(id),
  UNIQUE KEY (userId, materialId)
);

-- Track ingestion classification feedback
CREATE TABLE ingestionFeedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  materialId INT NOT NULL,
  userCorrection JSON, -- {field: "classification", oldValue: "code", newValue: "simulation"}
  reason TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (materialId) REFERENCES ingestedMaterials(id)
);
```

## Implementation Steps

### Step 1: Build Resonance Extraction Engine
- Create `server/resonanceExtractor.ts`
- Implement gate/line/codon mapping logic
- Add elemental quality detection
- Create design property analyzer

### Step 2: Build Context Injection Engine
- Modify `server/routers.ts` message.send to:
  - Extract user's design properties
  - Query relevant materials
  - Inject into system prompt
- Add material retrieval helpers to `server/db.ts`

### Step 3: Update Material Ingestion Router
- Modify `material.ingest` to:
  - Call resonance extractor
  - Store signature in database
  - Return classification to user
  - Ask for feedback if uncertain

### Step 4: Add Learning Loop
- Create `server/ingestionLearning.ts`
- Track user corrections
- Adjust extraction logic based on feedback
- Improve significance scoring

### Step 5: Test End-to-End
- Upload a material
- Verify resonance signature is extracted
- Verify it appears in orchestrator responses
- Verify user can correct classification
- Verify system learns from corrections

## Success Criteria

✅ **When this phase is complete:**
1. Users can upload materials and see extracted resonance properties
2. Orchestrator mentions relevant materials in responses
3. Materials actually influence orchestrator reasoning
4. User can correct classifications and system learns
5. Over time, classification accuracy improves
6. Materials are properly routed to Neo4j or Supabase

## Credit Estimate

- Resonance extraction engine: 20 credits
- Context injection: 20 credits
- Database updates: 10 credits
- Testing & refinement: 10 credits
- **Total: 60 credits**

## Timeline

- Start: Now
- Estimated completion: 2-3 hours
- Ready for Phase 3: Agent System
