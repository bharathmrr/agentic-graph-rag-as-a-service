import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, AlertTriangle, X, CheckCircle, FileText, Brain, Database, Network } from 'lucide-react'

const UploadGeneratorAlert = ({ isOpen, onClose, onUpload }) => {
  if (!isOpen) return null

  const steps = [
    {
      icon: Upload,
      title: "Upload Document",
      description: "Upload your PDF, TXT, DOC, or other document files",
      color: "text-blue-400"
    },
    {
      icon: Brain,
      title: "Generate Ontology",
      description: "AI will extract entities, relationships, and concepts",
      color: "text-purple-400"
    },
    {
      icon: Database,
      title: "Create Embeddings",
      description: "Generate semantic embeddings for intelligent search",
      color: "text-green-400"
    },
    {
      icon: Network,
      title: "Build Knowledge Graph",
      description: "Construct interactive knowledge graph with Neo4j",
      color: "text-orange-400"
    }
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-2xl p-8 max-w-2xl w-full border border-gray-700/50 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Upload Required</h2>
                <p className="text-gray-300">Please upload documents first to access modules</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Process Steps */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Processing Pipeline</h3>
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50"
                >
                  <div className={`w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center ${step.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">{step.title}</h4>
                    <p className="text-gray-300 text-sm">{step.description}</p>
                  </div>
                  <div className="text-gray-500 text-sm">
                    Step {index + 1}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Benefits */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <h4 className="text-blue-400 font-semibold mb-2">What You'll Get:</h4>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Intelligent entity extraction and relationship mapping</li>
              <li>• Semantic search capabilities with AI-powered retrieval</li>
              <li>• Interactive knowledge graph visualization</li>
              <li>• Real-time processing with progress tracking</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <button
              onClick={onUpload}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Upload className="w-5 h-5" />
              <span>Upload Documents</span>
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default UploadGeneratorAlert
