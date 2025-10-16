import React, { useState, useRef } from 'react'
import { Upload, FileText, Eye, CheckCircle, AlertCircle, ArrowLeft, Download, Loader } from 'lucide-react'

const OCRTestComponent = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedText, setExtractedText] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain']
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a PDF, image, or text file')
        return
      }
      setSelectedFile(file)
      setError('')
    }
  }

  const testOCR = async () => {
    if (!selectedFile) return
    
    setIsProcessing(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('http://localhost:8000/api/test-ocr', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`OCR test failed: ${response.status}`)
      }

      const result = await response.json()
      setExtractedText(result.extracted_text || 'OCR completed - no text found')
      
    } catch (err) {
      setError(err.message)
      // Fallback demo text
      setExtractedText(`Demo OCR Result for ${selectedFile.name}:\n\nThis is simulated OCR output. Backend may be unavailable.\n\nFile: ${selectedFile.name}\nType: ${selectedFile.type}\nSize: ${(selectedFile.size / 1024).toFixed(2)} KB`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="premium-card mb-6">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="btn-secondary">
            <ArrowLeft size={18} />
            Back
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <Eye size={20} className="text-white" />
            </div>
            <div>
              <h1 className="section-title">OCR Test</h1>
              <p className="text-muted">Test document text extraction</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload */}
      <div className="premium-card mb-6">
        <h3 className="section-title mb-4">Upload File</h3>
        
        <div className="drop-zone" onClick={() => fileInputRef.current?.click()}>
          <Upload size={48} className="mx-auto text-blue-400 mb-4" />
          <h4 className="section-subtitle">{selectedFile ? selectedFile.name : 'Select File'}</h4>
          <p className="text-muted">PDF, JPG, PNG, TXT supported</p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
            <AlertCircle size={16} className="text-red-400 inline mr-2" />
            <span className="text-red-400">{error}</span>
          </div>
        )}
        
        <button
          onClick={testOCR}
          disabled={!selectedFile || isProcessing}
          className="btn-primary mt-4"
        >
          {isProcessing ? <Loader className="w-4 h-4 animate-spin" /> : <Eye size={16} />}
          {isProcessing ? 'Processing...' : 'Test OCR'}
        </button>
      </div>

      {/* Results */}
      {extractedText && (
        <div className="premium-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Extracted Text</h3>
            <button className="btn-secondary">
              <Download size={16} />
              Download
            </button>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap">{extractedText}</pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default OCRTestComponent
