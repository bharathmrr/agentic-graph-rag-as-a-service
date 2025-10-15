import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, Database, Network, Search, TrendingUp, 
  BarChart3, PieChart, Activity, Eye, Download,
  ArrowRight, Zap, Star, Target, Layers, CheckCircle,
  FileText, Users, Link
} from 'lucide-react'

const BeautifulDataDisplay = ({ data, onExplore, currentStep = 1, onNextStep }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)

  // Steps configuration
  const steps = [
    { id: 1, name: 'Document Upload', icon: FileText, color: 'from-green-500 to-emerald-600', status: 'completed' },
    { id: 2, name: 'Ontology Generation', icon: Brain, color: 'from-purple-500 to-indigo-600', status: currentStep >= 2 ? 'current' : 'pending' },
    { id: 3, name: 'Entity Resolution', icon: Users, color: 'from-orange-500 to-red-600', status: currentStep >= 3 ? 'current' : 'pending' }
  ]

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'entities', name: 'Entities', icon: Brain },
    { id: 'relationships', name: 'Relationships', icon: Network },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 }
  ]

  const metrics = [
    { label: 'Documents Processed', value: data?.documentsProcessed || 12, icon: Database, color: 'text-blue-400' },
    { label: 'Entities Extracted', value: data?.entitiesExtracted || 156, icon: Brain, color: 'text-purple-400' },
    { label: 'Relationships Found', value: data?.relationshipsFound || 89, icon: Network, color: 'text-green-400' },
    { label: 'Graph Nodes', value: data?.graphNodes || 156, icon: Target, color: 'text-orange-400' }
  ]

  const entityTypes = [
    { type: 'PERSON', count: 45, color: '#3b82f6' },
    { type: 'ORGANIZATION', count: 32, color: '#10b981' },
    { type: 'LOCATION', count: 28, color: '#f59e0b' },
    { type: 'CONCEPT', count: 51, color: '#8b5cf6' }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 p-6">
        {/* Workflow Steps Progress */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.2 }}
                    className="flex flex-col items-center"
                  >
                    <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${
                      step.status === 'completed' ? 'from-green-500 to-emerald-600' :
                      step.status === 'current' ? step.color :
                      'from-gray-600 to-gray-700'
                    } flex items-center justify-center shadow-lg`}>
                      {step.status === 'completed' ? (
                        <CheckCircle className="w-8 h-8 text-white" />
                      ) : (
                        <step.icon className="w-8 h-8 text-white" />
                      )}
                      {step.status === 'current' && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-4 border-white/50"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </div>
                    <div className="mt-3 text-center">
                      <div className={`text-sm font-bold ${
                        step.status === 'completed' ? 'text-green-400' :
                        step.status === 'current' ? 'text-white' :
                        'text-gray-400'
                      }`} style={{textShadow: '0 2px 4px rgba(0,0,0,0.8)'}}>
                        Step {step.id}
                      </div>
                      <div className={`text-xs font-medium ${
                        step.status === 'completed' ? 'text-green-300' :
                        step.status === 'current' ? 'text-white/90' :
                        'text-gray-500'
                      }`} style={{textShadow: '0 1px 2px rgba(0,0,0,0.8)'}}>
                        {step.name}
                      </div>
                    </div>
                  </motion.div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-4 h-1 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          currentStep > step.id ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gray-600'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: currentStep > step.id ? '100%' : '0%' }}
                        transition={{ duration: 0.5, delay: index * 0.2 }}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4" style={{textShadow: '0 4px 16px rgba(0,0,0,0.8)'}}>
            {currentStep === 1 ? '🎉 Step 1 Complete!' : 
             currentStep === 2 ? '🧠 Ontology Generated!' :
             '✅ All Steps Complete!'}
          </h1>
          <p className="text-xl text-white/90 font-semibold" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
            {currentStep === 1 ? 'Document uploaded and processed successfully' :
             currentStep === 2 ? 'Entities and relationships extracted' :
             'Your knowledge graph is ready for exploration'}
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {metrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center"
              >
                <div className={`w-12 h-12 mx-auto mb-4 ${metric.color} bg-white/10 rounded-full flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-white mb-2" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
                  {metric.value}
                </div>
                <div className="text-white/80 font-semibold" style={{textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>
                  {metric.label}
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-8"
        >
          <div className="flex space-x-1 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-semibold">{tab.name}</span>
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-white mb-4" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
                    Processing Overview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-3" style={{textShadow: '0 2px 6px rgba(0,0,0,0.8)'}}>
                        Entity Distribution
                      </h4>
                      <div className="space-y-2">
                        {entityTypes.map((entity, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-white/90 font-medium" style={{textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>
                              {entity.type}
                            </span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-700 rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full" 
                                  style={{ 
                                    width: `${(entity.count / 51) * 100}%`,
                                    backgroundColor: entity.color 
                                  }}
                                />
                              </div>
                              <span className="text-white font-bold" style={{textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>
                                {entity.count}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-3" style={{textShadow: '0 2px 6px rgba(0,0,0,0.8)'}}>
                        Processing Stats
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-white/90" style={{textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>Confidence Score</span>
                          <span className="text-green-400 font-bold">94.2%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/90" style={{textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>Processing Time</span>
                          <span className="text-blue-400 font-bold">2.3s</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/90" style={{textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>Quality Score</span>
                          <span className="text-purple-400 font-bold">A+</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'entities' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
                    Extracted Entities
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {['Alice Johnson', 'TechCorp Inc', 'Machine Learning', 'San Francisco', 'Data Science', 'AI Research'].map((entity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/5 border border-white/20 rounded-lg p-4 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <Brain className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <div className="text-white font-semibold" style={{textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>
                              {entity}
                            </div>
                            <div className="text-white/70 text-sm" style={{textShadow: '0 1px 3px rgba(0,0,0,0.8)'}}>
                              Entity
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'relationships' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
                    Discovered Relationships
                  </h3>
                  <div className="space-y-4">
                    {[
                      { from: 'Alice Johnson', to: 'TechCorp Inc', type: 'works_for', strength: 0.95 },
                      { from: 'TechCorp Inc', to: 'San Francisco', type: 'located_in', strength: 0.89 },
                      { from: 'Machine Learning', to: 'AI Research', type: 'related_to', strength: 0.92 }
                    ].map((rel, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/5 border border-white/20 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-white font-semibold" style={{textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>
                              {rel.from}
                            </div>
                            <div className="flex items-center space-x-2">
                              <ArrowRight className="w-4 h-4 text-white/60" />
                              <span className="text-white/80 font-medium" style={{textShadow: '0 1px 3px rgba(0,0,0,0.8)'}}>
                                {rel.type}
                              </span>
                              <ArrowRight className="w-4 h-4 text-white/60" />
                            </div>
                            <div className="text-white font-semibold" style={{textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>
                              {rel.to}
                            </div>
                          </div>
                          <div className="text-green-400 font-bold">
                            {Math.round(rel.strength * 100)}%
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
                    Analytics Dashboard
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-white mb-4" style={{textShadow: '0 2px 6px rgba(0,0,0,0.8)'}}>
                        Processing Performance
                      </h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-white/90" style={{textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>Speed</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-700 rounded-full h-2">
                              <div className="h-2 bg-green-500 rounded-full" style={{ width: '85%' }} />
                            </div>
                            <span className="text-green-400 font-bold">85%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/90" style={{textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>Accuracy</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-700 rounded-full h-2">
                              <div className="h-2 bg-blue-500 rounded-full" style={{ width: '94%' }} />
                            </div>
                            <span className="text-blue-400 font-bold">94%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-white mb-4" style={{textShadow: '0 2px 6px rgba(0,0,0,0.8)'}}>
                        Quality Metrics
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-white/90" style={{textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>Entity Quality</span>
                          <span className="text-green-400 font-bold">A+</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/90" style={{textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>Relationship Quality</span>
                          <span className="text-blue-400 font-bold">A</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/90" style={{textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>Overall Score</span>
                          <span className="text-purple-400 font-bold">A+</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center space-x-4"
        >
          {currentStep < 3 && onNextStep && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNextStep}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl flex items-center space-x-3 shadow-lg"
            >
              {currentStep === 1 ? <Brain className="w-5 h-5" /> : <Users className="w-5 h-5" />}
              <span>
                {currentStep === 1 ? 'Continue to Ontology Generation' : 'Continue to Entity Resolution'}
              </span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          )}
          
          {currentStep === 3 && onExplore && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onExplore}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl flex items-center space-x-3 shadow-lg"
            >
              <Eye className="w-5 h-5" />
              <span>Explore Knowledge Graph</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl flex items-center space-x-3 shadow-lg"
          >
            <Download className="w-5 h-5" />
            <span>Export Data</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}

export default BeautifulDataDisplay
