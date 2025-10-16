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
  Sparkles,
  CloudUpload
} from 'lucide-react'

const LightThemeDocumentUpload = ({ 
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
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [backendStatus, setBackendStatus] = useState('checking')
  const [backendUrl] = useState('http://localhost:8000')
  const [processingLogs, setProcessingLogs] = useState({})
  const [showLogs, setShowLogs] = useState({})
  const [showProcessing, setShowProcessing] = useState(false)
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
    const interval = setInterval(checkBackendHealth, 10000)
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
        return <FileText size={24} className="file-icon document" />
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image size={24} className="file-icon image" />
      case 'zip':
      case 'rar':
        return <Archive size={24} className="file-icon archive" />
      default:
        return <File size={24} className="file-icon default" />
    }
  }

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
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    setFiles(prev => [...prev, ...droppedFiles])
  }, [])

  // Handle file selection
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    setFiles(prev => [...prev, ...selectedFiles])
  }

  // Remove file from list
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Clear all files
  const clearFiles = () => {
    setFiles([])
    setUploadProgress({})
    setProcessingJobs({})
  }

  // Upload files
  const uploadFiles = async () => {
    if (files.length === 0) {
      onNotification?.({
        type: 'warning',
        title: 'No Files Selected',
        message: 'Please select files to upload first'
      })
      return
    }

    if (backendStatus !== 'online') {
      onNotification?.({
        type: 'error',
        title: 'Backend Offline',
        message: 'Please ensure the backend server is running'
      })
      return
    }

    try {
      setShowProcessing(true)
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('file', file)

        // Update progress
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))

        const response = await fetch(`${backendUrl}/api/upload/document`, {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const result = await response.json()
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
          setUploadedFiles(prev => [...prev, { ...result, filename: file.name }])
          
          onNotification?.({
            type: 'success',
            title: 'Upload Successful',
            message: `${file.name} uploaded successfully`
          })
        } else {
          throw new Error(`Upload failed for ${file.name}`)
        }
      }

      onUploadComplete?.()
      setFiles([])
      
    } catch (error) {
      console.error('Upload error:', error)
      onNotification?.({
        type: 'error',
        title: 'Upload Failed',
        message: error.message || 'Failed to upload files'
      })
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="light-document-upload">
      <div className="upload-container">
        {/* Header */}
        <div className="upload-header">
          <div className="header-content">
            <div className="header-info">
              <h1>Document Intelligence</h1>
              <p>Upload and process documents with AI-powered extraction and real-time analysis</p>
            </div>
            
            <div className="header-stats">
              <div className="stat-item">
                <div className="stat-icon">
                  <Brain size={20} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">AI-Powered</span>
                  <span className="stat-value">Extraction</span>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon">
                  <Activity size={20} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Real-time</span>
                  <span className="stat-value">Processing</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Zone */}
        <motion.div
          className={`upload-zone ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="upload-content">
            <motion.div
              className="upload-icon-container"
              animate={{ y: isDragging ? -5 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <CloudUpload size={64} className="upload-icon" />
            </motion.div>
            
            <div className="upload-text">
              <h3>Drop files here or click to browse</h3>
              <p>Support for PDF, DOC, DOCX, TXT, and image files</p>
            </div>
            
            <div className="upload-features">
              <div className="feature-item">
                <CheckCircle size={16} />
                <span>Batch processing</span>
              </div>
              <div className="feature-item">
                <CheckCircle size={16} />
                <span>Progress tracking</span>
              </div>
              <div className="feature-item">
                <CheckCircle size={16} />
                <span>Real-time updates</span>
              </div>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
          />
        </motion.div>

        {/* File List */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              className="file-list"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="file-list-header">
                <h3>Selected Files ({files.length})</h3>
                <div className="file-actions">
                  <button className="btn btn-secondary" onClick={clearFiles}>
                    <Trash2 size={16} />
                    Clear All
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={uploadFiles}
                    disabled={backendStatus !== 'online'}
                  >
                    <Upload size={16} />
                    Upload Files
                  </button>
                </div>
              </div>
              
              <div className="files-grid">
                {files.map((file, index) => (
                  <motion.div
                    key={`${file.name}-${index}`}
                    className="file-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="file-info">
                      {getFileIcon(file.name)}
                      <div className="file-details">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{formatFileSize(file.size)}</span>
                      </div>
                    </div>
                    
                    <div className="file-progress">
                      {uploadProgress[file.name] !== undefined && (
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${uploadProgress[file.name]}%` }}
                          />
                        </div>
                      )}
                    </div>
                    
                    <button
                      className="remove-file"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(index)
                      }}
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Backend Status */}
        <div className="backend-status">
          <div className={`status-indicator ${backendStatus}`}>
            <div className="status-dot" />
            <span>Backend {backendStatus}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .light-document-upload {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          background: #F5F5F5;
          min-height: 100vh;
        }

        .upload-container {
          background: #FFFFFF;
          border-radius: 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        .upload-header {
          background: linear-gradient(135deg, #007BFF 0%, #0056b3 100%);
          color: white;
          padding: 2rem;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .header-info h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .header-info p {
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .header-stats {
          display: flex;
          gap: 2rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          padding: 1rem;
          border-radius: 0.75rem;
          backdrop-filter: blur(10px);
        }

        .stat-icon {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.5rem;
          border-radius: 0.5rem;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.875rem;
          opacity: 0.8;
        }

        .stat-value {
          font-weight: 600;
          font-size: 1rem;
        }

        .upload-zone {
          margin: 2rem;
          border: 2px dashed #DDDDDD;
          border-radius: 1rem;
          padding: 3rem;
          text-align: center;
          background: #FAFAFA;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .upload-zone:hover {
          border-color: #007BFF;
          background: #E3F2FD;
        }

        .upload-zone.dragging {
          border-color: #007BFF;
          background: #E3F2FD;
          border-width: 3px;
        }

        .upload-icon-container {
          margin-bottom: 1.5rem;
        }

        .upload-icon {
          color: #007BFF;
        }

        .upload-text h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #333333;
          margin-bottom: 0.5rem;
        }

        .upload-text p {
          color: #666666;
          margin-bottom: 1.5rem;
        }

        .upload-features {
          display: flex;
          justify-content: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #28A745;
          font-weight: 500;
        }

        .file-list {
          margin: 0 2rem 2rem;
          border: 1px solid #E5E5E5;
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .file-list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          background: #F8F9FA;
          border-bottom: 1px solid #E5E5E5;
        }

        .file-list-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #333333;
        }

        .file-actions {
          display: flex;
          gap: 1rem;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: #007BFF;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0056b3;
          transform: translateY(-1px);
        }

        .btn-primary:disabled {
          background: #CCCCCC;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #F8F9FA;
          color: #666666;
          border: 1px solid #E5E5E5;
        }

        .btn-secondary:hover {
          background: #E9ECEF;
        }

        .files-grid {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .file-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #FFFFFF;
          border: 1px solid #E5E5E5;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
        }

        .file-item:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }

        .file-icon.document { color: #DC3545; }
        .file-icon.image { color: #28A745; }
        .file-icon.archive { color: #FFC107; }
        .file-icon.default { color: #666666; }

        .file-details {
          display: flex;
          flex-direction: column;
        }

        .file-name {
          font-weight: 500;
          color: #333333;
        }

        .file-size {
          font-size: 0.875rem;
          color: #666666;
        }

        .file-progress {
          flex: 1;
          max-width: 200px;
        }

        .progress-bar {
          width: 100%;
          height: 4px;
          background: #E5E5E5;
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #007BFF;
          transition: width 0.3s ease;
        }

        .remove-file {
          background: none;
          border: none;
          color: #666666;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.25rem;
          transition: all 0.2s ease;
        }

        .remove-file:hover {
          background: #F8F9FA;
          color: #DC3545;
        }

        .backend-status {
          padding: 1rem 2rem;
          border-top: 1px solid #E5E5E5;
          background: #F8F9FA;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-indicator.online .status-dot {
          background: #28A745;
        }

        .status-indicator.offline .status-dot {
          background: #DC3545;
        }

        .status-indicator.checking .status-dot {
          background: #FFC107;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @media (max-width: 768px) {
          .light-document-upload {
            padding: 1rem;
          }

          .header-content {
            flex-direction: column;
            text-align: center;
          }

          .header-stats {
            flex-direction: column;
            gap: 1rem;
          }

          .upload-zone {
            margin: 1rem;
            padding: 2rem 1rem;
          }

          .upload-features {
            flex-direction: column;
            gap: 1rem;
          }

          .file-list-header {
            flex-direction: column;
            gap: 1rem;
          }

          .file-actions {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}

export default LightThemeDocumentUpload
