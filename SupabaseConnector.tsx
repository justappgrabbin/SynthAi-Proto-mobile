'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, CheckCircle, XCircle, Loader2, Save } from 'lucide-react'
import { useMorphStore } from '@/hooks/useMorphStore'
import { testSupabaseConnection } from '@/lib/supabase'
import { cn } from '@/lib/utils'

export function SupabaseConnector() {
  const supabaseConfig = useMorphStore((state) => state.supabaseConfig)
  const setSupabaseConfig = useMorphStore((state) => state.setSupabaseConfig)

  const [url, setUrl] = useState(supabaseConfig.url)
  const [anonKey, setAnonKey] = useState(supabaseConfig.anonKey)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<boolean | null>(null)
  const [isExpanded, setIsExpanded] = useState(!supabaseConfig.connected)

  const handleTest = async () => {
    setIsTesting(true)
    setTestResult(null)

    const result = await testSupabaseConnection({
      url,
      anonKey,
      connected: false,
      tables: [],
    })

    setTestResult(result)
    setIsTesting(false)

    if (result) {
      setSupabaseConfig({
        url,
        anonKey,
        connected: true,
      })
    }
  }

  const handleSave = () => {
    setSupabaseConfig({
      url,
      anonKey,
      connected: testResult === true,
    })
    setIsExpanded(false)
  }

  return (
    <div className="bg-void-800 border border-void-600 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-void-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-lg',
            supabaseConfig.connected ? 'bg-morph-500/20 text-morph-400' : 'bg-gray-500/20 text-gray-400'
          )}>
            <Database className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-white">Supabase Connection</h3>
            <p className="text-xs text-gray-400">
              {supabaseConfig.connected ? 'Connected and ready' : 'Not configured'}
            </p>
          </div>
        </div>

        {supabaseConfig.connected && (
          <CheckCircle className="w-5 h-5 text-morph-400" />
        )}
      </button>

      {/* Expanded Form */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-void-600"
          >
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Project URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full px-3 py-2 bg-void-900 border border-void-600 rounded-lg text-white text-sm focus:border-morph-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">Anon Key</label>
                <input
                  type="password"
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIs..."
                  className="w-full px-3 py-2 bg-void-900 border border-void-600 rounded-lg text-white text-sm focus:border-morph-500 focus:outline-none"
                />
              </div>

              {/* Test Result */}
              {testResult !== null && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'p-3 rounded-lg flex items-center gap-2 text-sm',
                    testResult ? 'bg-morph-500/20 text-morph-400' : 'bg-red-500/20 text-red-400'
                  )}
                >
                  {testResult ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {testResult ? 'Connection successful!' : 'Connection failed. Check your credentials.'}
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <motion.button
                  onClick={handleTest}
                  disabled={isTesting || !url || !anonKey}
                  className="flex-1 py-2 px-4 bg-void-700 hover:bg-void-600 disabled:bg-void-800 disabled:text-gray-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.95 }}
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </motion.button>

                <motion.button
                  onClick={handleSave}
                  disabled={!url || !anonKey}
                  className="flex-1 py-2 px-4 bg-morph-600 hover:bg-morph-500 disabled:bg-void-800 disabled:text-gray-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.95 }}
                >
                  <Save className="w-4 h-4" />
                  Save
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
