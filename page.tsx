'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, Brain, Terminal, Network, 
  Sparkles, Zap, GitBranch, Cpu,
  ArrowRight, Code2, RefreshCw,
  Database, Cloud, HardDrive, Lightbulb,
  Home, Command, Mic
} from 'lucide-react'
import { useMorphStore } from '@/hooks/useMorphStore'
import { UploadZone } from '@/components/UploadZone'
import { ArtifactCard } from '@/components/ArtifactCard'
import { SupabaseConnector } from '@/components/SupabaseConnector'
import { OperationLog } from '@/components/OperationLog'
import { GNNVisualizer } from '@/components/GNNVisualizer'
import { CommandInterface } from '@/components/CommandInterface'
import { MorphBeing } from '@/components/MorphBeing'
import { MorphOrchestrator } from '@/components/MorphOrchestrator'
import { cn } from '@/lib/utils'

export default function MorphOS() {
  const [osMode, setOsMode] = useState<'desktop' | 'immersive'>('desktop')
  const [activeModule, setActiveModule] = useState<string | null>(null)

  const activeTab = useMorphStore((state) => state.activeTab)
  const setActiveTab = useMorphStore((state) => state.setActiveTab)
  const artifacts = useMorphStore((state) => state.artifacts)
  const operations = useMorphStore((state) => state.operations)
  const gnnNodes = useMorphStore((state) => state.gnnNodes)
  const supabaseConfig = useMorphStore((state) => state.supabaseConfig)
  const conversationMemory = useMorphStore((state) => state.conversationMemory)

  const tabs = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'artifacts', label: 'Memory', icon: Brain, count: artifacts.length },
    { id: 'operations', label: 'Operations', icon: Terminal, count: operations.length },
    { id: 'gnn', label: 'GNN', icon: Network, count: gnnNodes.length },
  ]

  const understoodCount = artifacts.filter(a => a.metadata.status !== 'analyzing').length
  const regeneratedCount = artifacts.filter(a => a.metadata.status === 'regenerated').length
  const storedCount = artifacts.filter(a => a.supabaseSync.understandingSynced).length
  const totalNodes = gnnNodes.length
  const totalInsights = gnnNodes.filter(n => n.nodeType === 'insight').length

  return (
    <div className="min-h-screen bg-void-900 relative">
      {/* Morph Orchestrator - Always Present OS Core */}
      <MorphOrchestrator />

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-6 pt-20">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <motion.div
                  className="absolute inset-0 bg-morph-500/30 rounded-full morph-blob"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 90, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <GitBranch className="w-5 h-5 text-morph-400" />
                </div>
              </div>

              <div>
                <h1 className="text-xl font-bold text-white">Morph OS</h1>
                <p className="text-xs text-gray-400">
                  {conversationMemory.length} conversations • {gnnNodes.length} memory nodes • Orchestrator Active
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setOsMode(osMode === 'desktop' ? 'immersive' : 'desktop')}
                className="px-3 py-1.5 bg-void-800 border border-void-600 rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
              >
                {osMode === 'desktop' ? 'Immersive Mode' : 'Desktop Mode'}
              </button>
            </div>
          </div>
        </header>

        {/* Pipeline Visualization */}
        <div className="bg-void-800 border border-void-600 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-300">Morph Memory Pipeline</h3>
            <span className="text-xs text-gray-500">
              {supabaseConfig.connected ? 'Supabase connected' : 'Supabase not connected'}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <motion.div 
              className={cn(
                'p-3 rounded-lg border text-center space-y-2 cursor-pointer hover:border-blue-400 transition-colors',
                artifacts.length > 0 ? 'border-blue-500/30 bg-blue-500/10' : 'border-void-600 bg-void-900'
              )}
              onClick={() => setActiveModule('upload')}
              whileHover={{ scale: 1.02 }}
            >
              <Upload className="w-5 h-5 mx-auto text-blue-400" />
              <div className="text-xs font-medium text-white">1. Upload</div>
              <div className="text-xs text-gray-500">Drop or paste</div>
              <div className="text-lg font-bold text-blue-400">{artifacts.length}</div>
            </motion.div>

            <motion.div 
              className={cn(
                'p-3 rounded-lg border text-center space-y-2 cursor-pointer hover:border-purple-400 transition-colors',
                understoodCount > 0 ? 'border-purple-500/30 bg-purple-500/10' : 'border-void-600 bg-void-900'
              )}
              onClick={() => setActiveModule('understand')}
              whileHover={{ scale: 1.02 }}
            >
              <Brain className="w-5 h-5 mx-auto text-purple-400" />
              <div className="text-xs font-medium text-white">2. Understand</div>
              <div className="text-xs text-gray-500">GNN extracts intent</div>
              <div className="text-lg font-bold text-purple-400">{understoodCount}</div>
            </motion.div>

            <motion.div 
              className={cn(
                'p-3 rounded-lg border text-center space-y-2 cursor-pointer hover:border-yellow-400 transition-colors',
                totalNodes > 0 ? 'border-yellow-500/30 bg-yellow-500/10' : 'border-void-600 bg-void-900'
              )}
              onClick={() => setActiveModule('remember')}
              whileHover={{ scale: 1.02 }}
            >
              <Lightbulb className="w-5 h-5 mx-auto text-yellow-400" />
              <div className="text-xs font-medium text-white">3. Remember</div>
              <div className="text-xs text-gray-500">Store in GNN memory</div>
              <div className="text-lg font-bold text-yellow-400">{totalNodes}</div>
            </motion.div>

            <motion.div 
              className={cn(
                'p-3 rounded-lg border text-center space-y-2 cursor-pointer hover:border-morph-400 transition-colors',
                regeneratedCount > 0 ? 'border-morph-500/30 bg-morph-500/10' : 'border-void-600 bg-void-900'
              )}
              onClick={() => setActiveModule('build')}
              whileHover={{ scale: 1.02 }}
            >
              <Code2 className="w-5 h-5 mx-auto text-morph-400" />
              <div className="text-xs font-medium text-white">4. Build</div>
              <div className="text-xs text-gray-500">When you need it</div>
              <div className="text-lg font-bold text-morph-400">{regeneratedCount}</div>
            </motion.div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Navigation */}
            <div className="flex gap-1 p-1 bg-void-800 rounded-xl">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all',
                    activeTab === tab.id
                      ? 'bg-morph-600 text-white shadow-lg shadow-morph-600/25'
                      : 'text-gray-400 hover:text-white hover:bg-void-700'
                  )}
                  whileTap={{ scale: 0.98 }}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'upload' && (
                <div className="space-y-6">
                  <UploadZone />

                  {artifacts.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <Brain className="w-4 h-4 text-blue-400" />
                        Recently Remembered
                      </h3>
                      <div className="space-y-3">
                          {artifacts.slice(0, 3).map((artifact) => (
                            <ArtifactCard key={artifact.id} artifact={artifact} />
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'artifacts' && (
                <div className="space-y-3">
                  {artifacts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No memories yet</p>
                      <p className="text-sm mt-1">Upload files to build GNN memory</p>
                    </div>
                  ) : (
                    artifacts.map((artifact) => (
                      <ArtifactCard key={artifact.id} artifact={artifact} />
                    ))
                  )}
                </div>
              )}

              {activeTab === 'operations' && <OperationLog />}

              {activeTab === 'gnn' && <GNNVisualizer />}
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <SupabaseConnector />
            <CommandInterface />

            {/* GNN Memory Stats */}
            <div className="bg-void-800 border border-void-600 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <Network className="w-4 h-4 text-morph-400" />
                GNN Memory
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Total Nodes</span>
                  <span className="text-sm font-bold text-white">{totalNodes}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Key Insights</span>
                  <span className="text-sm font-bold text-yellow-400">{totalInsights}</span>
                </div>

                <div className="space-y-2">
                  {['functionality', 'pattern', 'dependency', 'reusable_component'].map(type => {
                    const count = gnnNodes.filter(n => n.nodeType === type).length
                    return (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 capitalize">{type.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-void-900 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-morph-500 rounded-full"
                              style={{ width: totalNodes > 0 ? `${(count / totalNodes) * 100}%` : '0%' }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 w-4">{count}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-void-800 border border-void-600 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <motion.button
                  onClick={() => {
                    const understood = artifacts.filter(a => a.metadata.status === 'understood')
                    understood.forEach(a => {
                      const store = useMorphStore.getState()
                      store.regenerateArtifact(a.id)
                    })
                  }}
                  className="w-full py-2 px-3 bg-void-700 hover:bg-morph-600 text-left text-sm text-gray-300 hover:text-white rounded-lg flex items-center gap-2 transition-colors"
                  whileTap={{ scale: 0.98 }}
                >
                  <Code2 className="w-4 h-4 text-morph-400" />
                  Build All from Memory
                </motion.button>

                <motion.button
                  onClick={() => {
                    const store = useMorphStore.getState()
                    store.improvise('Combine everything I know', undefined)
                  }}
                  className="w-full py-2 px-3 bg-void-700 hover:bg-purple-600 text-left text-sm text-gray-300 hover:text-white rounded-lg flex items-center gap-2 transition-colors"
                  whileTap={{ scale: 0.98 }}
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Improvise from Memory
                </motion.button>

                <motion.button
                  onClick={() => {
                    const understood = artifacts.filter(a => a.metadata.status === 'understood' && !a.supabaseSync.understandingSynced)
                    understood.forEach(a => {
                      const store = useMorphStore.getState()
                      store.syncToSupabase(a.id)
                    })
                  }}
                  disabled={!supabaseConfig.connected}
                  className="w-full py-2 px-3 bg-void-700 hover:bg-blue-600 disabled:bg-void-800 disabled:text-gray-600 text-left text-sm text-gray-300 hover:text-white rounded-lg flex items-center gap-2 transition-colors"
                  whileTap={{ scale: 0.98 }}
                >
                  <Cloud className="w-4 h-4 text-blue-400" />
                  Store Memory in Supabase
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Morph Being - Floating conversational entity */}
      <MorphBeing />

      {/* Footer */}
      <footer className="border-t border-void-700 mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>Morph OS • Orchestrated by the Morph Being • Persistent Memory • Real-Time Simulation</p>
          <p className="mt-1 text-xs">Say "Hey Morph" or click the orb to command your system</p>
        </div>
      </footer>
    </div>
  )
}
