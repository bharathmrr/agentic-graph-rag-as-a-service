import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Activity, CheckCircle, Clock, AlertCircle } from 'lucide-react'

const ModuleCard = ({ module, index, onClick, processingStatus }) => {
  const Icon = module.icon
  
  // Convert hex color to RGB for CSS custom properties
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  const rgb = hexToRgb(module.color)
  const isProcessing = processingStatus.isProcessing && 
    processingStatus.currentStep?.toLowerCase().includes(module.name.toLowerCase().split(' ')[0])

  const getStatusIcon = () => {
    const filesUploaded = localStorage.getItem('documentsAvailable') === 'true'
    const moduleData = localStorage.getItem(`moduleData_${module.id}`)
    
    if (isProcessing) return <Activity className="w-3 h-3 animate-spin" />
    if (module.status === 'active') return <CheckCircle className="w-3 h-3 text-green-500" />
    
    // Green dot if data sent to module, red if not
    if (filesUploaded && module.coreNumber) {
      if (moduleData) {
        return <div className="w-3 h-3 bg-green-500 rounded-full"></div>
      } else {
        return <div className="w-3 h-3 bg-red-500 rounded-full"></div>
      }
    }
    
    if (module.status === 'ready') return <Clock className="w-3 h-3" />
    return <AlertCircle className="w-3 h-3" />
  }

  const getStatusText = () => {
    const filesUploaded = localStorage.getItem('documentsAvailable') === 'true'
    if (isProcessing) return 'Processing'
    if (filesUploaded && module.coreNumber) return 'Ready'
    return module.status
  }

  const getStatusColor = () => {
    if (isProcessing) return '#3b82f6'
    if (module.status === 'active') return '#10b981'
    if (module.status === 'ready') return '#f59e0b'
    return '#ef4444'
  }

  return (
    <motion.div
      className="module-card glass-effect"
      style={{
        '--card-color': module.color,
        '--card-color-rgb': rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : '59, 130, 246'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="module-card-header">
        <motion.div 
          className="module-card-icon"
          whileHover={{ 
            scale: 1.1,
            rotate: 5,
            transition: { duration: 0.2 }
          }}
        >
          <Icon 
            size={24} 
            color={module.color}
            className={isProcessing ? 'animate-pulse' : ''}
          />
        </motion.div>
        <div>
          <h3 className="module-card-title">{module.name}</h3>
        </div>
      </div>
      
      <p className="module-card-description">
        {module.description}
      </p>
      
      {/* Enhanced Features Badge */}
      {(module.id === 'upload' || module.id === 'documentation') && (
        <div className="mb-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg animate-pulse">
            ✨ {module.id === 'upload' ? 'Enhanced UI' : 'New Module'}
          </span>
          {module.id === 'upload' && (
            <div className="mt-2 text-xs text-gray-400">
              • Premium Design • AI Metrics • Better Readability
            </div>
          )}
          {module.id === 'documentation' && (
            <div className="mt-2 text-xs text-gray-400">
              • System Overview • Tech Stack • API Reference
            </div>
          )}
        </div>
      )}
      
      <div className="module-card-footer">
        <div className="module-card-status">
          <motion.div
            animate={isProcessing ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 1, repeat: isProcessing ? Infinity : 0 }}
          >
            {getStatusIcon()}
          </motion.div>
          <span style={{ color: getStatusColor() }}>
            {getStatusText()}
          </span>
        </div>
        
        <motion.button
          className="module-card-button"
          whileHover={{ 
            x: 4,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.95 }}
          disabled={isProcessing}
        >
          <span>{isProcessing ? 'Processing...' : 'Explore'}</span>
          <ArrowRight size={16} />
        </motion.button>
      </div>
      
      {/* Processing overlay */}
      {isProcessing && (
        <motion.div
          className="processing-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, rgba(${rgb?.r || 59}, ${rgb?.g || 130}, ${rgb?.b || 246}, 0.1), transparent)`,
            borderRadius: '16px',
            pointerEvents: 'none'
          }}
        />
      )}
      
      {/* Hover glow effect */}
      <motion.div
        className="card-glow"
        style={{
          position: 'absolute',
          top: -2,
          left: -2,
          right: -2,
          bottom: -2,
          background: `linear-gradient(135deg, ${module.color}20, transparent)`,
          borderRadius: '18px',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -1
        }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}

export default ModuleCard
