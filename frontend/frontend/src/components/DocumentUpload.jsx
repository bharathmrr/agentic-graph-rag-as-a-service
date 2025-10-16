import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Image,
  Archive,
  Loader
} from 'lucide-react'
import { useData } from '../context/DataContext'

const DocumentUpload = ({ onNotification }) => {
  const { uploadDocument, isLoading } = useData()
  const [dragActive, setDragActive] = useState(false)
  const [uploadQueue, setUploadQueue] = useState([])
  const [uploadProgress, setUploadProgress] = useState({})

  const getFileIcon = (fileType) => {
    if (fileType.includes('image')) return Image
    if (fileType.includes('text') || fileType.includes('pdf')) return FileText
    if (fileType.includes('zip') || fileType.includes('rar')) return Archive
    return File
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }, [])

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = async (files) => {
    const validFiles = files.filter(file => {
      const validTypes = [
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/csv',
        'application/json'
      ]
      
      if (!validTypes.includes(file.type)) {
        onNotification({
          type: 'error',
          title: 'Invalid File Type',
          message: `${file.name} is not a supported file type`
        })
        return false
      }
      
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        onNotification({
          type: 'error',
          title: 'File Too Large',
          message: `${file.name} exceeds 50MB limit`
        })
        return false
      }
      
      return true
    })

    if (validFiles.length === 0) return

    // Add files to upload queue
    const newUploads = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      status: 'pending',
      progress: 0,
      error: null
    }))

    setUploadQueue(prev => [...prev, ...newUploads])

    // Process uploads
    for (const upload of newUploads) {
      await processUpload(upload)
    }
  }

  const processUpload = async (upload) => {
    try {
      // Update status to uploading
      setUploadQueue(prev => 
        prev.map(item => 
          item.id === upload.id 
            ? { ...item, status: 'uploading', progress: 0 }
            : item
        )
      )

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadQueue(prev => 
          prev.map(item => {
            if (item.id === upload.id && item.status === 'uploading') {
              const newProgress = Math.min(item.progress + Math.random() * 30, 90)
              return { ...item, progress: newProgress }
            }
            return item
          })
        )
      }, 500)

      // Upload file
      const result = await uploadDocument(upload.file)
      
      clearInterval(progressInterval)

      // Update status to completed
      setUploadQueue(prev => 
        prev.map(item => 
          item.id === upload.id 
            ? { 
                ...item, 
                status: 'completed', 
                progress: 100,
                result: result
              }
            : item
        )
      )

      onNotification({
        type: 'success',
        title: 'Upload Successful',
        message: `${upload.file.name} uploaded successfully`
      })

    } catch (error) {
      // Update status to error
      setUploadQueue(prev => 
        prev.map(item => 
          item.id === upload.id 
            ? { 
                ...item, 
                status: 'error', 
                error: error.message || 'Upload failed'
              }
            : item
        )
      )

      onNotification({
        type: 'error',
        title: 'Upload Failed',
        message: `Failed to upload ${upload.file.name}: ${error.message}`
      })
    }
  }

  const removeFromQueue = (uploadId) => {
    setUploadQueue(prev => prev.filter(item => item.id !== uploadId))
  }

  const retryUpload = async (upload) => {
    await processUpload(upload)
  }

  const clearCompleted = () => {
    setUploadQueue(prev => prev.filter(item => item.status !== 'completed'))
  }

  return (
    <div className="upload-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="upload-header"
      >
        <h2 className="upload-title">
          <Upload className="title-icon" />
          Document Upload
        </h2>
        <p className="upload-subtitle">
          Upload documents to build your knowledge graph
        </p>
      </motion.div>

      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="upload-content">
          <div className="upload-icon">
            <Upload size={48} />
          </div>
          <h3 className="upload-message">
            Drag and drop files here
          </h3>
          <p className="upload-description">
            or click to browse files
          </p>
          <input
            type="file"
            multiple
            onChange={handleFileInput}
            className="file-input"
            accept=".pdf,.txt,.doc,.docx,.csv,.json"
          />
          <button className="browse-button">
            Browse Files
          </button>
        </div>
        
        <div className="supported-formats">
          <span className="formats-label">Supported formats:</span>
          <span className="formats-list">PDF, TXT, DOC, DOCX, CSV, JSON</span>
        </div>
      </motion.div>

      {/* Upload Queue */}
      <AnimatePresence>
        {uploadQueue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="upload-queue"
          >
            <div className="queue-header">
              <h3 className="queue-title">Upload Queue</h3>
              <button 
                onClick={clearCompleted}
                className="clear-button"
              >
                Clear Completed
              </button>
            </div>
            
            <div className="queue-list">
              {uploadQueue.map((upload) => {
                const FileIcon = getFileIcon(upload.file.type)
                
                return (
                  <motion.div
                    key={upload.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="queue-item"
                  >
                    <div className="item-info">
                      <div className="file-icon">
                        <FileIcon size={20} />
                      </div>
                      <div className="file-details">
                        <span className="file-name">{upload.file.name}</span>
                        <span className="file-size">
                          {formatFileSize(upload.file.size)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="item-status">
                      {upload.status === 'pending' && (
                        <div className="status-pending">
                          <Loader size={16} className="spin" />
                          <span>Pending</span>
                        </div>
                      )}
                      
                      {upload.status === 'uploading' && (
                        <div className="status-uploading">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ width: `${upload.progress}%` }}
                            />
                          </div>
                          <span>{Math.round(upload.progress)}%</span>
                        </div>
                      )}
                      
                      {upload.status === 'completed' && (
                        <div className="status-completed">
                          <CheckCircle size={16} />
                          <span>Completed</span>
                        </div>
                      )}
                      
                      {upload.status === 'error' && (
                        <div className="status-error">
                          <AlertCircle size={16} />
                          <span>Failed</span>
                          <button 
                            onClick={() => retryUpload(upload)}
                            className="retry-button"
                          >
                            Retry
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => removeFromQueue(upload.id)}
                      className="remove-button"
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .upload-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0;
        }
        
        .upload-header {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .upload-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-size: 28px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 8px;
        }
        
        .title-icon {
          color: #10b981;
        }
        
        .upload-subtitle {
          font-size: 16px;
          color: #a1a1aa;
          margin: 0;
        }
        
        .upload-zone {
          position: relative;
          background: rgba(255, 255, 255, 0.02);
          border: 2px dashed rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 48px 24px;
          text-align: center;
          transition: all 0.3s ease;
          cursor: pointer;
          margin-bottom: 32px;
        }
        
        .upload-zone:hover,
        .upload-zone.drag-active {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.05);
          transform: translateY(-2px);
        }
        
        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        
        .upload-icon {
          color: #10b981;
          opacity: 0.8;
        }
        
        .upload-message {
          font-size: 20px;
          font-weight: 600;
          color: #ffffff;
          margin: 0;
        }
        
        .upload-description {
          font-size: 14px;
          color: #a1a1aa;
          margin: 0;
        }
        
        .file-input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }
        
        .browse-button {
          background: #10b981;
          color: #ffffff;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .browse-button:hover {
          background: #059669;
          transform: translateY(-1px);
        }
        
        .supported-formats {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 12px;
        }
        
        .formats-label {
          color: #a1a1aa;
          margin-right: 8px;
        }
        
        .formats-list {
          color: #ffffff;
          font-weight: 500;
        }
        
        .upload-queue {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 24px;
        }
        
        .queue-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .queue-title {
          font-size: 18px;
          font-weight: 600;
          color: #ffffff;
          margin: 0;
        }
        
        .clear-button {
          background: transparent;
          color: #a1a1aa;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .clear-button:hover {
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.4);
        }
        
        .queue-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .queue-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }
        
        .item-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }
        
        .file-icon {
          color: #a1a1aa;
        }
        
        .file-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .file-name {
          font-size: 14px;
          font-weight: 500;
          color: #ffffff;
        }
        
        .file-size {
          font-size: 12px;
          color: #a1a1aa;
        }
        
        .item-status {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 120px;
        }
        
        .status-pending,
        .status-uploading,
        .status-completed,
        .status-error {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .status-pending {
          color: #f59e0b;
        }
        
        .status-uploading {
          color: #3b82f6;
        }
        
        .status-completed {
          color: #10b981;
        }
        
        .status-error {
          color: #ef4444;
        }
        
        .progress-bar {
          width: 60px;
          height: 4px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: #3b82f6;
          transition: width 0.3s ease;
        }
        
        .retry-button {
          background: transparent;
          color: #ef4444;
          border: 1px solid #ef4444;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .retry-button:hover {
          background: #ef4444;
          color: #ffffff;
        }
        
        .remove-button {
          background: transparent;
          color: #a1a1aa;
          border: none;
          padding: 4px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .remove-button:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }
        
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default DocumentUpload
