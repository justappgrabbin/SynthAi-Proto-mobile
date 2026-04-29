# Morph Interface

A self-building interface that **understands** your code, **remembers** what it does in a GNN knowledge graph, and **builds from memory** when you need it.

## Philosophy

**We don't just store files. We understand them and remember the understanding.**

When you upload code:
1. **Upload** → File is received
2. **Understand** → GNN extracts intent, functionality, patterns, dependencies, insights
3. **Remember** → Stores understanding as GNN nodes (not the raw file)
4. **Build Later** → When you need it, regenerates from accumulated GNN memory
5. **Improvise** → Combines remembered knowledge creatively

The original file is kept as reference, but the GNN **only works from understanding**.

## Features

- **Upload & Paste** → Drop files or paste code
- **Smart Analysis** → Extracts intent, functionality, patterns, dependencies, key insights
- **GNN Memory** → Remembers what code does as connected nodes
- **Build from Memory** → Regenerates working code when you ask, using all accumulated knowledge
- **Improvise** → Combines remembered components creatively
- **Supabase Integration** → Persist GNN memory and original references

## Quick Start

```bash
npm install
cp .env.example .env.local
# Add your Supabase credentials
npm run dev
```

## How It Works

### Upload Phase
- Drop a file or paste code
- System immediately begins analysis

### Understand Phase (Automatic)
- Extracts **intent** from comments, class names, function names
- Identifies **functionality**: exports, methods, API calls, state management
- Detects **patterns**: inheritance, hooks, observers, factories
- Maps **dependencies**: imports, requires, external APIs
- Discovers **key insights**: architectural patterns, reusable components, optimization opportunities
- Calculates **complexity** score

### Remember Phase (Automatic)
- Creates GNN memory nodes:
  - **functionality** → What capabilities exist
  - **pattern** → How it's structured
  - **dependency** → What it needs
  - **insight** → What the GNN learned (reusable knowledge)
  - **reusable_component** → Parts that can be used in future builds
  - **improvement** → Suggested enhancements
- Connects related nodes
- Strengthens connections over time
- Tracks usage count (how often a node is used in builds)

### Build Phase (On Demand)
- You ask the GNN to build something
- It queries ALL accumulated memory for relevant nodes
- Prefers nodes that have been used before (proven useful)
- Generates working code from understanding + memory
- Reports confidence based on memory strength and usage

### Improvise Phase (Creative)
- Combines nodes from multiple remembered artifacts
- Extends functionality beyond original scope
- Creates new architectural patterns
- Builds bridges between unrelated features

## GNN Memory Architecture

```
Upload → Understand → Remember → [Build Later] → Improvise
   ↓         ↓           ↓            ↓            ↓
  File    Intent      GNN Nodes    New Code     Creative
         Functionality   (memory)   (on demand)  Extensions
         Patterns
         Dependencies
         Insights
         Reusable Components
```

## Node Types

- **functionality** → What the code does (methods, exports, capabilities)
- **pattern** → How it's structured (inheritance, hooks, observers)
- **dependency** → What it needs (imports, APIs, libraries)
- **insight** → What the GNN learned (architectural patterns, optimization opportunities)
- **reusable_component** → Parts that can be reused in future builds
- **improvement** → Suggested enhancements
- **constraint** → Limitations or requirements

Each node tracks:
- **weight** → Confidence/importance
- **usageCount** → How many times used in builds
- **lastUsedAt** → When last used
- **connections** → Related nodes

## Supabase Storage

The interface stores:
- **Original file** → Reference copy
- **GNN understanding** → Intent, functionality, patterns, insights, reusable components
- **GNN nodes** → The actual memory graph

Schema supports querying by:
- Intent ("what does this do?")
- Functionality ("what capabilities?")
- Patterns ("how is it structured?")
- Reusable components ("what can I reuse?")

## Usage Flow

1. Upload a file → Auto-analyzes and remembers
2. Upload another → More memory added
3. Ask "Build me X" → GNN queries memory and generates
4. Ask "Improvise" → GNN combines remembered knowledge creatively
5. The more you upload, the smarter the builds become
