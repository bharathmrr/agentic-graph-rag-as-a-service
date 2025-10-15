import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Network, Play, Download, Eye, Settings, BarChart3, Database, Layers, CheckCircle, Zap, ArrowLeft } from 'lucide-react'
import { useData } from '../context/DataContext'

const GraphConstructor = ({ onNotification, onGraphComplete, onBack }) => {
  const { hasDocuments, ontologyData, entityData, backendStatus } = useData()
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

  // Remove mock data - only use real document-based data

  const buildGraph = async () => {
    if (!hasDocuments || !ontologyData) {
      onNotification?.({
        type: 'warning',
        title: 'No Data Available',
        message: 'Please upload documents and generate ontology first'
      })
      return
    }

    setIsBuilding(true)
    setNeo4jIntegration(true)
    
    try {
      setProcessingStage('🚀 Connecting to Neo4j database...')
      setBuildProgress(10)
      
      // Call real backend API
      const response = await fetch('http://localhost:8000/graph/build-from-ontology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entities: ontologyData.entities,
          relationships: ontologyData.relationships
        })
      })
      
      setBuildProgress(50)
      setProcessingStage('🏗️ Building graph structure...')
      
      if (!response.ok) {
        throw new Error('Failed to build graph')
      }
      
      const result = await response.json()
      setBuildProgress(90)
      setProcessingStage('✨ Finalizing visualization...')
      
      // Use real graph data from backend
      if (result.success) {
        setGraphData(result.graph_data)
        onNotification?.({
          type: 'success',
          title: 'Graph Built Successfully',
          message: `Created graph with ${result.graph_data.nodes?.length || 0} nodes and ${result.graph_data.edges?.length || 0} relationships`
        })
      }
      
      setBuildProgress(100)
      setProcessingStage('✅ Graph construction complete!')
      
      if (onGraphComplete) {
        onGraphComplete(result.graph_data)
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
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Network size={20} className="text-white" />
              </div>
              <div>
                <h1 className="section-title">Graph Constructor</h1>
                <p className="text-muted">Build knowledge graphs with Neo4j visualization</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="premium-card mb-6">
        <div className="flex items-center justify-between">
          <h3 className="section-title">Controls</h3>
          <button
            onClick={buildGraph}
            disabled={isBuilding}
            className="btn-primary"
          >
            <Play size={16} />
            <span>{isBuilding ? 'Building...' : 'Build Graph'}</span>
          </button>
        </div>
        
        {isBuilding && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted">{processingStage}</span>
              <span className="text-sm text-pink-400">{buildProgress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${buildProgress}%` }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Statistics */}
      {graphData && (
        <div className="stats-grid mb-6">
          <div className="stat-premium">
            <div className="stat-icon">
              <Network size={16} />
            </div>
            <div className="stat-label">Total Nodes</div>
            <div className="stat-value">{graphData.statistics.totalNodes}</div>
          </div>
          
          <div className="stat-premium">
            <div className="stat-icon">
              <BarChart3 size={16} />
            </div>
            <div className="stat-label">Total Edges</div>
            <div className="stat-value">{graphData.statistics.totalEdges}</div>
          </div>
          
          <div className="stat-premium">
            <div className="stat-icon">
              <Eye size={16} />
            </div>
            <div className="stat-label">Density</div>
            <div className="stat-value">{graphData.statistics.density}</div>
          </div>
          
          <div className="stat-premium">
            <div className="stat-icon">
              <Settings size={16} />
            </div>
            <div className="stat-label">Avg Degree</div>
            <div className="stat-value">{graphData.statistics.avgDegree}</div>
          </div>
          
          <div className="stat-premium">
            <div className="stat-icon">
              <Layers size={16} />
            </div>
            <div className="stat-label">Clusters</div>
            <div className="stat-value">{graphData.statistics.clusters}</div>
          </div>
        </div>
      )}

      {/* Graph Preview */}
      {graphData && (
        <div className="premium-card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Graph Preview</h3>
            <div className="flex space-x-2">
              <button className="btn-secondary">
                <Eye size={16} />
                <span>View Full</span>
              </button>
              <button className="btn-secondary">
                <Download size={16} />
                <span>Export</span>
              </button>
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
        </div>
      )}

      {/* Node and Relationship Types */}
      {graphData && (
        <div className="content-grid two-column">
          <div className="premium-card">
            <h3 className="section-title mb-4">Node Types</h3>
            <div className="space-y-3">
              {Object.entries(getTypeStats()).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: graphData.nodes.find(n => n.type === type)?.color }}
                    />
                    <span className="text-white font-medium">{type}</span>
                  </div>
                  <span className="text-muted">{count} nodes</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="premium-card">
            <h3 className="section-title mb-4">Relationship Types</h3>
            <div className="space-y-3">
              {Object.entries(getRelationshipStats()).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-white font-medium">{type}</span>
                  <span className="text-muted">{count} edges</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!graphData && !isBuilding ? (
        <div className="empty-state">
          <Network className="empty-state-icon" />
          <h4 className="empty-state-title">Ready to Build Graph</h4>
          <p className="empty-state-description">Click "Build Graph" to create an interactive Neo4j knowledge graph</p>
          <button onClick={buildGraph} className="btn-primary">
            <Play size={16} />
            Build Knowledge Graph
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default GraphConstructor
