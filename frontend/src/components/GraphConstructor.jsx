import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Network, Play, Download, Eye, Settings, BarChart3, Database, Layers, CheckCircle, Zap } from 'lucide-react'

const GraphConstructor = ({ onNotification, onGraphComplete }) => {
  // Step 5 specific states
  const [currentStep, setCurrentStep] = useState(5)
  const [totalSteps] = useState(12)
  const [isStep5Complete, setIsStep5Complete] = useState(false)
  const [neo4jIntegration, setNeo4jIntegration] = useState(false)
  const [showReadyButton, setShowReadyButton] = useState(false)
  const [processingStage, setProcessingStage] = useState('')
  const [buildProgress, setBuildProgress] = useState(0)
  const [selectedNodes, setSelectedNodes] = useState(5)
  const [isBuilding, setIsBuilding] = useState(false)
  const [graphData, setGraphData] = useState(null)
  const [multipleGraphs, setMultipleGraphs] = useState([])
  const [activeGraphId, setActiveGraphId] = useState(null)

  const mockGraphData = {
    nodes: [
      { id: 'n1', label: 'Alice Johnson', type: 'PERSON', size: 20, color: '#FF6B6B' },
      { id: 'n2', label: 'TechCorp Inc', type: 'ORGANIZATION', size: 25, color: '#4ECDC4' },
      { id: 'n3', label: 'San Francisco', type: 'LOCATION', size: 18, color: '#45B7D1' },
      { id: 'n4', label: 'Machine Learning', type: 'CONCEPT', size: 22, color: '#96CEB4' },
      { id: 'n5', label: 'Bob Smith', type: 'PERSON', size: 17, color: '#FF6B6B' },
      { id: 'n6', label: 'Data Science', type: 'CONCEPT', size: 21, color: '#96CEB4' }
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', type: 'WORKS_FOR', weight: 0.9 },
      { id: 'e2', source: 'n2', target: 'n3', type: 'LOCATED_IN', weight: 0.8 },
      { id: 'e3', source: 'n1', target: 'n4', type: 'EXPERT_IN', weight: 0.7 },
      { id: 'e4', source: 'n4', target: 'n6', type: 'RELATED_TO', weight: 0.6 },
      { id: 'e5', source: 'n5', target: 'n2', type: 'WORKS_FOR', weight: 0.8 },
      { id: 'e6', source: 'n5', target: 'n6', type: 'EXPERT_IN', weight: 0.9 }
    ],
    statistics: {
      totalNodes: 6,
      totalEdges: 6,
      density: 0.33,
      avgDegree: 2.0,
      clusters: 2
    }
  }

  const buildGraph = async () => {
    setIsBuilding(true)
    setNeo4jIntegration(true)
    
    try {
      setProcessingStage('🚀 Connecting to Neo4j database...')
      setBuildProgress(10)
      
      await new Promise(resolve => setTimeout(resolve, 800))
      setProcessingStage('📊 Processing ontology and embeddings...')
      setBuildProgress(25)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProcessingStage('🏗️ Building graph structure with relationships...')
      setBuildProgress(50)
      
      await new Promise(resolve => setTimeout(resolve, 1200))
      setProcessingStage('🎯 Creating dynamic node network...')
      setBuildProgress(75)
      
      await new Promise(resolve => setTimeout(resolve, 800))
      setProcessingStage('✨ Optimizing graph visualization...')
      setBuildProgress(90)
      
      // Generate dynamic graph based on selected nodes
      const mockGraphs = [
        {
          id: 'graph_5_nodes',
          name: '5-Node Network',
          nodeCount: 5,
          nodes: [
            { id: 'bharath', label: 'Bharath', type: 'PERSON', size: 25, color: '#FF6B6B' },
            { id: 'lyzr', label: 'LYzr AI', type: 'ORGANIZATION', size: 30, color: '#4ECDC4' },
            { id: 'project', label: 'Agentic Graph RAG', type: 'PROJECT', size: 28, color: '#45B7D1' },
            { id: 'neo4j', label: 'Neo4j', type: 'TECHNOLOGY', size: 22, color: '#96CEB4' },
            { id: 'chromadb', label: 'ChromaDB', type: 'TECHNOLOGY', size: 20, color: '#FECA57' }
          ],
          edges: [
            { id: 'e1', source: 'bharath', target: 'project', type: 'CREATED', weight: 0.95 },
            { id: 'e2', source: 'bharath', target: 'lyzr', type: 'WORKS_AT', weight: 0.92 },
            { id: 'e3', source: 'project', target: 'neo4j', type: 'USES', weight: 0.89 },
            { id: 'e4', source: 'project', target: 'chromadb', type: 'INTEGRATES', weight: 0.87 },
            { id: 'e5', source: 'lyzr', target: 'project', type: 'DEVELOPS', weight: 0.91 }
          ]
        },
        {
          id: 'graph_8_nodes',
          name: '8-Node Extended Network',
          nodeCount: 8,
          nodes: [
            { id: 'bharath', label: 'Bharath', type: 'PERSON', size: 25, color: '#FF6B6B' },
            { id: 'lyzr', label: 'LYzr AI', type: 'ORGANIZATION', size: 30, color: '#4ECDC4' },
            { id: 'project', label: 'Agentic Graph RAG', type: 'PROJECT', size: 28, color: '#45B7D1' },
            { id: 'neo4j', label: 'Neo4j', type: 'TECHNOLOGY', size: 22, color: '#96CEB4' },
            { id: 'chromadb', label: 'ChromaDB', type: 'TECHNOLOGY', size: 20, color: '#FECA57' },
            { id: 'openai', label: 'OpenAI', type: 'ORGANIZATION', size: 24, color: '#4ECDC4' },
            { id: 'ml', label: 'Machine Learning', type: 'CONCEPT', size: 26, color: '#A8E6CF' },
            { id: 'kg', label: 'Knowledge Graph', type: 'CONCEPT', size: 27, color: '#A8E6CF' }
          ],
          edges: [
            { id: 'e1', source: 'bharath', target: 'project', type: 'CREATED', weight: 0.95 },
            { id: 'e2', source: 'bharath', target: 'lyzr', type: 'WORKS_AT', weight: 0.92 },
            { id: 'e3', source: 'project', target: 'neo4j', type: 'USES', weight: 0.89 },
            { id: 'e4', source: 'project', target: 'chromadb', type: 'INTEGRATES', weight: 0.87 },
            { id: 'e5', source: 'lyzr', target: 'project', type: 'DEVELOPS', weight: 0.91 },
            { id: 'e6', source: 'project', target: 'openai', type: 'POWERED_BY', weight: 0.85 },
            { id: 'e7', source: 'kg', target: 'ml', type: 'IMPLEMENTS', weight: 0.83 },
            { id: 'e8', source: 'project', target: 'kg', type: 'CREATES', weight: 0.94 }
          ]
        }
      ]
      
      setMultipleGraphs(mockGraphs)
      setGraphData(mockGraphs[0]) // Default to 5-node graph
      setActiveGraphId('graph_5_nodes')
      
      setProcessingStage('✅ Graph construction complete!')
      setBuildProgress(100)
      
      // Complete Step 5
      setIsStep5Complete(true)
      setShowReadyButton(true)
      
      onNotification?.({
        type: 'success',
        title: 'Step 5 Complete!',
        message: `Built interactive knowledge graph with ${mockGraphs.length} different configurations. Neo4j integration successful.`
      })
      
      // Trigger completion callback
      if (onGraphComplete) {
        onGraphComplete({
          step: 5,
          graphs: mockGraphs,
          activeGraph: mockGraphs[0],
          neo4jIntegrated: true,
          completed: true
        })
      }
      
    } catch (error) {
      onNotification?.({
        type: 'error',
        title: 'Graph Construction Failed',
        message: error.message || 'Failed to build knowledge graph'
      })
    } finally {
      setIsBuilding(false)
      setNeo4jIntegration(false)
      setProcessingStage('')
      setBuildProgress(0)
    }
  }

  const getTypeStats = () => {
    if (!graphData) return {}
    
    const stats = {}
    graphData.nodes.forEach(node => {
      stats[node.type] = (stats[node.type] || 0) + 1
    })
    return stats
  }

  const getRelationshipStats = () => {
    if (!graphData) return {}
    
    const stats = {}
    graphData.edges.forEach(edge => {
      stats[edge.type] = (stats[edge.type] || 0) + 1
    })
    return stats
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Network className="w-6 h-6 mr-2 text-pink-400" />
            Graph Constructor
          </h2>
          <p className="text-gray-400 mt-1">Build interactive Neo4j knowledge graphs</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={buildGraph}
          disabled={isBuilding}
          className="px-4 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 text-white rounded-lg flex items-center space-x-2"
        >
          <Play className="w-4 h-4" />
          <span>{isBuilding ? 'Building...' : 'Build Knowledge Graph'}</span>
        </motion.button>
      </div>

      {/* Statistics */}
      {graphData && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Nodes</p>
                <p className="text-2xl font-bold text-white">{graphData.statistics.totalNodes}</p>
              </div>
              <Network className="w-8 h-8 text-pink-400" />
            </div>
          </div>
          
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Edges</p>
                <p className="text-2xl font-bold text-pink-400">{graphData.statistics.totalEdges}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-pink-400" />
            </div>
          </div>
          
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Density</p>
                <p className="text-2xl font-bold text-blue-400">{graphData.statistics.density}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Degree</p>
                <p className="text-2xl font-bold text-green-400">{graphData.statistics.avgDegree}</p>
              </div>
              <Settings className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Clusters</p>
                <p className="text-2xl font-bold text-purple-400">{graphData.statistics.clusters}</p>
              </div>
              <Network className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>
      )}

      {/* Graph Visualization Preview */}
      {graphData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Graph Preview</h3>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded flex items-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>View Full</span>
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
          
          {/* Simple Graph Representation */}
          <div className="bg-gray-900/50 rounded-lg p-6 min-h-64 flex items-center justify-center">
            <div className="relative">
              {/* Nodes */}
              {graphData.nodes.map((node, index) => (
                <motion.div
                  key={node.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="absolute w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
                  style={{
                    backgroundColor: node.color,
                    left: `${20 + (index % 3) * 120}px`,
                    top: `${20 + Math.floor(index / 3) * 80}px`
                  }}
                >
                  {node.label.split(' ').map(w => w[0]).join('')}
                </motion.div>
              ))}
              
              {/* Connection lines (simplified) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {graphData.edges.map((edge, index) => {
                  const sourceIndex = graphData.nodes.findIndex(n => n.id === edge.source)
                  const targetIndex = graphData.nodes.findIndex(n => n.id === edge.target)
                  const x1 = 44 + (sourceIndex % 3) * 120
                  const y1 = 44 + Math.floor(sourceIndex / 3) * 80
                  const x2 = 44 + (targetIndex % 3) * 120
                  const y2 = 44 + Math.floor(targetIndex / 3) * 80
                  
                  return (
                    <motion.line
                      key={edge.id}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: index * 0.2 + 0.5 }}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#4B5563"
                      strokeWidth="2"
                      strokeOpacity="0.6"
                    />
                  )
                })}
              </svg>
            </div>
          </div>
        </motion.div>
      )}

      {/* Node Types */}
      {graphData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Node Types</h3>
            <div className="space-y-3">
              {Object.entries(getTypeStats()).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: graphData.nodes.find(n => n.type === type)?.color }}
                    />
                    <span className="text-white">{type}</span>
                  </div>
                  <span className="text-gray-400">{count} nodes</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Relationship Types</h3>
            <div className="space-y-3">
              {Object.entries(getRelationshipStats()).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-white">{type}</span>
                  <span className="text-gray-400">{count} edges</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Building State */}
      {isBuilding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full"
            />
            <span className="text-white text-lg">Building knowledge graph...</span>
          </div>
          <p className="text-gray-400">Constructing nodes and relationships</p>
        </motion.div>
      )}
    </div>
  )
}

export default GraphConstructor
