'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileCode, FileText, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useMorphStore } from '@/hooks/useMorphStore'

export function UploadZone() {
  const [isPasting, setIsPasting] = useState(false)
  const [pasteContent, setPasteContent] = useState('')
  const addArtifact = useMorphStore((state) => state.addArtifact)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const content = await file.text()
      addArtifact({
        name: file.name,
        type: file.name.endsWith('.zip') ? 'file' : 'code',
        content,
        language: file.name.split('.').pop() || 'plaintext',
      })
    }
  }, [addArtifact])

  const { getRootProps, getInputProps, isDragActive, isDragAccept } = useDropzone({
    onDrop,
    accept: {
      'text/*': ['.ts', '.tsx', '.js', '.jsx', '.py', '.json', '.md', '.txt', '.sql', '.yml', '.yaml'],
      'application/zip': ['.zip'],
    },
    multiple: true,
  })

  const handlePasteSubmit = () => {
    if (!pasteContent.trim()) return

    addArtifact({
      name: `pasted_${Date.now()}.txt`,
      type: 'text',
      content: pasteContent,
      language: 'plaintext',
    })

    setPasteContent('')
    setIsPasting(false)
  }

  return (
    <div className="space-y-4">
      {/* File Drop Zone */}
      <motion.div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300',
          isDragActive && 'border-morph-400 bg-morph-400/10',
          isDragAccept && 'border-morph-500 bg-morph-500/20 scale-105',
          !isDragActive && 'border-void-600 hover:border-morph-600 hover:bg-void-800'
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input {...getInputProps()} />

        <motion.div
          animate={{
            y: isDragActive ? -10 : 0,
            scale: isDragActive ? 1.1 : 1,
          }}
          className="flex flex-col items-center gap-3"
        >
          <div className="w-16 h-16 rounded-full bg-morph-500/20 flex items-center justify-center">
            <Upload className="w-8 h-8 text-morph-400" />
          </div>

          <div>
            <p className="text-lg font-medium text-white">
              {isDragActive ? 'Drop files here...' : 'Drop files or click to upload'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Supports .ts, .tsx, .js, .py, .json, .md, .zip
            </p>
          </div>
        </motion.div>

        {/* Animated border effect */}
        {isDragActive && (
          <motion.div
            layoutId="active-border"
            className="absolute inset-0 rounded-2xl border-2 border-morph-400 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </motion.div>

      {/* Paste Toggle */}
      <motion.button
        onClick={() => setIsPasting(!isPasting)}
        className={cn(
          'w-full py-3 px-4 rounded-xl border transition-all flex items-center justify-center gap-2',
          isPasting
            ? 'bg-morph-600 border-morph-500 text-white'
            : 'bg-void-800 border-void-600 text-gray-300 hover:border-morph-600'
        )}
        whileTap={{ scale: 0.98 }}
      >
        <FileText className="w-5 h-5" />
        {isPasting ? 'Cancel Paste' : 'Or paste code/text'}
      </motion.button>

      {/* Paste Area */}
      <AnimatePresence>
        {isPasting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <textarea
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
              placeholder="Paste your code, text, or artifact here...
The Morph system will analyze and integrate it."
              className="w-full h-48 bg-void-900 border border-void-600 rounded-xl p-4 text-gray-200 font-mono text-sm resize-none focus:border-morph-500 focus:outline-none focus:ring-1 focus:ring-morph-500"
              spellCheck={false}
            />

            <div className="flex gap-2">
              <motion.button
                onClick={handlePasteSubmit}
                disabled={!pasteContent.trim()}
                className="flex-1 py-3 bg-morph-600 hover:bg-morph-500 disabled:bg-void-700 disabled:text-gray-500 text-white rounded-xl font-medium flex items-center justify-center gap-2"
                whileTap={{ scale: 0.98 }}
              >
                <Zap className="w-4 h-4" />
                Add to Morph
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
