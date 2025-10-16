import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Upload, 
  AlertTriangle, 
  Database, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  FileText,
  Zap
} from 'lucide-react'
import { useData } from '../context/DataContext'

const ProfessionalModuleWrapper = ({ 
  children, 
  moduleId, 
  moduleName, 
  moduleIcon: ModuleIcon, 
  moduleColor,
  onBack,
  requiresData = true,
  dataType = 'documents' // 'documents', 'ontology', 'entities', etc.
}) => {
  const { 
    documents, 
    ontologyData, 
    entityData, 
    embeddingData, 
    graphData, 
    backendStatus,
    isLoading 
  } = useData()
  
  const [showUploadAlert, setShowUploadAlert] = useState(false)
  const [hasRequiredData, setHasRequiredData] = useState(false)

  // Check if required data exists
  useEffect(() => {
    if (!requiresData) {
      setHasRequiredData(true)
      return
    }

    let dataExists = false
    
    switch (dataType) {
      case 'documents':
        dataExists = documents && documents.length > 0
        break
      case 'ontology':
        dataExists = ontologyData && Object.keys(ontologyData).length > 0
        break
      case 'entities':
        dataExists = entityData && Object.keys(entityData).length > 0
        break
      case 'embeddings':
        dataExists = embeddingData && Object.keys(embeddingData).length > 0
        break
      case 'graph':
        dataExists = graphData && Object.keys(graphData).length > 0
        break
      default:
        dataExists = documents && documents.length > 0
    }
    
    setHasRequiredData(dataExists)
    setShowUploadAlert(!dataExists && requiresData)
  }, [documents, ontologyData, entityData, embeddingData, graphData, requiresData, dataType])

  const getDataTypeLabel = () => {
    switch (dataType) {
      case 'documents': return 'documents'
      case 'ontology': return 'ontology data'
      case 'entities': return 'entity resolution data'
      case 'embeddings': return 'embedding data'
      case 'graph': return 'graph data'
      default: return 'data'
    }
  }

  const getUploadMessage = () => {
    switch (dataType) {
      case 'documents':
        return 'Please upload documents first to generate ontology data'
      case 'ontology':
        return 'Please generate ontology data first using the Ontology Generator module'
      case 'entities':
        return 'Please resolve entities first using the Entity Resolution module'
      case 'embeddings':
        return 'Please generate embeddings first using the Embedding Generator module'
      case 'graph':
        return 'Please build the knowledge graph first using the Graph Constructor module'
      default:
        return 'Please ensure required data is available'
    }
  }

  const getRequiredSteps = () => {
    const steps = []
    switch (dataType) {
      case 'ontology':
        steps.push({ name: 'Upload Documents', icon: Upload, completed: documents?.length > 0 })
        break
      case 'entities':
        steps.push({ name: 'Upload Documents', icon: Upload, completed: documents?.length > 0 })
        steps.push({ name: 'Generate Ontology', icon: Database, completed: ontologyData != null })
        break
      case 'embeddings':
        steps.push({ name: 'Upload Documents', icon: Upload, completed: documents?.length > 0 })
        steps.push({ name: 'Generate Ontology', icon: Database, completed: ontologyData != null })
        steps.push({ name: 'Resolve Entities', icon: Zap, completed: entityData != null })
        break
      case 'graph':
        steps.push({ name: 'Upload Documents', icon: Upload, completed: documents?.length > 0 })
        steps.push({ name: 'Generate Ontology', icon: Database, completed: ontologyData != null })
        steps.push({ name: 'Resolve Entities', icon: Zap, completed: entityData != null })
        steps.push({ name: 'Generate Embeddings', icon: FileText, completed: embeddingData != null })
        break
      default:
        steps.push({ name: 'Upload Documents', icon: Upload, completed: documents?.length > 0 })
    }
    return steps
  }

  return (
    <div className="professional-module-wrapper">
      {/* Header with Back Button */}
      <motion.div 
        className="module-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-all duration-200 border border-gray-600/30"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </motion.button>
            
            <div className="flex items-center space-x-3">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${moduleColor}20`, border: `1px solid ${moduleColor}40` }}
              >
                <ModuleIcon className="w-6 h-6" style={{ color: moduleColor }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{moduleName}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${backendStatus === 'online' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className="text-sm text-gray-400">
                    Backend {backendStatus === 'online' ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Status Indicators */}
          <div className="flex items-center space-x-3">
            {isLoading && (
              <div className="flex items-center space-x-2 text-blue-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Processing...</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${hasRequiredData ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
              <span className="text-sm text-gray-400">
                {hasRequiredData ? 'Data Available' : 'Awaiting Data'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content Area */}
      <div className="module-content">
        <AnimatePresence mode="wait">
          {showUploadAlert ? (
            <motion.div
              key="upload-alert"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="upload-alert-container"
            >
              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-yellow-500/20 rounded-full">
                    <AlertTriangle className="w-8 h-8 text-yellow-400" />
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2">
                  No {getDataTypeLabel()} Available
                </h3>
                
                <p className="text-gray-400 mb-6">
                  {getUploadMessage()}
                </p>
                
                {/* Required Steps */}
                <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Required Steps:</h4>
                  <div className="space-y-2">
                    {getRequiredSteps().map((step, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        {step.completed ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <step.icon className="w-4 h-4 text-gray-400" />
                        <span className={`text-sm ${step.completed ? 'text-green-400' : 'text-gray-400'}`}>
                          {step.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onBack?.()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200"
                >
                  Go to Dashboard
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="module-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="module-inner-content"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ProfessionalModuleWrapper
