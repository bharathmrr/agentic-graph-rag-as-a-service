import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, FileText, Check, Loader2, ArrowRight, Brain
} from 'lucide-react'

const ModernDocumentUpload = ({ onNotification, onBack }) => {
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('idle') // idle, uploading, processing, complete
  const [progress, setProgress] = useState(0)
  const [extractedData, setExtractedData] = useState(null)
  const fileInputRef = useRef(null)
  const backendUrl = 'http://localhost:8000'

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
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
    }
  }, [])

  const handleFileSelect = useCallback((e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
    e.target.value = ''
  }, [])

  const uploadFile = async () => {
    if (!file) return

    setUploadStatus('uploading')
    setProgress(0)

    const formData = new FormData()
    formData.append('file', file)

    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const uploadProgress = Math.round((e.loaded / e.total) * 50)
        setProgress(uploadProgress)
      }
    })

    xhr.onload = () => {
      if (xhr.status === 200) {
        setUploadStatus('processing')
        setProgress(60)
        
        const response = JSON.parse(xhr.responseText)
        const docId = response.data?.doc_id

        // Simulate processing steps
        const processSteps = [
          { progress: 70, delay: 500 },
          { progress: 85, delay: 1000 },
          { progress: 95, delay: 800 }
        ]

        let currentStep = 0
        const processInterval = setInterval(() => {
          if (currentStep < processSteps.length) {
            setProgress(processSteps[currentStep].progress)
            currentStep++
          } else {
            clearInterval(processInterval)
            setProgress(100)
            setUploadStatus('complete')
            setExtractedData(response.data)
            
            onNotification?.({
              type: 'success',
              title: 'Processing Complete',
              message: 'Document analyzed successfully!'
            })
          }
        }, 1000)
      } else {
        setUploadStatus('idle')
        setProgress(0)
        onNotification?.({
          type: 'error',
          title: 'Upload Failed',
          message: 'Failed to upload document'
        })
      }
    }

    xhr.onerror = () => {
      setUploadStatus('idle')
      setProgress(0)
      onNotification?.({
        type: 'error',
        title: 'Upload Error',
        message: 'Network error occurred'
      })
    }

    xhr.open('POST', `${backendUrl}/api/upload`)
    xhr.send(formData)
  }

  const resetUpload = () => {
    setFile(null)
    setUploadStatus('idle')
    setProgress(0)
    setExtractedData(null)
  }

  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl"
            style={{ textShadow: '0 0 40px rgba(99, 102, 241, 0.3)' }}
          >
            🚀 Upload Document
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-semibold text-white"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
          >
            Transform your documents into intelligent knowledge graphs
          </motion.p>
        </div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/90 backdrop-blur-xl border-2 border-slate-700 rounded-3xl p-12 shadow-2xl"
          style={{ boxShadow: '0 0 60px rgba(99, 102, 241, 0.2)' }}
        >
          <AnimatePresence mode="wait">
            {uploadStatus === 'idle' && !file && (
              <motion.div
                key="upload-zone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`border-3 border-dashed rounded-2xl p-16 text-center transition-all duration-300 ${
                  isDragging 
                    ? 'border-blue-400 bg-blue-500/20 scale-105 shadow-lg shadow-blue-500/50' 
                    : 'border-slate-500 hover:border-blue-400 hover:bg-slate-800/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <motion.div
                  animate={isDragging ? { scale: 1.2 } : { scale: 1 }}
                  className="mb-8"
                >
                  <Upload className="w-24 h-24 mx-auto text-blue-400" />
                </motion.div>
                
                <h3 className="text-4xl font-bold text-white mb-4" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                  Drop your document here
                </h3>
                <p className="text-gray-300 mb-8 text-xl font-medium" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                  or click to browse files
                </p>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200"
                >
                  Choose File
                </motion.button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.md"
                  onChange={handleFileSelect}
                />
                
                <div className="mt-8 flex justify-center gap-4 text-base font-semibold">
                  <span className="text-red-400">📄 PDF</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-blue-400">📝 DOCX</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-green-400">📃 TXT</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-purple-400">📋 MD</span>
                </div>
              </motion.div>
            )}

            {uploadStatus === 'idle' && file && (
              <motion.div
                key="file-selected"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <FileText className="w-24 h-24 mx-auto text-blue-400 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  {file.name}
                </h3>
                <p className="text-gray-400 mb-8">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
                
                <div className="flex gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={uploadFile}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl flex items-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    Upload & Process
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetUpload}
                    className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            )}

            {(uploadStatus === 'uploading' || uploadStatus === 'processing') && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="mb-8"
                >
                  <Loader2 className="w-24 h-24 mx-auto text-blue-400" />
                </motion.div>
                
                <h3 className="text-3xl font-bold text-white mb-2">
                  {uploadStatus === 'uploading' ? 'Uploading...' : 'Processing Document...'}
                </h3>
                <p className="text-gray-400 mb-8 text-lg">
                  {uploadStatus === 'uploading' 
                    ? 'Transferring file to server' 
                    : 'Extracting text and analyzing content'}
                </p>
                
                <div className="max-w-md mx-auto">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {uploadStatus === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="mb-8"
                >
                  <div className="w-24 h-24 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                    <Check className="w-16 h-16 text-green-400" />
                  </div>
                </motion.div>
                
                <h3 className="text-3xl font-bold text-white mb-2">
                  Processing Complete!
                </h3>
                <p className="text-gray-400 mb-6 text-lg">
                  Document analyzed successfully
                </p>

                {extractedData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-900/50 rounded-xl p-6 mb-8 text-left max-w-2xl mx-auto"
                  >
                    <h4 className="text-lg font-semibold text-blue-400 mb-4">
                      Extracted Data
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-400">
                          {extractedData.character_count || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-400">Characters</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-purple-400">
                          {extractedData.word_count || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-400">Words</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-pink-400">
                          {extractedData.page_count || '1'}
                        </div>
                        <div className="text-sm text-gray-400">Pages</div>
                      </div>
                    </div>
                    
                    {extractedData.text && (
                      <div className="mt-4 bg-slate-800/50 rounded-lg p-4 max-h-32 overflow-y-auto">
                        <p className="text-sm text-gray-300 font-mono">
                          {extractedData.text.substring(0, 300)}...
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
                
                <div className="flex gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.href = '#/ontology'}
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl flex items-center gap-2"
                  >
                    <Brain className="w-5 h-5" />
                    Generate Ontology
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetUpload}
                    className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl"
                  >
                    Upload Another
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default ModernDocumentUpload
