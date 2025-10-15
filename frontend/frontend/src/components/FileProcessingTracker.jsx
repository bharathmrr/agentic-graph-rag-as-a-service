import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield, Clock, CheckCircle, AlertCircle, Database, Network } from 'lucide-react'

const FileProcessingTracker = ({ onBack }) => {
  const [processedFiles, setProcessedFiles] = useState([])
  const [processingStats, setProcessingStats] = useState({
    totalFiles: 0,
    chromaDBUpdates: 0,
    neo4jUpdates: 0,
    totalProcessingTime: 0
  })

  useEffect(() => {
    // Load processed files from localStorage
    const files = JSON.parse(localStorage.getItem('uploadedFiles') || '[]')
    const processed = JSON.parse(localStorage.getItem('processedFiles') || '[]')
    
    const enrichedFiles = files.map(file => ({
      ...file,
      isProcessed: processed.includes(file.documentId),
      chromaDBTimestamp: localStorage.getItem(`chromadb_${file.documentId}`),
      neo4jTimestamp: localStorage.getItem(`neo4j_${file.documentId}`),
      processingTime: Math.random() * 5000 + 1000 // Simulated processing time
    }))

    setProcessedFiles(enrichedFiles)
    setProcessingStats({
      totalFiles: files.length,
      chromaDBUpdates: enrichedFiles.filter(f => f.chromaDBTimestamp).length,
      neo4jUpdates: enrichedFiles.filter(f => f.neo4jTimestamp).length,
      totalProcessingTime: enrichedFiles.reduce((sum, f) => sum + f.processingTime, 0)
    })
  }, [])

  const getStatusIcon = (file) => {
    if (file.isProcessed && file.chromaDBTimestamp && file.neo4jTimestamp) {
      return <CheckCircle size={20} className="text-green-500" />
    } else if (file.isProcessed) {
      return <Clock size={20} className="text-yellow-500" />
    } else {
      return <AlertCircle size={20} className="text-gray-400" />
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Not processed'
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-white">
      <div className="h-full flex flex-col">
        {/* Premium Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                <ArrowLeft size={18} className="text-gray-600" />
                <span className="text-gray-700 font-medium">Back</span>
              </motion.button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Shield size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">File Processing Tracker</h1>
                  <p className="text-gray-500 text-sm">Model Core 9: Complete file lifecycle management</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{processingStats.totalFiles}</div>
                <div className="text-gray-500 text-sm">Total Files</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{processingStats.chromaDBUpdates}</div>
                <div className="text-gray-500 text-sm">ChromaDB</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{processingStats.neo4jUpdates}</div>
                <div className="text-gray-500 text-sm">Neo4j</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <motion.div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <Shield size={24} className="text-red-500" />
                <h3 className="font-semibold text-gray-900">Processing Status</h3>
              </div>
              <div className="text-2xl font-bold text-red-600">{processingStats.totalFiles}</div>
              <p className="text-gray-500 text-sm">Files tracked</p>
            </motion.div>

            <motion.div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <Database size={24} className="text-blue-500" />
                <h3 className="font-semibold text-gray-900">ChromaDB Updates</h3>
              </div>
              <div className="text-2xl font-bold text-blue-600">{processingStats.chromaDBUpdates}</div>
              <p className="text-gray-500 text-sm">Vector embeddings stored</p>
            </motion.div>

            <motion.div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <Network size={24} className="text-purple-500" />
                <h3 className="font-semibold text-gray-900">Neo4j Updates</h3>
              </div>
              <div className="text-2xl font-bold text-purple-600">{processingStats.neo4jUpdates}</div>
              <p className="text-gray-500 text-sm">Graph nodes created</p>
            </motion.div>

            <motion.div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <Clock size={24} className="text-green-500" />
                <h3 className="font-semibold text-gray-900">Processing Time</h3>
              </div>
              <div className="text-2xl font-bold text-green-600">{Math.round(processingStats.totalProcessingTime / 1000)}s</div>
              <p className="text-gray-500 text-sm">Total time spent</p>
            </motion.div>
          </div>

          {/* File Processing Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">File Processing History</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ChromaDB</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Neo4j</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {processedFiles.map((file, index) => (
                    <tr key={file.documentId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusIcon(file)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {file.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {file.documentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(file.uploadTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(file.chromaDBTimestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(file.neo4jTimestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {processedFiles.length === 0 && (
              <div className="text-center py-12">
                <Shield size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Files Processed</h3>
                <p className="text-gray-500">Upload some files to see processing history</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileProcessingTracker
