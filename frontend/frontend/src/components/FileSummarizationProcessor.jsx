import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText,
  Upload,
  Brain,
  Download,
  Eye,
  Search,
  Zap,
  CheckCircle,
  Loader,
  FileSearch,
  BarChart3,
  Terminal,
  Play,
  Copy,
  Save,
  AlertCircle
} from 'lucide-react'

/**
 * Step 12: Enhanced File Summarization Processor
 * 
 * Features:
 * - File upload and automatic summarization
 * - Progress tracking with visual indicators
 * - Summary viewing and downloading
 * - Live query console for data interrogation
 * - Split file processing stats
 */
const FileSummarizationProcessor = ({ onNotification, onProcessingComplete }) => {
  // Step 12 specific states
  const [currentStep, setCurrentStep] = useState(12)
  const [totalSteps] = useState(12)
  const [isStep12Complete, setIsStep12Complete] = useState(false)
  const [showReadyButton, setShowReadyButton] = useState(false)
  const [processingStats, setProcessingStats] = useState({})
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processProgress, setProcessProgress] = useState(0)
  const [summary, setSummary] = useState(null)
  const [summaryStats, setSummaryStats] = useState(null)
  const [showSummary, setShowSummary] = useState(false)
  const [queryMode, setQueryMode] = useState(false)
  const [queryText, setQueryText] = useState('')
  const [queryResults, setQueryResults] = useState([])
  const [liveConsoleActive, setLiveConsoleActive] = useState(false)
  
  const fileInputRef = useRef(null)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setUploadedFile(file)
      setSummary(null)
      setShowSummary(false)
      setQueryResults([])
      
      onNotification?.({
        type: 'info',
        title: 'File Selected',
        message: `${file.name} ready for processing`
      })
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      setUploadedFile(file)
      setSummary(null)
      setShowSummary(false)
    }
  }

  const startSummarization = async () => {
    if (!uploadedFile) {
      onNotification?.({
        type: 'error',
        title: 'No File',
        message: 'Please select a file to summarize'
      })
      return
    }

    setIsProcessing(true)
    setProcessProgress(0)

    try {
      // Read file content
      const text = await uploadedFile.text()
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProcessProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 300)

      // Call summarization API
      const response = await fetch('http://127.0.0.1:8000/v2/files/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doc_id: `doc_${Date.now()}`,
          text: text,
          chunk_size: 1000,
          overlap: 100
        })
      })

      clearInterval(progressInterval)
      setProcessProgress(100)

      const data = await response.json()

      if (data.success && data.data) {
        // Extract summary from response
        const summaryText = data.data.summary || 'Summary generated successfully.'
        const stats = {
          original_bytes: data.data.processed_bytes || text.length,
          summary_file: data.data.summary_file,
          chunks_stored: data.data.chroma?.stored || 0,
          processing_time: data.data.processing_ms || data.processing_ms
        }

        setSummary(summaryText)
        setSummaryStats(stats)
        setShowSummary(true)

        onNotification?.({
          type: 'success',
          title: 'Summarization Complete',
          message: `Processed ${stats.original_bytes} bytes in ${stats.processing_time}ms`
        })
      } else {
        throw new Error(data.error || 'Summarization failed')
      }

    } catch (error) {
      console.error('Summarization error:', error)
      
      // Fallback: Generate basic summary
      const text = await uploadedFile.text()
      const words = text.split(/\s+/)
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
      
      const fallbackSummary = `
📄 Document Summary (Fallback Mode)

File: ${uploadedFile.name}
Size: ${(uploadedFile.size / 1024).toFixed(2)} KB
Words: ${words.length}
Sentences: ${sentences.length}

Key Content Preview:
${sentences.slice(0, 3).join('. ')}...

Note: This is a basic extraction. For AI-powered summarization, ensure the backend API is available.
      `.trim()

      setSummary(fallbackSummary)
      setSummaryStats({
        original_bytes: uploadedFile.size,
        summary_file: 'fallback_summary.txt',
        chunks_stored: 0,
        processing_time: 0
      })
      setShowSummary(true)

      onNotification?.({
        type: 'warning',
        title: 'Fallback Summary',
        message: 'Using basic extraction - API unavailable'
      })
    } finally {
      setIsProcessing(false)
      setTimeout(() => setProcessProgress(0), 1000)
    }
  }

  const downloadSummary = () => {
    if (!summary) return

    const blob = new Blob([summary], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `summary_${uploadedFile.name}_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)

    onNotification?.({
      type: 'success',
      title: 'Downloaded',
      message: 'Summary file downloaded'
    })
  }

  const copySummary = () => {
    if (!summary) return
    navigator.clipboard.writeText(summary)
    onNotification?.({
      type: 'success',
      title: 'Copied',
      message: 'Summary copied to clipboard'
    })
  }

  const executeQuery = () => {
    if (!queryText.trim() || !summary) return

    // Simple query execution - search in summary
    const query = queryText.toLowerCase()
    const summaryLines = summary.split('\n')
    const matches = summaryLines.filter(line => 
      line.toLowerCase().includes(query)
    )

    const result = {
      query: queryText,
      matches: matches.length,
      results: matches.slice(0, 5),
      timestamp: new Date().toLocaleTimeString()
    }

    setQueryResults(prev => [result, ...prev].slice(0, 10))
    setQueryText('')

    onNotification?.({
      type: 'info',
      title: 'Query Executed',
      message: `Found ${matches.length} matches`
    })
  }

  return (
    <div className="file-summarization-container">
      {/* Header */}
      <div className="fsp-header">
        <div className="header-left">
          <div className="header-icon">
            <FileText className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">File Summarization Processor</h2>
            <p className="text-sm text-gray-400">Upload • Analyze • Summarize • Query</p>
          </div>
        </div>
      </div>

      <div className="fsp-content">
        {/* Upload Section */}
        {!uploadedFile && (
          <div
            className="upload-zone"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Upload File to Summarize</h3>
            <p className="text-gray-400 text-sm mb-4">
              Drop file here or click to browse
            </p>
            <p className="text-gray-500 text-xs">
              Supports: TXT, PDF, DOC, MD, JSON
            </p>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept=".txt,.pdf,.doc,.docx,.md,.json"
            />
          </div>
        )}

        {/* File Info & Process */}
        {uploadedFile && !showSummary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="file-info-card"
          >
            <div className="file-details">
              <FileText className="w-12 h-12 text-blue-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">{uploadedFile.name}</h3>
                <p className="text-gray-400 text-sm">
                  Size: {(uploadedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>

            {isProcessing ? (
              <div className="processing-indicator">
                <div className="progress-bar">
                  <motion.div
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${processProgress}%` }}
                  />
                </div>
                <div className="processing-status">
                  <Loader className="w-5 h-5 animate-spin text-blue-400" />
                  <span>Processing and summarizing... {processProgress}%</span>
                </div>
              </div>
            ) : (
              <button onClick={startSummarization} className="process-btn">
                <Brain className="w-5 h-5" />
                Start Summarization
              </button>
            )}

            <button 
              onClick={() => {
                setUploadedFile(null)
                setSummary(null)
              }}
              className="change-file-btn"
            >
              Change File
            </button>
          </motion.div>
        )}

        {/* Summary Display */}
        {showSummary && summary && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="summary-display"
          >
            <div className="summary-header">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Summary Generated
              </h3>
              <div className="summary-actions">
                <button onClick={copySummary} className="action-btn" title="Copy">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={downloadSummary} className="action-btn" title="Download">
                  <Download className="w-4 h-4" />
                </button>
                <button onClick={() => setQueryMode(!queryMode)} className="action-btn" title="Query">
                  <Terminal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stats */}
            {summaryStats && (
              <div className="summary-stats">
                <div className="stat-item">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  <span className="stat-label">Original Size:</span>
                  <span className="stat-value">{(summaryStats.original_bytes / 1024).toFixed(2)} KB</span>
                </div>
                <div className="stat-item">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="stat-label">Processing Time:</span>
                  <span className="stat-value">{summaryStats.processing_time}ms</span>
                </div>
                <div className="stat-item">
                  <Save className="w-4 h-4 text-green-400" />
                  <span className="stat-label">Chunks Stored:</span>
                  <span className="stat-value">{summaryStats.chunks_stored}</span>
                </div>
              </div>
            )}

            {/* Summary Text */}
            <div className="summary-content">
              <pre>{summary}</pre>
            </div>

            {/* Live Query Console */}
            {queryMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="query-console"
              >
                <div className="console-header">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Live Query Console</span>
                </div>

                <div className="query-input-area">
                  <input
                    type="text"
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && executeQuery()}
                    placeholder="Search in summary..."
                    className="query-input"
                  />
                  <button onClick={executeQuery} className="query-btn">
                    <Play className="w-4 h-4" />
                  </button>
                </div>

                {queryResults.length > 0 && (
                  <div className="query-results">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">
                      Query Results ({queryResults.length})
                    </h4>
                    {queryResults.map((result, idx) => (
                      <div key={idx} className="result-item">
                        <div className="result-header">
                          <Search className="w-3 h-3 text-cyan-400" />
                          <span className="result-query">"{result.query}"</span>
                          <span className="result-time">{result.timestamp}</span>
                        </div>
                        <div className="result-matches">
                          {result.matches} matches found
                        </div>
                        {result.results.length > 0 && (
                          <div className="result-preview">
                            {result.results.slice(0, 2).map((line, i) => (
                              <div key={i} className="result-line">{line}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            <button
              onClick={() => {
                setUploadedFile(null)
                setSummary(null)
                setShowSummary(false)
                setQueryResults([])
              }}
              className="new-file-btn"
            >
              <Upload className="w-4 h-4" />
              Process New File
            </button>
          </motion.div>
        )}
      </div>

      <style jsx>{`
        .file-summarization-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: rgba(15, 23, 42, 0.9);
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .fsp-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem;
          background: rgba(30, 41, 59, 0.6);
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2));
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .fsp-content {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }

        .upload-zone {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          border: 2px dashed rgba(148, 163, 184, 0.3);
          border-radius: 16px;
          background: rgba(30, 41, 59, 0.3);
          cursor: pointer;
          transition: all 0.3s;
        }

        .upload-zone:hover {
          border-color: rgba(16, 185, 129, 0.5);
          background: rgba(30, 41, 59, 0.5);
        }

        .file-info-card {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 16px;
          padding: 2rem;
          border: 1px solid rgba(148, 163, 184, 0.2);
        }

        .file-details {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .processing-indicator {
          margin: 2rem 0;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #10b981);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .processing-status {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #94a3b8;
          font-size: 0.875rem;
        }

        .process-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          width: 100%;
          padding: 1rem;
          border-radius: 12px;
          background: linear-gradient(135deg, #10b981, #059669);
          border: none;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          margin-bottom: 1rem;
        }

        .process-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(16, 185, 129, 0.4);
        }

        .change-file-btn, .new-file-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem;
          border-radius: 8px;
          background: rgba(148, 163, 184, 0.1);
          border: 1px solid rgba(148, 163, 184, 0.2);
          color: #94a3b8;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .change-file-btn:hover, .new-file-btn:hover {
          background: rgba(148, 163, 184, 0.2);
          color: #f8fafc;
        }

        .summary-display {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 16px;
          padding: 1.5rem;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .summary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }

        .summary-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          padding: 0.5rem;
          border-radius: 8px;
          background: rgba(148, 163, 184, 0.1);
          border: 1px solid rgba(148, 163, 184, 0.2);
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: rgba(148, 163, 184, 0.2);
          color: #f8fafc;
        }

        .summary-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          font-size: 0.875rem;
        }

        .stat-label {
          color: #94a3b8;
        }

        .stat-value {
          color: #f8fafc;
          font-weight: 600;
          margin-left: auto;
        }

        .summary-content {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          max-height: 400px;
          overflow-y: auto;
        }

        .summary-content pre {
          color: #e2e8f0;
          line-height: 1.6;
          white-space: pre-wrap;
          word-wrap: break-word;
          margin: 0;
          font-size: 0.875rem;
        }

        .query-console {
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .console-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #22d3ee;
          font-weight: 600;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .query-input-area {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .query-input {
          flex: 1;
          padding: 0.75rem;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(148, 163, 184, 0.2);
          color: #f8fafc;
          font-size: 0.875rem;
        }

        .query-btn {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          background: rgba(6, 182, 212, 0.2);
          border: 1px solid rgba(6, 182, 212, 0.3);
          color: #22d3ee;
          cursor: pointer;
          transition: all 0.2s;
        }

        .query-btn:hover {
          background: rgba(6, 182, 212, 0.3);
        }

        .query-results {
          max-height: 300px;
          overflow-y: auto;
        }

        .result-item {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          padding: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .result-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .result-query {
          color: #22d3ee;
          font-weight: 500;
          font-size: 0.875rem;
        }

        .result-time {
          margin-left: auto;
          color: #94a3b8;
          font-size: 0.75rem;
        }

        .result-matches {
          color: #94a3b8;
          font-size: 0.8125rem;
          margin-bottom: 0.5rem;
        }

        .result-preview {
          padding-left: 1rem;
        }

        .result-line {
          color: #e2e8f0;
          font-size: 0.75rem;
          padding: 0.25rem 0;
          border-left: 2px solid rgba(6, 182, 212, 0.3);
          padding-left: 0.5rem;
          margin: 0.25rem 0;
        }

        .new-file-btn {
          margin-top: 1rem;
        }
      `}</style>
    </div>
  )
}

export default FileSummarizationProcessor
