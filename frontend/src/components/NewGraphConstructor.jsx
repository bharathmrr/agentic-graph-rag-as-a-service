import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Network, Play, CheckCircle, Zap, Database, Eye } from 'lucide-react'

const NewGraphConstructor = ({ onBack }) => {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [graphData, setGraphData] = useState(null)
  const [progress, setProgress] = useState(0)
  const [neo4jStatus, setNeo4jStatus] = useState('disconnected')

  useEffect(() => {
    const files = JSON.parse(localStorage.getItem('uploadedFiles') || '[]')
    setUploadedFiles(files)
    
    // Check Neo4j status
    checkNeo4jConnection()
  }, [])

  const checkNeo4jConnection = async () => {
    try {
      // Simulate Neo4j connection check
      await new Promise(resolve => setTimeout(resolve, 1000))
      setNeo4jStatus('connected')
    } catch (error) {
      setNeo4jStatus('error')
    }
  }

  const buildGraph = async () => {
    setIsProcessing(true)
    setProgress(0)

    const steps = [
      'Connecting to Neo4j...',
      'Processing ontology data...',
      'Creating nodes and relationships...',
      'Building graph structure...',
      'Finalizing visualization...'
    ]

    for (let i = 0; i < steps.length; i++) {
      for (let j = 0; j <= 20; j++) {
        await new Promise(resolve => setTimeout(resolve, 50))
        setProgress((i * 20) + j)
      }
    }

    // Generate sample graph data
    const sampleGraph = {
      nodes: [
        { id: 1, name: 'AI Technology', type: 'concept', x: 100, y: 100 },
        { id: 2, name: 'Machine Learning', type: 'technology', x: 200, y: 150 },
        { id: 3, name: 'Neural Networks', type: 'algorithm', x: 300, y: 100 },
        { id: 4, name: 'Deep Learning', type: 'technology', x: 250, y: 200 }
      ],
      edges: [
        { source: 1, target: 2, relationship: 'includes' },
        { source: 2, target: 3, relationship: 'uses' },
        { source: 3, target: 4, relationship: 'enables' }
      ],
      stats: {
        totalNodes: 4,
        totalEdges: 3,
        neo4jStatus: 'success'
      }
    }

    setGraphData(sampleGraph)
    setIsProcessing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-slate-900 to-black relative overflow-hidden font-['Inter']">
      {/* Animated Grid Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Floating Network Nodes */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-emerald-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.8)'
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.3
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.h1 
            className="text-6xl font-bold text-white mb-4 font-['Orbitron'] tracking-wider"
            style={{ textShadow: '0 0 30px rgba(16, 185, 129, 0.8)' }}
            animate={{ 
              textShadow: [
                '0 0 30px rgba(16, 185, 129, 0.8)',
                '0 0 40px rgba(16, 185, 129, 1)',
                '0 0 30px rgba(16, 185, 129, 0.8)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Graph Constructor
          </motion.h1>
          <p className="text-2xl text-emerald-300 font-medium">
            Neo4j Knowledge Graph Builder
          </p>
          
          {/* Back Button */}
          <motion.button
            onClick={onBack}
            className="absolute top-8 left-8 flex items-center space-x-3 px-6 py-3 bg-emerald-500/20 backdrop-blur-md hover:bg-emerald-500/40 rounded-xl border border-emerald-400/30 transition-all duration-300 group"
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 0 25px rgba(16, 185, 129, 0.6)'
            }}
          >
            <ArrowLeft size={20} className="text-emerald-300 group-hover:text-white transition-colors" />
            <span className="text-emerald-300 group-hover:text-white font-medium transition-colors">Back</span>
          </motion.button>
        </motion.div>

        {/* Status Bar */}
        <motion.div 
          className="max-w-4xl mx-auto mb-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="bg-emerald-500/10 backdrop-blur-xl rounded-2xl p-6 border border-emerald-400/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Database size={24} className="text-emerald-400" />
                <div>
                  <h3 className="text-xl font-bold text-white">Neo4j Status</h3>
                  <p className="text-emerald-300">
                    {neo4jStatus === 'connected' ? '✅ Connected' : 
                     neo4jStatus === 'error' ? '❌ Connection Error' : '⏳ Connecting...'}
                  </p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">{uploadedFiles.length}</div>
                <div className="text-emerald-300 text-sm">Documents Ready</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Control Panel */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-emerald-500/10 backdrop-blur-xl rounded-2xl p-6 border border-emerald-400/30">
                <h3 className="text-3xl font-bold text-white mb-4 font-['Orbitron']">Graph Builder</h3>
                
                {uploadedFiles.length > 0 ? (
                  <div className="space-y-4">
                    <div className="text-emerald-300 mb-4">
                      Ready to build knowledge graph from {uploadedFiles.length} documents
                    </div>
                    
                    {/* Build Graph Button */}
                    {!isProcessing && !graphData && (
                      <motion.button
                        onClick={buildGraph}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-3 group"
                        whileHover={{ 
                          scale: 1.02,
                          boxShadow: '0 0 30px rgba(16, 185, 129, 0.8)'
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Play size={20} className="group-hover:animate-pulse" />
                        <span>Build Knowledge Graph</span>
                        <Network size={20} className="group-hover:animate-bounce" />
                      </motion.button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Network size={64} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-white text-xl">No documents available</p>
                    <p className="text-emerald-300">Upload files to build graph</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Graph Visualization */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-emerald-500/10 backdrop-blur-xl rounded-2xl p-6 border border-emerald-400/30 min-h-96">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <Eye size={24} className="mr-2 text-emerald-400" />
                  Graph Visualization
                </h3>
                
                <AnimatePresence mode="wait">
                  {isProcessing ? (
                    <motion.div
                      key="processing"
                      className="flex flex-col items-center justify-center h-full py-12"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="relative w-32 h-32 mb-8">
                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="transparent" />
                          <circle
                            cx="50" cy="50" r="40"
                            stroke="url(#emeraldGradient)" strokeWidth="8" fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                            className="transition-all duration-300"
                          />
                          <defs>
                            <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="100%" stopColor="#14b8a6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">{progress}%</span>
                        </div>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">Building Graph...</h4>
                      <p className="text-emerald-300">Creating nodes and relationships</p>
                    </motion.div>
                  ) : graphData ? (
                    <motion.div
                      key="graph"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-emerald-500/20 p-4 rounded-xl text-center">
                          <div className="text-2xl font-bold text-white">{graphData.stats.totalNodes}</div>
                          <div className="text-emerald-300 text-sm">Nodes</div>
                        </div>
                        <div className="bg-teal-500/20 p-4 rounded-xl text-center">
                          <div className="text-2xl font-bold text-white">{graphData.stats.totalEdges}</div>
                          <div className="text-teal-300 text-sm">Edges</div>
                        </div>
                        <div className="bg-green-500/20 p-4 rounded-xl text-center">
                          <div className="text-lg font-bold text-white">✅</div>
                          <div className="text-green-300 text-sm">Neo4j</div>
                        </div>
                      </div>
                      
                      {/* Simple Graph Visualization */}
                      <div className="bg-black/20 rounded-xl p-6 h-64 flex items-center justify-center">
                        <div className="text-center">
                          <Network size={48} className="text-emerald-400 mx-auto mb-4" />
                          <p className="text-white font-semibold">Interactive Graph Created!</p>
                          <p className="text-emerald-300 text-sm">Click to explore relationships</p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      className="flex flex-col items-center justify-center h-full py-12"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Network size={64} className="text-gray-400 mb-4" />
                      <h4 className="text-xl font-bold text-white mb-2">Ready to Build</h4>
                      <p className="text-emerald-300 text-center">
                        Click "Build Knowledge Graph" to create Neo4j visualization
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-emerald-400 font-medium">Powered by LyzrAI</p>
        </motion.div>
      </div>
    </div>
  )
}

export default NewGraphConstructor
