import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Users, AlertTriangle, CheckCircle, Eye, Download } from 'lucide-react'

const EntityResolution = ({ onNotification }) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [duplicates, setDuplicates] = useState([])

  const mockDuplicates = [
    {
      id: 1,
      entities: ['Alice Johnson', 'A. Johnson', 'Alice J.'],
      type: 'PERSON',
      confidence: 0.95,
      suggestedMerge: 'Alice Johnson'
    },
    {
      id: 2,
      entities: ['TechCorp Inc', 'TechCorp Incorporated', 'Tech Corp'],
      type: 'ORGANIZATION',
      confidence: 0.87,
      suggestedMerge: 'TechCorp Inc'
    },
    {
      id: 3,
      entities: ['San Francisco', 'SF', 'San Francisco, CA'],
      type: 'LOCATION',
      confidence: 0.92,
      suggestedMerge: 'San Francisco'
    }
  ]

  const detectDuplicates = async () => {
    setIsProcessing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      setDuplicates(mockDuplicates)
      
      onNotification?.({
        type: 'success',
        title: 'Duplicates Detected',
        message: `Found ${mockDuplicates.length} potential duplicate groups`
      })
    } catch (error) {
      onNotification?.({
        type: 'error',
        title: 'Detection Failed',
        message: error.message
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'text-green-400'
    if (confidence >= 0.7) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getTypeColor = (type) => {
    const colors = {
      PERSON: 'bg-blue-500/20 text-blue-400',
      ORGANIZATION: 'bg-green-500/20 text-green-400',
      LOCATION: 'bg-purple-500/20 text-purple-400'
    }
    return colors[type] || 'bg-gray-500/20 text-gray-400'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Search className="w-6 h-6 mr-2 text-orange-400" />
            Entity Resolution
          </h2>
          <p className="text-gray-400 mt-1">Detect and resolve duplicate entities</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={detectDuplicates}
          disabled={isProcessing}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-lg flex items-center space-x-2"
        >
          <Search className="w-4 h-4" />
          <span>{isProcessing ? 'Detecting...' : 'Detect Duplicates'}</span>
        </motion.button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Entities</p>
              <p className="text-2xl font-bold text-white">156</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Duplicates Found</p>
              <p className="text-2xl font-bold text-orange-400">{duplicates.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-400" />
          </div>
        </div>
        
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Resolved</p>
              <p className="text-2xl font-bold text-green-400">0</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Duplicates Table */}
      {duplicates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Duplicate Entities</h3>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
              >
                <Eye className="w-4 h-4 inline mr-1" />
                Review All
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded"
              >
                <Download className="w-4 h-4 inline mr-1" />
                Export
              </motion.button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Duplicate Entities</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Suggested Merge</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Confidence</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {duplicates.map((duplicate) => (
                  <motion.tr
                    key={duplicate.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: duplicate.id * 0.1 }}
                    className="border-b border-gray-700/50 hover:bg-gray-700/20"
                  >
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(duplicate.type)}`}>
                        {duplicate.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {duplicate.entities.map((entity, index) => (
                          <div key={index} className="text-sm text-gray-300">
                            • {entity}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-white font-medium">{duplicate.suggestedMerge}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${getConfidenceColor(duplicate.confidence)}`}>
                        {Math.round(duplicate.confidence * 100)}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
                        >
                          Merge
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                        >
                          Ignore
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"
            />
            <span className="text-white text-lg">Analyzing entities for duplicates...</span>
          </div>
          <p className="text-gray-400">This may take a few moments</p>
        </motion.div>
      )}
    </div>
  )
}

export default EntityResolution
