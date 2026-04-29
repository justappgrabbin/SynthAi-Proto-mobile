"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Artifact, GNNNode, MorphOperation, SupabaseConfig } from "@/types"
import { getMorphEngine, hydrateEngine, RegenerationMode } from "@/lib/morphGNN"
import { syncArtifactToSupabase, initSupabase } from "@/lib/supabase"
import { generateId } from "@/lib/utils"

export interface ConversationMemory {
  id: string
  timestamp: string
  userMessage: string
  morphResponse: string
  situation?: string
  entities?: string[]
  insights?: string[]
  simulationId?: string
  emotionalState?: string
}

interface MorphState {
  artifacts: Artifact[]
  gnnNodes: GNNNode[]
  operations: MorphOperation[]
  conversationMemory: ConversationMemory[]
  supabaseConfig: SupabaseConfig
  isProcessing: boolean
  activeTab: "upload" | "artifacts" | "operations" | "gnn"

  addArtifact: (data: { name: string; type: "file" | "code" | "text"; content: string; language?: string }) => void
  removeArtifact: (id: string) => void
  analyzeAndRemember: (id: string) => Promise<void>
  regenerateArtifact: (id: string, context?: string, mode?: RegenerationMode) => Promise<void>
  recallFromMemory: (query: string) => Promise<{ relevantNodes: GNNNode[]; insights: string[]; suggestedComponents: string[] }>
  syncToSupabase: (id: string) => Promise<void>
  improvise: (request: string, baseId?: string) => Promise<{ code: string; explanation: string; usedNodes: GNNNode[] }>

  rememberConversation: (memory: Omit<ConversationMemory, "id" | "timestamp">) => void
  recallConversation: (query: string) => ConversationMemory[]
  getConversationContext: () => string

  setSupabaseConfig: (config: Partial<SupabaseConfig>) => void
  setActiveTab: (tab: "upload" | "artifacts" | "operations" | "gnn") => void
  clearAll: () => void
}

export const useMorphStore = create<MorphState>()(
  persist(
    (set, get) => ({
      artifacts: [],
      gnnNodes: [],
      operations: [],
      conversationMemory: [],
      supabaseConfig: { url: "", anonKey: "", connected: false },
      isProcessing: false,
      activeTab: "upload",

      addArtifact: (data) => {
        const id = generateId()
        const artifact: Artifact = {
          id,
          originalName: data.name,
          originalContent: data.content,
          type: data.type,
          language: data.language,
          understanding: {
            intent: "Pending analysis",
            functionality: [],
            dependencies: [],
            patterns: [],
            complexity: 0,
            keyInsights: [],
            reusableComponents: []
          },
          supabaseSync: {
            understandingSynced: false,
            originalSynced: false
          },
          metadata: {
            size: data.content.length,
            uploadedAt: new Date().toISOString(),
            source: "upload",
            status: "analyzing",
            morphGnnRelated: false
          }
        }

        set((state) => ({
          artifacts: [artifact, ...state.artifacts]
        }))

        get().analyzeAndRemember(id)
      },

      removeArtifact: (id) => {
        set((state) => ({
          artifacts: state.artifacts.filter((a) => a.id !== id)
        }))
      },

      analyzeAndRemember: async (id) => {
        set({ isProcessing: true })

        try {
          const artifact = get().artifacts.find((a) => a.id === id)
          if (!artifact) return

          const engine = getMorphEngine()

          const analyzed = await engine.analyzeArtifact(artifact)
          await engine.rememberArtifact(analyzed)

          set((state) => ({
            artifacts: state.artifacts.map((a) =>
              a.id === id ? analyzed : a
            ),
            gnnNodes: engine.getNodes(),
            operations: engine.getOperations()
          }))

          const { supabaseConfig } = get()
          if (supabaseConfig.connected) {
            get().syncToSupabase(id)
          }
        } finally {
          set({ isProcessing: false })
        }
      },

      regenerateArtifact: async (id, context, mode = "exact") => {
        set({ isProcessing: true })

        try {
          const artifact = get().artifacts.find((a) => a.id === id)
          if (!artifact || !artifact.understanding) return

          const engine = getMorphEngine()
          // Hydrate engine with persisted nodes before regeneration
          engine.hydrate(get().gnnNodes)

          const regenerated = await engine.regenerateArtifact(artifact, context, mode)

          set((state) => ({
            artifacts: state.artifacts.map((a) =>
              a.id === id ? regenerated : a
            ),
            gnnNodes: engine.getNodes(),
            operations: engine.getOperations()
          }))

          const { supabaseConfig } = get()
          if (supabaseConfig.connected) {
            get().syncToSupabase(id)
          }
        } finally {
          set({ isProcessing: false })
        }
      },

      recallFromMemory: async (query) => {
        const engine = getMorphEngine()
        // Hydrate before recall
        engine.hydrate(get().gnnNodes)
        const result = await engine.recall(query)

        set((state) => ({
          operations: engine.getOperations()
        }))

        return result
      },

      syncToSupabase: async (id) => {
        const artifact = get().artifacts.find((a) => a.id === id)
        if (!artifact) return

        set({ isProcessing: true })

        try {
          const result = await syncArtifactToSupabase(artifact)

          if (result.success) {
            set((state) => ({
              artifacts: state.artifacts.map((a) =>
                a.id === id 
                  ? { 
                      ...a, 
                      supabaseSync: {
                        understandingSynced: true,
                        originalSynced: true,
                        lastSyncAt: new Date().toISOString()
                      }
                    } 
                  : a
              )
            }))
          } else {
            set((state) => ({
              artifacts: state.artifacts.map((a) =>
                a.id === id 
                  ? { 
                      ...a, 
                      supabaseSync: {
                        ...a.supabaseSync,
                        syncError: result.error
                      }
                    } 
                  : a
              )
            }))
          }
        } catch (err) {
          console.error("Sync failed:", err)
        } finally {
          set({ isProcessing: false })
        }
      },

      improvise: async (request, baseId) => {
        const engine = getMorphEngine()
        engine.hydrate(get().gnnNodes)
        const baseArtifact = baseId ? get().artifacts.find(a => a.id === baseId) : undefined

        const result = await engine.improvise(request, baseArtifact)

        set((state) => ({
          operations: engine.getOperations()
        }))

        return result
      },

      rememberConversation: (memory) => {
        const newMemory: ConversationMemory = {
          ...memory,
          id: generateId(),
          timestamp: new Date().toISOString()
        }

        set((state) => ({
          conversationMemory: [newMemory, ...state.conversationMemory]
        }))
      },

      recallConversation: (query) => {
        const memories = get().conversationMemory
        const lower = query.toLowerCase()

        return memories.filter(m => 
          m.userMessage.toLowerCase().includes(lower) ||
          m.morphResponse.toLowerCase().includes(lower) ||
          m.situation?.toLowerCase().includes(lower) ||
          m.entities?.some(e => e.toLowerCase().includes(lower)) ||
          m.insights?.some(i => i.toLowerCase().includes(lower))
        )
      },

      getConversationContext: () => {
        const memories = get().conversationMemory
        if (memories.length === 0) return ""

        const recent = memories.slice(0, 5)
        return recent.map(m => 
          `[${new Date(m.timestamp).toLocaleDateString()}] User: "${m.userMessage}" -> Situation: ${m.situation || "general"} | Insights: ${m.insights?.join(", ") || "none"}`
        ).join("\n")
      },

      setSupabaseConfig: (config) => {
        // Initialize Supabase client when config is saved
        if (config.url && config.anonKey) {
          try {
            initSupabase({ url: config.url, anonKey: config.anonKey, connected: true, tables: [] })
          } catch (err) {
            console.error("Failed to initialize Supabase:", err)
          }
        }

        set((state) => ({
          supabaseConfig: { ...state.supabaseConfig, ...config }
        }))
      },

      setActiveTab: (tab) => {
        set({ activeTab: tab })
      },

      clearAll: () => {
        set({
          artifacts: [],
          gnnNodes: [],
          operations: [],
          conversationMemory: []
        })
      }
    }),
    {
      name: "morph-interface-storage",
      partialize: (state) => ({
        artifacts: state.artifacts,
        supabaseConfig: state.supabaseConfig,
        gnnNodes: state.gnnNodes,
        operations: state.operations,
        conversationMemory: state.conversationMemory
      }),
      onRehydrateStorage: () => (state) => {
        // Hydrate engine from persisted nodes after storage rehydration
        if (state?.gnnNodes && state.gnnNodes.length > 0) {
          hydrateEngine(state.gnnNodes)
        }
      }
    }
  )
)
