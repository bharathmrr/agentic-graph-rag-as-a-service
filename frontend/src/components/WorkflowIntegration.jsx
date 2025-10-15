import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  Brain, 
  Search, 
  Database, 
  Network, 
  Zap,
  ArrowRight,
  CheckCircle,
  Play,
  Eye,
  Sparkles,
  Users,
  Building,
  MapPin
} from 'lucide-react'
import EntityExplorer from './EntityExplorer'

const WorkflowIntegration = ({ onStepComplete }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [showExplorer, setShowExplorer] = useState(false)
  const [generatedData, setGeneratedData] = useState(null)

  const workflowSteps = [
    {
      id: 'upload',
      title: 'Document Upload',
      description: 'Upload and process documents with OCR',
      icon: Upload,
      color: 'from-blue-500 to-blue-600',
      status: 'completed'
    },
    {
      id: 'ontology',
      title: 'Ontology Generation',
      description: 'Extract entities and relationships using LLM',
      icon: Brain,
      color: 'from-purple-500 to-purple-600',
      status: 'processing'
    },
    {
      id: 'resolution',
      title: 'Entity Resolution',
      description: 'Remove duplicates with fuzzy matching',
      icon: Search,
      color: 'from-orange-500 to-orange-600',
      status: 'pending'
    },
    {
      id: 'embedding',
      title: 'Embedding Generation',
      description: 'Convert to vectors using ChromaDB',
      icon: Database,
      color: 'from-cyan-500 to-cyan-600',
      status: 'pending'
    },
    {
      id: 'graph',
      title: 'Graph Construction',
      description: 'Build knowledge graph with Neo4j',
      icon: Network,
      color: 'from-green-500 to-green-600',
      status: 'pending'
    },
    {
      id: 'retrieval',
      title: 'Agentic Retrieval',
      description: 'Intelligent multi-strategy search',
      icon: Zap,
      color: 'from-yellow-500 to-yellow-600',
      status: 'pending'
    }
  ]

  // Mock generated entity data
  const mockGeneratedData = {
    entities: [
      { name: 'Bharath', type: 'PERSON', count: 15, confidence: 0.95 },
      { name: 'Lyzr AI', type: 'ORGANIZATION', count: 8, confidence: 0.92 },
      { name: 'Microsoft', type: 'ORGANIZATION', count: 12, confidence: 0.89 },
      { name: 'Machine Learning', type: 'CONCEPT', count: 25, confidence: 0.87 },
      { name: 'Seattle', type: 'LOCATION', count: 6, confidence: 0.91 }
    ],
    relationships: [
      { source: 'Bharath', target: 'Lyzr AI', type: 'WORKS_AT', strength: 0.95 },
      { source: 'Bharath', target: 'Microsoft', type: 'PREVIOUSLY_WORKED_AT', strength: 0.85 },
      { source: 'Lyzr AI', target: 'Machine Learning', type: 'SPECIALIZES_IN', strength: 0.90 },
      { source: 'Microsoft', target: 'Seattle', type: 'LOCATED_IN', strength: 0.88 }
    ],
    stats: {
      totalEntities: 156,
      totalRelationships: 89,
      confidence: 94.7,
      processingTime: '2.3s'
    }
  }

  const processStep = async (stepIndex) => {
    setIsProcessing(true)
    setCurrentStep(stepIndex)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setCompletedSteps(prev => [...prev, stepIndex])
    setIsProcessing(false)
    
    // If ontology step is completed, show generated data
    if (stepIndex === 1) {
      setGeneratedData(mockGeneratedData)
    }
    
    // Auto-advance to next step
    if (stepIndex < workflowSteps.length - 1) {
      setTimeout(() => {
        processStep(stepIndex + 1)
      }, 1000)
    }
  }

  const getStepStatus = (index) => {
    if (completedSteps.includes(index)) return 'completed'
    if (currentStep === index && isProcessing) return 'processing'
    if (index === 0) return 'completed' // First step is always completed
    return 'pending'
  }

  const getEntityIcon = (type) => {
    switch (type) {
      case 'PERSON': return Users
      case 'ORGANIZATION': return Building
      case 'LOCATION': return MapPin
      case 'CONCEPT': return Brain
      default: return Sparkles
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="premium-card mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title">Agentic Graph RAG Workflow</h1>
            <p className="text-muted">Complete document-to-knowledge pipeline with AI processing</p>
          </div>
          <div className="flex items-center space-x-3">
            {!isProcessing && completedSteps.length === 0 && (
              <button
                onClick={() => processStep(1)}
                className="btn-primary"
              >
                <Play size={16} />
                Start Processing
              </button>
            )}
            {generatedData && (
              <button
                onClick={() => setShowExplorer(!showExplorer)}
                className="btn-secondary"
              >
                <Eye size={16} />
                {showExplorer ? 'Hide' : 'Explore'} Results
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="premium-card mb-6">
        <h3 className="section-title mb-6">Processing Pipeline</h3>
        
        <div className="space-y-4">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon
            const status = getStepStatus(index)
            
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center space-x-4 p-4 rounded-lg border transition-all duration-300 ${
                  status === 'completed' 
                    ? 'bg-green-900/20 border-green-500/30' 
                    : status === 'processing'
                    ? 'bg-blue-900/20 border-blue-500/30'
                    : 'bg-gray-800/50 border-gray-600/30'
                }`}
              >
                {/* Step Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${step.color}`}>
                  {status === 'completed' ? (
                    <CheckCircle size={24} className="text-white" />
                  ) : status === 'processing' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Icon size={24} className="text-white" />
                    </motion.div>
                  ) : (
                    <Icon size={24} className="text-white" />
                  )}
                </div>
                
                {/* Step Content */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="section-subtitle">{step.title}</h4>
                    <span className={`status-chip ${
                      status === 'completed' ? 'success' : 
                      status === 'processing' ? 'processing' : 'pending'
                    }`}>
                      {status === 'completed' ? 'Complete' : 
                       status === 'processing' ? 'Processing...' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-muted text-sm mt-1">{step.description}</p>
                </div>
                
                {/* Arrow */}
                {index < workflowSteps.length - 1 && (
                  <ArrowRight size={20} className="text-gray-500" />
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Generated Data Preview */}
      <AnimatePresence>
        {generatedData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="premium-card mb-6"
          >
            <h3 className="section-title mb-4">Generated Knowledge</h3>
            
            {/* Stats */}
            <div className="stats-grid mb-6">
              <div className="stat-premium">
                <div className="stat-icon">
                  <Users size={16} />
                </div>
                <div className="stat-label">Total Entities</div>
                <div className="stat-value">{generatedData.stats.totalEntities}</div>
              </div>
              
              <div className="stat-premium">
                <div className="stat-icon">
                  <Network size={16} />
                </div>
                <div className="stat-label">Relationships</div>
                <div className="stat-value">{generatedData.stats.totalRelationships}</div>
              </div>
              
              <div className="stat-premium">
                <div className="stat-icon">
                  <CheckCircle size={16} />
                </div>
                <div className="stat-label">Confidence</div>
                <div className="stat-value">{generatedData.stats.confidence}%</div>
              </div>
              
              <div className="stat-premium">
                <div className="stat-icon">
                  <Zap size={16} />
                </div>
                <div className="stat-label">Processing Time</div>
                <div className="stat-value">{generatedData.stats.processingTime}</div>
              </div>
            </div>
            
            {/* Sample Entities and Relationships */}
            <div className="content-grid two-column">
              {/* Top Entities */}
              <div>
                <h4 className="section-subtitle mb-3">Top Entities</h4>
                <div className="space-y-2">
                  {generatedData.entities.slice(0, 5).map((entity, index) => {
                    const Icon = getEntityIcon(entity.type)
                    return (
                      <motion.div
                        key={entity.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Icon size={16} className="text-blue-400" />
                          <div>
                            <div className="text-white font-medium">{entity.name}</div>
                            <div className="text-gray-400 text-xs">{entity.type}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 text-sm">{Math.round(entity.confidence * 100)}%</div>
                          <div className="text-gray-400 text-xs">{entity.count} mentions</div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
              
              {/* Key Relationships */}
              <div>
                <h4 className="section-subtitle mb-3">Key Relationships</h4>
                <div className="space-y-2">
                  {generatedData.relationships.map((rel, index) => (
                    <motion.div
                      key={`${rel.source}-${rel.target}`}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-white text-sm font-medium">
                          {rel.source} → {rel.target}
                        </div>
                        <span className="text-green-400 text-xs">
                          {Math.round(rel.strength * 100)}%
                        </span>
                      </div>
                      <div className="text-gray-400 text-xs">{rel.type}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Beautiful Entity Chain Example */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-cyan-900/20 rounded-lg border border-blue-500/20">
              <h4 className="section-subtitle mb-3">Entity Relationship Chain</h4>
              <div className="flex items-center space-x-3 text-sm">
                <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 rounded-full">
                  <Users size={14} />
                  <span className="text-blue-300">Bharath</span>
                </div>
                <ArrowRight size={16} className="text-gray-400" />
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 rounded-full">
                  <span className="text-green-300">WORKS_AT</span>
                </div>
                <ArrowRight size={16} className="text-gray-400" />
                <div className="flex items-center space-x-2 px-3 py-1 bg-purple-500/20 rounded-full">
                  <Building size={14} />
                  <span className="text-purple-300">Lyzr AI</span>
                </div>
                <ArrowRight size={16} className="text-gray-400" />
                <div className="flex items-center space-x-2 px-3 py-1 bg-cyan-500/20 rounded-full">
                  <span className="text-cyan-300">OFFERS</span>
                </div>
                <ArrowRight size={16} className="text-gray-400" />
                <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-500/20 rounded-full">
                  <Sparkles size={14} />
                  <span className="text-yellow-300">Competitive Salary</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entity Explorer */}
      <AnimatePresence>
        {showExplorer && generatedData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <EntityExplorer data={generatedData} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default WorkflowIntegration
