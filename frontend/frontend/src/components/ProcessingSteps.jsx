import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, Clock, AlertCircle, Brain, Database, 
  Network, Search, Target, ArrowRight, Zap
} from 'lucide-react'

const ProcessingSteps = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(true)
  const [progress, setProgress] = useState(0)

  const steps = [
    {
      id: 'analysis',
      name: 'Document Analysis',
      description: 'Analyzing document structure and content',
      icon: Brain,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      id: 'entities',
      name: 'Entity Extraction',
      description: 'Extracting entities and relationships',
      icon: Target,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      id: 'relationships',
      name: 'Relationship Mapping',
      description: 'Mapping entity relationships',
      icon: Network,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    },
    {
      id: 'embeddings',
      name: 'Embedding Generation',
      description: 'Generating semantic embeddings',
      icon: Search,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20'
    },
    {
      id: 'graph',
      name: 'Graph Construction',
      description: 'Building knowledge graph',
      icon: Database,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/20'
    }
  ]

  useEffect(() => {
    if (!isProcessing) return

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setIsProcessing(false)
          onComplete?.()
          return 100
        }
        return prev + 2
      })
    }, 100)

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval)
          return prev
        }
        return prev + 1
      })
    }, 2000)

    return () => {
      clearInterval(interval)
      clearInterval(stepInterval)
    }
  }, [isProcessing, onComplete])

  const getStepStatus = (index) => {
    if (index < currentStep) return 'completed'
    if (index === currentStep) return 'active'
    return 'pending'
  }

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-6 h-6 text-green-400" />
      case 'active': return <Clock className="w-6 h-6 text-blue-400" />
      default: return <Clock className="w-6 h-6 text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen core-modules-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gray-900" />
      
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4" style={{textShadow: '0 4px 16px rgba(0,0,0,0.8)'}}>
            🚀 Processing Document
          </h1>
          <p className="text-xl text-white font-bold" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
            AI is analyzing your document step by step
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
              Overall Progress
            </h2>
            <span className="text-2xl font-bold text-white" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full"
              style={{ width: `${progress}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Processing Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const status = getStepStatus(index)
            const Icon = step.icon
            
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl p-6 ${
                  status === 'active' ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step.bgColor}`}>
                    {getStepIcon(status)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-white" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
                        {step.name}
                      </h3>
                      {status === 'active' && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Zap className="w-5 h-5 text-blue-400" />
                        </motion.div>
                      )}
                    </div>
                    <p className="text-white/90 font-bold" style={{textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>
                      {step.description}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className={`text-lg font-bold ${step.color}`} style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
                      {status === 'completed' ? '✓' : status === 'active' ? '⟳' : '○'}
                    </div>
                    <div className="text-sm text-white font-bold" style={{textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>
                      {status === 'completed' ? 'Done' : status === 'active' ? 'Processing' : 'Waiting'}
                    </div>
                  </div>
                </div>

                {status === 'active' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4"
                  >
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `${Math.min(progress - (index * 20), 100)}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress - (index * 20), 100)}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Completion Message */}
        <AnimatePresence>
          {!isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center mt-8"
            >
              <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-6">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
                  🎉 Processing Complete!
                </h2>
                <p className="text-xl text-white font-bold" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
                  Your document has been successfully processed and is ready for analysis
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ProcessingSteps
