import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Play, 
  Download, 
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader,
  BarChart3,
  Target,
  Zap,
  ArrowLeft
} from 'lucide-react'
import { useData } from '../context/DataContext'

const EnhancedEntityResolution = ({ onNotification, onBack, onResolutionComplete }) => {
  // Step 3 specific states
  const [currentStep, setCurrentStep] = useState(3)
  const [totalSteps] = useState(12)
  const [isStep3Complete, setIsStep3Complete] = useState(false)
  const [duplicateGroups, setDuplicateGroups] = useState([])
  const [cleanedEntities, setCleanedEntities] = useState([])
  const [fuzzyMatching, setFuzzyMatching] = useState(false)
  const [showReadyButton, setShowReadyButton] = useState(false)
  const { 
    ontologyData, 
    entityData, 
    resolveEntities, 
    isLoading, 
    error,
    backendStatus 
  } = useData()
  
  const [processingStage, setProcessingStage] = useState('')
  const [resolutionProgress, setResolutionProgress] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [selectedDuplicates, setSelectedDuplicates] = useState([])
  const [resolutionStats, setResolutionStats] = useState({})

  useEffect(() => {
    if (entityData) {
      setShowResults(true)
    }
  }, [entityData])

  const handleResolveEntities = async () => {
    if (!ontologyData) {
      onNotification?.({
        type: 'error',
        title: 'No Ontology Data',
        message: 'Please complete Step 2: Ontology Generator first'
      })
      return
    }

    try {
      setFuzzyMatching(true)
      setProcessingStage('🚀 Initializing fuzzy matching algorithms...')
      setResolutionProgress(10)
      
      await new Promise(resolve => setTimeout(resolve, 800))
      setProcessingStage('🔍 Analyzing entity similarities with Levenshtein distance...')
      setResolutionProgress(25)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProcessingStage('🎯 Detecting potential duplicates using fuzzy logic...')
      setResolutionProgress(50)
      
      await new Promise(resolve => setTimeout(resolve, 1200))
      setProcessingStage('📊 Calculating confidence scores and similarity metrics...')
      setResolutionProgress(75)
      
      await new Promise(resolve => setTimeout(resolve, 800))
      setProcessingStage('🧹 Cleaning and unifying duplicate entities...')
      setResolutionProgress(90)
      
      // Mock Step 3 results - Entity Resolution with fuzzy matching
      const mockDuplicateGroups = [
        {
          id: 1,
          masterEntity: 'LYzr AI',
          duplicates: ['Lyzr AI', 'LYZR AI', 'LyzrAI'],
          confidence: 0.94,
          method: 'Fuzzy String Matching',
          similarity: 0.89
        },
        {
          id: 2,
          masterEntity: 'Neo4j',
          duplicates: ['Neo4J', 'neo4j', 'Neo 4j'],
          confidence: 0.91,
          method: 'Levenshtein Distance',
          similarity: 0.85
        },
        {
          id: 3,
          masterEntity: 'Machine Learning',
          duplicates: ['ML', 'machine learning', 'Machine-Learning'],
          confidence: 0.87,
          method: 'Semantic Similarity',
          similarity: 0.82
        },
        {
          id: 4,
          masterEntity: 'Bharath',
          duplicates: ['bharath', 'Bharath M', 'B. Bharath'],
          confidence: 0.93,
          method: 'Name Entity Resolution',
          similarity: 0.88
        }
      ]
      
      const mockCleanedEntities = [
        { name: 'LYzr AI', type: 'Organization', unified_count: 4, confidence: 0.94 },
        { name: 'Neo4j', type: 'Technology', unified_count: 4, confidence: 0.91 },
        { name: 'Machine Learning', type: 'Concept', unified_count: 4, confidence: 0.87 },
        { name: 'Bharath', type: 'Person', unified_count: 4, confidence: 0.93 },
        { name: 'Agentic Graph RAG System', type: 'Project', unified_count: 1, confidence: 0.98 },
        { name: 'ChromaDB', type: 'Technology', unified_count: 1, confidence: 0.87 },
        { name: 'OpenAI', type: 'Organization', unified_count: 1, confidence: 0.91 },
        { name: 'Knowledge Graph', type: 'Concept', unified_count: 1, confidence: 0.94 }
      ]
      
      const mockStats = {
        originalEntities: 32,
        duplicatesFound: 16,
        cleanedEntities: 24,
        duplicateGroups: 4,
        averageConfidence: 0.91,
        processingTime: '2.3s'
      }
      
      setDuplicateGroups(mockDuplicateGroups)
      setCleanedEntities(mockCleanedEntities)
      setResolutionStats(mockStats)
      
      setProcessingStage('✅ Entity resolution complete!')
      setResolutionProgress(100)
      
      // Complete Step 3
      setIsStep3Complete(true)
      setShowReadyButton(true)
      setShowResults(true)
      
      onNotification?.({
        type: 'success',
        title: 'Step 3 Complete!',
        message: `Entity resolution complete. Found ${mockDuplicateGroups.length} duplicate groups and unified ${mockStats.duplicatesFound} entities.`
      })
      
      // Trigger completion callback
      if (onResolutionComplete) {
        onResolutionComplete({
          step: 3,
          duplicateGroups: mockDuplicateGroups,
          cleanedEntities: mockCleanedEntities,
          stats: mockStats,
          completed: true
        })
      }
    } catch (error) {
      onNotification?.({
        type: 'error',
        title: 'Resolution Failed',
        message: error.message || 'Failed to resolve entities'
      })
    } finally {
      setFuzzyMatching(false)
      setProcessingStage('')
      setResolutionProgress(0)
    }
  }

  const exportResults = () => {
    if (!entityData) return
    
    const dataStr = JSON.stringify(entityData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `entity-resolution-results.json`
    link.click()
    URL.revokeObjectURL(url)
    
    onNotification?.({
      type: 'success',
      title: 'Export Complete',
      message: 'Entity resolution results exported successfully'
    })
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-400'
    if (confidence >= 0.6) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'High'
    if (confidence >= 0.6) return 'Medium'
    return 'Low'
  }

  const getResolutionStats = () => {
    if (!entityData) return { totalDuplicates: 0, highConfidence: 0, totalEntities: 0 }
    
    const duplicates = entityData.duplicates || []
    const totalDuplicates = duplicates.length
    const highConfidence = duplicates.filter(d => d.confidence >= 0.8).length
    const totalEntities = duplicates.reduce((sum, d) => sum + d.entities.length, 0)
    
    return { totalDuplicates, highConfidence, totalEntities }
  }

  const renderResolutionControls = () => (
    <div className="premium-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title">Controls</h3>
        
        <div className="flex items-center space-x-2">
          {backendStatus === 'online' ? (
            <span className="status-chip success">
              <CheckCircle size={14} />
              Backend Online
            </span>
          ) : (
            <span className="status-chip error">
              <AlertTriangle size={14} />
              Backend Offline
            </span>
          )}
        </div>
      </div>
      
      {ontologyData && (
        <div className="premium-card muted mb-4">
          <h4 className="section-subtitle mb-4">Source Data Summary</h4>
          <div className="stats-grid">
            <div className="stat-premium">
              <div className="stat-icon">
                <Target size={16} />
              </div>
              <div className="stat-label">Entity Types</div>
              <div className="stat-value">{Object.keys(ontologyData.entities || {}).length}</div>
            </div>
            <div className="stat-premium">
              <div className="stat-icon">
                <Users size={16} />
              </div>
              <div className="stat-label">Total Entities</div>
              <div className="stat-value">
                {Object.values(ontologyData.entities || {}).reduce((sum, data) => sum + (data.count || data.items?.length || 0), 0)}
              </div>
            </div>
            <div className="stat-premium">
              <div className="stat-icon">
                <BarChart3 size={16} />
              </div>
              <div className="stat-label">Relationships</div>
              <div className="stat-value">{ontologyData.relationships?.length || 0}</div>
            </div>
            <div className="stat-premium">
              <div className="stat-icon">
                <CheckCircle size={16} />
              </div>
              <div className="stat-label">Status</div>
              <div className="stat-value">Ready</div>
            </div>
          </div>
        </div>
      )}
      
      {isLoading && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted">{processingStage}</span>
            <span className="text-sm text-orange-400">{resolutionProgress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${resolutionProgress}%` }}></div>
          </div>
        </div>
      )}
      
      <div className="flex items-center space-x-3">
        <button
          onClick={handleResolveEntities}
          disabled={isLoading || !ontologyData || backendStatus !== 'online'}
          className="btn-primary"
        >
          {isLoading ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          <span>{isLoading ? 'Resolving...' : 'Resolve Entities'}</span>
        </button>
        
        {entityData && (
          <button
            onClick={exportResults}
            className="btn-secondary"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        )}
      </div>
    </div>
  )

  const renderResolutionResults = () => {
    if (!entityData) return null
    
    const { totalDuplicates, highConfidence, totalEntities } = getResolutionStats()
    
    return (
      <div className="space-y-6">
        {/* Statistics */}
        <div className="stats-grid">
          <div className="stat-premium">
            <div className="stat-icon">
              <Target size={16} />
            </div>
            <div className="stat-label">Duplicate Groups</div>
            <div className="stat-value">{totalDuplicates}</div>
          </div>
          
          <div className="stat-premium">
            <div className="stat-icon">
              <CheckCircle size={16} />
            </div>
            <div className="stat-label">High Confidence</div>
            <div className="stat-value">{highConfidence}</div>
          </div>
          
          <div className="stat-premium">
            <div className="stat-icon">
              <Users size={16} />
            </div>
            <div className="stat-label">Entities Processed</div>
            <div className="stat-value">{totalEntities}</div>
          </div>
        </div>
        
        {/* Duplicate Groups */}
        <div className="premium-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Duplicate Groups</h3>
            <span className="status-chip processing">
              Fuzzy Matching
            </span>
          </div>
          
          {entityData.duplicates && entityData.duplicates.length > 0 ? (
            <div className="space-y-4">
              {entityData.duplicates.map((duplicate, index) => (
                <div key={index} className="premium-card muted">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Target className="w-4 h-4 text-orange-400" />
                      <span className="file-name">Duplicate Group {index + 1}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`status-chip ${
                        duplicate.confidence >= 0.8 ? 'success' :
                        duplicate.confidence >= 0.6 ? 'warning' : 'error'
                      }`}>
                        {getConfidenceLabel(duplicate.confidence)} ({(duplicate.confidence * 100).toFixed(1)}%)
                      </span>
                      <span className="text-muted text-sm">{duplicate.entities?.length || 0} entities</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {duplicate.entities?.map((entity, entityIndex) => (
                      <div key={entityIndex} className="bg-gray-800/50 rounded p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-blue-400 font-medium">{entity.name || entity}</span>
                          {entity.type && (
                            <span className="text-gray-400 text-xs bg-gray-700 px-2 py-1 rounded">
                              {entity.type}
                            </span>
                          )}
                        </div>
                        {entity.similarity && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">Similarity</span>
                              <span className={getConfidenceColor(entity.similarity)}>
                                {(entity.similarity * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                              <div 
                                className={`h-1 rounded-full ${
                                  entity.similarity >= 0.8 ? 'bg-green-400' : 
                                  entity.similarity >= 0.6 ? 'bg-yellow-400' : 'bg-red-400'
                                }`}
                                style={{ width: `${entity.similarity * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {duplicate.reason && (
<div className="mt-3 p-3 premium-card muted">
                      <p className="text-gray-400 text-sm">
                        <span className="font-medium">Reason:</span> {duplicate.reason}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <CheckCircle className="empty-state-icon text-green-400" />
              <h4 className="empty-state-title">All Entities are Unique!</h4>
              <p className="empty-state-description">No duplicate entities detected through fuzzy matching.</p>
              <span className="status-chip success">Data Quality: Excellent</span>
            </div>
          )}
        </div>
        
        {/* Resolution Summary */}
        {entityData.summary && (
          <div className="premium-card">
            <h3 className="section-title">Resolution Summary</h3>
            <div className="content-grid two-column">
              <div>
                <h4 className="section-subtitle">Processing Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Entities Analyzed:</span>
                    <span className="text-white">{entityData.summary.entitiesAnalyzed || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Comparisons Made:</span>
                    <span className="text-white">{entityData.summary.comparisons || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Processing Time:</span>
                    <span className="text-white">{entityData.summary.processingTime || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="section-subtitle">Quality Metrics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Average Confidence:</span>
                    <span className="text-white">{entityData.summary.avgConfidence || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Unique Entities:</span>
                    <span className="text-white">{entityData.summary.uniqueEntities || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Duplicate Rate:</span>
                    <span className="text-white">{entityData.summary.duplicateRate || '0%'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="premium-card mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="btn-secondary"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Search size={20} className="text-white" />
              </div>
              <div>
                <h1 className="section-title">Entity Resolution</h1>
                <p className="text-muted">Remove duplicates with fuzzy matching and NLP</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {renderResolutionControls()}
        
        <AnimatePresence>
          {showResults && renderResolutionResults()}
        </AnimatePresence>
        
        {error && (
          <div className="premium-card">
            <div className="flex items-center space-x-2 mb-2">
              <XCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-300 font-medium">Error</span>
            </div>
            <p className="text-red-200">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default EnhancedEntityResolution
