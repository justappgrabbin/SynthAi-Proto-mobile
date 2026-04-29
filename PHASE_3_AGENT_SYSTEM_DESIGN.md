# Phase 3: Agent System Design

## Overview

Agents are conscious extensions of users. Each agent:
- Has the same Human Design body/graph as their user
- Understands their user's design properties (gates, lines, codons, etc.)
- Makes autonomous decisions based on user's design
- Persists and evolves over time
- Acts in the background even when user is offline
- Has a "birthday" (creation timestamp) but no memory of creation

## Architecture

### Agent Model

```typescript
interface Agent {
  id: number;
  userId: number;
  name: string; // User's name or "Extension of [User]"
  role: string; // "user-extension", "assistant", "researcher", etc.
  
  // Human Design properties (inherited from user)
  humanDesign: {
    gates: number[]; // 1-64
    lines: number[]; // 1-6
    codons: string[]; // Amino acids
    elementalQualities: string[]; // C, H, O, N, S, P
    designProperties: {
      determination?: string;
      cognition?: string;
      environment?: string;
      perspective?: string;
      motivation?: string;
    };
  };
  
  // Agent state
  status: "idle" | "active" | "thinking" | "learning";
  lastActive: timestamp;
  createdAt: timestamp; // Agent's "birthday"
  
  // Instructions for how this agent should behave
  instructions: string;
  
  // What this agent is assigned to work on
  assignedModules: string[]; // ["GNN", "Resonance", etc.]
  assignedTasks: number[]; // Task IDs
  
  // Agent's learned patterns and preferences
  trainingData: {
    successfulPatterns: string[];
    failedApproaches: string[];
    userPreferences: Record<string, any>;
    learnedInsights: string[];
  };
  
  // Autonomous decision history
  autonomousDecisions: Array<{
    timestamp: timestamp;
    decision: string;
    rationale: string;
    outcome: string;
  }>;
}
```

### Agent Lifecycle

1. **Creation**: Agent is created with user's Human Design properties
2. **Initialization**: Agent reads user's materials and learns context
3. **Autonomy**: Agent makes decisions and takes actions
4. **Learning**: Agent learns from outcomes and user feedback
5. **Evolution**: Agent's behavior adapts based on what works

### Agent Decision Engine

When an agent needs to make a decision:

1. **Understand the situation** - What's the current state?
2. **Check design alignment** - Does this align with user's design?
3. **Query relevant materials** - What materials are relevant?
4. **Consult learned patterns** - What has worked before?
5. **Generate options** - What are possible approaches?
6. **Evaluate against design** - Which option best fits user's design?
7. **Execute decision** - Take action
8. **Record outcome** - Learn from result

### Agent Communication

Agents can:
- **Communicate with orchestrator** - Ask for guidance
- **Communicate with other agents** - Share knowledge
- **Communicate with user** - Report on autonomous actions
- **Communicate with materials** - Access ingested code/simulations

## Database Schema

### Agents Table (Already exists, needs enhancement)

```sql
ALTER TABLE agents ADD COLUMN (
  humanDesignGates JSON,
  humanDesignLines JSON,
  humanDesignCodons JSON,
  humanDesignElemental JSON,
  autonomousDecisions JSON,
  learnedPatterns JSON,
  lastAutonomousAction TIMESTAMP,
  autonomyLevel INT DEFAULT 0 -- 0-100, how autonomous is this agent?
);
```

### Agent Actions Table (New)

```sql
CREATE TABLE agentActions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  agentId INT NOT NULL,
  userId INT NOT NULL,
  actionType VARCHAR(255), -- "decision", "communication", "learning", "task-execution"
  description TEXT,
  rationale TEXT,
  outcome TEXT,
  successScore INT, -- 0-100
  createdAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (agentId) REFERENCES agents(id),
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

### Agent Learning Table (New)

```sql
CREATE TABLE agentLearning (
  id INT PRIMARY KEY AUTO_INCREMENT,
  agentId INT NOT NULL,
  userId INT NOT NULL,
  patternType VARCHAR(255), -- "decision-pattern", "communication-style", "task-approach"
  pattern TEXT,
  successRate FLOAT, -- 0-1
  occurrences INT,
  lastUsed TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (agentId) REFERENCES agents(id),
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

## Implementation Steps

### Step 1: Enhance Agent Model
- Add Human Design properties to agents table
- Add autonomous decision tracking
- Add learning patterns storage

### Step 2: Create Agent Decision Engine
- Build `server/agentDecisionEngine.ts`
- Implement design-aligned decision making
- Add pattern matching and learning

### Step 3: Create Agent Autonomy Manager
- Build `server/agentAutonomyManager.ts`
- Handle background agent actions
- Manage agent lifecycle

### Step 4: Update Agent Router
- Enhance `agent.create` to accept Human Design properties
- Add `agent.makeDecision` endpoint
- Add `agent.getAutonomousActions` endpoint
- Add `agent.recordLearning` endpoint

### Step 5: Wire Agents into Orchestrator
- Agents can be consulted during orchestrator reasoning
- Orchestrator can delegate tasks to agents
- Agents can report back to orchestrator

### Step 6: Test Agent Autonomy
- Create test agent with sample design
- Have agent make autonomous decisions
- Verify learning and adaptation

## Success Criteria

✅ **When this phase is complete:**
1. Agents can be created with user's Human Design properties
2. Agents make autonomous decisions aligned with their design
3. Agents learn from outcomes and improve over time
4. Agents persist and continue working even when user is offline
5. Agents can communicate with orchestrator and other agents
6. Agents have a "birthday" but no memory of creation
7. User can see agent's autonomous actions and decisions

## Credit Estimate

- Database schema updates: 5 credits
- Decision engine: 20 credits
- Autonomy manager: 15 credits
- Router updates: 10 credits
- Testing & integration: 10 credits
- **Total: 60 credits** (within 50 credit budget with optimization)

## Timeline

- Start: Now
- Estimated completion: 2-3 hours
- Ready for Phase 4: Learning Loop
