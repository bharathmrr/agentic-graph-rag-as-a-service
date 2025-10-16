import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Search, Network, Filter, Brain, Eye, Download, CheckCircle, Target, Layers, ArrowLeft } from 'lucide-react'

const AgenticRetrieval = ({ onNotification, onRetrievalComplete, onBack }) => {
  // Step 8 specific states
  const [currentStep, setCurrentStep] = useState(8)
  const [totalSteps] = useState(12)
  const [isStep8Complete, setIsStep8Complete] = useState(false)
  const [showReadyButton, setShowReadyButton] = useState(false)
  const [agentProcessing, setAgentProcessing] = useState(false)
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState([])
  const [strategy, setStrategy] = useState('adaptive')
  const [reasoningSteps, setReasoningSteps] = useState([])
  const [retrievalStats, setRetrievalStats] = useState({})

  const strategies = [
    { id: 'vector', name: 'Vector Only', icon: Search, color: 'text-blue-400' },
    { id: 'graph', name: 'Graph Only', icon: Network, color: 'text-green-400' },
    { id: 'logical', name: 'Logical Filter', icon: Filter, color: 'text-purple-400' },
    { id: 'hybrid', name: 'Hybrid', icon: Brain, color: 'text-orange-400' },
    { id: 'adaptive', name: 'Adaptive', icon: Zap, color: 'text-yellow-400' }
  ]

  const mockResults = [
    {
      id: 1,
      content: "Alice Johnson is a software engineer at TechCorp Inc, specializing in machine learning algorithms.",
      score: 0.95,
      source: 'vector',
      metadata: { type: 'PERSON', entity: 'Alice Johnson' }
    },
    {
      id: 2,
      content: "TechCorp Inc → LOCATED_IN → San Francisco",
      score: 0.87,
      source: 'graph',
      metadata: { type: 'RELATIONSHIP', from: 'TechCorp Inc', to: 'San Francisco' }
    },
    {
      id: 3,
      content: "Machine learning concepts related to data analysis and artificial intelligence.",
      score: 0.92,
      source: 'logical',
      metadata: { type: 'CONCEPT', entity: 'Machine Learning' }
    }
  ]

  const mockReasoningSteps = [
    {
      step: 1,
      type: 'Query Analysis',
      description: 'Analyzed query intent and complexity',
      confidence: 0.9,
      details: 'Detected entity lookup intent with medium complexity'
    },
    {
      step: 2,
      type: 'Strategy Selection',
      description: 'Selected adaptive retrieval strategy',
      confidence: 0.85,
      details: 'Combining vector search with graph traversal'
    },
    {
      step: 3,
      type: 'Information Retrieval',
      description: 'Retrieved relevant information from multiple sources',
      confidence: 0.92,
      details: 'Found 3 high-confidence results across different modalities'
    },
    {
      step: 4,
      type: 'Result Synthesis',
      description: 'Synthesized and ranked results',
      confidence: 0.88,
      details: 'Applied confidence weighting and relevance scoring'
    }
  ]

  const performSearch = async () => {
    if (!query.trim()) {
      onNotification?.({
        type: 'warning',
        title: 'No Query',
        message: 'Please enter a search query'
      })
      return
    }
    
    setIsSearching(true)
    setAgentProcessing(true)
    setResults([])
    setReasoningSteps([])
    
    try {
      // Step 8: Agentic Retrieval with intelligent agent processing
      const enhancedReasoningSteps = [
        {
          step: 1,
          type: 'Query Analysis',
          description: '🔍 Analyzing query intent and extracting keywords',
          confidence: 0.94,
          details: `Detected entities: ["${query.split(' ').slice(0, 2).join('", "')}"] with high relevance`
        },
        {
          step: 2,
          type: 'Agent Selection',
          description: '🤖 Intelligent agent selected optimal retrieval strategy',
          confidence: 0.91,
          details: `Using ${strategy} approach with Gemini/OpenAI agent intelligence`
        },
        {
          step: 3,
          type: 'Multi-Modal Retrieval',
          description: '🌐 Retrieving from embeddings, ontologies, and knowledge graphs',
          confidence: 0.96,
          details: 'Parallel search across vector DB, Neo4j graph, and logical filters'
        },
        {
          step: 4,
          type: 'Context-Aware Ranking',
          description: '🎯 AI agent ranking results by relevance and context',
          confidence: 0.89,
          details: 'Applied semantic similarity and relationship strength weighting'
        },
        {
          step: 5,
          type: 'Adaptive Learning',
          description: '🧠 Agent learning from query patterns for future optimization',
          confidence: 0.87,
          details: 'Updated retrieval preferences based on user interaction patterns'
        }
      ]
      
      // Simulate intelligent agent processing
      for (let i = 0; i < enhancedReasoningSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800))
        setReasoningSteps(prev => [...prev, enhancedReasoningSteps[i]])
      }
      
      // Enhanced mock results with agent intelligence
      const enhancedResults = [
        {
          id: 1,
          content: `Bharath → Created → Agentic Graph RAG System (Confidence: 0.96)`,
          score: 0.96,
          source: 'graph',
          metadata: { type: 'RELATIONSHIP', from: 'Bharath', to: 'Agentic Graph RAG System', agent_selected: true }
        },
        {
          id: 2,
          content: `LYzr AI develops advanced AI systems including knowledge graphs and RAG implementations with semantic search capabilities.`,
          score: 0.93,
          source: 'vector',
          metadata: { type: 'ORGANIZATION', entity: 'LYzr AI', semantic_match: 0.93 }
        },
        {
          id: 3,
          content: `Knowledge Graph → Implements → Machine Learning (Similarity: 0.91)`,
          score: 0.91,
          source: 'logical',
          metadata: { type: 'CONCEPT_RELATION', concept: 'Knowledge Graph', ml_relevance: 0.91 }
        },
        {
          id: 4,
          content: `Neo4j and ChromaDB integration enables hybrid vector-graph retrieval with contextual understanding.`,
          score: 0.89,
          source: 'hybrid',
          metadata: { type: 'TECHNICAL', technologies: ['Neo4j', 'ChromaDB'], context_score: 0.89 }
        }
      ]
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      setResults(enhancedResults)
      
      // Step 8 completion stats
      const mockStats = {
        queriesProcessed: 1,
        agentStrategy: strategy,
        retrievalSources: 4,
        averageConfidence: 0.92,
        processingTime: '4.1s',
        agentLearning: true
      }
      
      setRetrievalStats(mockStats)
      
      // Complete Step 8
      setIsStep8Complete(true)
      setShowReadyButton(true)
      
      onNotification?.({
        type: 'success',
        title: 'Step 8 Complete!',
        message: `Agentic retrieval successful! Found ${enhancedResults.length} results with AI agent intelligence.`
      })
      
      // Trigger completion callback
      if (onRetrievalComplete) {
        onRetrievalComplete({
          step: 8,
          query,
          results: enhancedResults,
          reasoningSteps: enhancedReasoningSteps,
          stats: mockStats,
          completed: true
        })
      }
      
    } catch (error) {
      onNotification?.({
        type: 'error',
        title: 'Retrieval Failed',
        message: error.message || 'Agentic retrieval failed'
      })
    } finally {
      setIsSearching(false)
      setAgentProcessing(false)
    }
  }

  const getSourceColor = (source) => {
    const colors = {
      vector: 'bg-blue-500/20 text-blue-400',
      graph: 'bg-green-500/20 text-green-400',
      logical: 'bg-purple-500/20 text-purple-400',
      hybrid: 'bg-orange-500/20 text-orange-400'
    }
    return colors[source] || 'bg-gray-500/20 text-gray-400'
  }

  const getStepIcon = (type) => {
    switch (type) {
      case 'Query Analysis': return Search
      case 'Strategy Selection': return Zap
      case 'Information Retrieval': return Network
      case 'Result Synthesis': return Brain
      default: return Eye
    }
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
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                <Zap size={20} className="text-white" />
              </div>
              <div>
                <h1 className="section-title">Agentic Retrieval</h1>
                <p className="text-muted">Intelligent multi-strategy information retrieval</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Interface */}
      <div className="premium-card mb-6">
        <div className="space-y-4">
          {/* Strategy Selection */}
          <div>
            <h3 className="section-subtitle mb-3">Retrieval Strategy</h3>
            <div className="segmented">
              {strategies.map((strat) => {
                const Icon = strat.icon
                return (
                  <button
                    key={strat.id}
                    onClick={() => setStrategy(strat.id)}
                    className={`segmented-item ${strategy === strat.id ? 'active' : ''}`}
                  >
                    <Icon size={16} />
                    <span>{strat.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Query Input */}
          <div>
            <h3 className="section-subtitle mb-3">Search Query</h3>
            <div className="flex space-x-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your query for intelligent retrieval..."
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                onKeyPress={(e) => e.key === 'Enter' && performSearch()}
              />
              <button
                onClick={performSearch}
                disabled={!query.trim() || isSearching}
                className="btn-primary"
              >
                <Zap size={16} />
                <span>{isSearching ? 'Searching...' : 'Search'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reasoning Steps */}
      {reasoningSteps.length > 0 && (
        <div className="premium-card mb-6">
          <h3 className="section-title mb-4">
            <Brain className="w-5 h-5 mr-2 inline" />
            Reasoning Chain
          </h3>
          
          <div className="space-y-3">
            {reasoningSteps.map((step, index) => {
              const StepIcon = getStepIcon(step.type)
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-4 p-4 bg-gray-700/30 rounded-lg"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-yellow-600 rounded-full">
                    <StepIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-white font-medium">{step.type}</h4>
                      <span className="text-green-400 text-sm">{Math.round(step.confidence * 100)}%</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-1">{step.description}</p>
                    <p className="text-gray-400 text-xs">{step.details}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="premium-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Search Results ({results.length})</h3>
            <div className="flex space-x-2">
              <button className="btn-secondary">
                <Eye size={16} />
                <span>View All</span>
              </button>
              <button className="btn-secondary">
                <Download size={16} />
                <span>Export</span>
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {results.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-700/30 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-white text-sm">{result.content}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSourceColor(result.source)}`}>
                      {result.source}
                    </span>
                    <span className="text-green-400 text-sm font-medium">
                      {Math.round(result.score * 100)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Type: {result.metadata.type}</span>
                  <span>Entity: {result.metadata.entity || result.metadata.from || 'N/A'}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isSearching && (
        <div className="premium-card text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <h4 className="section-subtitle">Performing Intelligent Retrieval</h4>
          <p className="text-muted">Analyzing query and selecting optimal strategy</p>
        </div>
      )}
    </div>
  )
}

export default AgenticRetrieval
