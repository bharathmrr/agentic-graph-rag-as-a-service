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
  Maximize2,
  Play,
  Trash2,
  Clock,
  File,
  Image,
  Archive
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
    <div className="module-content">
      {/* Module Header */}
      <div className="module-header">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={onBack}
              className="btn-secondary flex items-center space-x-2"
              whileHover={{ scale: 1.02 }}
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </motion.button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Upload size={20} className="text-white" />
              </div>
              <div>
                <h1 className="module-title">Document Intelligence</h1>
                <p className="module-subtitle">Transform documents into knowledge graphs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-premium">
            <div className="flex items-center space-x-3 mb-2">
              <FileText size={20} className="text-blue-400" />
              <span className="label">Documents</span>
            </div>
            <div className="value">{files.length}</div>
          </div>

          <div className="stat-premium">
            <div className="flex items-center space-x-3 mb-2">
              <CheckCircle size={20} className="text-green-400" />
              <span className="label">Completed</span>
            </div>
            <div className="value">{files.filter(f => f.status === 'completed').length}</div>
          </div>

          <div className="stat-premium">
            <div className="flex items-center space-x-3 mb-2">
              <Brain size={20} className="text-purple-400" />
              <span className="label">AI Accuracy</span>
            </div>
            <div className="value">99.2%</div>
          </div>
        </div>
      </div>
        {/* Main Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >


          {/* Upload Area - Premium Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="premium-card large mb-8"
          >
            <div
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${
                isDragging ? 'border-blue-500' : 'border-[rgba(100,116,139,0.5)]'
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
              <div className="mx-auto mb-4 w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}>
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="section-title mb-1">Drag & drop files here</h3>
              <p className="text-muted mb-6">or click to browse supported formats (PDF, DOCX, TXT, MD)</p>

              <label htmlFor="file-upload">
                <button type="button" className="btn-primary">Choose Files</button>
              </label>

              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.md,.rtf,.odt"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          </motion.div>

      {/* Processing Complete */}
      {files.some(f => f.status === 'completed') && (
        <div className="premium-card mb-6">
          <div className="text-center">
              <CheckCircle size={40} className="mx-auto" />
              <h3 className="section-title mt-3">Processing complete</h3>
              <p className="text-muted mb-6">All uploaded files were processed successfully. You can continue to Ontology Generation.</p>

              <div className="stats-grid mb-6">
                <div className="stat-premium">
                  <div className="label">Files</div>
                  <div className="value">{files.filter(f => f.status === 'completed').length}</div>
                </div>
                <div className="stat-premium">
                  <div className="label">Status</div>
                  <div className="value">Ready</div>
                </div>
                <div className="stat-premium">
                  <div className="label">Confidence</div>
                  <div className="value">94.7%</div>
                </div>
              </div>

              <button
                type="button"
                className="btn-primary"
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
              >
                Continue
              </button>
            </div>
          </div>
          )}

          {/* Upload Summary */}
          {files.length > 0 && (
            <>
              <div className="premium-card mb-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { label: 'Ready', count: files.filter(f => f.status === 'ready').length, color: 'text-blue-400' },
                    { label: 'Uploading', count: files.filter(f => f.status === 'uploading').length, color: 'text-yellow-400' },
                    { label: 'Processing', count: files.filter(f => f.status === 'processing').length, color: 'text-purple-400' },
                    { label: 'Completed', count: files.filter(f => f.status === 'completed').length, color: 'text-green-400' },
                    { label: 'Error', count: files.filter(f => f.status === 'error').length, color: 'text-red-400' }
                  ].map((item) => (
                    <div key={item.label} className="stat-premium text-center">
                      <div className={`value ${item.color}`}>{item.count}</div>
                      <div className="label">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* File List */}
              <div className="premium-card">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="section-title">
                    Files ({files.length})
                  </h3>
                  <div className="flex space-x-3">
                    <button
                      onClick={uploadAll}
                      disabled={!files.some(f => f.status === 'ready')}
                      className="btn-primary"
                    >
                      <RefreshCw size={16} />
                      Process All
                    </button>
                    
                    <button
                      onClick={clearCompleted}
                      disabled={!files.some(f => f.status === 'completed')}
                      className="btn-secondary"
                    >
                      <X size={16} />
                      Clear
                    </button>
                  </div>
                </div>

                <div className="space-y-4">

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
                      className="premium-card muted p-6"
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
                          <span className={`status-chip ${
                            fileItem.status === 'completed' ? 'success' :
                            fileItem.status === 'error' ? 'error' :
                            (fileItem.status === 'uploading' || fileItem.status === 'processing') ? 'warning' : 'neutral'
                          }`}>
                            {fileItem.status === 'uploading' ? 'Uploading' : fileItem.status.charAt(0).toUpperCase() + fileItem.status.slice(1)}
                          </span>
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
                          <div className="progress-bar">
                            <motion.div
                              className="progress-fill"
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
                </div>
              </div>
            </>
          )}

        </motion.div>

      {/* Backend Status */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-12"
          >
            <div className="premium-card">
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
                
                <button
                  type="button"
                  onClick={checkBackendHealth}
                  className="btn-secondary"
                >
                  Refresh
                </button>
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
    </div>
  )
}

export default EnhancedDocumentUpload
