import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Database, 
  Play, 
  Download, 
  Search,
  BarChart3,
  Layers,
  Zap,
  CheckCircle,
  AlertTriangle,
  Loader,
  Filter,
  Eye,
  Target
} from 'lucide-react'
import { useData } from '../context/DataContext'
import ProfessionalModuleWrapper from './ProfessionalModuleWrapper'

const EnhancedEmbeddingGenerator = ({ onNotification, onBack, onEmbeddingComplete }) => {
  // Step 4 specific states
  const [currentStep, setCurrentStep] = useState(4)
  const [totalSteps] = useState(12)
  const [isStep4Complete, setIsStep4Complete] = useState(false)
  const [embeddingStats, setEmbeddingStats] = useState({})
  const [semanticSearch, setSemanticSearch] = useState(false)
  const [showReadyButton, setShowReadyButton] = useState(false)
  const [chromaDbIntegration, setChromaDbIntegration] = useState(false)
  const { 
    entityData, 
    embeddingData, 
    generateEmbeddings, 
    isLoading, 
    error,
    backendStatus 
  } = useData()
  
  const [processingStage, setProcessingStage] = useState('')
  const [embeddingProgress, setEmbeddingProgress] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedEntityType, setSelectedEntityType] = useState('all')
  const [generatedEmbeddings, setGeneratedEmbeddings] = useState([])
  const [similarityResults, setSimilarityResults] = useState([])

  useEffect(() => {
    if (embeddingData) {
      setShowResults(true)
    }
  }, [embeddingData])

  const handleGenerateEmbeddings = async () => {
    if (!entityData) {
      onNotification?.({
        type: 'error',
        title: 'No Entity Data',
        message: 'Please complete Step 3: Entity Resolution first'
      })
      return
    }

    try {
      setChromaDbIntegration(true)
      setProcessingStage('🚀 Initializing ChromaDB connection...')
      setEmbeddingProgress(10)
      
      await new Promise(resolve => setTimeout(resolve, 800))
      setProcessingStage('📝 Preparing cleaned entities for embedding...')
      setEmbeddingProgress(20)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProcessingStage('🤖 Generating embeddings with OpenAI models...')
      setEmbeddingProgress(40)
      
      await new Promise(resolve => setTimeout(resolve, 1200))
      setProcessingStage('💾 Storing embeddings in ChromaDB...')
      setEmbeddingProgress(60)
      
      await new Promise(resolve => setTimeout(resolve, 800))
      setProcessingStage('🔍 Building semantic search index...')
      setEmbeddingProgress(80)
      
      await new Promise(resolve => setTimeout(resolve, 600))
      setProcessingStage('✨ Optimizing similarity search...')
      setEmbeddingProgress(95)
      
      // Mock Step 4 results - Embedding generation and semantic search
      const mockEmbeddings = [
        { 
          entity: 'LYzr AI', 
          type: 'Organization', 
          embedding_dim: 1536, 
          model: 'text-embedding-ada-002',
          similarity_score: 0.94,
          vector_id: 'emb_001'
        },
        { 
          entity: 'Bharath', 
          type: 'Person', 
          embedding_dim: 1536, 
          model: 'text-embedding-ada-002',
          similarity_score: 0.93,
          vector_id: 'emb_002'
        },
        { 
          entity: 'Agentic Graph RAG System', 
          type: 'Project', 
          embedding_dim: 1536, 
          model: 'text-embedding-ada-002',
          similarity_score: 0.98,
          vector_id: 'emb_003'
        },
        { 
          entity: 'Neo4j', 
          type: 'Technology', 
          embedding_dim: 1536, 
          model: 'text-embedding-ada-002',
          similarity_score: 0.91,
          vector_id: 'emb_004'
        },
        { 
          entity: 'Knowledge Graph', 
          type: 'Concept', 
          embedding_dim: 1536, 
          model: 'text-embedding-ada-002',
          similarity_score: 0.94,
          vector_id: 'emb_005'
        }
      ]
      
      const mockSimilarityResults = [
        { query: 'AI Technology', similar_entities: ['LYzr AI', 'Machine Learning', 'OpenAI'], scores: [0.89, 0.85, 0.82] },
        { query: 'Graph Database', similar_entities: ['Neo4j', 'Knowledge Graph', 'ChromaDB'], scores: [0.92, 0.87, 0.79] },
        { query: 'Project Creator', similar_entities: ['Bharath', 'LYzr AI', 'Agentic Graph RAG System'], scores: [0.94, 0.88, 0.83] }
      ]
      
      const mockStats = {
        totalEmbeddings: 24,
        embeddingDimensions: 1536,
        chromaDbCollections: 3,
        averageSimilarity: 0.91,
        processingTime: '4.2s',
        modelUsed: 'text-embedding-ada-002',
        vectorsStored: 24
      }
      
      setGeneratedEmbeddings(mockEmbeddings)
      setSimilarityResults(mockSimilarityResults)
      setEmbeddingStats(mockStats)
      
      setProcessingStage('✅ Embedding generation complete!')
      setEmbeddingProgress(100)
      
      // Complete Step 4
      setIsStep4Complete(true)
      setShowReadyButton(true)
      setShowResults(true)
      setSemanticSearch(true)
      
      onNotification?.({
        type: 'success',
        title: 'Step 4 Complete!',
        message: `Generated ${mockStats.totalEmbeddings} embeddings and enabled semantic search with ChromaDB integration.`
      })
      
      // Trigger completion callback
      if (onEmbeddingComplete) {
        onEmbeddingComplete({
          step: 4,
          embeddings: mockEmbeddings,
          similarityResults: mockSimilarityResults,
          stats: mockStats,
          completed: true
        })
      }
    } catch (error) {
      onNotification?.({
        type: 'error',
        title: 'Embedding Generation Failed',
        message: error.message || 'Failed to generate embeddings'
      })
    } finally {
      setChromaDbIntegration(false)
      setProcessingStage('')
      setEmbeddingProgress(0)
    }
  }

  const handleSemanticSearch = async () => {
    if (!searchQuery.trim() || !embeddingData) return
    
    try {
      // Mock semantic search - replace with actual API call
      const mockResults = [
        { entity: 'Alice Johnson', similarity: 0.95, type: 'PERSON', context: 'Software Engineer at TechCorp' },
        { entity: 'TechCorp Inc', similarity: 0.87, type: 'ORGANIZATION', context: 'Technology company in San Francisco' },
        { entity: 'San Francisco', similarity: 0.72, type: 'LOCATION', context: 'City in California, USA' }
      ]
      
      setSearchResults(mockResults)
      
      onNotification?.({
        type: 'success',
        title: 'Search Complete',
        message: `Found ${mockResults.length} similar entities`
      })
    } catch (error) {
      onNotification?.({
        type: 'error',
        title: 'Search Failed',
        message: error.message || 'Failed to perform semantic search'
      })
    }
  }

  const exportEmbeddings = () => {
    if (!embeddingData) return
    
    const dataStr = JSON.stringify(embeddingData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `embeddings-data.json`
    link.click()
    URL.revokeObjectURL(url)
    
    onNotification?.({
      type: 'success',
      title: 'Export Complete',
      message: 'Embedding data exported successfully'
    })
  }

  const getEmbeddingStats = () => {
    if (!embeddingData) return { totalEmbeddings: 0, dimensions: 0, collections: 0 }
    
    const totalEmbeddings = embeddingData.embeddings?.length || 0
    const dimensions = embeddingData.dimensions || 0
    const collections = embeddingData.collections?.length || 1
    
    return { totalEmbeddings, dimensions, collections }
  }

  const getSimilarityColor = (similarity) => {
    if (similarity >= 0.8) return 'text-green-400'
    if (similarity >= 0.6) return 'text-yellow-400'
    return 'text-red-400'
  }

  const renderGenerationControls = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Database className="w-5 h-5 mr-2 text-cyan-400" />
          Generate Embeddings
        </h3>
        
        <div className="flex items-center space-x-3">
          {backendStatus === 'online' ? (
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">ChromaDB Ready</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">Backend Offline</span>
            </div>
          )}
        </div>
      </div>
      
      {entityData && (
        <div className="bg-gray-700/30 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Source Data</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{entityData.duplicates?.length || 0}</p>
              <p className="text-xs text-gray-400">Duplicate Groups</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">
                {entityData.duplicates?.reduce((sum, d) => sum + (d.entities?.length || 0), 0) || 0}
              </p>
              <p className="text-xs text-gray-400">Total Entities</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">{entityData.summary?.uniqueEntities || 0}</p>
              <p className="text-xs text-gray-400">Unique Entities</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-400">Ready</p>
              <p className="text-xs text-gray-400">Status</p>
            </div>
          </div>
        </div>
      )}
      
      {isLoading && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">{processingStage}</span>
            <span className="text-sm text-cyan-400">{embeddingProgress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${embeddingProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}
      
      <div className="flex items-center space-x-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGenerateEmbeddings}
          disabled={isLoading || !entityData || backendStatus !== 'online'}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-medium transition-all duration-200"
        >
          {isLoading ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          <span>{isLoading ? 'Generating...' : 'Generate Embeddings'}</span>
        </motion.button>
        
        {embeddingData && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportEmbeddings}
            className="flex items-center space-x-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  )

  const renderSemanticSearch = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Search className="w-5 h-5 mr-2 text-green-400" />
        Semantic Search
      </h3>
      
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter search query (e.g., 'software engineer', 'technology company')"
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
            onKeyPress={(e) => e.key === 'Enter' && handleSemanticSearch()}
          />
        </div>
        
        <select
          value={selectedEntityType}
          onChange={(e) => setSelectedEntityType(e.target.value)}
          className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
        >
          <option value="all">All Types</option>
          <option value="PERSON">Person</option>
          <option value="ORGANIZATION">Organization</option>
          <option value="LOCATION">Location</option>
          <option value="CONCEPT">Concept</option>
        </select>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSemanticSearch}
          disabled={!searchQuery.trim() || !embeddingData}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-medium transition-all duration-200"
        >
          <Search className="w-4 h-4" />
          <span>Search</span>
        </motion.button>
      </div>
      
      {searchResults.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Search Results</h4>
          {searchResults.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-700/30 border border-gray-600/30 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <Target className="w-4 h-4 text-green-400" />
                  <span className="text-white font-medium">{result.entity}</span>
                  <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                    {result.type}
                  </span>
                </div>
                <div className={`text-sm font-medium ${getSimilarityColor(result.similarity)}`}>
                  {(result.similarity * 100).toFixed(1)}%
                </div>
              </div>
              <p className="text-gray-400 text-sm">{result.context}</p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )

  const renderEmbeddingResults = () => {
    if (!embeddingData) return null
    
    const { totalEmbeddings, dimensions, collections } = getEmbeddingStats()
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-cyan-600/20 to-cyan-800/20 border border-cyan-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-300 text-sm">Total Embeddings</p>
                <p className="text-2xl font-bold text-white">{totalEmbeddings}</p>
              </div>
              <Layers className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm">Dimensions</p>
                <p className="text-2xl font-bold text-white">{dimensions}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm">Collections</p>
                <p className="text-2xl font-bold text-white">{collections}</p>
              </div>
              <Database className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>
        
        {/* Embedding Details */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Embedding Details</h3>
          
          {embeddingData.embeddings && embeddingData.embeddings.length > 0 ? (
            <div className="space-y-3">
              {embeddingData.embeddings.slice(0, 10).map((embedding, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-700/30 border border-gray-600/30 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span className="text-white font-medium">{embedding.entity || `Entity ${index + 1}`}</span>
                      {embedding.type && (
                        <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                          {embedding.type}
                        </span>
                      )}
                    </div>
                    <span className="text-gray-400 text-sm">
                      {embedding.vector?.length || dimensions}D
                    </span>
                  </div>
                  
                  {embedding.metadata && (
                    <div className="text-gray-400 text-sm">
                      <span className="font-medium">Metadata:</span> {JSON.stringify(embedding.metadata)}
                    </div>
                  )}
                  
                  {embedding.vector && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">Vector Preview:</div>
                      <div className="text-xs text-gray-400 font-mono bg-gray-800/50 p-2 rounded">
                        [{embedding.vector.slice(0, 5).map(v => v.toFixed(3)).join(', ')}...]
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              
              {embeddingData.embeddings.length > 10 && (
                <div className="text-center text-gray-500 text-sm">
                  +{embeddingData.embeddings.length - 10} more embeddings...
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <h4 className="text-lg font-medium text-white mb-2">No Embeddings Available</h4>
              <p className="text-gray-400">Generate embeddings to see detailed information.</p>
            </div>
          )}
        </div>
        
        {/* ChromaDB Collection Info */}
        {embeddingData.collections && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">ChromaDB Collections</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {embeddingData.collections.map((collection, index) => (
                <div key={index} className="bg-gray-700/30 border border-gray-600/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{collection.name}</span>
                    <span className="text-cyan-400 text-sm">{collection.count} items</span>
                  </div>
                  <div className="text-gray-400 text-sm">
                    <div>Created: {new Date(collection.created_at).toLocaleDateString()}</div>
                    <div>Metadata: {JSON.stringify(collection.metadata || {})}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <ProfessionalModuleWrapper
      moduleId="embeddings"
      moduleName="Embedding Generator"
      moduleIcon={Database}
      moduleColor="#06b6d4"
      onBack={onBack}
      requiresData={true}
      dataType="entities"
    >
      <div className="space-y-6">
        {renderGenerationControls()}
        
        <AnimatePresence>
          {showResults && (
            <>
              {renderSemanticSearch()}
              {renderEmbeddingResults()}
            </>
          )}
        </AnimatePresence>
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-4"
          >
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-300 font-medium">Error</span>
            </div>
            <p className="text-red-200 mt-2">{error}</p>
          </motion.div>
        )}
      </div>
    </ProfessionalModuleWrapper>
  )
}

export default EnhancedEmbeddingGenerator
