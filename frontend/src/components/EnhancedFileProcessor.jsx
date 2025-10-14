import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  FileText, 
  Brain, 
  Search, 
  Database, 
  Network, 
  Save,
  CheckCircle, 
  AlertCircle, 
  Loader, 
  Play,
  Eye,
  Download,
  Settings,
  Zap
} from 'lucide-react'

const EnhancedFileProcessor = ({ onNotification }) => {
  const [file, setFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentJob, setCurrentJob] = useState(null)
  const [processingStages, setProcessingStages] = useState([])
  const [results, setResults] = useState({})
  const [selectedProvider, setSelectedProvider] = useState('gemini')
  const [showResults, setShowResults] = useState(false)
  const [providerStatus, setProviderStatus] = useState({})
  
  const fileInputRef = useRef(null)
  const eventSourceRef = useRef(null)

  useEffect(() => {
    checkProviderStatus()
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  const checkProviderStatus = async () => {
    try {
      const response = await fetch('/api/enhanced/providers/status')
      const data = await response.json()
      if (data.success) {
        setProviderStatus(data.providers)
      }
    } catch (error) {
      console.error('Failed to check provider status:', error)
    }
  }

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResults({})
      setShowResults(false)
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const droppedFile = event.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
      setResults({})
      setShowResults(false)
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const startProcessing = async () => {
    if (!file) {
      onNotification?.({
        type: 'error',
        title: 'No File Selected',
        message: 'Please select a file to process'
      })
      return
    }

    setIsProcessing(true)
    setProcessingStages([])
    setResults({})

    try {
      // Upload and start processing
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/enhanced/upload/process', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setCurrentJob(data.job_id)
        startProgressStream(data.job_id)
        
        onNotification?.({
          type: 'success',
          title: 'Processing Started',
          message: `File "${file.name}" is being processed`
        })
      } else {
        throw new Error(data.detail || 'Processing failed')
      }

    } catch (error) {
      console.error('Processing failed:', error)
      setIsProcessing(false)
      onNotification?.({
        type: 'error',
        title: 'Processing Failed',
        message: error.message
      })
    }
  }

  const startProgressStream = (jobId) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    eventSourceRef.current = new EventSource(`/api/enhanced/jobs/${jobId}/progress/stream`)
    
    eventSourceRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.type === 'heartbeat') {
          return // Ignore heartbeat messages
        }

        if (data.job_id || data.job) {
          updateJobProgress(data)
        }

      } catch (error) {
        console.error('Failed to parse progress data:', error)
      }
    }

    eventSourceRef.current.onerror = (error) => {
      console.error('Progress stream error:', error)
      eventSourceRef.current?.close()
      
      // Fallback to polling
      setTimeout(() => pollJobStatus(jobId), 1000)
    }
  }

  const pollJobStatus = async (jobId) => {
    try {
      const response = await fetch(`/api/enhanced/jobs/${jobId}/status`)
      const data = await response.json()
      
      if (data.success) {
        updateJobProgress(data.job)
        
        if (data.job.status === 'running') {
          setTimeout(() => pollJobStatus(jobId), 2000)
        }
      }
    } catch (error) {
      console.error('Failed to poll job status:', error)
    }
  }

  const updateJobProgress = (jobData) => {
    setProcessingStages(jobData.stages || [])
    setResults(jobData.results || {})
    
    if (jobData.status === 'completed') {
      setIsProcessing(false)
      setShowResults(true)
      eventSourceRef.current?.close()
      
      onNotification?.({
        type: 'success',
        title: 'Processing Complete',
        message: 'All modules have finished processing your file!'
      })
    } else if (jobData.status === 'failed') {
      setIsProcessing(false)
      eventSourceRef.current?.close()
      
      onNotification?.({
        type: 'error',
        title: 'Processing Failed',
        message: 'File processing encountered an error'
      })
    }
  }

  const getStageIcon = (stageName) => {
    const icons = {
      upload: FileText,
      ontology: Brain,
      entities: Search,
      embeddings: Database,
      graph: Network,
      storage: Save
    }
    return icons[stageName] || FileText
  }

  const getStageColor = (status) => {
    const colors = {
      pending: 'text-gray-400',
      running: 'text-blue-400',
      completed: 'text-green-400',
      failed: 'text-red-400'
    }
    return colors[status] || 'text-gray-400'
  }

  const exportResults = () => {
    const exportData = {
      filename: file?.name,
      processing_date: new Date().toISOString(),
      provider: selectedProvider,
      results: results
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${file?.name || 'results'}_processed.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="enhanced-file-processor">
      {/* Header */}
      <div className="processor-header enhanced-card">
        <div className="header-content">
          <div className="header-info">
            <h2 className="text-2xl font-bold text-white">Enhanced File Processor</h2>
            <p className="text-gray-400">
              Upload files and process them through all modules with real-time progress tracking
            </p>
          </div>
          
          <div className="provider-selector">
            <label className="text-sm text-gray-300">LLM Provider:</label>
            <select 
              value={selectedProvider} 
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="enhanced-input"
              disabled={isProcessing}
            >
              <option value="gemini" disabled={!providerStatus.gemini?.available}>
                🤖 Gemini {!providerStatus.gemini?.available ? '(API Key Required)' : ''}
              </option>
              <option value="groq" disabled={!providerStatus.groq?.available}>
                ⚡ Groq {!providerStatus.groq?.available ? '(API Key Required)' : ''}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* File Upload Area */}
      <div className="upload-section">
        <div 
          className={`upload-zone enhanced-card ${file ? 'has-file' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.json,.csv"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          <div className="upload-content">
            {file ? (
              <div className="file-info">
                <FileText className="w-12 h-12 text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold text-white">{file.name}</h3>
                <p className="text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                  }}
                  className="mt-2 text-red-400 hover:text-red-300"
                >
                  Remove File
                </button>
              </div>
            ) : (
              <div className="upload-prompt">
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Upload File</h3>
                <p className="text-gray-400 mb-4">
                  Drag & drop your file here or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports: .txt, .md, .json, .csv
                </p>
              </div>
            )}
          </div>
        </div>

        {file && !isProcessing && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={startProcessing}
            className="start-processing-btn enhanced-button"
            disabled={!providerStatus[selectedProvider]?.available}
          >
            <Play className="w-5 h-5 mr-2" />
            Start Processing
          </motion.button>
        )}
      </div>

      {/* Processing Stages */}
      {isProcessing && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="processing-stages enhanced-card"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Processing Pipeline</h3>
          
          <div className="stages-grid">
            {processingStages.map((stage, index) => {
              const StageIcon = getStageIcon(stage.name)
              const colorClass = getStageColor(stage.status)
              
              return (
                <div key={stage.name} className={`stage-item ${stage.status}`}>
                  <div className="stage-header">
                    <div className="stage-icon">
                      <StageIcon className={`w-6 h-6 ${colorClass}`} />
                    </div>
                    <div className="stage-info">
                      <h4 className="font-semibold text-white">{stage.description}</h4>
                      <p className="text-sm text-gray-400 capitalize">{stage.status}</p>
                    </div>
                    <div className="stage-status">
                      {stage.status === 'running' && (
                        <Loader className="w-5 h-5 text-blue-400 animate-spin" />
                      )}
                      {stage.status === 'completed' && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                      {stage.status === 'failed' && (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                  </div>
                  
                  {stage.status === 'running' && (
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${stage.progress}%` }}
                      />
                    </div>
                  )}
                  
                  {stage.error && (
                    <div className="stage-error">
                      <p className="text-red-400 text-sm">{stage.error}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Results Display */}
      {showResults && Object.keys(results).length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="results-section"
        >
          <div className="results-header enhanced-card">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">Processing Results</h3>
              <div className="results-actions">
                <button onClick={exportResults} className="action-btn">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>

          <div className="results-grid">
            {/* Ontology Results */}
            {results.ontology && (
              <ResultCard
                title="🧠 Ontology Generation"
                data={results.ontology}
                type="ontology"
              />
            )}

            {/* Entity Results */}
            {results.entities && (
              <ResultCard
                title="🔍 Entity Extraction"
                data={results.entities}
                type="entities"
              />
            )}

            {/* Embeddings Results */}
            {results.embeddings && (
              <ResultCard
                title="🔢 Embeddings Generation"
                data={results.embeddings}
                type="embeddings"
              />
            )}

            {/* Graph Results */}
            {results.graph && (
              <ResultCard
                title="🕸️ Knowledge Graph"
                data={results.graph}
                type="graph"
              />
            )}
          </div>
        </motion.div>
      )}

      <style jsx>{`
        .enhanced-file-processor {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .processor-header {
          padding: 2rem;
          margin-bottom: 2rem;
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .provider-selector {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .provider-selector select {
          min-width: 200px;
        }
        
        .upload-section {
          margin-bottom: 2rem;
        }
        
        .upload-zone {
          padding: 3rem;
          border: 2px dashed rgba(148, 163, 184, 0.3);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
          margin-bottom: 1rem;
        }
        
        .upload-zone:hover {
          border-color: rgba(59, 130, 246, 0.5);
          background: rgba(59, 130, 246, 0.05);
        }
        
        .upload-zone.has-file {
          border-color: rgba(16, 185, 129, 0.5);
          background: rgba(16, 185, 129, 0.05);
        }
        
        .start-processing-btn {
          width: 100%;
          padding: 1rem 2rem;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .processing-stages {
          padding: 2rem;
          margin-bottom: 2rem;
        }
        
        .stages-grid {
          display: grid;
          gap: 1rem;
        }
        
        .stage-item {
          padding: 1.5rem;
          background: rgba(30, 41, 59, 0.5);
          border-radius: 12px;
          border: 1px solid rgba(148, 163, 184, 0.1);
          transition: all 0.3s ease;
        }
        
        .stage-item.running {
          border-color: rgba(59, 130, 246, 0.3);
          background: rgba(59, 130, 246, 0.05);
        }
        
        .stage-item.completed {
          border-color: rgba(16, 185, 129, 0.3);
          background: rgba(16, 185, 129, 0.05);
        }
        
        .stage-item.failed {
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.05);
        }
        
        .stage-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .stage-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(148, 163, 184, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .stage-info {
          flex: 1;
        }
        
        .progress-bar {
          margin-top: 1rem;
          height: 4px;
          background: rgba(148, 163, 184, 0.2);
          border-radius: 2px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #10b981);
          border-radius: 2px;
          transition: width 0.3s ease;
        }
        
        .stage-error {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 6px;
        }
        
        .results-section {
          margin-top: 2rem;
        }
        
        .results-header {
          padding: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .results-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .action-btn {
          padding: 0.5rem 1rem;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #3b82f6;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
        }
        
        .action-btn:hover {
          background: rgba(59, 130, 246, 0.2);
        }
        
        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1.5rem;
        }
        
        @media (max-width: 768px) {
          .enhanced-file-processor {
            padding: 1rem;
          }
          
          .header-content {
            flex-direction: column;
            align-items: stretch;
          }
          
          .results-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

const ResultCard = ({ title, data, type }) => {
  const [expanded, setExpanded] = useState(false)
  
  const renderContent = () => {
    if (!data || !data.success) {
      return (
        <div className="error-content">
          <AlertCircle className="w-6 h-6 text-red-400 mb-2" />
          <p className="text-red-400">Processing failed</p>
          {data?.error && <p className="text-sm text-gray-400">{data.error}</p>}
        </div>
      )
    }

    switch (type) {
      case 'ontology':
        const ontology = data.ontology || data.result?.ontology
        return (
          <div className="ontology-content">
            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-value">{ontology?.entities?.length || 0}</span>
                <span className="stat-label">Entities</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{ontology?.relationships?.length || 0}</span>
                <span className="stat-label">Relations</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{(ontology?.confidence_score * 100 || 0).toFixed(1)}%</span>
                <span className="stat-label">Confidence</span>
              </div>
            </div>
            {expanded && ontology?.entities && (
              <div className="entity-list">
                <h4 className="text-sm font-semibold text-white mb-2">Entities:</h4>
                {ontology.entities.slice(0, 5).map((entity, idx) => (
                  <div key={idx} className="entity-item">
                    <span className="entity-name">{entity.name}</span>
                    <span className="entity-type">{entity.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'entities':
        const entities = data.entities || data.result?.entities || []
        return (
          <div className="entities-content">
            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-value">{entities.length}</span>
                <span className="stat-label">Found</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{(data.confidence_score * 100 || 0).toFixed(1)}%</span>
                <span className="stat-label">Confidence</span>
              </div>
            </div>
            {expanded && (
              <div className="entity-list">
                {entities.slice(0, 5).map((entity, idx) => (
                  <div key={idx} className="entity-item">
                    <span className="entity-name">{entity.text}</span>
                    <span className="entity-type">{entity.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'embeddings':
        const embeddings = data.embeddings || data.result?.embeddings || []
        return (
          <div className="embeddings-content">
            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-value">{embeddings.length}</span>
                <span className="stat-label">Vectors</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{data.dimensions || embeddings[0]?.dimensions || 0}</span>
                <span className="stat-label">Dimensions</span>
              </div>
            </div>
          </div>
        )

      case 'graph':
        const graph = data.graph || data.result?.graph
        return (
          <div className="graph-content">
            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-value">{graph?.node_count || graph?.nodes?.length || 0}</span>
                <span className="stat-label">Nodes</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{graph?.edge_count || graph?.edges?.length || 0}</span>
                <span className="stat-label">Edges</span>
              </div>
            </div>
          </div>
        )

      default:
        return <div className="text-gray-400">No data available</div>
    }
  }

  return (
    <div className="result-card enhanced-card">
      <div className="card-header">
        <h4 className="card-title">{title}</h4>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="expand-btn"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
      
      <div className="card-content">
        {renderContent()}
      </div>

      <style jsx>{`
        .result-card {
          padding: 1.5rem;
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .card-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #f8fafc;
        }
        
        .expand-btn {
          padding: 0.5rem;
          background: rgba(148, 163, 184, 0.1);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 6px;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .expand-btn:hover {
          background: rgba(148, 163, 184, 0.2);
          color: #f8fafc;
        }
        
        .stats-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.75rem;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 8px;
          flex: 1;
        }
        
        .stat-value {
          font-size: 1.25rem;
          font-weight: 600;
          color: #3b82f6;
        }
        
        .stat-label {
          font-size: 0.75rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .entity-list {
          margin-top: 1rem;
        }
        
        .entity-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          margin-bottom: 0.5rem;
          background: rgba(30, 41, 59, 0.5);
          border-radius: 6px;
        }
        
        .entity-name {
          color: #e2e8f0;
          font-weight: 500;
        }
        
        .entity-type {
          font-size: 0.75rem;
          color: #94a3b8;
          background: rgba(148, 163, 184, 0.2);
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
        }
        
        .error-content {
          text-align: center;
          padding: 1rem;
        }
      `}</style>
    </div>
  )
}

export default EnhancedFileProcessor
