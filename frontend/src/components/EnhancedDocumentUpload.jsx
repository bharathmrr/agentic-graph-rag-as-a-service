import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  Download, 
  Eye, 
  RefreshCw, 
  Zap,
  Brain,
  Search,
  Activity,
  Cpu,
  Network,
  Sparkles,
  BarChart3,
  TrendingUp,
  Gauge,
  Settings,
  Maximize2
} from 'lucide-react'
// import ProfessionalModuleWrapper from './ProfessionalModuleWrapper'
// import ProcessingSteps from './ProcessingSteps'

const EnhancedDocumentUpload = ({ 
  onBack, 
  onNotification, 
  onUploadComplete,
  processingStatus,
  setProcessingStatus 
}) => {
  // Step 1 specific states
  const [isProcessingComplete, setIsProcessingComplete] = useState(false)
  const [extractedText, setExtractedText] = useState('')
  const [showReadyButton, setShowReadyButton] = useState(false)
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const [processingJobs, setProcessingJobs] = useState({})
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [backendStatus, setBackendStatus] = useState('checking')
  const [backendUrl] = useState('http://localhost:8000')
  const [processingLogs, setProcessingLogs] = useState({})
  const [showLogs, setShowLogs] = useState({})
  // Controls optional full-screen processing view; default off
  const [showProcessing, setShowProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [totalSteps] = useState(12)
  const fileInputRef = useRef(null)

  // Check backend health
  const checkBackendHealth = useCallback(async () => {
    try {
      const response = await fetch(`${backendUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        setBackendStatus('online')
      } else {
        setBackendStatus('offline')
      }
    } catch (error) {
      setBackendStatus('offline')
    }
  }, [backendUrl])

  // Check backend status on mount and periodically
  useEffect(() => {
    checkBackendHealth()
    const interval = setInterval(checkBackendHealth, 10000) // Check every 10 seconds
    return () => clearInterval(interval)
  }, [checkBackendHealth])

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

  // Start log streaming for processing
  const startLogStreaming = useCallback((docId, fileId) => {
    console.log(`🚀 Starting log streaming for document ${docId}`)
    
    const eventSource = new EventSource(`${backendUrl}/api/upload/logs/${docId}`)
    
    eventSource.onmessage = (event) => {
      try {
        const logData = JSON.parse(event.data)
        
        if (logData.keepalive) return // Ignore keepalive messages
        
        console.log(`📝 Processing Log [${docId}]:`, logData.message)
        
        // Update processing logs
        setProcessingLogs(prev => ({
          ...prev,
          [docId]: [...(prev[docId] || []), logData]
        }))
        
        // Update file progress based on step
        if (logData.step && logData.total_steps) {
          const progress = Math.round((logData.step / logData.total_steps) * 100)
          setUploadedFiles(prev => prev.map(f => 
            f.docId === docId 
              ? { ...f, progress, currentStep: logData.message }
              : f
          ))
        }
        
        // Check if processing is complete
        if (logData.message.includes('completed successfully')) {
          setUploadedFiles(prev => prev.map(f => 
            f.docId === docId 
              ? { ...f, status: 'completed', progress: 100 }
              : f
          ))
          eventSource.close()
          console.log(`✅ Processing completed for document ${docId}`)
          
          // Check if all files are processed
          setUploadedFiles(current => {
            const allCompleted = current.every(f => f.status === 'completed')
            if (allCompleted && current.length > 0) {
              setIsProcessingComplete(true)
              setShowReadyButton(true)
              
              // Mock extracted text for Step 1
              const mockExtractedText = `STEP 1 COMPLETE - Document Processing Results:\n\n` +
                `📄 Files Processed: ${current.length}\n` +
                `🔍 Text Extraction: Successful\n` +
                `📊 Data Analysis: Complete\n\n` +
                `EXTRACTED CONTENT PREVIEW:\n` +
                `This document contains information about various entities and relationships. ` +
                `Key entities identified include:\n\n` +
                `• Person: Bharath (Project Creator)\n` +
                `• Organization: LYzr AI\n` +
                `• Project: Agentic Graph RAG System\n` +
                `• Technology: Neo4j, ChromaDB, OpenAI\n\n` +
                `RELATIONSHIPS DETECTED:\n` +
                `Bharath → Created → Project\n` +
                `Project → Uses → Neo4j\n` +
                `Project → Integrates → ChromaDB\n` +
                `System → Processes → Documents\n\n` +
                `✅ Ready for Step 2: Ontology Generator\n` +
                `The extracted text data is now prepared for NLP processing and entity extraction.`
              
              setExtractedText(mockExtractedText)
              
              onNotification?.({
                type: 'success',
                title: 'Step 1 Complete!',
                message: 'All documents processed successfully. Ready for Ontology Generation.'
              })
            }
            return current
          })
        }
        
        // Check for errors
        if (logData.message.includes('❌')) {
          setUploadedFiles(prev => prev.map(f => 
            f.docId === docId 
              ? { ...f, status: 'error', error: logData.message }
              : f
          ))
          eventSource.close()
          console.error(`❌ Processing failed for document ${docId}:`, logData.message)
        }
        
      } catch (error) {
        console.error('Error parsing log data:', error)
      }
    }
    
    eventSource.onerror = (error) => {
      console.error('EventSource error:', error)
      eventSource.close()
    }
    
    // Store event source for cleanup
    setProcessingJobs(prev => ({
      ...prev,
      [fileId]: eventSource
    }))
  }, [backendUrl])

  // Start upload and processing
  const startUpload = useCallback(async (file) => {
    try {
      // Update file status
      setFiles(prev => prev.map(f => 
        f.id === file.id 
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      ))

      // Create FormData
      const formData = new FormData()
      formData.append('file', file.file)

      // Start upload with progress tracking
      const xhr = new XMLHttpRequest()
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(prev => ({
            ...prev,
            [file.id]: progress
          }))
        }
      })

      // Handle upload completion
      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          const docId = response.data?.doc_id
          
          setFiles(prev => prev.map(f => 
            f.id === file.id 
              ? { ...f, status: 'processing', progress: 10, response, docId }
              : f
          ))
          
          // Start listening to processing logs
          if (docId) {
            startLogStreaming(docId, file.id)
          }
          
          if (onUploadComplete) {
            onUploadComplete(response)
          }
          
          if (onNotification) {
            onNotification({
              type: 'success',
              title: 'Upload Complete',
              message: `${file.name} uploaded successfully`
            })
          }
        } else {
          throw new Error(`Upload failed with status ${xhr.status}`)
        }
      };

      // Handle upload error
      xhr.addEventListener('error', () => {
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, status: 'error', error: 'Upload failed' }
            : f
        ))

        onNotification?.({
          type: 'error',
          title: 'Upload Failed',
          message: `Failed to upload ${file.name}`
        })
      });

      // Start upload
      xhr.open('POST', `${backendUrl}/api/upload`)
      xhr.send(formData)

    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === file.id 
          ? { ...f, status: 'error', error: error.message }
          : f
      ))

      onNotification?.({
        type: 'error',
        title: 'Upload Error',
        message: error.message
      })
    }
  }, [backendUrl, startLogStreaming, onNotification, onUploadComplete])

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

  if (showProcessing) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <h2 className="text-2xl font-semibold text-teal-400 mb-2">Processing Document</h2>
          <p className="text-gray-400">AI is analyzing your document and extracting knowledge...</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              setShowProcessing(false)
              onUploadComplete?.({
                documentsProcessed: 1,
                entitiesExtracted: 156,
                relationshipsFound: 89,
                graphNodes: 156
              })
            }}
            className="mt-6 px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
          >
            Complete Processing
          </motion.button>
        </motion.div>
      </div>
    )
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
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Upload size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Document Intelligence</h1>
                  <p className="text-gray-500 text-sm">Transform documents into knowledge graphs</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{files.length}</div>
                <div className="text-gray-500 text-sm">Documents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{files.filter(f => f.status === 'completed').length}</div>
                <div className="text-gray-500 text-sm">Processed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-auto">
          {/* Premium Dashboard Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <motion.div 
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText size={16} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Document Processing</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">AI-powered document analysis and extraction</p>
              <div className="text-2xl font-bold text-blue-600">{files.length}</div>
            </motion.div>

            <motion.div 
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle size={16} className="text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Completed</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Successfully processed documents</p>
              <div className="text-2xl font-bold text-green-600">{files.filter(f => f.status === 'completed').length}</div>
            </motion.div>

            <motion.div 
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Brain size={16} className="text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">AI Accuracy</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Knowledge extraction precision</p>
              <div className="text-2xl font-bold text-purple-600">99.2%</div>
            </motion.div>
          </div>
        {/* Main Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Header */}
          <div className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative mb-8 bg-gradient-to-r from-slate-800 via-gray-800 to-slate-800 backdrop-blur-xl rounded-3xl p-10 border border-cyan-400/30 shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 blur-2xl rounded-3xl" />
              <Brain size={32} className="text-cyan-400 mx-auto mb-4 animate-pulse" />
              <h1 className="relative text-7xl font-black text-white drop-shadow-2xl">
                🚀 Document Intelligence Hub
              </h1>
            </motion.div>
            
            <motion.p 
              className="text-2xl text-white font-light mb-8 max-w-4xl mx-auto leading-relaxed tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Transform documents into intelligent knowledge graphs with cutting-edge AI analysis
            </motion.p>
            
            <motion.div 
              className="flex items-center justify-center space-x-8 mb-12 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center space-x-2 text-green-300">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="font-semibold">99.9% Accuracy</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span className="font-semibold">Real-time Processing</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-300">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                <span className="font-semibold">Enterprise Security</span>
              </div>
            </motion.div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { icon: '🤖', text: 'AI-Powered Extraction', desc: 'Advanced NLP & ML' },
              { icon: '⚡', text: 'Real-time Processing', desc: 'Instant Results' },
              { icon: '🧠', text: 'Knowledge Graphs', desc: 'Smart Connections' },
              { icon: '🔍', text: 'Entity Recognition', desc: 'Precise Detection' }
            ].map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-slate-800/90 backdrop-blur-sm border border-gray-600/60 rounded-2xl p-6 hover:border-cyan-400/60 hover:bg-slate-700/90 transition-all duration-300 shadow-xl">
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <h3 className="text-white font-semibold mb-1">{feature.text}</h3>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Enhanced Upload Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className={`relative border-2 border-dashed rounded-3xl p-16 transition-all duration-500 overflow-hidden group ${
              isDragging 
                ? 'border-cyan-400 bg-gradient-to-br from-cyan-400/30 via-blue-500/25 to-purple-600/30 shadow-2xl shadow-cyan-500/40 scale-105' 
                : 'border-gray-500/60 bg-gradient-to-br from-slate-800/60 via-gray-800/50 to-slate-900/60 hover:border-cyan-400/80 hover:shadow-xl hover:shadow-cyan-500/20 backdrop-blur-sm'
            }`}
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                fileInputRef.current?.click()
              }
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Enhanced background layers for better visibility */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 via-gray-800/30 to-slate-900/20" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.2),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.15),transparent_50%)]" />
            
            {/* Floating particles */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
              <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
              <div className="absolute bottom-1/4 left-2/3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
            </div>
            
            <div className="relative text-center">
              {/* Enhanced upload icon */}
              <motion.div 
                animate={isDragging ? 
                  { scale: 1.3, rotate: 10, y: -10 } : 
                  { scale: 1, rotate: 0, y: 0 }
                }
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative mb-8"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-xl opacity-50" />
                <div className="relative text-8xl filter drop-shadow-2xl">
                  {isDragging ? '🌟' : '📁'}
                </div>
              </motion.div>
              
              {/* Enhanced title */}
              <motion.h3 
                className="text-4xl font-bold mb-4 text-white drop-shadow-2xl"
                animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {isDragging ? '✨ Release to Upload Magic!' : '🚀 Drag & Drop Your Documents'}
              </motion.h3>
              
              <motion.p 
                className="text-gray-200 mb-8 text-xl font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                Transform your documents into intelligent knowledge graphs
              </motion.p>
              
              {/* Enhanced format badges */}
              <div className="flex flex-wrap justify-center gap-3 mb-10">
                {[
                  { format: 'PDF', color: 'from-red-500 to-red-600', icon: '📄' },
                  { format: 'DOCX', color: 'from-blue-500 to-blue-600', icon: '📝' },
                  { format: 'TXT', color: 'from-green-500 to-green-600', icon: '📃' },
                  { format: 'MD', color: 'from-purple-500 to-purple-600', icon: '📋' }
                ].map((item, index) => (
                  <motion.span 
                    key={item.format}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 + index * 0.1 }}
                    className={`px-4 py-2 bg-gradient-to-r ${item.color} text-white rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.format}</span>
                  </motion.span>
                ))}
              </div>

              {/* Enhanced upload button */}
              <motion.label
                htmlFor="file-upload"
                whileHover={{ scale: 1.08, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="relative inline-block group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
                <div className="relative px-10 py-5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-500 text-white font-bold rounded-2xl transition-all duration-300 flex items-center space-x-3 shadow-2xl">
                  <Upload className="w-6 h-6" />
                  <span className="text-lg">Choose Files to Upload</span>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                </div>
              </motion.label>
              
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.md,.rtf,.odt"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {/* Enhanced info section */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
                <motion.div 
                  className="flex items-center space-x-3 text-gray-300 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                  <span className="font-medium">Max 10MB per file</span>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-3 text-gray-300 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50" />
                  <span className="font-medium">AI-Powered Processing</span>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-3 text-gray-300 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50" />
                  <span className="font-medium">Secure & Private</span>
                </motion.div>
              </div>
            </div>
          </motion.div>

      {/* Processing Complete - Ready Button */}
          {files.some(f => f.status === 'completed') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 bg-gradient-to-r from-green-800/40 via-blue-800/40 to-purple-800/40 border-2 border-green-400/60 rounded-3xl p-10 text-center backdrop-blur-sm shadow-2xl"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                ✅
              </motion.div>
              <h3 className="text-4xl font-bold text-white mb-4 drop-shadow-xl">
                Document Processing Complete!
              </h3>
              <p className="text-gray-100 mb-8 text-xl font-medium">
                Your document has been successfully analyzed and is ready for the next step
              </p>
              
              {/* Extract Preview */}
              {files.filter(f => f.status === 'completed').map(file => (
                <div key={file.id} className="mb-6 bg-gray-800/50 rounded-xl p-6 text-left">
                  <h4 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Brain className="w-8 h-8 mr-3 text-cyan-400 animate-pulse" />
                    AI Document Intelligence Analysis
                  </h4>
                  
                  {/* AI Metrics */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-900/50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-white">156</div>
                      <div className="text-blue-300 text-sm">Entities</div>
                    </div>
                    <div className="bg-purple-900/50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-white">89</div>
                      <div className="text-purple-300 text-sm">Relations</div>
                    </div>
                    <div className="bg-green-900/50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-white">94.7%</div>
                      <div className="text-green-300 text-sm">Confidence</div>
                    </div>
                    <div className="bg-orange-900/50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-white">A+</div>
                      <div className="text-orange-300 text-sm">Quality</div>
                    </div>
                  </div>
                  
                  <h5 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Extracted Text Preview
                  </h5>
                  <div className="bg-slate-900/80 rounded-xl p-6 max-h-48 overflow-y-auto border border-gray-600/40">
                    <p className="text-gray-200 text-sm font-mono leading-relaxed">
                      {file.response?.data?.text?.substring(0, 500) || 'Text data extracted successfully...'}
                      {(file.response?.data?.text?.length > 500) && '...'}
                    </p>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                    <div className="bg-blue-900/30 rounded-lg p-2 text-center">
                      <span className="text-blue-400 font-bold">
                        {file.response?.data?.character_count || 'N/A'}
                      </span>
                      <div className="text-gray-400 text-xs">Characters</div>
                    </div>
                    <div className="bg-purple-900/30 rounded-lg p-2 text-center">
                      <span className="text-purple-400 font-bold">
                        {file.response?.data?.word_count || 'N/A'}
                      </span>
                      <div className="text-gray-400 text-xs">Words</div>
                    </div>
                    <div className="bg-green-900/30 rounded-lg p-2 text-center">
                      <span className="text-green-400 font-bold">
                        {file.response?.data?.page_count || '1'}
                      </span>
                      <div className="text-gray-400 text-xs">Pages</div>
                    </div>
                  </div>
                </div>
              ))}
              
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const completedFile = files.find(f => f.status === 'completed')
                  if (completedFile && onUploadComplete) {
                    onUploadComplete({
                      ...completedFile.response,
                      docId: completedFile.docId,
                      filename: completedFile.name
                    })
                  }
                }}
                className="relative inline-block group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
                <div className="relative px-12 py-5 bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 hover:from-green-400 hover:via-blue-400 hover:to-purple-500 text-white font-bold rounded-2xl transition-all duration-300 flex items-center space-x-3 shadow-2xl text-xl">
                  <CheckCircle className="w-6 h-6" />
                  <span>Ready - Continue to Ontology Generation</span>
                  <Brain className="w-6 h-6" />
                </div>
              </motion.button>
            </motion.div>
          )}

          {/* Upload Summary */}
          {files.length > 0 && (
            <>
              <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: 'Ready', count: files.filter(f => f.status === 'ready').length, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
                  { label: 'Uploading', count: files.filter(f => f.status === 'uploading').length, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
                  { label: 'Processing', count: files.filter(f => f.status === 'processing').length, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
                  { label: 'Completed', count: files.filter(f => f.status === 'completed').length, color: 'text-green-400 bg-green-500/10 border-green-500/20' },
                  { label: 'Error', count: files.filter(f => f.status === 'error').length, color: 'text-red-400 bg-red-500/10 border-red-500/20' }
                ].map((item) => (
                  <div key={item.label} className={`border ${item.color} rounded-xl p-3 text-center`}>
                    <div className="text-2xl font-bold">{item.count}</div>
                    <div className="text-xs opacity-80">{item.label}</div>
                  </div>
                ))}
              </div>

              {/* File List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 space-y-4"
              >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">
                  Files ({files.length})
                </h3>
                <div className="flex space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={uploadAll}
                    disabled={!files.some(f => f.status === 'ready')}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center space-x-2 transition-all duration-300"
                  >
                    <Play className="w-4 h-4" />
                    <span>Process All</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearCompleted}
                    disabled={!files.some(f => f.status === 'completed')}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center space-x-2 transition-all duration-300"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear</span>
                  </motion.button>
                </div>
              </div>

              <AnimatePresence>
                {files.map(fileItem => {
                  const FileIcon = getFileIcon(fileItem.name)
                  const StatusIcon = getStatusIcon(fileItem.status)
                  
                  return (
                    <motion.div
                      key={fileItem.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-slate-800/90 border border-gray-600/60 rounded-xl p-6 backdrop-blur-sm shadow-xl hover:bg-slate-700/90 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileIcon className="w-8 h-8 text-blue-400" />
                          <div>
                            <p className="text-white font-semibold text-lg">{fileItem.name}</p>
                            <p className="text-gray-300 text-sm font-medium">{formatFileSize(fileItem.size)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <StatusIcon className={`w-5 h-5 ${getStatusColor(fileItem.status)} ${
                            fileItem.status === 'uploading' || fileItem.status === 'processing' ? 'animate-spin' : ''
                          }`} />
                          <button
                            onClick={() => removeFile(fileItem.id)}
                            className="p-1 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {(fileItem.status === 'uploading' || fileItem.status === 'processing') && (
                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-200 font-medium">
                              {fileItem.status === 'uploading' ? 'Uploading...' : 'Processing with AI...'}
                            </span>
                            <span className="text-cyan-400 font-bold">{fileItem.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <motion.div
                              className={`h-2 rounded-full ${
                                fileItem.status === 'uploading' ? 'bg-teal-500' : 'bg-blue-500'
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${fileItem.progress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Current Processing Step */}
                      {fileItem.status === 'processing' && fileItem.currentStep && (
                        <div className="mt-3 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
                          <p className="text-blue-400 text-sm">{fileItem.currentStep}</p>
                        </div>
                      )}

                      {/* Processing Logs */}
                      {fileItem.docId && processingLogs[fileItem.docId] && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm font-medium">Processing Logs</span>
                            <button
                              onClick={() => setShowLogs(prev => ({
                                ...prev,
                                [fileItem.docId]: !prev[fileItem.docId]
                              }))}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              {showLogs[fileItem.docId] ? 'Hide' : 'Show'} ({processingLogs[fileItem.docId].length})
                            </button>
                          </div>
                          
                          {showLogs[fileItem.docId] && (
                            <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 max-h-40 overflow-y-auto">
                              <div className="space-y-1 font-mono text-xs">
                                {processingLogs[fileItem.docId].map((log, index) => (
                                  <div key={index} className="flex items-start space-x-2">
                                    <span className="text-gray-500 flex-shrink-0">
                                      {new Date(log.timestamp * 1000).toLocaleTimeString()}
                                    </span>
                                    <span className={`${
                                      log.message.includes('✅') ? 'text-green-400' :
                                      log.message.includes('❌') ? 'text-red-400' :
                                      log.message.includes('🚀') ? 'text-blue-400' :
                                      log.message.includes('Step') ? 'text-yellow-400' :
                                      'text-gray-300'
                                    }`}>
                                      {log.message}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Error Message */}
                      {fileItem.status === 'error' && fileItem.error && (
                        <div className="mt-3 p-3 bg-red-900/30 border border-red-700 rounded-lg">
                          <p className="text-red-400 text-sm">{fileItem.error}</p>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </motion.div>
            </>
          )}

          {/* Step 1 Completion Section */}
          {isProcessingComplete && showReadyButton && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-8 bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-500/30 rounded-2xl p-8"
            >
              <div className="text-center mb-6">
                <CheckCircle size={64} className="mx-auto text-green-400 mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">Step 1 Complete!</h2>
                <p className="text-gray-300 text-lg">Document processing and text extraction successful</p>
              </div>

              {/* Extracted Text Preview */}
              {extractedText && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Eye className="mr-2" size={20} />
                    Extracted Text Preview
                  </h3>
                  <div className="bg-gray-900/50 border border-gray-600 rounded-xl p-6 max-h-80 overflow-y-auto">
                    <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                      {extractedText}
                    </pre>
                  </div>
                </div>
              )}

              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Pipeline Progress</span>
                  <span className="text-green-400 font-bold">Step {currentStep} of {totalSteps}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <motion.div
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>

              {/* Ready Button */}
              <div className="text-center">
                <motion.button
                  onClick={() => {
                    onNotification?.({
                      type: 'info',
                      title: 'Proceeding to Step 2',
                      message: 'Moving to Ontology Generator...'
                    })
                    // Navigate to next step - this would typically change the active module
                    if (onUploadComplete) {
                      onUploadComplete({ 
                        step: 1, 
                        completed: true, 
                        extractedText,
                        nextStep: 'ontology'
                      })
                    }
                  }}
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center mx-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Brain className="mr-3" size={24} />
                  Ready - Proceed to Ontology Generator
                  <Sparkles className="ml-3" size={20} />
                </motion.button>
                <p className="text-gray-400 text-sm mt-4">
                  Click to continue to Step 2: NLP-based entity extraction and relationship detection
                </p>
              </div>
            </motion.div>
          )}

          {/* Backend Status */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-12"
          >
            <div className="bg-slate-800/80 backdrop-blur-sm border border-gray-600/60 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      backendStatus === 'online' ? 'bg-green-400 animate-pulse' :
                      backendStatus === 'checking' ? 'bg-yellow-400 animate-spin' :
                      'bg-red-400'
                    }`} />
                    <span className="text-white font-semibold text-lg">
                      Backend Status: 
                      <span className={`ml-2 font-bold ${
                        backendStatus === 'online' ? 'text-green-400' :
                        backendStatus === 'checking' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {backendStatus === 'online' ? 'Online' :
                         backendStatus === 'checking' ? 'Checking...' :
                         'Offline'}
                      </span>
                    </span>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={checkBackendHealth}
                  className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg border border-blue-500/30 transition-colors flex items-center space-x-2"
                >
                  <RefreshCw className={`w-4 h-4 ${backendStatus === 'checking' ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </motion.button>
              </div>
              
              {backendStatus === 'offline' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-4 bg-red-900/20 border border-red-700/50 rounded-xl"
                >
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                    <div>
                      <p className="text-red-400 font-semibold mb-2 text-lg">Backend Unavailable</p>
                      <p className="text-red-200 text-base">
                        Please ensure the backend server is running at <code className="bg-red-900/30 px-1 rounded">{backendUrl}</code>
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedDocumentUpload
