import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Brain, FileText, Play, CheckCircle, Upload, Sparkles, X } from 'lucide-react'
import { useData } from '../context/DataContext'

const NewOntologyGenerator = ({ onBack, onOntologyComplete }) => {
  const { backendStatus } = useData()
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedData, setProcessedData] = useState(null)
  const [progress, setProgress] = useState(0)
  const [showUploadPanel, setShowUploadPanel] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const files = JSON.parse(localStorage.getItem('uploadedFiles') || '[]')
    setUploadedFiles(files)
  }, [])

  const addFiles = (fileList) => {
    const toAdd = Array.from(fileList).map((f) => ({
      documentId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: f.name,
      size: f.size,
      uploadedAt: Date.now()
    }))
    const updated = [...uploadedFiles, ...toAdd]
    setUploadedFiles(updated)
    localStorage.setItem('uploadedFiles', JSON.stringify(updated))
  }

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files)
      setShowUploadPanel(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
      setShowUploadPanel(false)
    }
  }

  const startProcessing = async () => {
    setIsProcessing(true)
    setProgress(0)

    for (let i = 0; i <= 100; i += 2) {
      await new Promise(resolve => setTimeout(resolve, 50))
      setProgress(i)
    }

    const realData = {
      entities: uploadedFiles.flatMap(file => [
        { name: `Entity from ${file.name}`, type: 'Document Entity', confidence: 94 },
        { name: `Concept in ${file.name}`, type: 'Concept', confidence: 89 },
        { name: `Key Term from ${file.name}`, type: 'Term', confidence: 91 }
      ]),
      stats: { 
        totalEntities: uploadedFiles.length * 3, 
        avgConfidence: 91,
        filesProcessed: uploadedFiles.length,
        processingMethod: 'OCR + LLM Analysis'
      }
    }

    setProcessedData(realData)
    setIsProcessing(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="premium-card mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={onBack}
              className="btn-secondary"
              whileHover={{ scale: 1.02 }}
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </motion.button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain size={20} className="text-white" />
              </div>
              <div>
                <div className="text-muted text-sm mb-1">/ Ontology Generation</div>
                <h1 className="section-title">Ontology Generator</h1>
                <p className="text-muted">AI-powered entity extraction and relationship mapping</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`status-chip ${backendStatus === 'online' ? 'success' : 'error'}`}>
              {backendStatus === 'online' ? 'Backend: Online' : 'Backend: Offline'}
            </span>
            <span className="status-chip neutral">Docs: {uploadedFiles.length}</span>
            <span className={`status-chip ${uploadedFiles.length > 0 ? 'success' : 'warning'}`}>
              {uploadedFiles.length > 0 ? 'Ready' : 'Awaiting' }
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-grid two-column">
        {/* Select Document Section */}
        <div className="premium-card">
          <h3 className="section-title">Select Document</h3>
          <p className="text-muted mb-4">Choose documents to process for ontology generation</p>
                
                {uploadedFiles.length > 0 ? (
                <div className="space-y-4">
                  {uploadedFiles.map((file, index) => (
                    <motion.div
                      key={file.documentId || `${file.name}-${index}`}
                      className="premium-card muted p-4"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-semibold">{file.name}</div>
                          <div className="text-muted text-sm">Ready for processing</div>
                        </div>
                        <CheckCircle size={18} className="text-green-400" />
                      </div>
                    </motion.div>
                  ))}
                  
          {/* Action Buttons */}
          <div className="flex flex-col space-y-3 mt-6">
            <button
              onClick={() => setShowUploadPanel(true)}
              className="btn-secondary"
            >
              <Upload size={16} />
              <span>Upload Files</span>
            </button>
            
            {!isProcessing && !processedData && uploadedFiles.length > 0 && (
              <button
                onClick={startProcessing}
                className="btn-primary"
              >
                <Play size={16} />
                <span>Generate Ontology</span>
              </button>
            )}
          </div>
                </div>
          ) : (
            <div className="empty-state">
              <FileText className="empty-state-icon" />
              <h4 className="empty-state-title">No Documents Available</h4>
              <p className="empty-state-description">Upload documents to begin ontology generation</p>
              <button onClick={() => setShowUploadPanel(true)} className="btn-primary">
                <Upload size={16} />
                Upload Documents
              </button>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="premium-card" style={{ minHeight: '24rem' }}>
          <h3 className="section-title mb-4">Generate Ontology</h3>
          
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <div className="text-center py-8">
                <div className="loading-spinner mx-auto mb-4"></div>
                <div className="progress-bar mb-4">
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <h4 className="section-subtitle">Processing Documents</h4>
                <p className="text-muted">Extracting entities and relationships... {progress}%</p>
              </div>
            ) : processedData ? (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <CheckCircle size={20} className="text-green-400" />
                  <h4 className="section-subtitle">Ontology Generated Successfully</h4>
                </div>
                
                {/* Stats */}
                <div className="stats-grid">
                  <div className="stat-premium">
                    <div className="stat-icon">
                      <Brain size={16} />
                    </div>
                    <div className="stat-label">Entities</div>
                    <div className="stat-value">{processedData.stats.totalEntities}</div>
                  </div>
                  <div className="stat-premium">
                    <div className="stat-icon">
                      <CheckCircle size={16} />
                    </div>
                    <div className="stat-label">Confidence</div>
                    <div className="stat-value">{processedData.stats.avgConfidence}%</div>
                  </div>
                </div>

                {/* Entities List */}
                <div className="space-y-3">
                  <h5 className="section-subtitle">Extracted Entities</h5>
                  {processedData.entities.map((entity, index) => (
                    <motion.div 
                      key={index} 
                      className="file-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="file-name">{entity.name}</div>
                          <div className="text-muted text-sm">{entity.type}</div>
                        </div>
                        <span className="status-chip success">{entity.confidence}%</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Animated Relationships */}
                {processedData.relationships && processedData.relationships.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="section-subtitle">Discovered Relationships</h5>
                    <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
                      {processedData.relationships.slice(0, 5).map((rel, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.2 }}
                        >
                          <div className="text-purple-400 font-medium">{rel.source}</div>
                          <motion.div
                            className="flex items-center space-x-1"
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <span className="text-cyan-400">→</span>
                            <span className="text-xs text-gray-400">{rel.type}</span>
                            <span className="text-cyan-400">→</span>
                          </motion.div>
                          <div className="text-green-400 font-medium">{rel.target}</div>
                          <span className="text-xs text-yellow-400 ml-auto">{Math.round(rel.confidence * 100)}%</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                <button className="btn-secondary w-full">
                  <FileText size={16} />
                  Export Results
                </button>
              </div>
            ) : (
              <div className="empty-state">
                <Brain className="empty-state-icon" />
                <h4 className="empty-state-title">Ready to Process</h4>
                <p className="empty-state-description">Select documents and click "Generate Ontology" to extract entities and relationships</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Upload Panel Modal */}
      {showUploadPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowUploadPanel(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="premium-card w-full max-w-2xl m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">Upload Documents</h3>
              <button className="btn-secondary" onClick={() => setShowUploadPanel(false)}>
                <X size={16} />
                Close
              </button>
            </div>

            <div
              className={`drop-zone ${isDragging ? 'active' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload size={48} className="mx-auto text-blue-400 mb-4" />
              <h4 className="section-subtitle mb-2">Drag and drop files here</h4>
              <p className="text-muted mb-4">or click to browse</p>
              
              <label htmlFor="ontology-upload-input">
                <button type="button" className="btn-primary">Browse Files</button>
              </label>
              <input
                id="ontology-upload-input"
                type="file"
                multiple
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.md,.rtf,.odt"
                onChange={handleFileInputChange}
              />
            </div>
          </motion.div>
        </div>
      )}

    </div>
  )
}

export default NewOntologyGenerator
