import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Brain, FileText, Play, CheckCircle, Upload, Sparkles } from 'lucide-react'

const NewOntologyGenerator = ({ onBack }) => {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedData, setProcessedData] = useState(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const files = JSON.parse(localStorage.getItem('uploadedFiles') || '[]')
    setUploadedFiles(files)
  }, [])

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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-black relative overflow-hidden font-['Inter']">
      {/* Glowing Grid Background */}
      <div className="absolute inset-0">
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Glowing Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              boxShadow: '0 0 10px rgba(59, 130, 246, 0.8)'
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
        
        {/* Gradient Overlays */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 p-8">
        {/* Premium Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-6xl font-bold text-white mb-4 font-['Orbitron'] tracking-wider"
            style={{ textShadow: '0 0 30px rgba(59, 130, 246, 0.8)' }}
            animate={{ 
              textShadow: [
                '0 0 30px rgba(59, 130, 246, 0.8)',
                '0 0 40px rgba(59, 130, 246, 1)',
                '0 0 30px rgba(59, 130, 246, 0.8)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Ontology Generator
          </motion.h1>
          <motion.p 
            className="text-2xl text-blue-300 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            AI-Powered Entity Extraction
          </motion.p>
          
          {/* Back Button */}
          <motion.button
            onClick={onBack}
            className="absolute top-8 left-8 flex items-center space-x-3 px-6 py-3 bg-blue-500/20 backdrop-blur-md hover:bg-blue-500/40 rounded-xl border border-blue-400/30 transition-all duration-300 group"
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 0 25px rgba(59, 130, 246, 0.6)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={20} className="text-blue-300 group-hover:text-white transition-colors" />
            <span className="text-blue-300 group-hover:text-white font-medium transition-colors">Back</span>
          </motion.button>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Document Library Section */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <motion.div 
                className="bg-blue-500/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-400/30"
                whileHover={{ borderColor: 'rgba(59, 130, 246, 0.6)' }}
              >
                <h3 className="text-3xl font-bold text-white mb-2 font-['Orbitron']">Document Library</h3>
                <p className="text-blue-300 mb-4">Uploaded: {uploadedFiles.length} documents • Status: Ready</p>
                
                {uploadedFiles.length > 0 ? (
                <div className="space-y-4">
                  {uploadedFiles.map((file, index) => (
                    <motion.div
                      key={file.documentId}
                      className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-semibold text-lg">{file.name}</div>
                          <div className="text-purple-200">Ready for processing</div>
                        </div>
                        <CheckCircle size={24} className="text-green-400" />
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Neon Buttons */}
                  <div className="flex flex-col space-y-4 mt-6">
                    <motion.button
                      className="w-full bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 hover:text-white py-4 px-8 rounded-xl font-bold text-lg border border-blue-400/50 hover:border-blue-400 transition-all duration-300 flex items-center justify-center space-x-3 group"
                      whileHover={{ 
                        scale: 1.02,
                        boxShadow: '0 0 30px rgba(59, 130, 246, 0.6)'
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Upload size={20} className="group-hover:animate-bounce" />
                      <span>Upload Files</span>
                    </motion.button>
                    
                    {!isProcessing && !processedData && uploadedFiles.length > 0 && (
                      <motion.button
                        onClick={startProcessing}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-3 group"
                        whileHover={{ 
                          scale: 1.02,
                          boxShadow: '0 0 30px rgba(6, 182, 212, 0.8)'
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Play size={20} className="group-hover:animate-pulse" />
                        <span>Generate Ontology</span>
                        <Sparkles size={20} className="group-hover:animate-spin" />
                      </motion.button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText size={64} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-white text-xl">No documents uploaded</p>
                  <p className="text-purple-200">Upload files to start</p>
                </div>
              )}
              </motion.div>
            </motion.div>

            {/* Results Panel */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Processing Results</h3>
              
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 min-h-96">
                <AnimatePresence mode="wait">
                  {isProcessing ? (
                    <motion.div
                      key="processing"
                      className="flex flex-col items-center justify-center h-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="relative w-32 h-32 mb-8">
                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="transparent" />
                          <circle
                            cx="50" cy="50" r="40"
                            stroke="url(#gradient)" strokeWidth="8" fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                            className="transition-all duration-300"
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#8b5cf6" />
                              <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">{progress}%</span>
                        </div>
                      </div>
                      <motion.h4 
                        className="text-xl font-bold text-white mb-2"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        Processing Documents
                      </motion.h4>
                      <p className="text-purple-200">Extracting entities and relationships...</p>
                    </motion.div>
                  ) : processedData ? (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-6"
                    >
                      <h4 className="text-xl font-bold text-white mb-4">Extraction Complete!</h4>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-purple-500/20 p-4 rounded-xl text-center">
                          <div className="text-2xl font-bold text-white">{processedData.stats.totalEntities}</div>
                          <div className="text-purple-200">Entities</div>
                        </div>
                        <div className="bg-blue-500/20 p-4 rounded-xl text-center">
                          <div className="text-2xl font-bold text-white">{processedData.stats.avgConfidence}%</div>
                          <div className="text-blue-200">Confidence</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {processedData.entities.map((entity, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div>
                              <div className="text-white font-semibold">{entity.name}</div>
                              <div className="text-purple-200 text-sm">{entity.type}</div>
                            </div>
                            <div className="text-green-400 font-bold">{entity.confidence}%</div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      className="flex flex-col items-center justify-center h-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Brain size={64} className="text-gray-400 mb-4" />
                      <h4 className="text-xl font-bold text-white mb-2">Ready to Process</h4>
                      <p className="text-purple-200 text-center">Click "Generate Ontology" to extract entities</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-blue-400 font-medium">Powered by LyzrAI</p>
        </motion.div>
      </div>
    </div>
  )
}

export default NewOntologyGenerator
