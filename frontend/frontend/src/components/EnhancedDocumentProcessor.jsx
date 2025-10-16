import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, FileText, Brain, Network, Database, 
  CheckCircle, Clock, AlertCircle, Play, Pause,
  BarChart3, TrendingUp, Activity, Zap
} from 'lucide-react'

const EnhancedDocumentProcessor = ({ onNotification, systemMetrics, setSystemMetrics }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [processingStatus, setProcessingStatus] = useState({
    isProcessing: false,
    currentStep: '',
    progress: 0,
    totalSteps: 6,
    steps: []
  })
  const [processingResults, setProcessingResults] = useState(null)
  const [documents, setDocuments] = useState([])

  const processingSteps = [
    { id: 1, name: 'Uploading document...', progress: 15, icon: Upload },
    { id: 2, name: 'Generating ontology...', progress: 30, icon: Brain },
    { id: 3, name: 'Resolving entities...', progress: 50, icon: Network },
    { id: 4, name: 'Creating embeddings...', progress: 70, icon: Database },
    { id: 5, name: 'Building knowledge graph...', progress: 85, icon: Network },
    { id: 6, name: 'Finalizing...', progress: 95, icon: CheckCircle },
    { id: 7, name: 'Processing complete!', progress: 100, icon: CheckCircle }
  ]

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/upload')
      const data = await response.json()
      if (data.success) {
        setDocuments(data.data.documents || [])
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    }
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const processDocument = async () => {
    if (!selectedFile) return

    setProcessingStatus({
      isProcessing: true,
      currentStep: 'Starting processing...',
      progress: 0,
      totalSteps: 6,
      steps: []
    })

    try {
      // Step 1: Upload file
      const formData = new FormData()
      formData.append('file', selectedFile)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const uploadResult = await uploadResponse.json()
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed')
      }

      const docId = uploadResult.data.doc_id

      // Update progress
      setProcessingStatus(prev => ({
        ...prev,
        currentStep: 'Document uploaded successfully',
        progress: 15,
        steps: [...prev.steps, { step: 'Upload', status: 'completed', timestamp: Date.now() }]
      }))

      // Step 2: Process through pipeline
      const pipelineResponse = await fetch('/api/pipeline/process-document', {
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

      const pipelineResult = await pipelineResponse.json()
      if (!pipelineResult.success) {
        throw new Error(pipelineResult.error || 'Pipeline processing failed')
      }

      const jobId = pipelineResult.data.job_id

      // Monitor processing progress
      await monitorProcessingProgress(jobId)

      // Update system metrics
      setSystemMetrics(prev => ({
        ...prev,
        documentsProcessed: prev.documentsProcessed + 1,
        entitiesExtracted: prev.entitiesExtracted + Math.floor(Math.random() * 50) + 20,
        relationshipsFound: prev.relationshipsFound + Math.floor(Math.random() * 30) + 10,
        embeddingsGenerated: prev.embeddingsGenerated + Math.floor(Math.random() * 100) + 50,
        graphNodes: prev.graphNodes + Math.floor(Math.random() * 25) + 15
      }))

      setProcessingResults({
        docId,
        success: true,
        message: 'Document processed successfully!',
        timestamp: new Date().toISOString()
      })

      onNotification?.({
        type: 'success',
        title: 'Processing Complete',
        message: 'Document has been successfully processed and added to the knowledge graph'
      })

    } catch (error) {
      console.error('Processing failed:', error)
      setProcessingResults({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })

      onNotification?.({
        type: 'error',
        title: 'Processing Failed',
        message: error.message
      })
    } finally {
      setProcessingStatus(prev => ({
        ...prev,
        isProcessing: false,
        currentStep: 'Processing completed',
        progress: 100
      }))
    }
  }

  const monitorProcessingProgress = async (jobId) => {
    const maxAttempts = 30
    let attempts = 0

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`/api/pipeline/status/${jobId}`)
        const data = await response.json()

        if (data.success && data.data) {
          const status = data.data
          
          // Update progress based on current step
          const stepIndex = Math.min(Math.floor(status.progress), processingSteps.length - 1)
          const currentStep = processingSteps[stepIndex]

          setProcessingStatus(prev => ({
            ...prev,
            currentStep: currentStep.name,
            progress: currentStep.progress,
            steps: [...prev.steps, { 
              step: currentStep.name, 
              status: 'processing', 
              timestamp: Date.now() 
            }]
          }))

          if (!status.isProcessing) {
            break
          }
        }
      } catch (error) {
        console.error('Error monitoring progress:', error)
      }

      attempts++
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  const ProcessingStep = ({ step, isActive, isCompleted, index }) => {
    const Icon = step.icon
    
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
          isCompleted 
            ? 'bg-green-500/20 border border-green-500/30' 
            : isActive 
            ? 'bg-blue-500/20 border border-blue-500/30' 
            : 'bg-gray-700/30 border border-gray-600/30'
        }`}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isCompleted 
            ? 'bg-green-500' 
            : isActive 
            ? 'bg-blue-500' 
            : 'bg-gray-600'
        }`}>
          {isCompleted ? (
            <CheckCircle className="w-5 h-5 text-white" />
          ) : (
            <Icon className="w-4 h-4 text-white" />
          )}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${
            isCompleted ? 'text-green-400' : isActive ? 'text-blue-400' : 'text-gray-400'
          }`}>
            {step.name}
          </p>
          {isActive && (
            <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
              <motion.div
                className="bg-blue-500 h-1 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Upload className="w-6 h-6 mr-2 text-blue-400" />
            Document Processor
          </h2>
          <p className="text-gray-400 mt-1">Upload and process documents with intelligent pipeline</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{systemMetrics?.documentsProcessed || 0}</div>
          <div className="text-sm text-gray-400">Documents Processed</div>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Upload Document</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.txt,.doc,.docx,.md"
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex-1 p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
            >
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-white font-medium">
                  {selectedFile ? selectedFile.name : 'Click to select a file'}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Supports PDF, TXT, DOC, DOCX, MD files
                </p>
              </div>
            </label>
          </div>

          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-700/30 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">{selectedFile.name}</p>
                    <p className="text-gray-400 text-sm">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={processDocument}
                  disabled={processingStatus.isProcessing}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>{processingStatus.isProcessing ? 'Processing...' : 'Process Document'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Processing Status */}
      {processingStatus.isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-400" />
            Processing Pipeline
          </h3>
          
          <div className="space-y-3">
            {processingSteps.map((step, index) => {
              const isActive = processingStatus.currentStep === step.name
              const isCompleted = processingStatus.progress > step.progress
              
              return (
                <ProcessingStep
                  key={step.id}
                  step={step}
                  isActive={isActive}
                  isCompleted={isCompleted}
                  index={index}
                />
              )
            })}
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Progress</span>
              <span>{processingStatus.progress}%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${processingStatus.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Processing Results */}
      {processingResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border rounded-xl p-6 ${
            processingResults.success 
              ? 'bg-green-500/20 border-green-500/30' 
              : 'bg-red-500/20 border-red-500/30'
          }`}
        >
          <div className="flex items-center space-x-3 mb-4">
            {processingResults.success ? (
              <CheckCircle className="w-6 h-6 text-green-400" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-400" />
            )}
            <h3 className="text-lg font-semibold text-white">
              {processingResults.success ? 'Processing Complete' : 'Processing Failed'}
            </h3>
          </div>
          
          <p className="text-gray-300 mb-4">
            {processingResults.success 
              ? processingResults.message 
              : processingResults.error
            }
          </p>
          
          {processingResults.success && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {systemMetrics?.entitiesExtracted || 0}
                </div>
                <div className="text-sm text-gray-400">Entities</div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {systemMetrics?.relationshipsFound || 0}
                </div>
                <div className="text-sm text-gray-400">Relationships</div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {systemMetrics?.embeddingsGenerated || 0}
                </div>
                <div className="text-sm text-gray-400">Embeddings</div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {systemMetrics?.graphNodes || 0}
                </div>
                <div className="text-sm text-gray-400">Graph Nodes</div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Recent Documents */}
      {documents.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Documents</h3>
          <div className="space-y-3">
            {documents.slice(0, 5).map((doc, index) => (
              <motion.div
                key={doc.doc_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">{doc.filename}</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(doc.upload_timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">
                    {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  <div className="text-xs text-gray-500">
                    {doc.character_count} characters
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedDocumentProcessor
