import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Network, ArrowLeft, RefreshCw, Database, Users, GitBranch, Box, Layers, Eye, Target, Maximize, CheckCircle, Zap, Settings } from 'lucide-react'
import { useData } from '../context/DataContext'
import ModernModuleLayout from './ModernModuleLayout'

const EnhancedKnowledgeGraph = ({ onNotification, onBack, onVisualizationComplete }) => {
  // Step 6 specific states
  const [currentStep, setCurrentStep] = useState(6)
  const [totalSteps] = useState(12)
  const [isStep6Complete, setIsStep6Complete] = useState(false)
  const [visualizationMode, setVisualizationMode] = useState('3D')
  const [selectedEntities, setSelectedEntities] = useState([])
  const [showReadyButton, setShowReadyButton] = useState(false)
  const [is3DRendering, setIs3DRendering] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [graphData, setGraphData] = useState(null)
  const [visualizationData, setVisualizationData] = useState(null)
  const [renderingProgress, setRenderingProgress] = useState(0)
  
  // Get data context
  const { 
    neo4jData, 
    getNeo4jData, 
    backendStatus, 
    ontologyData,
    entityData,
    embeddingData 
  } = useData()

  // Debug logging
  console.log('🚀 EnhancedKnowledgeGraph component mounted', { onNotification, onBack })
  
  // Immediate render test
  console.log('📊 Component state:', { isLoading, error })
  
  // Emergency fallback - if something goes wrong, show this
  if (typeof React === 'undefined') {
    return <div>React not loaded</div>
  }

  // Load graph data on mount
  useEffect(() => {
    const loadGraphData = async () => {
      try {
        console.log('🔄 Loading graph data...')
        console.log('📊 Backend status:', backendStatus)
        console.log('📊 Available data:', { neo4jData, ontologyData, entityData, embeddingData })
        
        if (backendStatus === 'online') {
          // Try to fetch fresh data from backend
          try {
            const data = await getNeo4jData()
            setGraphData(data)
            console.log('✅ Fetched fresh graph data:', data)
            onNotification?.({ 
              type: 'success', 
              title: 'Knowledge Graph', 
              message: 'Graph data loaded from backend' 
            })
          } catch (fetchError) {
            console.warn('⚠️ Failed to fetch from backend, using available data')
            // Use available data from context
            setGraphData(neo4jData || createDemoData())
            onNotification?.({ 
              type: 'warning', 
              title: 'Knowledge Graph', 
              message: 'Using cached data - backend unavailable' 
            })
          }
        } else {
          // Use demo data when backend is offline
          console.log('📊 Backend offline, using demo data')
          setGraphData(createDemoData())
          onNotification?.({ 
            type: 'info', 
            title: 'Knowledge Graph', 
            message: 'Demo graph loaded - backend offline' 
          })
        }
        
        setIsLoading(false)
      } catch (err) {
        console.error('❌ Error loading graph data:', err)
        setError(err.message)
        setIsLoading(false)
        onNotification?.({ 
          type: 'error', 
          title: 'Knowledge Graph Error', 
          message: 'Failed to load graph data' 
        })
      }
    }
    
    loadGraphData()
  }, [backendStatus, neo4jData, getNeo4jData, onNotification])
  
  // Create demo data when no real data is available
  const createDemoData = () => {
    return {
      nodes: [
        { id: 1, label: 'AI Research', type: 'CONCEPT', color: '#3b82f6' },
        { id: 2, label: 'Machine Learning', type: 'CONCEPT', color: '#3b82f6' },
        { id: 3, label: 'Alice Johnson', type: 'PERSON', color: '#10b981' },
        { id: 4, label: 'TechCorp Inc', type: 'ORGANIZATION', color: '#f59e0b' },
        { id: 5, label: 'San Francisco', type: 'LOCATION', color: '#8b5cf6' },
        { id: 6, label: 'Data Science', type: 'CONCEPT', color: '#3b82f6' }
      ],
      edges: [
        { source: 1, target: 2, relationship: 'RELATED_TO' },
        { source: 3, target: 4, relationship: 'WORKS_FOR' },
        { source: 4, target: 5, relationship: 'LOCATED_IN' },
        { source: 2, target: 6, relationship: 'INCLUDES' },
        { source: 3, target: 1, relationship: 'RESEARCHES' }
      ],
      stats: {
        totalNodes: 6,
        totalEdges: 5,
        entityTypes: 4
      }
    }
  }
  
  // Refresh data function
  const refreshData = async () => {
    setIsLoading(true)
    try {
      if (backendStatus === 'online') {
        const data = await getNeo4jData()
        setGraphData(data)
        onNotification?.({ 
          type: 'success', 
          title: 'Data Refreshed', 
          message: 'Graph data updated successfully' 
        })
      }
    } catch (err) {
      console.error('Failed to refresh data:', err)
      onNotification?.({ 
        type: 'error', 
        title: 'Refresh Failed', 
        message: 'Could not refresh graph data' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Step 6: Generate 3D/4D Knowledge Graph Visualization
  const generate3DVisualization = async () => {
    if (!graphData) {
      onNotification?.({
        type: 'error',
        title: 'No Graph Data',
        message: 'Please complete Step 5: Graph Constructor first'
      })
      return
    }

    try {
      setIs3DRendering(true)
      setRenderingProgress(10)
      
      // Simulate 3D rendering process
      await new Promise(resolve => setTimeout(resolve, 800))
      setRenderingProgress(25)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      setRenderingProgress(50)
      
      await new Promise(resolve => setTimeout(resolve, 1200))
      setRenderingProgress(75)
      
      await new Promise(resolve => setTimeout(resolve, 800))
      setRenderingProgress(90)
      
      // Mock 3D/4D visualization data
      const mock3DData = {
        nodes: [
          { 
            id: 'bharath', 
            label: 'Bharath', 
            type: 'PERSON', 
            position: { x: 0, y: 0, z: 0 },
            color: '#FF6B6B',
            size: 25,
            connections: 4
          },
          { 
            id: 'lyzr', 
            label: 'LYzr AI', 
            type: 'ORGANIZATION', 
            position: { x: 50, y: 30, z: 20 },
            color: '#4ECDC4',
            size: 30,
            connections: 3
          },
          { 
            id: 'project', 
            label: 'Agentic Graph RAG', 
            type: 'PROJECT', 
            position: { x: -30, y: 40, z: -10 },
            color: '#45B7D1',
            size: 28,
            connections: 5
          },
          { 
            id: 'neo4j', 
            label: 'Neo4j', 
            type: 'TECHNOLOGY', 
            position: { x: 40, y: -20, z: 30 },
            color: '#96CEB4',
            size: 22,
            connections: 2
          },
          { 
            id: 'chromadb', 
            label: 'ChromaDB', 
            type: 'TECHNOLOGY', 
            position: { x: -40, y: -30, z: 25 },
            color: '#FECA57',
            size: 20,
            connections: 2
          },
          { 
            id: 'kg', 
            label: 'Knowledge Graph', 
            type: 'CONCEPT', 
            position: { x: 0, y: 50, z: -30 },
            color: '#A8E6CF',
            size: 27,
            connections: 3
          }
        ],
        edges: [
          { 
            source: 'bharath', 
            target: 'project', 
            type: 'CREATED', 
            strength: 0.95,
            color: '#FF6B6B'
          },
          { 
            source: 'bharath', 
            target: 'lyzr', 
            type: 'WORKS_AT', 
            strength: 0.92,
            color: '#4ECDC4'
          },
          { 
            source: 'project', 
            target: 'neo4j', 
            type: 'USES', 
            strength: 0.89,
            color: '#96CEB4'
          },
          { 
            source: 'project', 
            target: 'chromadb', 
            type: 'INTEGRATES', 
            strength: 0.87,
            color: '#FECA57'
          },
          { 
            source: 'project', 
            target: 'kg', 
            type: 'CREATES', 
            strength: 0.94,
            color: '#A8E6CF'
          }
        ],
        visualization: {
          mode: visualizationMode,
          dimensions: visualizationMode === '3D' ? 3 : 4,
          interactivity: {
            rotation: true,
            zoom: true,
            nodeSelection: true,
            pathHighlighting: true
          },
          layout: 'force-directed-3d',
          physics: {
            gravity: 0.1,
            repulsion: 100,
            linkDistance: 50
          }
        },
        stats: {
          totalNodes: 6,
          totalEdges: 5,
          visualizationDimensions: visualizationMode === '3D' ? 3 : 4,
          renderingTime: '3.2s',
          interactiveFeatures: 8
        }
      }
      
      setVisualizationData(mock3DData)
      setRenderingProgress(100)
      
      // Complete Step 6
      setIsStep6Complete(true)
      setShowReadyButton(true)
      
      onNotification?.({
        type: 'success',
        title: 'Step 6 Complete!',
        message: `Generated ${visualizationMode} knowledge graph visualization with interactive features.`
      })
      
      // Trigger completion callback
      if (onVisualizationComplete) {
        onVisualizationComplete({
          step: 6,
          visualizationData: mock3DData,
          mode: visualizationMode,
          completed: true
        })
      }
      
    } catch (error) {
      onNotification?.({
        type: 'error',
        title: 'Visualization Failed',
        message: error.message || 'Failed to generate 3D visualization'
      })
    } finally {
      setIs3DRendering(false)
      setRenderingProgress(0)
    }
  }

  // Toggle entity selection for highlighting
  const toggleEntitySelection = (entityId) => {
    setSelectedEntities(prev => 
      prev.includes(entityId) 
        ? prev.filter(id => id !== entityId)
        : [...prev, entityId]
    )
  }

  // Error boundary
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              {onBack && (
                <motion.button
                  onClick={onBack}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </motion.button>
              )}
              <h1 className="text-3xl font-bold text-red-400">Error</h1>
            </div>
          </div>
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
            <p className="text-red-300">Component Error: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header with back button */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              {onBack && (
                <motion.button
                  onClick={onBack}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </motion.button>
              )}
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Knowledge Graph Explorer
              </h1>
            </div>
          </div>
          
          {/* Loading content */}
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
            />
            <p className="text-gray-400 text-lg">Loading knowledge graph...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-white">
      <div className="h-full flex flex-col">
        {/* Premium Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                <ArrowLeft size={18} className="text-gray-600" />
                <span className="text-gray-700 font-medium">Back</span>
              </motion.button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Network size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Knowledge Graph</h1>
                  <p className="text-gray-500 text-sm">Interactive 3D knowledge visualization</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{graphData?.stats?.totalNodes || 0}</div>
                <div className="text-gray-500 text-sm">Nodes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{graphData?.stats?.totalEdges || 0}</div>
                <div className="text-gray-500 text-sm">Relationships</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-auto">
          {/* 3D Graph Visualization Area */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-96 mb-6 flex items-center justify-center">
            <div className="text-center">
              <Network size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3D Knowledge Graph</h3>
              <p className="text-gray-500">Interactive visualization will appear here</p>
            </div>
          </div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {onBack && (
              <motion.button
                onClick={onBack}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </motion.button>
            )}
            <div>
              <h2 className="text-4xl font-bold text-white flex items-center mb-2">
                <Network className="w-8 h-8 mr-3 text-blue-400" />
                Interactive Knowledge Graph
              </h2>
              <div className="flex items-center space-x-4">
                <p className="text-white/90 text-lg font-semibold">
                  {graphData ? `${graphData.stats?.totalNodes || 0} nodes, ${graphData.stats?.totalEdges || 0} edges` : 'Loading graph data...'}
                </p>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  backendStatus === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {backendStatus === 'online' ? '● Online' : '● Offline'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Refresh Button */}
          <motion.button
            onClick={refreshData}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </motion.button>
        </div>

        {/* Graph Container */}
<div className="premium-card h-96">
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <Network className="w-16 h-16 text-blue-400 mx-auto" />
              <h3 className="text-xl font-semibold text-white">Knowledge Graph Visualization</h3>
              <p className="text-gray-400">Interactive graph visualization will appear here</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                onClick={() => onNotification?.({ 
                  type: 'info', 
                  title: 'Graph Feature', 
                  message: 'Graph visualization coming soon!' 
                })}
              >
                Load Sample Graph
              </motion.button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
<div className="stat-premium text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-blue-400 mr-2" />
            </div>
            <p className="text-2xl font-bold text-blue-400">{graphData?.stats?.totalNodes || 0}</p>
            <p className="text-sm text-gray-400">Total Nodes</p>
          </div>
<div className="stat-premium text-center">
            <div className="flex items-center justify-center mb-2">
              <GitBranch className="w-5 h-5 text-green-400 mr-2" />
            </div>
            <p className="text-2xl font-bold text-green-400">{graphData?.stats?.totalEdges || 0}</p>
            <p className="text-sm text-gray-400">Total Edges</p>
          </div>
<div className="stat-premium text-center">
            <div className="flex items-center justify-center mb-2">
              <Database className="w-5 h-5 text-purple-400 mr-2" />
            </div>
            <p className="text-2xl font-bold text-purple-400">{graphData?.stats?.entityTypes || 0}</p>
            <p className="text-sm text-gray-400">Entity Types</p>
          </div>
<div className="stat-premium text-center">
            <div className="flex items-center justify-center mb-2">
              <Network className="w-5 h-5 text-orange-400 mr-2" />
            </div>
            <p className="text-2xl font-bold text-orange-400">
              {backendStatus === 'online' ? 'Live' : 'Demo'}
            </p>
            <p className="text-sm text-gray-400">Data Source</p>
          </div>
        </div>
        
        {/* Graph Data Display */}
        {graphData && graphData.nodes && (
<div className="premium-card">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2 text-blue-400" />
              Graph Data Preview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nodes Preview */}
              <div>
                <h4 className="text-lg font-medium text-white mb-3">Sample Nodes</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {graphData.nodes.slice(0, 5).map((node, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-gray-700/50 rounded">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: node.color || '#3b82f6' }}
                      />
                      <span className="text-white font-medium">{node.label}</span>
                      <span className="text-gray-400 text-sm">({node.type})</span>
                    </div>
                  ))}
                  {graphData.nodes.length > 5 && (
                    <p className="text-gray-400 text-sm">...and {graphData.nodes.length - 5} more</p>
                  )}
                </div>
              </div>
              
              {/* Edges Preview */}
              <div>
                <h4 className="text-lg font-medium text-white mb-3">Sample Relationships</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {graphData.edges.slice(0, 5).map((edge, index) => {
                    const sourceNode = graphData.nodes.find(n => n.id === edge.source)
                    const targetNode = graphData.nodes.find(n => n.id === edge.target)
                    return (
                      <div key={index} className="p-2 bg-gray-700/50 rounded text-sm">
                        <span className="text-white">{sourceNode?.label || edge.source}</span>
                        <span className="text-gray-400 mx-2">→ {edge.relationship} →</span>
                        <span className="text-white">{targetNode?.label || edge.target}</span>
                      </div>
                    )
                  })}
                  {graphData.edges.length > 5 && (
                    <p className="text-gray-400 text-sm">...and {graphData.edges.length - 5} more</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

export default EnhancedKnowledgeGraph
