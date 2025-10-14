import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, Database, Network, Search, Filter, Zap, 
  TrendingUp, Activity, BarChart3, PieChart, 
  ArrowRight, Play, Pause, RotateCcw, Settings,
  Eye, Download, Share2, Star, Clock, CheckCircle
} from 'lucide-react'
import LYzrLogo from './LYzrLogo'
import AnimatedStarsBackground from './AnimatedStarsBackground'
import UploadGeneratorAlert from './UploadGeneratorAlert'
import BeautifulDataDisplay from './BeautifulDataDisplay'
import ModuleDetailView from './ModuleDetailView'

const CoreModulesDashboard = ({ onBack, systemMetrics }) => {
  const [modules, setModules] = useState([])
  const [selectedModule, setSelectedModule] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [showUploadAlert, setShowUploadAlert] = useState(false)
  const [showDataDisplay, setShowDataDisplay] = useState(false)
  const [processedData, setProcessedData] = useState(null)
  const [hasUploadedFiles, setHasUploadedFiles] = useState(false)

  useEffect(() => {
    fetchDashboardData()
    checkForUploadedFiles()
  }, [])

  const checkForUploadedFiles = async () => {
    try {
      const response = await fetch('/api/documents')
      const data = await response.json()
      setHasUploadedFiles(data.success && data.data && data.data.length > 0)
    } catch (error) {
      console.error('Failed to check for uploaded files:', error)
      setHasUploadedFiles(false)
      // Only show error if it's a real error, not just no files
      if (error.message !== 'No documents found') {
        console.error('Error checking uploaded files:', error)
      }
    }
  }

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/core-modules/dashboard')
      const data = await response.json()
      
      if (data.success) {
        setDashboardData(data.data)
        setModules(data.data.all_modules)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchModuleDetails = async (moduleId) => {
    try {
      const response = await fetch(`/api/core-modules/${moduleId}`)
      const data = await response.json()
      
      if (data.success) {
        setSelectedModule(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch module details:', error)
    }
  }

  const handleUploadClick = () => {
    setShowUploadAlert(false)
    // Navigate to upload module
    window.location.hash = '#upload'
  }

  const handleExploreClick = () => {
    setShowDataDisplay(true)
    // Simulate processed data
    setProcessedData({
      documentsProcessed: 12,
      entitiesExtracted: 156,
      relationshipsFound: 89,
      graphNodes: 156
    })
  }

  const executeModule = async (moduleId, parameters = {}) => {
    try {
      const response = await fetch(`/api/core-modules/${moduleId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parameters)
      })
      const data = await response.json()
      
      if (data.success) {
        // Refresh module details
        await fetchModuleDetails(moduleId)
      }
    } catch (error) {
      console.error('Failed to execute module:', error)
    }
  }

  const getModuleIcon = (moduleId) => {
    const iconMap = {
      'ontology_generator': Brain,
      'entity_resolution': Search,
      'embedding_generator': Database,
      'graph_constructor': Network,
      'vector_search': Search,
      'graph_traversal': Network,
      'logical_filter': Filter,
      'reasoning_stream': Zap
    }
    return iconMap[moduleId] || Activity
  }

  const getStatusColor = (status) => {
    const colors = {
      'active': 'text-green-400 bg-green-500/20',
      'ready': 'text-blue-400 bg-blue-500/20',
      'processing': 'text-yellow-400 bg-yellow-500/20',
      'error': 'text-red-400 bg-red-500/20'
    }
    return colors[status] || 'text-gray-400 bg-gray-500/20'
  }

  const ModuleCard = ({ module, index }) => {
    const Icon = getModuleIcon(module.id)
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          if (!hasUploadedFiles) {
            setShowUploadAlert(true)
            return
          }
          setSelectedModule(module)
          fetchModuleDetails(module.id)
        }}
        className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl p-6 cursor-pointer hover:border-white/40 transition-all duration-300 group shadow-lg hover:shadow-xl"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${module.color}20` }}
            >
              <Icon className="w-6 h-6" style={{ color: module.color }} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors" style={{textShadow: '0 2px 6px rgba(0,0,0,0.8)'}}>
                {module.name}
              </h3>
              <p className="text-sm text-white/80 font-semibold" style={{textShadow: '0 2px 4px rgba(0,0,0,0.8)'}}>
                {module.description}
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(module.status)}`}>
            {module.status}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70 font-semibold">Type:</span>
            <span className="text-white font-bold capitalize" style={{textShadow: '0 2px 4px rgba(0,0,0,0.8)'}}>
              {module.type}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70 font-semibold">Capabilities:</span>
            <span className="text-white font-bold" style={{textShadow: '0 2px 4px rgba(0,0,0,0.8)'}}>
              {module.capabilities?.length || 0}
            </span>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-gray-500">Click to explore</span>
          <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
        </div>
      </motion.div>
    )
  }

  const ModuleDetails = ({ module, details }) => {
    if (!details) return null

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-transparent backdrop-blur-sm border border-gray-700/30 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${module.color}20` }}
            >
              <span className="text-2xl">{module.icon}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{module.name}</h2>
              <p className="text-gray-400">{module.description}</p>
            </div>
          </div>
          <button
            onClick={() => executeModule(module.id)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>Execute</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Performance Metrics */}
          <div className="bg-transparent backdrop-blur-sm border border-gray-700/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Performance Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Avg Processing Time:</span>
                <span className="text-white">2.3s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Success Rate:</span>
                <span className="text-green-400">98.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Runs:</span>
                <span className="text-white">156</span>
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <div className="bg-transparent backdrop-blur-sm border border-gray-700/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Capabilities
            </h3>
            <div className="space-y-2">
              {module.capabilities?.map((capability, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300">{capability}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Module-specific data */}
        {details.module_details && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Module Analytics</h3>
            <div className="bg-transparent backdrop-blur-sm border border-gray-700/20 rounded-lg p-4">
              <pre className="text-sm text-gray-300 overflow-auto">
                {JSON.stringify(details.module_details, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </motion.div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Dark overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-black/40 backdrop-blur-sm border-b border-white/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105 border border-white/30"
              >
                <span className="text-white text-xl font-bold">×</span>
              </button>
              <div className="flex items-center space-x-4">
                <LYzrLogo size="default" className="text-blue-400" />
                <div>
                  <h1 className="text-3xl font-bold text-white" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>Core Modules Dashboard</h1>
                  <p className="text-white/90 font-semibold" style={{textShadow: '0 2px 6px rgba(0,0,0,0.8)'}}>
                    {dashboardData?.statistics?.total_modules || 0} Modules Available
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-2xl font-bold text-white" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
                  {systemMetrics?.documentsProcessed || 0}
                </div>
                <div className="text-sm text-white/90 font-semibold" style={{textShadow: '0 2px 6px rgba(0,0,0,0.8)'}}>Documents Processed</div>
              </div>
              <div className="flex items-center space-x-2 text-blue-400">
                <span className="text-sm font-bold" style={{textShadow: '0 2px 6px rgba(0,0,0,0.8)'}}>Powered by</span>
                <LYzrLogo size="small" className="text-blue-400" />
                <span className="text-sm font-bold" style={{textShadow: '0 2px 6px rgba(0,0,0,0.8)'}}>LYzr AI</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {!selectedModule ? (
            <>
              {/* Welcome Section */}
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-white mb-4" style={{textShadow: '0 3px 12px rgba(0,0,0,0.9)'}}>Your Knowledge Graph is Ready</h2>
                <p className="text-xl text-white font-semibold max-w-3xl mx-auto" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
                  Explore your processed data through powerful ingestion and retrieval modules. 
                  Each module provides specialized functionality for different aspects of knowledge processing.
                </p>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-black/40 backdrop-blur-sm border border-blue-500/50 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Database className="w-8 h-8 text-blue-400" />
                    <div>
                      <h3 className="text-lg font-bold text-white" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>Graphs Available</h3>
                      <p className="text-blue-400 font-bold text-xl" style={{textShadow: '0 2px 6px rgba(0,0,0,0.8)'}}>{dashboardData?.statistics?.total_modules || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/40 backdrop-blur-sm border border-purple-500/50 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Upload className="w-8 h-8 text-purple-400" />
                    <div>
                      <h3 className="text-lg font-bold text-white" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>Ingestion Modules</h3>
                      <p className="text-purple-400 font-bold text-xl" style={{textShadow: '0 2px 6px rgba(0,0,0,0.8)'}}>{dashboardData?.statistics?.ingestion_modules || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/40 backdrop-blur-sm border border-emerald-500/50 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Search className="w-8 h-8 text-emerald-400" />
                    <div>
                      <h3 className="text-lg font-bold text-white" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>Retrieval Modules</h3>
                      <p className="text-emerald-400 font-bold text-xl" style={{textShadow: '0 2px 6px rgba(0,0,0,0.8)'}}>{dashboardData?.statistics?.retrieval_modules || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modules Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module, index) => (
                  <ModuleCard key={module.id} module={module} index={index} />
                ))}
              </div>
            </>
          ) : (
            <ModuleDetailView
              module={selectedModule}
              onBack={() => setSelectedModule(null)}
              onExecute={async (moduleId) => {
                try {
                  const response = await fetch(`/api/core-modules/${moduleId}/execute`, {
                    method: 'POST'
                  })
                  const data = await response.json()
                  if (data.success) {
                    console.log('Module execution started:', data)
                  }
                } catch (error) {
                  console.error('Failed to execute module:', error)
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Upload Alert Modal */}
      <UploadGeneratorAlert
        isOpen={showUploadAlert}
        onClose={() => setShowUploadAlert(false)}
        onUpload={handleUploadClick}
      />

      {/* Beautiful Data Display */}
      {showDataDisplay && (
        <BeautifulDataDisplay
          data={processedData}
          onExplore={() => {
            setShowDataDisplay(false)
            // Navigate to graph visualization
            window.location.hash = '#graph'
          }}
        />
      )}
    </div>
  )
}

export default CoreModulesDashboard
