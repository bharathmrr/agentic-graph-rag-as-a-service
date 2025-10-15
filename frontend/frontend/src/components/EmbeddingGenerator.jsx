import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Database, Search, Zap, Download, Eye, Filter } from 'lucide-react'

const EmbeddingGenerator = ({ onNotification }) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [embeddings, setEmbeddings] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])

  const mockEmbeddings = [
    {
      id: 1,
      text: "Alice Johnson works at TechCorp as a software engineer",
      vector: [0.1, 0.2, 0.3, 0.4, 0.5],
      similarity: 0.95,
      metadata: { type: 'PERSON', entity: 'Alice Johnson' }
    },
    {
      id: 2,
      text: "TechCorp Inc is located in San Francisco",
      vector: [0.2, 0.3, 0.4, 0.5, 0.6],
      similarity: 0.87,
      metadata: { type: 'ORGANIZATION', entity: 'TechCorp Inc' }
    },
    {
      id: 3,
      text: "Machine learning algorithms are used for data analysis",
      vector: [0.3, 0.4, 0.5, 0.6, 0.7],
      similarity: 0.92,
      metadata: { type: 'CONCEPT', entity: 'Machine Learning' }
    }
  ]

  const generateEmbeddings = async () => {
    setIsGenerating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      setEmbeddings(mockEmbeddings)
      
      onNotification?.({
        type: 'success',
        title: 'Embeddings Generated',
        message: `Generated ${mockEmbeddings.length} embeddings successfully`
      })
    } catch (error) {
      onNotification?.({
        type: 'error',
        title: 'Generation Failed',
        message: error.message
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const performSemanticSearch = async () => {
    if (!searchQuery.trim()) return
    
    try {
      // Mock semantic search
      const results = mockEmbeddings.filter(emb => 
        emb.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emb.metadata.entity.toLowerCase().includes(searchQuery.toLowerCase())
      )
      
      setSearchResults(results)
      
      onNotification?.({
        type: 'success',
        title: 'Search Complete',
        message: `Found ${results.length} relevant results`
      })
    } catch (error) {
      onNotification?.({
        type: 'error',
        title: 'Search Failed',
        message: error.message
      })
    }
  }

  const getTypeColor = (type) => {
    const colors = {
      PERSON: 'bg-blue-500/20 text-blue-400',
      ORGANIZATION: 'bg-green-500/20 text-green-400',
      CONCEPT: 'bg-purple-500/20 text-purple-400',
      LOCATION: 'bg-orange-500/20 text-orange-400'
    }
    return colors[type] || 'bg-gray-500/20 text-gray-400'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Database className="w-6 h-6 mr-2 text-cyan-400" />
            Embedding Generator
          </h2>
          <p className="text-gray-400 mt-1">Generate semantic embeddings for ChromaDB</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={generateEmbeddings}
          disabled={isGenerating}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white rounded-lg flex items-center space-x-2"
        >
          <Zap className="w-4 h-4" />
          <span>{isGenerating ? 'Generating...' : 'Generate Embeddings'}</span>
        </motion.button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Embeddings</p>
              <p className="text-2xl font-bold text-white">{embeddings.length}</p>
            </div>
            <Database className="w-8 h-8 text-cyan-400" />
          </div>
        </div>
        
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Vector Dimensions</p>
              <p className="text-2xl font-bold text-cyan-400">384</p>
            </div>
            <Zap className="w-8 h-8 text-cyan-400" />
          </div>
        </div>
        
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Search Results</p>
              <p className="text-2xl font-bold text-green-400">{searchResults.length}</p>
            </div>
            <Search className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Similarity</p>
              <p className="text-2xl font-bold text-purple-400">
                {searchResults.length > 0 
                  ? Math.round((searchResults.reduce((sum, r) => sum + r.similarity, 0) / searchResults.length) * 100) + '%'
                  : '0%'
                }
              </p>
            </div>
            <Eye className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Semantic Search */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Search className="w-5 h-5 mr-2" />
          Semantic Search
        </h3>
        
        <div className="flex space-x-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search embeddings semantically..."
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
              onKeyPress={(e) => e.key === 'Enter' && performSemanticSearch()}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={performSemanticSearch}
            disabled={!searchQuery.trim()}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white rounded-lg flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </motion.button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-md font-medium text-gray-300">Search Results ({searchResults.length})</h4>
            {searchResults.map((result) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-700/30 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-white text-sm">{result.text}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(result.metadata.type)}`}>
                      {result.metadata.type}
                    </span>
                    <span className="text-green-400 text-sm font-medium">
                      {Math.round(result.similarity * 100)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Entity: {result.metadata.entity}</span>
                  <span className="text-gray-500 text-xs">Vector: [{result.vector.slice(0, 3).join(', ')}...]</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Embeddings List */}
      {embeddings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Generated Embeddings</h3>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded flex items-center space-x-1"
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded flex items-center space-x-1"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </motion.button>
            </div>
          </div>
          
          <div className="space-y-3">
            {embeddings.map((embedding) => (
              <motion.div
                key={embedding.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: embedding.id * 0.1 }}
                className="bg-gray-700/30 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-white text-sm">{embedding.text}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(embedding.metadata.type)}`}>
                    {embedding.metadata.type}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Entity: {embedding.metadata.entity}</span>
                  <span>Vector: [{embedding.vector.join(', ')}]</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Processing State */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full"
            />
            <span className="text-white text-lg">Generating embeddings...</span>
          </div>
          <p className="text-gray-400">Converting text to vector representations</p>
        </motion.div>
      )}
    </div>
  )
}

export default EmbeddingGenerator
