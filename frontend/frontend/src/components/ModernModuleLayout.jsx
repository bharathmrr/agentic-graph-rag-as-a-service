import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Maximize2, Settings, Info, Zap } from 'lucide-react'

const ModernModuleLayout = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  color, 
  onBack, 
  children, 
  actions = [],
  stats = []
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-black">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.08),transparent_70%)]" />
      
      <div className="relative">
        {/* Modern Header */}
        <motion.div
          className="bg-slate-900/80 backdrop-blur-xl border-b border-gray-700/50 sticky top-0 z-50"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              {/* Left Section */}
              <div className="flex items-center space-x-6">
                <motion.button
                  onClick={onBack}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60 rounded-xl border border-gray-600/40 text-gray-300 hover:text-white transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowLeft size={18} />
                  <span className="font-medium">Back to Dashboard</span>
                </motion.button>
                
                <div className="flex items-center space-x-4">
                  <motion.div
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-gray-600/40"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                  >
                    <Icon size={24} color={color} />
                  </motion.div>
                  
                  <div>
                    <h1 className="text-2xl font-bold text-white">{title}</h1>
                    <p className="text-gray-400 text-sm">{subtitle}</p>
                  </div>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center space-x-4">
                {/* Stats */}
                {stats.length > 0 && (
                  <div className="flex items-center space-x-4">
                    {stats.map((stat, index) => (
                      <motion.div
                        key={index}
                        className="text-center"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                      >
                        <div className="text-lg font-bold text-white">{stat.value}</div>
                        <div className="text-xs text-gray-400">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  {actions.map((action, index) => (
                    <motion.button
                      key={index}
                      onClick={action.onClick}
                      className="p-2 bg-slate-800/60 hover:bg-slate-700/60 rounded-lg border border-gray-600/40 text-gray-300 hover:text-white transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title={action.label}
                    >
                      <action.icon size={18} />
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <motion.div
          className="max-w-7xl mx-auto px-8 py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Content Container */}
          <div className="bg-slate-900/40 backdrop-blur-sm rounded-3xl border border-gray-700/30 overflow-hidden shadow-2xl">
            <div className="p-8">
              {children}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ModernModuleLayout
