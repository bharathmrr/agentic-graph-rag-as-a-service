import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  Brain, 
  Network, 
  Search, 
  MessageSquare, 
  Settings, 
  Database,
  Activity,
  FileText,
  Zap,
  Globe,
  Shield,
  Play,
  Pause,
  Download,
  Eye,
  BarChart3,
  Layers,
  Filter,
  Cpu,
  HardDrive,
  Wifi,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react'

const EnhancedDashboard = ({ onNotification }) => {
  const [systemStatus, setSystemStatus] = useState({
    neo4j_available: false,
    chromadb_available: false,
    openai_available: false,
    ollama_available: false
  })
  
  const [metrics, setMetrics] = useState({
    totalDocuments: 0,
    totalEntities: 0,
    totalRelationships: 0,
    totalEmbeddings: 0,
    processingJobs: 0
  })
  
  const [recentActivity, setRecentActivity] = useState([])
  const [activeJobs, setActiveJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch system status
  const fetchSystemStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/v2/system/status')
      const data = await response.json()
      
      if (data.success) {
        setSystemStatus(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch system status:', error)
    }
  }, [])

  // Fetch metrics
  const fetchMetrics = useCallback(async () => {
    try {
      // Fetch from multiple endpoints and aggregate
      const [chromaStats, graphStats] = await Promise.allSettled([
        fetch('/api/v2/embeddings/stats').then(r => r.json()),
        fetch('/api/v2/graph/statistics').then(r => r.json())
      ])

      let newMetrics = { ...metrics }

      if (chromaStats.status === 'fulfilled' && chromaStats.value.success) {
        newMetrics.totalEmbeddings = chromaStats.value.data.total_documents || 0
      }

      if (graphStats.status === 'fulfilled' && graphStats.value.success) {
        newMetrics.totalEntities = graphStats.value.data.networkx_stats?.nodes || 0
        newMetrics.totalRelationships = graphStats.value.data.networkx_stats?.edges || 0
      }

      setMetrics(newMetrics)
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    }
  }, [metrics])

  // Fetch active jobs
  const fetchActiveJobs = useCallback(async () => {
    try {
      const response = await fetch('/api/v2/jobs/active')
      const data = await response.json()
      
      if (data.success) {
        setActiveJobs(data.active_jobs || [])
        setMetrics(prev => ({ ...prev, processingJobs: data.active_jobs?.length || 0 }))
      }
    } catch (error) {
      console.error('Failed to fetch active jobs:', error)
    }
  }, [])

  // Initialize dashboard
  useEffect(() => {
    const initializeDashboard = async () => {
      setIsLoading(true)
      await Promise.all([
        fetchSystemStatus(),
        fetchMetrics(),
        fetchActiveJobs()
      ])
      setIsLoading(false)
    }

    initializeDashboard()

    // Set up periodic refresh
    const interval = setInterval(() => {
      fetchSystemStatus()
      fetchMetrics()
      fetchActiveJobs()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [fetchSystemStatus, fetchMetrics, fetchActiveJobs])

  const StatusIndicator = ({ status, label }) => (
    <div className="flex items-center space-x-3 p-3 bg-black/20 rounded-lg">
      <div className={`w-4 h-4 rounded-full ${status ? 'bg-green-400' : 'bg-red-400'} shadow-lg`} />
      <span className="text-sm text-white font-semibold" style={{textShadow: '0 2px 4px rgba(0,0,0,0.8)'}}>
        {label}
      </span>
    </div>
  )

  const MetricCard = ({ icon: Icon, title, value, change, color = "blue" }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-semibold mb-2" style={{textShadow: '0 2px 4px rgba(0,0,0,0.8)'}}>
            {title}
          </p>
          <p className="text-3xl font-bold text-white mb-2" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
            {value.toLocaleString()}
          </p>
          {change && (
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
              <span className="text-green-400 text-sm font-bold" style={{textShadow: '0 2px 4px rgba(0,0,0,0.8)'}}>
                +{change}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-lg bg-${color}-500/20 border border-${color}-400/30`}>
          <Icon className={`w-8 h-8 text-${color}-400`} />
        </div>
      </div>
    </motion.div>
  )

  const JobProgressBar = ({ job }) => (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white">{job.step || 'Processing'}</span>
        <span className="text-sm text-gray-400">{job.progress}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <motion.div
          className="bg-blue-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${job.progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-2">{job.message}</p>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
            Agentic Graph RAG Dashboard
          </h1>
          <p className="text-white/90 text-lg font-semibold" style={{textShadow: '0 2px 6px rgba(0,0,0,0.8)'}}>
            Intelligent Knowledge Graph Management System
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            fetchSystemStatus()
            fetchMetrics()
            fetchActiveJobs()
            onNotification?.({
              type: 'success',
              title: 'Dashboard Refreshed',
              message: 'All data has been updated'
            })
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2"
        >
          <Activity className="w-4 h-4" />
          <span>Refresh</span>
        </motion.button>
      </div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg"
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
          <Shield className="w-6 h-6 mr-3 text-green-400" />
          System Status
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatusIndicator status={systemStatus.neo4j_available} label="Neo4j Database" />
          <StatusIndicator status={systemStatus.chromadb_available} label="ChromaDB Vector Store" />
          <StatusIndicator status={systemStatus.openai_available} label="OpenAI API" />
          <StatusIndicator status={systemStatus.ollama_available} label="Ollama Local LLM" />
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={FileText}
          title="Documents Processed"
          value={metrics.totalDocuments}
          change={12}
          color="blue"
        />
        <MetricCard
          icon={Brain}
          title="Entities Extracted"
          value={metrics.totalEntities}
          change={8}
          color="purple"
        />
        <MetricCard
          icon={Network}
          title="Relationships Found"
          value={metrics.totalRelationships}
          change={15}
          color="green"
        />
        <MetricCard
          icon={Database}
          title="Embeddings Stored"
          value={metrics.totalEmbeddings}
          change={5}
          color="orange"
        />
      </div>

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-400" />
            Active Processing Jobs ({activeJobs.length})
          </h2>
          <div className="space-y-4">
            {activeJobs.map((job) => (
              <JobProgressBar key={job.job_id} job={job} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-yellow-400" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 bg-blue-600/20 border border-blue-500/30 rounded-lg text-center hover:bg-blue-600/30 transition-colors"
          >
            <Upload className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <span className="text-sm text-white">Upload Document</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 bg-purple-600/20 border border-purple-500/30 rounded-lg text-center hover:bg-purple-600/30 transition-colors"
          >
            <Brain className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <span className="text-sm text-white">Generate Ontology</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 bg-green-600/20 border border-green-500/30 rounded-lg text-center hover:bg-green-600/30 transition-colors"
          >
            <Network className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <span className="text-sm text-white">View Graph</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 bg-orange-600/20 border border-orange-500/30 rounded-lg text-center hover:bg-orange-600/30 transition-colors"
          >
            <MessageSquare className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <span className="text-sm text-white">Ask AI</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-400" />
          Recent Activity
        </h2>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span className="text-sm text-gray-300">{activity.message}</span>
                <span className="text-xs text-gray-500 ml-auto">{activity.timestamp}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No recent activity</p>
            <p className="text-sm text-gray-500">Upload a document to get started</p>
          </div>
        )}
      </motion.div>

      {/* System Resources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Cpu className="w-5 h-5 mr-2 text-red-400" />
          System Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <Cpu className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">CPU Usage</p>
            <p className="text-lg font-semibold text-white">45%</p>
          </div>
          <div className="text-center">
            <HardDrive className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Memory Usage</p>
            <p className="text-lg font-semibold text-white">62%</p>
          </div>
          <div className="text-center">
            <Wifi className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Network</p>
            <p className="text-lg font-semibold text-white">Online</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default EnhancedDashboard
