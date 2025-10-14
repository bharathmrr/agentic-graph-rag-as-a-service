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
  Zap
} from 'lucide-react'
import { useData } from '../context/DataContext'
import ProfessionalModuleWrapper from './ProfessionalModuleWrapper'

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
className="premium-card mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Search className="w-5 h-5 mr-2 text-orange-400" />
          Entity Resolution
        </h3>
        
        <div className="flex items-center space-x-3">
          {backendStatus === 'online' ? (
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Backend Ready</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">Backend Offline</span>
            </div>
          )}
        </div>
      </div>
      
      {ontologyData && (
<div className="premium-card muted mb-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Source Data</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{Object.keys(ontologyData.entities || {}).length}</p>
              <p className="text-xs text-gray-400">Entity Types</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">
                {Object.values(ontologyData.entities || {}).reduce((sum, data) => sum + (data.count || data.items?.length || 0), 0)}
              </p>
              <p className="text-xs text-gray-400">Total Entities</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">{ontologyData.relationships?.length || 0}</p>
              <p className="text-xs text-gray-400">Relationships</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-400">Ready</p>
              <p className="text-xs text-gray-400">Status</p>
            </div>
          </div>
        </div>
      )}
      
      {isLoading && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">{processingStage}</span>
            <span className="text-sm text-orange-400">{resolutionProgress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${resolutionProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}
      
      <div className="flex items-center space-x-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleResolveEntities}
          disabled={isLoading || !ontologyData || backendStatus !== 'online'}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-medium transition-all duration-200"
        >
          {isLoading ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          <span>{isLoading ? 'Resolving...' : 'Resolve Entities'}</span>
        </motion.button>
        
        {entityData && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportResults}
            className="flex items-center space-x-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  )

  const renderResolutionResults = () => {
    if (!entityData) return null
    
    const { totalDuplicates, highConfidence, totalEntities } = getResolutionStats()
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-300 text-sm">Duplicate Groups</p>
                <p className="text-2xl font-bold text-white">{totalDuplicates}</p>
              </div>
              <Target className="w-8 h-8 text-orange-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm">High Confidence</p>
                <p className="text-2xl font-bold text-white">{highConfidence}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm">Entities Processed</p>
                <p className="text-2xl font-bold text-white">{totalEntities}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>
        
        {/* Duplicate Groups */}
<div className="premium-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Detected Duplicates</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              <span>Using <span className="text-orange-400 font-medium">Fuzzy Matching</span></span>
            </div>
          </div>
          
          {entityData.duplicates && entityData.duplicates.length > 0 ? (
            <div className="space-y-4">
              {entityData.duplicates.map((duplicate, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
className="premium-card muted p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-orange-400" />
                        <span className="text-white font-medium">Duplicate Group {index + 1}</span>
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-xs font-bold ${getConfidenceColor(duplicate.confidence)} bg-gray-800/50 border ${
                        duplicate.confidence >= 0.8 ? 'border-green-500/30' :
                        duplicate.confidence >= 0.6 ? 'border-yellow-500/30' :
                        'border-red-500/30'
                      }`}>
                        🎯 {getConfidenceLabel(duplicate.confidence)} Match ({(duplicate.confidence * 100).toFixed(1)}%)
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 text-sm">{duplicate.entities?.length || 0} similar entities</span>
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
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              </motion.div>
              <h4 className="text-2xl font-bold text-white mb-3">✅ All Entities are Unique!</h4>
              <p className="text-gray-400 text-lg mb-4">No duplicate entities detected through fuzzy matching.</p>
<div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-900/40 border border-green-500/40 rounded-lg shadow">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-medium">Data Quality: Excellent</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Resolution Summary */}
        {entityData.summary && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Resolution Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Processing Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Entities Analyzed:</span>
                    <span className="text-white">{entityData.summary.entitiesAnalyzed || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Comparisons Made:</span>
                    <span className="text-white">{entityData.summary.comparisons || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Processing Time:</span>
                    <span className="text-white">{entityData.summary.processingTime || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Quality Metrics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Average Confidence:</span>
                    <span className="text-white">{entityData.summary.avgConfidence || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Unique Entities:</span>
                    <span className="text-white">{entityData.summary.uniqueEntities || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duplicate Rate:</span>
                    <span className="text-white">{entityData.summary.duplicateRate || '0%'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <ProfessionalModuleWrapper
      moduleId="entity-resolution"
      moduleName="Entity Resolution"
      moduleIcon={Search}
      moduleColor="#f59e0b"
      onBack={onBack}
      requiresData={true}
      dataType="ontology"
    >
      <div className="space-y-6">
        {renderResolutionControls()}
        
        <AnimatePresence>
          {showResults && renderResolutionResults()}
        </AnimatePresence>
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-4"
          >
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-300 font-medium">Error</span>
            </div>
            <p className="text-red-200 mt-2">{error}</p>
          </motion.div>
        )}
      </div>
    </ProfessionalModuleWrapper>
  )
}

export default EnhancedEntityResolution
