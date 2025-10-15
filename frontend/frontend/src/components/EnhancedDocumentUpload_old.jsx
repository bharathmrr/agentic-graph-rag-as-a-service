import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  FileText, 
  Image, 
  Archive, 
  File, 
  X, 
  Play, 
  Trash2, 
  Clock, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Zap,
  Brain,
  Search,
  Activity,
  Cpu,
  Network,
  Sparkles
} from 'lucide-react'
import ProfessionalModuleWrapper from './ProfessionalModuleWrapper'
import ProcessingSteps from './ProcessingSteps'

const EnhancedDocumentUpload = ({ 
  onBack, 
  onNotification, 
  onUploadComplete,
  processingStatus,
  setProcessingStatus 
}) => {
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const [processingJobs, setProcessingJobs] = useState({})
  const [showProcessing, setShowProcessing] = useState(false)
  const fileInputRef = useRef(null)

  // Get file icon based on extension
  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase()
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

  // Add files to the list
  const addFiles = useCallback((newFiles) => {
    const fileItems = Array.from(newFiles).map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      size: file.size,
      status: 'ready',
      progress: 0,
      error: null,
      result: null
    }))
    
    setFiles(prev => [...prev, ...fileItems])
  }, [])

  // Handle drag events
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles)
    }
  }, [addFiles])

  // Handle file input change
  const handleFileInputChange = useCallback((e) => {
    const selectedFiles = e.target.files
    if (selectedFiles.length > 0) {
      addFiles(selectedFiles)
    }
    e.target.value = ''
  }, [addFiles])

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
      xhr.open('POST', 'http://localhost:8001/api/upload')
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

  // Upload all ready files
  const uploadAll = useCallback(() => {
    const readyFiles = files.filter(f => f.status === 'ready')
    readyFiles.forEach(file => startUpload(file))
  }, [files, startUpload])

  // Clear completed files
  const clearCompleted = useCallback(() => {
    setFiles(prev => prev.filter(f => f.status !== 'completed'))
  }, [])

  // Update file progress from upload progress
  useEffect(() => {
    setFiles(prev => prev.map(f => ({
      ...f,
      progress: uploadProgress[f.id] || f.progress
    })))
  }, [uploadProgress])

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
        {/* Futuristic AI Command Center Header */}
        <div className="text-center mb-20 relative overflow-hidden">
          {/* Digital Grid Background */}
          <div className="absolute inset-0 -top-32 -bottom-32">
            <div className="absolute inset-0 opacity-10">
              <div className="grid grid-cols-12 gap-1 h-full">
                {[...Array(144)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="border border-cyan-500/20 h-8"
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.01 }}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Floating Particles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -100, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 4 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>
          
          {/* Neon Glow Orbs */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <motion.div 
              className="w-96 h-96 bg-gradient-to-r from-cyan-500/30 via-purple-500/20 to-orange-500/30 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative z-10"
          >
            {/* AI Pulse Animation */}
            <motion.div 
              className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full"
              animate={{
                scale: [1, 2, 1],
                opacity: [1, 0.3, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* Glowing Gradient Title */}
            <motion.h1 
              className="text-7xl md:text-8xl font-black mb-6 leading-tight font-mono tracking-wider"
              style={{
                fontFamily: "'Orbitron', 'Exo', monospace",
                textShadow: "0 0 30px rgba(6, 182, 212, 0.5), 0 0 60px rgba(6, 182, 212, 0.3)"
              }}
            >
              <motion.span
                className="inline-block"
                animate={{
                  background: [
                    "linear-gradient(45deg, #06b6d4, #8b5cf6, #f97316, #06b6d4)",
                    "linear-gradient(45deg, #8b5cf6, #f97316, #06b6d4, #8b5cf6)",
                    "linear-gradient(45deg, #f97316, #06b6d4, #8b5cf6, #f97316)"
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                style={{
                  backgroundSize: "300% 300%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                }}
              >
                AI DOCUMENT
              </motion.span>
              <br />
              <motion.span
                className="text-6xl md:text-7xl inline-block"
                animate={{ 
                  textShadow: [
                    "0 0 20px rgba(139, 92, 246, 0.8)",
                    "0 0 40px rgba(6, 182, 212, 0.8)",
                    "0 0 20px rgba(249, 115, 22, 0.8)",
                    "0 0 40px rgba(139, 92, 246, 0.8)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{
                  background: "linear-gradient(45deg, #a855f7, #06b6d4, #f97316)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                }}
              >
                INTELLIGENCE
              </motion.span>
            </motion.h1>
            
            {/* Futuristic Subheading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="relative mb-12"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent h-px top-1/2 transform -translate-y-1/2" />
              <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-light px-8 py-4 bg-black/20 backdrop-blur-sm rounded-2xl border border-cyan-500/20">
                Transform documents into 
                <motion.span 
                  className="font-semibold"
                  animate={{
                    background: [
                      "linear-gradient(45deg, #06b6d4, #8b5cf6)",
                      "linear-gradient(45deg, #8b5cf6, #f97316)",
                      "linear-gradient(45deg, #f97316, #06b6d4)"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text"
                  }}
                >
                  intelligent knowledge graphs
                </motion.span>
                {' '}with cutting-edge AI analysis
                <motion.span 
                  className="inline-block ml-2"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  ⚡
                </motion.span>
              </p>
            </motion.div>
            {/* Animated AI Feature Icons */}
            <motion.div 
              className="flex flex-wrap items-center justify-center gap-6 mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              {[
                { 
                  icon: Cpu, 
                  text: "AI-Powered Extraction", 
                  color: "from-cyan-500 to-blue-600",
                  glow: "cyan",
                  description: "Neural networks extract entities"
                },
                { 
                  icon: Zap, 
                  text: "Real-time Processing", 
                  color: "from-orange-500 to-red-600",
                  glow: "orange",
                  description: "Lightning-fast analysis"
                },
                { 
                  icon: Network, 
                  text: "Knowledge Graphs", 
                  color: "from-purple-500 to-pink-600",
                  glow: "purple",
                  description: "Intelligent relationship mapping"
                },
                { 
                  icon: Search, 
                  text: "Entity Recognition", 
                  color: "from-emerald-500 to-teal-600",
                  glow: "emerald",
                  description: "Advanced pattern detection"
                }
              ].map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, scale: 0.5, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ 
                      delay: 1 + index * 0.15, 
                      duration: 0.6,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{ 
                      scale: 1.1, 
                      y: -8,
                      rotateY: 10
                    }}
                    className="group relative cursor-pointer"
                  >
                    {/* Glow Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-all duration-500 scale-110`} />
                    
                    {/* Main Card */}
                    <div className={`relative px-8 py-6 bg-gradient-to-br ${feature.color} rounded-2xl border border-white/20 backdrop-blur-sm shadow-2xl overflow-hidden`}>
                      {/* Animated Background Pattern */}
                      <div className="absolute inset-0 opacity-20">
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10"
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="relative z-10 text-center">
                        <motion.div
                          animate={{ 
                            rotate: [0, 360],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ 
                            rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                            scale: { duration: 2, repeat: Infinity }
                          }}
                          className="mb-3"
                        >
                          <IconComponent className="w-8 h-8 text-white mx-auto" />
                        </motion.div>
                        
                        <h3 className="text-white font-bold text-sm mb-1 font-mono tracking-wide">
                          {feature.text}
                        </h3>
                        
                        <p className="text-white/70 text-xs font-light">
                          {feature.description}
                        </p>
                        
                        {/* Pulse Indicator */}
                        <motion.div 
                          className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"
                          animate={{ 
                            scale: [1, 1.5, 1],
                            opacity: [1, 0.5, 1]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </motion.div>
        </div>
      
        {/* Futuristic AI Upload Command Center */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
          className="relative group"
        >
          {/* Neon Glow Ring */}
          <div className={`absolute -inset-2 rounded-[3rem] transition-all duration-1000 ${
            isDragging 
              ? 'bg-gradient-to-r from-cyan-400 via-purple-400 to-orange-400 opacity-90 blur-lg animate-pulse scale-105' 
              : 'bg-gradient-to-r from-cyan-500/40 via-purple-500/40 to-orange-500/40 opacity-0 group-hover:opacity-70 blur-lg'
          }`}></div>
          
          <motion.div
            className={`relative overflow-hidden rounded-[2rem] backdrop-blur-xl transition-all duration-700 ${
              isDragging 
                ? 'bg-gradient-to-br from-emerald-500/30 via-cyan-500/20 to-purple-500/30 border-2 border-emerald-400/60 shadow-2xl shadow-emerald-500/25 scale-[1.02]' 
                : 'bg-gradient-to-br from-gray-900/60 via-gray-800/40 to-gray-900/60 border-2 border-dashed border-gray-600/40 hover:border-emerald-400/60 hover:bg-gradient-to-br hover:from-gray-800/70 hover:via-gray-700/50 hover:to-gray-800/70'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            whileHover={{ y: -6 }}
            style={{
              boxShadow: isDragging 
                ? '0 25px 50px -12px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(16, 185, 129, 0.1)'
                : '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <motion.div 
                className="absolute inset-0"
                animate={{
                  background: [
                    "radial-gradient(circle at 20% 20%, #10b981 0%, transparent 50%), radial-gradient(circle at 80% 80%, #06b6d4 0%, transparent 50%)",
                    "radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 50%), radial-gradient(circle at 20% 80%, #f59e0b 0%, transparent 50%)",
                    "radial-gradient(circle at 20% 20%, #10b981 0%, transparent 50%), radial-gradient(circle at 80% 80%, #06b6d4 0%, transparent 50%)"
                  ]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
            </div>
          
            <div className="relative p-20 text-center">
              {/* Enhanced Upload Icon */}
              <motion.div
                animate={isDragging ? { 
                  scale: [1, 1.2, 1], 
                  rotate: [0, 10, -10, 0],
                  y: [0, -10, 0]
                } : {
                  y: [0, -5, 0]
                }}
                transition={{ 
                  duration: isDragging ? 0.6 : 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="mb-10"
              >
                <div className="relative mx-auto w-32 h-32">
                  {/* Multiple Glow Layers */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 rounded-3xl opacity-30 blur-2xl animate-pulse"></div>
                  <div className="absolute inset-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl opacity-40 blur-xl"></div>
                  
                  {/* Main Icon Container */}
                  <div className="relative bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-500 rounded-3xl p-8 shadow-2xl border border-white/20">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
                    <Upload className="w-16 h-16 text-white mx-auto relative z-10" />
                  </div>
                  
                  {/* Floating Particles */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
                      style={{
                        top: `${20 + Math.sin(i) * 30}%`,
                        left: `${20 + Math.cos(i) * 30}%`,
                      }}
                      animate={{
                        y: [0, -20, 0],
                        opacity: [0.3, 1, 0.3],
                        scale: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 2 + i * 0.2,
                        repeat: Infinity,
                        delay: i * 0.3
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            
              {/* Dynamic Main Text */}
              <motion.h3 
                className="text-4xl font-bold text-white mb-6"
                animate={isDragging ? { scale: 1.05 } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {isDragging ? (
                  <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    ✨ Drop your files here ✨
                  </span>
                ) : (
                  'Drag & Drop Your Documents'
                )}
              </motion.h3>
              
              <motion.p 
                className="text-xl text-gray-300 mb-8 max-w-lg mx-auto leading-relaxed"
                animate={isDragging ? { y: -5 } : { y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {isDragging 
                  ? (
                    <span className="text-emerald-300 font-medium">
                      🚀 Release to start intelligent processing
                    </span>
                  )
                  : 'Upload documents to extract entities, relationships, and build knowledge graphs with AI'
                }
              </motion.p>
            
              {/* Enhanced Supported Formats */}
              <motion.div 
                className="flex flex-wrap justify-center gap-3 mb-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {[
                  { format: 'PDF', icon: '📄', color: 'from-red-500 to-red-600' },
                  { format: 'DOC', icon: '📝', color: 'from-blue-500 to-blue-600' },
                  { format: 'DOCX', icon: '📘', color: 'from-blue-600 to-indigo-600' },
                  { format: 'TXT', icon: '📃', color: 'from-gray-500 to-gray-600' },
                  { format: 'MD', icon: '📋', color: 'from-purple-500 to-purple-600' }
                ].map((item, index) => (
                  <motion.div
                    key={item.format}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className={`px-4 py-2 bg-gradient-to-r ${item.color} text-white text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-default`}
                  >
                    <span className="flex items-center space-x-2">
                      <span>{item.icon}</span>
                      <span>{item.format}</span>
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            
              {/* Enhanced Upload Button */}
              <motion.button
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: '0 25px 50px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(16, 185, 129, 0.2)' 
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fileInputRef.current?.click()}
                className="group relative px-12 py-5 bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-emerald-500 hover:via-cyan-500 hover:to-blue-500 text-white font-bold text-xl rounded-2xl shadow-2xl transition-all duration-500 overflow-hidden border border-white/20"
              >
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                {/* Button Content */}
                <span className="relative flex items-center space-x-4">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Upload className="w-6 h-6" />
                  </motion.div>
                  <span>Choose Files to Upload</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ✨
                  </motion.div>
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
              
              {/* Enhanced Additional Info */}
              <motion.div 
                className="mt-8 space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <p className="text-gray-400 text-sm">
                  <span className="inline-flex items-center space-x-2">
                    <span>📊</span>
                    <span>Maximum file size: <span className="text-emerald-400 font-semibold">10MB</span></span>
                  </span>
                </p>
                <p className="text-gray-400 text-sm">
                  <span className="inline-flex items-center space-x-2">
                    <span>🔒</span>
                    <span>Secure processing • Multiple file selection supported</span>
                  </span>
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Ultra Modern File List */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-10"
          >
            {/* Enhanced Processing Queue Header */}
            <motion.div 
              className="relative overflow-hidden bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-600/30 shadow-2xl"
              whileHover={{ y: -2 }}
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <motion.div 
                  className="absolute inset-0"
                  animate={{
                    background: [
                      "radial-gradient(circle at 10% 20%, #10b981 0%, transparent 50%), radial-gradient(circle at 90% 80%, #06b6d4 0%, transparent 50%)",
                      "radial-gradient(circle at 90% 20%, #8b5cf6 0%, transparent 50%), radial-gradient(circle at 10% 80%, #f59e0b 0%, transparent 50%)",
                      "radial-gradient(circle at 10% 20%, #10b981 0%, transparent 50%), radial-gradient(circle at 90% 80%, #06b6d4 0%, transparent 50%)"
                    ]
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
              </div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  {/* Animated Icon */}
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      📊
                    </motion.div>
                  </motion.div>
                  
                  <div>
                    <motion.h3 
                      className="text-3xl font-bold text-white mb-2"
                      initial={{ x: -20 }}
                      animate={{ x: 0 }}
                    >
                      <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        Processing Queue
                      </span>
                    </motion.h3>
                    <motion.p 
                      className="text-gray-300 text-lg"
                      initial={{ x: -20 }}
                      animate={{ x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      {files.length} {files.length === 1 ? 'document' : 'documents'} ready for 
                      <span className="text-emerald-400 font-semibold">intelligent analysis</span>
                    </motion.p>
                  </div>
                </div>
                
                {/* Enhanced Counter */}
                <motion.div 
                  className="text-right"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div 
                    className="text-5xl font-black bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {files.length}
                  </motion.div>
                  <div className="text-gray-400 text-sm font-medium uppercase tracking-wider">Files Queued</div>
                  
                  {/* Status Indicators */}
                  <div className="flex justify-end space-x-2 mt-3">
                    {[
                      { status: 'ready', color: 'bg-blue-500', count: files.filter(f => f.status === 'ready').length },
                      { status: 'processing', color: 'bg-purple-500', count: files.filter(f => f.status === 'processing').length },
                      { status: 'completed', color: 'bg-green-500', count: files.filter(f => f.status === 'completed').length }
                    ].map(item => item.count > 0 && (
                      <motion.div
                        key={item.status}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`${item.color} w-3 h-3 rounded-full shadow-lg`}
                        title={`${item.count} ${item.status}`}
                      />
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
            
            {/* Enhanced Action Buttons */}
            <motion.div 
              className="flex flex-wrap items-center justify-center gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(59, 130, 246, 0.2)' 
                }}
                whileTap={{ scale: 0.95 }}
                onClick={uploadAll}
                disabled={!files.some(f => f.status === 'ready')}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg flex items-center space-x-4 transition-all duration-500 shadow-2xl border border-white/20 overflow-hidden"
              >
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative z-10"
                >
                  <Play className="w-6 h-6" />
                </motion.div>
                <span className="relative z-10">Process All Documents</span>
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="relative z-10"
                >
                  ⚡
                </motion.div>
              </motion.button>
              
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 15px 30px rgba(107, 114, 128, 0.3)'
                }}
                whileTap={{ scale: 0.95 }}
                onClick={clearCompleted}
                disabled={!files.some(f => f.status === 'completed')}
                className="group relative px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg flex items-center space-x-4 transition-all duration-300 shadow-xl border border-gray-500/30"
              >
                <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Clear Completed</span>
                <span className="text-sm opacity-70">🗑️</span>
              </motion.button>
            </motion.div>

            <AnimatePresence>
              {files.map(fileItem => (
                <FileItem key={fileItem.id} fileItem={fileItem} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </ProfessionalModuleWrapper>
  )
}

export default EnhancedDocumentUpload
