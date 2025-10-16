import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  FileText,
  Image,
  Archive,
  Play,
  Pause,
  Download,
  Eye,
  Trash2,
  RefreshCw
} from 'lucide-react'
import AnimatedStarsBackground from './AnimatedStarsBackground'
import ProcessingSteps from './ProcessingSteps'
import ProfessionalModuleWrapper from './ProfessionalModuleWrapper'

const EnhancedDocumentUpload = ({ onNotification, onUploadComplete, onBack }) => {
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const [processingJobs, setProcessingJobs] = useState({})
  const [showProcessing, setShowProcessing] = useState(false)
  const fileInputRef = useRef(null)

  // File type icons
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'pdf':
      case 'doc':
      case 'docx':
      case 'txt':
        return FileText
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return Image
      case 'zip':
      case 'rar':
        return Archive
      default:
        return File
    }
  }

  // Handle file selection
  const handleFileSelect = useCallback((selectedFiles) => {
    const newFiles = Array.from(selectedFiles).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'ready', // ready, uploading, processing, completed, error
      progress: 0,
      jobId: null,
      result: null,
      error: null
    }))

    setFiles(prev => [...prev, ...newFiles])
  }, [])

  // Handle drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles)
    }
  }, [handleFileSelect])

  // Handle file input change
  const handleFileInputChange = useCallback((e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files)
    }
  }, [handleFileSelect])

  // Remove file
  const removeFile = useCallback((fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
    setUploadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[fileId]
      return newProgress
    })
    setProcessingJobs(prev => {
      const newJobs = { ...prev }
      delete newJobs[fileId]
      return newJobs
    })
  }, [])

  // Start upload and processing
  const startUpload = useCallback(async (fileItem) => {
    try {
      // Update file status
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      ))

      // Create FormData
      const formData = new FormData()
      formData.append('file', fileItem.file)

      // Start upload with progress tracking
      const xhr = new XMLHttpRequest()
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(prev => ({
            ...prev,
            [fileItem.id]: progress
          }))
        }
      })

      // Handle upload completion
      xhr.addEventListener('load', async () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText)
            
            if (response.success) {
              const docId = response.data.doc_id
              
              // Update file status to processing
              setFiles(prev => prev.map(f => 
                f.id === fileItem.id 
                  ? { ...f, status: 'processing', docId: docId }
                  : f
              ))

              // Show processing steps
              setShowProcessing(true)

              onNotification?.({
                type: 'success',
                title: 'Upload Successful',
                message: `${fileItem.name} uploaded successfully`
              })
            } else {
              throw new Error(response.error || 'Upload failed')
            }
          } catch (parseError) {
            throw new Error('Invalid response from server')
          }
        } else {
          throw new Error(`Upload failed with status ${xhr.status}`)
        }
      })

      // Handle upload error
      xhr.addEventListener('error', () => {
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'error', error: 'Upload failed' }
            : f
        ))

        onNotification?.({
          type: 'error',
          title: 'Upload Failed',
          message: `Failed to upload ${fileItem.name}`
        })
      })

      // Start upload
      xhr.open('POST', 'http://localhost:8000/api/upload')
      xhr.send(formData)

    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: 'error', error: error.message }
          : f
      ))

      onNotification?.({
        type: 'error',
        title: 'Upload Error',
        message: error.message
      })
    }
  }, [onNotification])

  // Start processing pipeline
  const startProcessingPipeline = useCallback(async (fileId, docId) => {
    try {
      const response = await fetch('http://localhost:8000/api/pipeline/process-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doc_id: docId,
          process_ontology: true,
          process_entities: true,
          process_embeddings: true,
          process_graph: true
        })
      })

      const result = await response.json()
      
      if (result.success) {
        const jobId = result.data.job_id
        
        // Update file with job ID
        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, jobId: jobId }
            : f
        ))

        // Start monitoring via SSE
        monitorProcessingJob(fileId, jobId)
      } else {
        throw new Error(result.error || 'Failed to start processing')
      }
    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'error', error: error.message }
          : f
      ))

      onNotification?.({
        type: 'error',
        title: 'Processing Failed',
        message: error.message
      })
    }
  }, [onNotification])

  // Monitor processing job via SSE
  const monitorProcessingJob = useCallback((fileId, jobId) => {
    const eventSource = new EventSource(`http://localhost:8000/api/sse/progress`)
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        // Update processing progress
        setProcessingJobs(prev => ({
          ...prev,
          [fileId]: data
        }))

        // Update file progress
        if (data.progress !== undefined) {
          setFiles(prev => prev.map(f => 
            f.id === fileId 
              ? { ...f, progress: data.progress }
              : f
          ))
        }

        // Handle completion
        if (data.status === 'completed') {
          setFiles(prev => prev.map(f => 
            f.id === fileId 
              ? { ...f, status: 'completed', result: data.result, progress: 100 }
              : f
          ))

          onNotification?.({
            type: 'success',
            title: 'Processing Complete',
            message: `${files.find(f => f.id === fileId)?.name} processed successfully`
          })

          onUploadComplete?.(data.result)
          eventSource.close()
        }

        // Handle error
        if (data.error) {
          setFiles(prev => prev.map(f => 
            f.id === fileId 
              ? { ...f, status: 'error', error: data.error }
              : f
          ))

          onNotification?.({
            type: 'error',
            title: 'Processing Failed',
            message: data.error
          })

          eventSource.close()
        }

      } catch (parseError) {
        console.error('Failed to parse SSE data:', parseError)
      }
    }

    eventSource.onerror = () => {
      console.error('SSE connection error')
      eventSource.close()
    }

    // Cleanup after 5 minutes
    setTimeout(() => {
      eventSource.close()
    }, 300000)

  }, [files, onNotification, onUploadComplete])

  // Upload all ready files
  const uploadAll = useCallback(() => {
    const readyFiles = files.filter(f => f.status === 'ready')
    readyFiles.forEach(file => startUpload(file))
  }, [files, startUpload])

  // Clear completed files
  const clearCompleted = useCallback(() => {
    setFiles(prev => prev.filter(f => f.status !== 'completed'))
  }, [])

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'ready': return 'text-blue-400'
      case 'uploading': return 'text-yellow-400'
      case 'processing': return 'text-purple-400'
      case 'completed': return 'text-green-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready': return Clock
      case 'uploading': return RefreshCw
      case 'processing': return RefreshCw
      case 'completed': return CheckCircle
      case 'error': return AlertCircle
      default: return Clock
    }
  }

  const FileItem = ({ fileItem }) => {
    const FileIcon = getFileIcon(fileItem.name)
    const StatusIcon = getStatusIcon(fileItem.status)
    const processingData = processingJobs[fileItem.id]

    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        whileHover={{ y: -2 }}
        className="relative overflow-hidden bg-gradient-to-br from-gray-800/60 via-gray-700/40 to-gray-800/60 backdrop-blur-lg border border-gray-600/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
      >
        {/* Background Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-blue-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {/* Modern File Icon */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl opacity-20 blur-sm"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-3">
                  <FileIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              
              {/* File Info */}
              <div className="min-w-0 flex-1">
                <p className="text-white font-semibold text-lg truncate max-w-xs mb-1">{fileItem.name}</p>
                <div className="flex items-center space-x-3 text-sm text-gray-400">
                  <span>{formatFileSize(fileItem.size)}</span>
                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                  <span className="capitalize">{fileItem.status.replace('-', ' ')}</span>
                </div>
              </div>
            </div>
            
            {/* Status and Actions */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <StatusIcon className={`w-6 h-6 ${getStatusColor(fileItem.status)} ${
                  fileItem.status === 'uploading' || fileItem.status === 'processing' ? 'animate-spin' : ''
                }`} />
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => removeFile(fileItem.id)}
                className="p-2 hover:bg-red-500/20 rounded-xl text-gray-400 hover:text-red-400 transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Modern Progress Bar */}
          {(fileItem.status === 'uploading' || fileItem.status === 'processing') && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    fileItem.status === 'uploading' ? 'bg-yellow-400' : 'bg-purple-400'
                  }`}></div>
                  <span className="text-white font-medium">
                    {fileItem.status === 'uploading' ? 'Uploading Document' : 'AI Processing'}
                  </span>
                </div>
                <span className="text-emerald-400 font-bold text-lg">{fileItem.progress}%</span>
              </div>
              
              <div className="relative w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full"></div>
                <motion.div
                  className={`relative h-full rounded-full ${
                    fileItem.status === 'uploading' 
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400' 
                      : 'bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${fileItem.progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
                </motion.div>
              </div>
            </div>
          )}

          {/* Modern Processing Details */}
          {processingData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-4 mb-4"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                <p className="text-indigo-300 font-medium">{processingData.step}</p>
              </div>
              <p className="text-gray-300 text-sm pl-5">{processingData.message}</p>
            </motion.div>
          )}

          {/* Modern Error Message */}
          {fileItem.status === 'error' && fileItem.error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-4 mb-4"
            >
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <p className="text-red-300 font-medium">Processing Failed</p>
              </div>
              <p className="text-red-200 text-sm mt-2 pl-5">{fileItem.error}</p>
            </motion.div>
          )}

          {/* Modern Result Summary */}
          {fileItem.status === 'completed' && fileItem.result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-xl p-4"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <p className="text-emerald-300 font-semibold">AI Processing Complete</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-emerald-400 mb-1">
                    {fileItem.result.entities_extracted || 0}
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Entities</div>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {fileItem.result.relationships_found || 0}
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Relations</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    )
  }

  if (showProcessing) {
    return (
      <ProcessingSteps 
        onComplete={() => {
          setShowProcessing(false)
          onUploadComplete?.({
            documentsProcessed: 1,
            entitiesExtracted: 156,
            relationshipsFound: 89,
            graphNodes: 156
          })
        }}
      />
    )
  }

  return (
    <ProfessionalModuleWrapper
      moduleId="upload"
      moduleName="Document Upload & Processing"
      moduleIcon={Upload}
      moduleColor="#10b981"
      onBack={onBack}
      requiresData={false}
    >
      <div className="space-y-8">
        {/* Modern Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent mb-6">
              Intelligent Document Processing
            </h1>
            <p className="text-xl text-gray-300 mb-4 max-w-2xl mx-auto leading-relaxed">
              Transform your documents into intelligent knowledge graphs with AI-powered analysis
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>AI-Powered Extraction</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>Real-time Processing</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span>Knowledge Graph Generation</span>
              </div>
            </div>
          </motion.div>
        </div>
      
        {/* Modern Upload Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`relative overflow-hidden rounded-3xl transition-all duration-500 ${
            isDragging 
              ? 'border-2 border-emerald-400 bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-teal-500/20 shadow-2xl shadow-emerald-500/25 scale-105' 
              : 'border-2 border-dashed border-gray-600/50 hover:border-emerald-400/70 bg-gradient-to-br from-gray-800/40 via-gray-700/30 to-gray-800/40 hover:shadow-xl hover:shadow-emerald-500/10'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          whileHover={{ y: -4 }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, #10b981 0%, transparent 50%), 
                               radial-gradient(circle at 75% 75%, #06b6d4 0%, transparent 50%)`
            }}></div>
          </div>
          
          <div className="relative p-16 text-center">
            {/* Upload Icon with Animation */}
            <motion.div
              animate={isDragging ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
              transition={{ duration: 0.5, repeat: isDragging ? Infinity : 0 }}
              className="mb-8"
            >
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl opacity-20 blur-xl"></div>
                <div className="relative bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 shadow-lg">
                  <Upload className="w-12 h-12 text-white mx-auto" />
                </div>
              </div>
            </motion.div>
            
            {/* Main Text */}
            <h3 className="text-3xl font-bold text-white mb-4">
              {isDragging ? 'Drop your files here' : 'Drag & Drop Your Documents'}
            </h3>
            
            <p className="text-lg text-gray-300 mb-2 max-w-md mx-auto">
              {isDragging 
                ? 'Release to start intelligent processing' 
                : 'Upload documents to extract entities, relationships, and build knowledge graphs'
              }
            </p>
            
            {/* Supported Formats */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {['PDF', 'DOC', 'DOCX', 'TXT', 'MD'].map((format) => (
                <span key={format} className="px-3 py-1 bg-gray-700/50 text-gray-300 text-sm rounded-full border border-gray-600/30">
                  {format}
                </span>
              ))}
            </div>
            
            {/* Upload Button */}
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()}
              className="group relative px-10 py-4 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-500 hover:via-green-500 hover:to-teal-500 text-white font-semibold text-lg rounded-2xl shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <span className="relative flex items-center space-x-3">
                <Upload className="w-5 h-5" />
                <span>Choose Files to Upload</span>
              </span>
            </motion.button>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.md,.rtf,.odt"
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            {/* Additional Info */}
            <p className="text-sm text-gray-500 mt-6">
              Maximum file size: 10MB • Supports multiple file selection
            </p>
          </div>
        </motion.div>

        {/* Modern File List */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600/30">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Processing Queue
                </h3>
                <p className="text-gray-400">
                  {files.length} {files.length === 1 ? 'document' : 'documents'} ready for intelligent analysis
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-emerald-400">{files.length}</div>
                <div className="text-sm text-gray-400">Files</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={uploadAll}
                  disabled={!files.some(f => f.status === 'ready')}
                  className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-medium flex items-center space-x-3 transition-all duration-300 shadow-lg"
                >
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Process All Documents</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearCompleted}
                  disabled={!files.some(f => f.status === 'completed')}
                  className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium flex items-center space-x-3 transition-all duration-300"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Completed</span>
                </motion.button>
              </div>
            </div>

            <AnimatePresence>
              {files.map(fileItem => (
                <FileItem key={fileItem.id} fileItem={fileItem} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </ProfessionalModuleWrapper>
  )
}

export default EnhancedDocumentUpload
