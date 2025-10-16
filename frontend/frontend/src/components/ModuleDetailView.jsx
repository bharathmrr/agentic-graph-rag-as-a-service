import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, Pause, RotateCcw, Settings, ArrowRight, 
  Clock, CheckCircle, AlertCircle, Zap, Brain, 
  Database, Network, Search, Target, Star
} from 'lucide-react'

const ModuleDetailView = ({ module, onBack, onExecute }) => {
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionProgress, setExecutionProgress] = useState(0)

  const handleExecute = async () => {
    setIsExecuting(true)
    setExecutionProgress(0)
    
    // Simulate execution progress
    const interval = setInterval(() => {
      setExecutionProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsExecuting(false)
          return 100
        }
        return prev + 10
      })
    }, 200)
    
    if (onExecute) {
      onExecute(module.id)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready': return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'running': return <Clock className="w-5 h-5 text-blue-400" />
      case 'error': return <AlertCircle className="w-5 h-5 text-red-400" />
      default: return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready': return 'text-green-400'
      case 'running': return 'text-blue-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen core-modules-background relative overflow-hidden"
    >
      {/* Same background as dashboard */}
      <div className="absolute inset-0 bg-gray-900" />

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105 border border-white/30"
            >
              <ArrowRight className="w-5 h-5 text-white rotate-180" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2" style={{textShadow: '0 4px 16px rgba(0,0,0,0.8)'}}>
                {module?.name || 'Module Details'}
              </h1>
              <div className="flex items-center space-x-3">
                {getStatusIcon(module?.status)}
                <span className={`font-bold ${getStatusColor(module?.status)}`} style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
                  {module?.status?.toUpperCase() || 'UNKNOWN'}
                </span>
                <span className="text-white font-bold" style={{textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>
                  • {module?.estimated_time || 'Unknown time'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-white font-bold" style={{textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>
                Module ID
              </div>
              <div className="text-lg font-bold text-white" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
                {module?.id || 'unknown'}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Module Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-4" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
                Description
              </h2>
              <p className="text-white/90 text-lg leading-relaxed" style={{textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>
                {module?.description || 'No description available for this module.'}
              </p>
            </motion.div>

            {/* Capabilities */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-4" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
                Capabilities
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {module?.capabilities?.map((capability, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-medium" style={{textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>
                      {capability}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Requirements */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-4" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
                Requirements
              </h2>
              <div className="space-y-3">
                {module?.requirements?.map((requirement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium" style={{textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>
                      {requirement}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Actions & Status */}
          <div className="space-y-6">
            {/* Execution Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
                Execution Status
              </h2>
              
              {isExecuting ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-semibold" style={{textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>
                      Executing...
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                      style={{ width: `${executionProgress}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${executionProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="text-center text-white/70 font-medium" style={{textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>
                    {executionProgress}% Complete
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(module?.status)}
                    <span className="text-white font-semibold" style={{textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>
                      Ready to Execute
                    </span>
                  </div>
                  <div className="text-white/70 text-sm" style={{textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>
                    Click Execute to start processing
                  </div>
                </div>
              )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExecute}
                disabled={isExecuting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center space-x-3 shadow-lg transition-all duration-300"
              >
                {isExecuting ? (
                  <>
                    <Clock className="w-5 h-5" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Execute Module</span>
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center space-x-3 shadow-lg transition-all duration-300"
              >
                <Settings className="w-5 h-5" />
                <span>Configure</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center space-x-3 shadow-lg transition-all duration-300"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Reset</span>
              </motion.button>
            </motion.div>

            {/* Output Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
                Expected Output
              </h2>
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <Target className="w-5 h-5 text-purple-400" />
                <span className="text-white font-medium" style={{textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>
                  {module?.output || 'Processing Results'}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ModuleDetailView
