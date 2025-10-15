import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  Clock, 
  Play, 
  ArrowRight, 
  Zap, 
  Brain, 
  Network,
  Database,
  Eye,
  MessageSquare,
  GraduationCap,
  FileText,
  Trophy,
  Target,
  Activity
} from 'lucide-react'

const WorkflowOrchestrator = ({ onNotification, systemMetrics }) => {
  const [workflowProgress, setWorkflowProgress] = useState({})
  const [completedSteps, setCompletedSteps] = useState([])
  const [currentActiveStep, setCurrentActiveStep] = useState(1)
  const [overallProgress, setOverallProgress] = useState(0)

  const workflowSteps = [
    {
      id: 1,
      name: 'Upload Documents',
      description: 'Upload and process documents with progress tracking',
      icon: FileText,
      color: '#10b981',
      estimatedTime: '2-3 minutes',
      dependencies: [],
      component: 'EnhancedDocumentUpload'
    },
    {
      id: 2,
      name: 'Ontology Generator', 
      description: 'Extract entities and relationships using NLP',
      icon: Brain,
      color: '#8b5cf6',
      estimatedTime: '3-5 minutes',
      dependencies: [1],
      component: 'EnhancedOntologyGenerator'
    },
    {
      id: 3,
      name: 'Entity Resolution',
      description: 'Detect and resolve duplicate entities',
      icon: Target,
      color: '#f59e0b', 
      estimatedTime: '2-4 minutes',
      dependencies: [2],
      component: 'EnhancedEntityResolution'
    },
    {
      id: 4,
      name: 'Embedding Generator',
      description: 'Generate semantic embeddings with ChromaDB',
      icon: Database,
      color: '#06b6d4',
      estimatedTime: '4-6 minutes', 
      dependencies: [3],
      component: 'EnhancedEmbeddingGenerator'
    },
    {
      id: 5,
      name: 'Graph Constructor',
      description: 'Build interactive knowledge graphs with Neo4j',
      icon: Network,
      color: '#ec4899',
      estimatedTime: '3-5 minutes',
      dependencies: [4],
      component: 'GraphConstructor'
    },
    {
      id: 6,
      name: 'Knowledge Graph 3D',
      description: 'Visualize knowledge graph in 3D/4D space',
      icon: Eye,
      color: '#84cc16',
      estimatedTime: '2-3 minutes',
      dependencies: [5],
      component: 'EnhancedKnowledgeGraph'
    },
    {
      id: 7,
      name: 'Core Modules',
      description: 'Integration of all core processing modules',
      icon: Zap,
      color: '#f59e0b',
      estimatedTime: '1-2 minutes',
      dependencies: [6],
      component: 'CoreModulesDashboard'
    },
    {
      id: 8,
      name: 'Agentic Retrieval',
      description: 'Multi-strategy retrieval with intelligent agents',
      icon: Zap,
      color: '#f97316',
      estimatedTime: '3-4 minutes',
      dependencies: [7],
      component: 'AgenticRetrieval'
    },
    {
      id: 9,
      name: 'Reasoning System',
      description: 'Advanced RAG with real-time reasoning',
      icon: Brain,
      color: '#6366f1',
      estimatedTime: '4-6 minutes',
      dependencies: [8],
      component: 'EnhancedReasoningBot'
    },
    {
      id: 10,
      name: 'AI Chatbot',
      description: 'Conversational AI with context awareness',
      icon: MessageSquare,
      color: '#14b8a6',
      estimatedTime: '2-3 minutes',
      dependencies: [9],
      component: 'ApplicationChatBot'
    },
    {
      id: 11,
      name: 'Group Manager AI',
      description: 'Educational AI for RAG and ML concepts',
      icon: GraduationCap,
      color: '#8b5cf6',
      estimatedTime: '2-4 minutes',
      dependencies: [10],
      component: 'GroupManagerAI'
    },
    {
      id: 12,
      name: 'File Processing',
      description: 'Enhanced file processing with summarization',
      icon: FileText,
      color: '#06b6d4',
      estimatedTime: '3-5 minutes',
      dependencies: [11],
      component: 'FileSummarizationProcessor'
    }
  ]

  useEffect(() => {
    // Calculate overall progress based on completed steps
    const progress = (completedSteps.length / workflowSteps.length) * 100
    setOverallProgress(progress)
  }, [completedSteps])

  const getStepStatus = (stepId) => {
    if (completedSteps.includes(stepId)) return 'completed'
    if (stepId === currentActiveStep) return 'active'
    if (workflowSteps.find(s => s.id === stepId)?.dependencies.every(dep => completedSteps.includes(dep))) {
      return 'available'
    }
    return 'locked'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle
      case 'active': return Play
      case 'available': return ArrowRight
      case 'locked': return Clock
      default: return Clock
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/20'
      case 'active': return 'text-blue-400 bg-blue-400/20 animate-pulse'
      case 'available': return 'text-yellow-400 bg-yellow-400/20'
      case 'locked': return 'text-gray-500 bg-gray-500/20'
      default: return 'text-gray-500 bg-gray-500/20'
    }
  }

  const markStepComplete = (stepId) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId])
      
      // Move to next available step
      const nextStep = workflowSteps.find(step => 
        !completedSteps.includes(step.id) && 
        step.id > stepId &&
        step.dependencies.every(dep => completedSteps.includes(dep) || dep === stepId)
      )
      
      if (nextStep) {
        setCurrentActiveStep(nextStep.id)
      }

      onNotification?.({
        type: 'success',
        title: `Step ${stepId} Complete!`,
        message: `Successfully completed ${workflowSteps.find(s => s.id === stepId)?.name}`
      })
    }
  }

  const getTotalEstimatedTime = () => {
    const totalMinutes = workflowSteps.reduce((total, step) => {
      const timeRange = step.estimatedTime.match(/(\d+)-(\d+)/)
      if (timeRange) {
        const avgTime = (parseInt(timeRange[1]) + parseInt(timeRange[2])) / 2
        return total + avgTime
      }
      return total + 3 // fallback
    }, 0)
    
    return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
  }

  return (
    <div className="workflow-orchestrator p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center space-x-3"
        >
          <Activity size={32} className="text-blue-400" />
          <h1 className="text-4xl font-bold text-white">
            12-Step Agentic Graph RAG Workflow
          </h1>
        </motion.div>
        
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Complete pipeline from document upload to advanced AI reasoning with knowledge graph integration
        </p>

        {/* Overall Progress */}
        <div className="bg-gray-800/50 rounded-2xl p-6 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-semibold">Overall Progress</span>
            <span className="text-blue-400 font-bold">{Math.round(overallProgress)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-400 mt-2">
            <span>{completedSteps.length} of {workflowSteps.length} steps</span>
            <span>Est. Total: {getTotalEstimatedTime()}</span>
          </div>
        </div>
      </div>

      {/* Workflow Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {workflowSteps.map((step, index) => {
            const status = getStepStatus(step.id)
            const StatusIcon = getStatusIcon(status)
            const StepIcon = step.icon
            
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  relative bg-gray-800/50 backdrop-blur-sm border rounded-2xl p-6 
                  transition-all duration-300 hover:scale-105 cursor-pointer
                  ${status === 'completed' ? 'border-green-500/50 bg-green-900/20' : 
                    status === 'active' ? 'border-blue-500/50 bg-blue-900/20' :
                    status === 'available' ? 'border-yellow-500/50 bg-yellow-900/20' :
                    'border-gray-600/50'}
                `}
                onClick={() => status === 'available' && setCurrentActiveStep(step.id)}
              >
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-gray-900 border-2 border-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{step.id}</span>
                </div>

                {/* Status Icon */}
                <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(status)}`}>
                  <StatusIcon size={16} />
                </div>

                {/* Step Content */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${step.color}20`, color: step.color }}
                    >
                      <StepIcon size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">{step.name}</h3>
                      <p className="text-xs text-gray-400">{step.estimatedTime}</p>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed">
                    {step.description}
                  </p>

                  {/* Dependencies */}
                  {step.dependencies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {step.dependencies.map(depId => (
                        <span 
                          key={depId}
                          className={`
                            px-2 py-1 rounded-full text-xs
                            ${completedSteps.includes(depId) 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-gray-500/20 text-gray-400'
                            }
                          `}
                        >
                          Step {depId}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Button */}
                  {status === 'available' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => markStepComplete(step.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                    >
                      Start Step {step.id}
                    </motion.button>
                  )}

                  {status === 'completed' && (
                    <div className="w-full bg-green-600/20 text-green-400 py-2 px-4 rounded-lg text-sm font-medium text-center">
                      ✅ Completed
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Completion Celebration */}
      {completedSteps.length === workflowSteps.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-500/30 rounded-2xl p-8"
        >
          <Trophy size={64} className="mx-auto text-yellow-400" />
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              🎉 Workflow Complete!
            </h2>
            <p className="text-gray-300 text-lg">
              Congratulations! You've successfully completed all 12 steps of the Agentic Graph RAG pipeline.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-400">{systemMetrics?.documentsProcessed || 0}</div>
              <div className="text-sm text-gray-400">Documents</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-400">{systemMetrics?.entitiesExtracted || 0}</div>
              <div className="text-sm text-gray-400">Entities</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-400">{systemMetrics?.relationshipsFound || 0}</div>
              <div className="text-sm text-gray-400">Relations</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-yellow-400">{systemMetrics?.graphNodes || 0}</div>
              <div className="text-sm text-gray-400">Graph Nodes</div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300"
            onClick={() => {
              onNotification?.({
                type: 'success',
                title: 'System Ready!',
                message: 'Your Agentic Graph RAG system is now fully operational and ready for production use.'
              })
            }}
          >
            🚀 System Ready for Production
          </motion.button>
        </motion.div>
      )}

      <style jsx>{`
        .workflow-orchestrator {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        }
      `}</style>
    </div>
  )
}

export default WorkflowOrchestrator
