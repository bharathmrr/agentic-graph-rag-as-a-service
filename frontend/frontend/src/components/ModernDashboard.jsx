import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, Brain, Search, Database, Network, 
  MessageSquare, Zap, ArrowRight, Sparkles
} from 'lucide-react'

const ModernDashboard = ({ onModuleSelect }) => {
  const [hoveredCard, setHoveredCard] = useState(null)

  const modules = [
    {
      id: 'upload',
      title: 'Upload Documents',
      description: 'Transform documents into intelligent knowledge',
      icon: Upload,
      color: 'from-blue-500 to-cyan-500',
      bgGlow: 'rgba(59, 130, 246, 0.3)',
      particles: 12
    },
    {
      id: 'ontology',
      title: 'Ontology Generator',
      description: 'Extract entities and relationships with AI',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      bgGlow: 'rgba(168, 85, 247, 0.3)',
      particles: 15
    },
    {
      id: 'entity-resolution',
      title: 'Entity Resolution',
      description: 'Detect and merge duplicate entities',
      icon: Search,
      color: 'from-orange-500 to-red-500',
      bgGlow: 'rgba(249, 115, 22, 0.3)',
      particles: 10
    },
    {
      id: 'embeddings',
      title: 'Embeddings',
      description: 'Generate semantic vector embeddings',
      icon: Database,
      color: 'from-green-500 to-emerald-500',
      bgGlow: 'rgba(34, 197, 94, 0.3)',
      particles: 14
    },
    {
      id: 'knowledge-graph',
      title: 'Knowledge Graph',
      description: 'Visualize your intelligent graph',
      icon: Network,
      color: 'from-indigo-500 to-blue-500',
      bgGlow: 'rgba(99, 102, 241, 0.3)',
      particles: 13
    },
    {
      id: 'chatbot',
      title: 'AI ChatBot',
      description: 'Chat with your knowledge base',
      icon: MessageSquare,
      color: 'from-teal-500 to-cyan-500',
      bgGlow: 'rgba(20, 184, 166, 0.3)',
      particles: 11
    }
  ]

  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            animate={{ 
              textShadow: [
                '0 0 20px rgba(99, 102, 241, 0.5)',
                '0 0 40px rgba(168, 85, 247, 0.5)',
                '0 0 20px rgba(99, 102, 241, 0.5)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <h1 className="text-8xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              <Sparkles className="inline-block w-16 h-16 mb-4 text-yellow-400" />
              {' '}Agentic Graph RAG
            </h1>
          </motion.div>
          <p className="text-3xl font-bold text-white" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
            Build Intelligent Knowledge Graphs with AI
          </p>
          <p className="text-xl text-gray-300 mt-4" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
            Choose a module to begin your journey
          </p>
        </motion.div>

        {/* Module Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {modules.map((module, index) => (
            <ModuleCard
              key={module.id}
              module={module}
              index={index}
              isHovered={hoveredCard === module.id}
              onHover={() => setHoveredCard(module.id)}
              onLeave={() => setHoveredCard(null)}
              onClick={() => onModuleSelect(module.id)}
            />
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-gray-400 text-lg">
            Powered by <span className="text-purple-400 font-bold">Lyzr AI</span>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

const ModuleCard = ({ module, index, isHovered, onHover, onLeave, onClick }) => {
  const Icon = module.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.05, y: -10 }}
      onHoverStart={onHover}
      onHoverEnd={onLeave}
      onClick={onClick}
      className="relative group cursor-pointer"
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: module.bgGlow }}
      />

      {/* Card */}
      <div className="relative bg-slate-900/90 backdrop-blur-xl border-2 border-slate-700 rounded-3xl p-8 overflow-hidden">
        {/* Floating particles */}
        <AnimatePresence>
          {isHovered && (
            <>
              {[...Array(module.particles)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 0, 
                    x: Math.random() * 100 - 50,
                    y: Math.random() * 100 - 50,
                    scale: 0
                  }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    y: -100,
                    scale: [0, 1, 0]
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    repeat: Infinity
                  }}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: `linear-gradient(${module.color})`,
                    left: `${Math.random() * 100}%`,
                    bottom: 0
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Icon */}
        <motion.div
          animate={isHovered ? { 
            rotate: [0, -10, 10, -10, 0],
            scale: [1, 1.1, 1]
          } : {}}
          transition={{ duration: 0.5 }}
          className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${module.color} mb-6`}
        >
          <Icon className="w-10 h-10 text-white" />
        </motion.div>

        {/* Content */}
        <h3 className="text-3xl font-bold text-white mb-3" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
          {module.title}
        </h3>
        <p className="text-gray-300 text-lg mb-6" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
          {module.description}
        </p>

        {/* Action */}
        <motion.div
          className="flex items-center text-white font-semibold text-lg"
          animate={isHovered ? { x: 10 } : { x: 0 }}
        >
          <span className={`bg-gradient-to-r ${module.color} bg-clip-text text-transparent`}>
            Get Started
          </span>
          <ArrowRight className={`ml-2 w-6 h-6 bg-gradient-to-r ${module.color}`} style={{ color: 'inherit' }} />
        </motion.div>

        {/* Progress indicator */}
        <motion.div
          className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${module.color}`}
          initial={{ width: 0 }}
          animate={isHovered ? { width: '100%' } : { width: 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  )
}

export default ModernDashboard
