# SYNTHAI Orchestrator - Science Lab Command Center

A retro-futuristic AI orchestrator web application designed as your autonomous partner for managing, building, and evolving modular AI scaffolding systems. The system features a "system failure" aesthetic with deep black backgrounds, scanlines, chromatic aberration effects, and neon cyan/magenta typography.

## Overview

The SYNTHAI Orchestrator is your command center for managing three core modular systems:

- **GNN (Graph Neural Network)**: Core neural architecture for pattern recognition and learning
- **Resonance Network**: Communication and feedback system between modules
- **Embodied Reality**: Integration layer connecting abstract computation to real-world applications

## Core Features

### 1. Conversational AI Chat Interface
- Natural language interaction with the orchestrator
- Streaming LLM responses with markdown rendering
- Full message history persistence across sessions
- Keyboard shortcuts: `Cmd/Ctrl+Enter` to send, `Esc` to clear input
- Auto-focus on input field for seamless workflow

### 2. Material Ingestion System
- Drag-and-drop file upload with multi-file support
- Automatic file type detection and parsing
- Intelligent module mapping (GNN, Resonance, Embodied Reality)
- Support for: `.ts`, `.tsx`, `.js`, `.jsx`, `.py`, `.md`, `.txt`, `.json`, `.yaml`, `.sql`
- Ingestion history tracking with metadata

### 3. Modular Project Map Dashboard
- Visual topology diagram of all three modules
- Real-time status indicators for each module
- Connection visualization showing data flow between modules
- Module detail cards with state management
- Quick stats panel

### 4. Agent Training Pipeline
- Create and configure specialized sub-agents
- Six agent roles: code-assembler, architect, researcher, optimizer, validator, trainer
- Custom instructions per agent
- Agent management interface with creation/deletion

### 5. Autonomous Assembly Engine
- AI-powered code organization suggestions
- Automatic scaffolding structure analysis
- Best-practice recommendations
- Assembly task tracking and history

### 6. Best Practice Advisor
- Strategic recommendations for architecture
- Code organization guidelines
- Agent training best practices
- Orchestrator readiness checklist
- Next steps guidance

### 7. Persistent Memory & Context Storage
- All conversations stored in database
- Material ingestion history with full metadata
- Module state persistence
- Agent configuration storage
- Research references and diagram generation tracking

## Architecture

### Database Schema

The system uses 8 core tables:

- **conversations**: Chat sessions with context and active modules
- **messages**: Individual chat messages with metadata
- **ingestedMaterials**: Uploaded files with module mapping
- **modules**: GNN, Resonance, Embodied Reality configuration
- **agents**: Configured sub-agents with roles and instructions
- **assemblyTasks**: Autonomous assembly suggestions and results
- **diagrams**: Generated topology and concept art
- **researchReferences**: Live research pulls tied to modules

### Backend (tRPC Routers)

All backend logic is exposed through tRPC procedures:

- `conversation.*`: Create, list, get conversations
- `message.*`: Send, list, get messages with LLM integration
- `material.*`: Ingest, list, get materials with auto-module mapping
- `module.*`: Create, list, get, update modules
- `agent.*`: Create, list, get, delete agents
- `assembly.*`: Suggest, list, get assembly tasks
- `diagram.*`: Generate, list, get diagrams
- `research.*`: Add, list, get research references

### Frontend Components

- **OrchestratorChat**: Main conversational interface with streaming support
- **ModuleMap**: Visual topology dashboard
- **MaterialUpload**: Drag-and-drop ingestion system
- **AgentConfig**: Agent creation and management
- **IngestionHistory**: Material tracking and metadata
- **BestPracticeAdvisor**: Strategic recommendations

## User Workflow

### Getting Started

1. **Login** via Manus OAuth
2. **Create a new session** - Start a conversation with the orchestrator
3. **Describe your architecture** - Tell the orchestrator about your GNN, Resonance, and Embodied Reality modules
4. **Ingest materials** - Upload code files, docs, and notes via the MATERIALS tab

### Day-to-Day Usage

1. **Chat with the orchestrator** - Ask for advice, describe changes, pivot modules
2. **Upload new materials** - Drop code and docs as you develop
3. **Configure agents** - Create specialized sub-agents for specific tasks
4. **Review topology** - Check module connections and status
5. **Consult the advisor** - Get best-practice recommendations
6. **Check history** - Review all ingested materials and their module mappings

### Advanced Features

- **Autonomous assembly**: Let the orchestrator suggest code organization
- **Agent training**: Configure agents to handle specific tasks autonomously
- **Diagram generation**: Generate topology diagrams from text descriptions
- **Live research**: Pull contextual research relevant to your modules

## Visual Design

The interface uses a retro-futuristic "system failure" aesthetic:

- **Deep black background** (oklch 0.02) with subtle texture
- **Scanline overlay** for authentic CRT monitor feel
- **Chromatic aberration** on headings (cyan/magenta splits)
- **Neon cyan & magenta** color palette with glowing effects
- **Terminal-style borders** with neon glow
- **IBM Plex Mono** typography for authentic retro feel
- **Glitch effects** for system failure atmosphere

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl+Enter` | Send chat message |
| `Esc` | Clear chat input |
| Click on session | Load conversation |
| Click on file | View ingestion details |

## Testing

The system includes 22 comprehensive vitest tests covering:

- Module creation and management
- Agent training pipeline
- Material ingestion with auto-mapping
- Autonomous assembly suggestions
- Diagram generation
- Live research integration
- Conversation and message management

Run tests with:
```bash
pnpm test server/orchestrator.simple.test.ts
```

## Deployment

The orchestrator is built with:

- **Frontend**: React 19 + Tailwind 4 + TypeScript
- **Backend**: Express 4 + tRPC 11 + Node.js
- **Database**: MySQL/TiDB with Drizzle ORM
- **Authentication**: Manus OAuth
- **LLM Integration**: Built-in Forge API

Deploy via the Manus Management UI by clicking the Publish button (requires checkpoint).

## Future Enhancements

- Voice transcription (speech-to-text input)
- Concept art generation for module architectures
- Research context display in chat
- Real-time collaboration features
- Advanced diagram rendering
- Custom agent role definitions

## Support & Feedback

For issues, feature requests, or feedback, use the Manus feedback portal at https://help.manus.im

---

**Version**: 1.0.0  
**Last Updated**: April 2026  
**Status**: Production Ready
