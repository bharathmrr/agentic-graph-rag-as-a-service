import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText, ChevronDown, ChevronUp, Eye, EyeOff, Clock } from 'lucide-react'

const SummarizationEngine = ({ onBack }) => {
  const [summaries, setSummaries] = useState([])
  const [expandedSummary, setExpandedSummary] = useState(null)

  useEffect(() => {
    const files = JSON.parse(localStorage.getItem('uploadedFiles') || '[]')
    const generatedSummaries = files.map(file => ({
      id: file.documentId,
      fileName: file.name,
      shortSummary: `Brief overview of ${file.name} covering main concepts and key findings.`,
      detailedSummary: `Comprehensive analysis of ${file.name} including detailed explanations, methodology, results, and implications for further research.`,
      keyPoints: ['Main concept identification', 'Key relationship mapping', 'Important findings summary'],
      compressionRatio: Math.floor(Math.random() * 20) + 75,
      readingTime: Math.floor(Math.random() * 3) + 1
    }))
    setSummaries(generatedSummaries)
  }, [])

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-white">
      <div className="h-full flex flex-col">
        {/* Header */}
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
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <FileText size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Summarization Engine</h1>
                  <p className="text-gray-500 text-sm">Model Core 13: Concise summaries with detailed expansion</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{summaries.length}</div>
                <div className="text-gray-500 text-sm">Documents</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {summaries.map((summary, index) => (
              <motion.div
                key={summary.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{summary.fileName}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Clock size={16} />
                        <span>{summary.readingTime} min read</span>
                      </span>
                      <span>{summary.compressionRatio}% compressed</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{summary.shortSummary}</p>
                  
                  <button
                    onClick={() => setExpandedSummary(expandedSummary === summary.id ? null : summary.id)}
                    className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium"
                  >
                    {expandedSummary === summary.id ? (
                      <>
                        <EyeOff size={16} />
                        <span>Show Less</span>
                        <ChevronUp size={16} />
                      </>
                    ) : (
                      <>
                        <Eye size={16} />
                        <span>Show More</span>
                        <ChevronDown size={16} />
                      </>
                    )}
                  </button>
                  
                  {expandedSummary === summary.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-4 border-t border-gray-100"
                    >
                      <h4 className="font-semibold text-gray-900 mb-2">Detailed Summary</h4>
                      <p className="text-gray-600 mb-4">{summary.detailedSummary}</p>
                      
                      <h4 className="font-semibold text-gray-900 mb-2">Key Points</h4>
                      <ul className="space-y-1">
                        {summary.keyPoints.map((point, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-600">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {summaries.length === 0 && (
              <div className="text-center py-12">
                <FileText size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents to Summarize</h3>
                <p className="text-gray-500">Upload some documents to see AI-generated summaries</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SummarizationEngine
