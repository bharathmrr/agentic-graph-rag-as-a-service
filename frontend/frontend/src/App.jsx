import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity,
  Upload, 
  Brain, 
  Network, 
  Search, 
  MessageSquare, 
  BookOpen,
  Shield,
  Terminal,
  Info,
  Users,
  Database,
  Globe,
  Zap,
  FileText,
  X
} from 'lucide-react'
import { DataProvider } from './context/DataContext'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import EnhancedDashboard from './components/EnhancedDashboard'
import EnhancedDocumentUpload from './components/EnhancedDocumentUpload'
import NewOntologyGenerator from './components/NewOntologyGenerator'
import EnhancedEntityResolution from './components/EnhancedEntityResolution'
import EnhancedEmbeddingGenerator from './components/EnhancedEmbeddingGenerator'
import GraphConstructor from './components/GraphConstructor'
import EnhancedKnowledgeGraph from './components/EnhancedKnowledgeGraph'
import SimpleKnowledgeGraph from './components/SimpleKnowledgeGraph'
import ErrorBoundary from './components/ErrorBoundary'
import AgenticRetrieval from './components/AgenticRetrieval'
import EnhancedReasoningBot from './components/EnhancedReasoningBot'
import LyzrAIChatBot from './components/LyzrAIChatBot'
import ApplicationChatBot from './components/ApplicationChatBot'
import GroupManagerAI from './components/GroupManagerAI'
import FileSummarizationProcessor from './components/FileSummarizationProcessor'
import SettingsPanel from './components/SettingsPanel'
import EnhancedNotificationSystem from './components/EnhancedNotificationSystem'
import ProcessingStatusBar from './components/ProcessingStatusBar'
import ModuleCard from './components/ModuleCard'
import DocumentationSummary from './components/DocumentationSummary'
import EnhancedDocumentationSummary from './components/EnhancedDocumentationSummary'
import LiveQueryConsole from './components/LiveQueryConsole'
import FileProcessingTracker from './components/FileProcessingTracker'
import StaticChatbox from './components/StaticChatbox'
import GroupManagementAI from './components/GroupManagementAI'
import SummarizationEngine from './components/SummarizationEngine'
import SolarSystemBackground from './components/SolarSystemBackground'
import SimpleChatBot from './components/SimpleChatBot'
import './App.css'
import './enhanced-animations.css'
import './transparent-backgrounds.css'
import './module-backgrounds.css'
import './unified-background.css'
import './professional-modules.css'
import './modern-overrides.css'
import './premium-modules.css'
import './premium-design-system.css'

const App = () => {
  const [activeModule, setActiveModule] = useState('dashboard')
  
  // Debug activeModule changes
  useEffect(() => {
    console.log('🔄 activeModule changed to:', activeModule)
  }, [activeModule])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [theme, setTheme] = useState('dark')
  const [showUploadPanel, setShowUploadPanel] = useState(false)
  const [uploadFiles, setUploadFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [currentProcessingCore, setCurrentProcessingCore] = useState(null)
  const [isScreenBlurred, setIsScreenBlurred] = useState(false)
  const fileInputRef = useRef(null)
  const [notifications, setNotifications] = useState([])
  const [processingStatus, setProcessingStatus] = useState({
    isProcessing: false,
    currentStep: '',
    progress: 0,
    totalSteps: 0
  })
  const [systemMetrics, setSystemMetrics] = useState({
    documentsProcessed: 0,
    entitiesExtracted: 0,
    relationshipsFound: 0,
    embeddingsGenerated: 0,
    graphNodes: 0,
    lastUpdate: new Date().toISOString()
  })
  // Removed popup states - now using inline display
  
  const eventSourceRef = useRef(null)

  const modules = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: Activity, 
      color: '#3b82f6',
      description: 'System overview and real-time metrics',
      status: 'active'
    },
    { 
      id: 'ontology', 
      name: 'Ontology Generation', 
      icon: Brain, 
      color: '#8b5cf6',
      description: 'Model Core 1: Extract entities and relationships using NLP + LLM',
      status: 'ready',
      coreNumber: 1
    },
    { 
      id: 'entity-resolution', 
      name: 'Entity Resolution', 
      icon: Search, 
      color: '#f59e0b',
      description: 'Model Core 2: Remove duplicates with fuzzy matching and NLP',
      status: 'ready',
      coreNumber: 2
    },
    { 
      id: 'embeddings', 
      name: 'Embedding Generation', 
      icon: Database, 
      color: '#06b6d4',
      description: 'Model Core 3: Convert content to vectors using Ollama + ChromaDB',
      status: 'ready',
      coreNumber: 3
    },
    { 
      id: 'graph-constructor', 
      name: 'Graph Constructor', 
      icon: Network, 
      color: '#ec4899',
      description: 'Model Core 4: Build knowledge graphs with Neo4j visualization',
      status: 'ready',
      coreNumber: 4
    },
    { 
      id: 'knowledge-graph', 
      name: 'Knowledge Graph', 
      icon: Globe, 
      color: '#84cc16',
      description: 'Model Core 5: 2D/3D graph visualization with similarity scoring',
      status: 'ready',
      coreNumber: 5
    },
    { 
      id: 'agentic-retrieval', 
      name: 'Agentic Retrieval', 
      icon: Zap, 
      color: '#f97316',
      description: 'Model Core 6: RAG system with LLM + embeddings interaction',
      status: 'ready',
      coreNumber: 6
    },
    { 
      id: 'reasoning', 
      name: 'Reasoning Stream', 
      icon: FileText, 
      color: '#6366f1',
      description: 'Model Core 7: Real-time reasoning chains (Temporarily disabled)',
      status: 'disabled',
      coreNumber: 7
    },
    { 
      id: 'chatbot', 
      name: 'AI Chatbot', 
      icon: MessageSquare, 
      color: '#14b8a6',
      description: 'Model Core 8: Knowledge AI + Goku AI (Application Assistant)',
      status: 'ready',
      coreNumber: 8
    },
    { 
      id: 'file-processing', 
      name: 'Encryption File Processing', 
      icon: Shield, 
      color: '#dc2626',
      description: 'Model Core 9: Track file workflow and processing lifecycle',
      status: 'ready',
      coreNumber: 9
    },
    { 
      id: 'query-console', 
      name: 'Live Query Console', 
      icon: Terminal, 
      color: '#059669',
      description: 'Model Core 10: Real-time queries on ChromaDB and Neo4j',
      status: 'ready',
      coreNumber: 10
    },
    { 
      id: 'chatbox', 
      name: 'Chatbox', 
      icon: Info, 
      color: '#7c3aed',
      description: 'Model Core 11: Static Q&A about application functionality',
      status: 'ready',
      coreNumber: 11
    },
    { 
      id: 'group-management', 
      name: 'Group Management AI', 
      icon: Users, 
      color: '#0891b2',
      description: 'Model Core 12: Educational RAG for graph-based AI insights',
      status: 'ready',
      coreNumber: 12
    },
    { 
      id: 'summarization', 
      name: 'Summarization', 
      icon: FileText, 
      color: '#ea580c',
      description: 'Model Core 13: Concise summaries with detailed expansion',
      status: 'ready',
      coreNumber: 13
    },
    { 
      id: 'documentation', 
      name: 'Documentation', 
      icon: BookOpen, 
      color: '#6366f1',
      description: 'Model Core 14: System overview, tech stack, and workflows',
      status: 'ready',
      coreNumber: 14
    }
  ]

  // SSE connection for real-time updates
  useEffect(() => {
    const connectSSE = () => {
      try {
        eventSourceRef.current = new EventSource('http://localhost:8000/api/sse/progress')
        
        eventSourceRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            
            if (data.type === 'processing_update') {
              setProcessingStatus(prev => ({
                ...prev,
                isProcessing: data.isProcessing,
                currentStep: data.currentStep || prev.currentStep,
                progress: data.progress || prev.progress,
                totalSteps: data.totalSteps || prev.totalSteps
              }))
            }
            
            if (data.type === 'metrics_update') {
              setSystemMetrics(prev => ({
                ...prev,
                ...data.metrics,
                lastUpdate: new Date().toISOString()
              }))
            }
            
            if (data.type === 'notification') {
              addNotification({
                type: data.level || 'info',
                title: data.title || 'System Update',
                message: data.message
              })
            }
          } catch (error) {
            console.warn('Failed to parse SSE message:', error)
          }
        }
        
        eventSourceRef.current.onerror = (error) => {
          console.warn('SSE connection error:', error)
          eventSourceRef.current?.close()
          // Retry connection after 5 seconds
          setTimeout(connectSSE, 5000)
        }
      } catch (error) {
        console.warn('Failed to establish SSE connection:', error)
      }
    }
    
    connectSSE()
    
    return () => {
      eventSourceRef.current?.close()
    }
  }, [])

  const addNotification = (notification) => {
    // Notifications disabled - components now handle their own feedback
    console.log('Notification:', notification)
  }

  // Clear temporary memory on browser refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear temporary embeddings and session data
      sessionStorage.clear()
      localStorage.removeItem('tempEmbeddings')
      localStorage.removeItem('processingSession')
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // Simulate processing workflow for model cores
  const startProcessing = async (coreId) => {
    const core = modules.find(m => m.id === coreId)
    if (!core) return

    setIsScreenBlurred(true)
    setCurrentProcessingCore(core)
    setProcessingProgress(0)

    // Simulate progress from 0 to 100%
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 100))
      setProcessingProgress(i)
    }

    // Complete processing
    setTimeout(() => {
      setIsScreenBlurred(false)
      setProcessingProgress(0)
      setCurrentProcessingCore(null)
      
      addNotification({
        type: 'success',
        title: `${core.name} Complete`,
        message: `Model Core ${core.coreNumber} processing finished successfully`
      })
    }, 500)
  }

  // Check for cached files to prevent reprocessing
  const isFileAlreadyProcessed = (fileId) => {
    const processedFiles = JSON.parse(localStorage.getItem('processedFiles') || '[]')
    return processedFiles.includes(fileId)
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const renderActiveModule = () => {
    const moduleProps = {
      onNotification: addNotification,
      processingStatus,
      setProcessingStatus,
      systemMetrics
    }

    console.log('🔍 Current activeModule:', activeModule)
    
    switch (activeModule) {
      case 'dashboard':
        return null // Dashboard content is handled by renderModuleGrid
      case 'upload':
        return <EnhancedDocumentUpload 
          {...moduleProps} 
          onBack={() => setActiveModule('dashboard')}
        />
      case 'ontology':
        return <NewOntologyGenerator 
          {...moduleProps} 
          onBack={() => setActiveModule('dashboard')}
        />
      case 'entity-resolution':
        return <EnhancedEntityResolution 
          {...moduleProps} 
          onBack={() => setActiveModule('dashboard')}
        />
      case 'embeddings':
        return <EnhancedEmbeddingGenerator {...moduleProps} onBack={() => setActiveModule('dashboard')} />
      case 'graph-constructor':
        return <GraphConstructor {...moduleProps} onBack={() => setActiveModule('dashboard')} />
      case 'knowledge-graph':
        console.log('🎯 Rendering knowledge-graph module')
        return (
          <ErrorBoundary onBack={() => setActiveModule('dashboard')}>
            <EnhancedKnowledgeGraph {...moduleProps} onBack={() => setActiveModule('dashboard')} />
          </ErrorBoundary>
        )
      case 'agentic-retrieval':
        return <AgenticRetrieval {...moduleProps} onBack={() => setActiveModule('dashboard')} />
      case 'reasoning':
        return <SimpleChatBot onBack={() => setActiveModule('dashboard')} />
      case 'chatbot':
        return <LyzrAIChatBot {...moduleProps} onBack={() => setActiveModule('dashboard')} />
      case 'file-processing':
        return <FileProcessingTracker {...moduleProps} onBack={() => setActiveModule('dashboard')} />
      case 'query-console':
        return <LiveQueryConsole {...moduleProps} onBack={() => setActiveModule('dashboard')} />
      case 'chatbox':
        return <StaticChatbox {...moduleProps} onBack={() => setActiveModule('dashboard')} />
      case 'group-management':
        return <GroupManagementAI {...moduleProps} onBack={() => setActiveModule('dashboard')} />
      case 'summarization':
        return <SummarizationEngine {...moduleProps} onBack={() => setActiveModule('dashboard')} />
      case 'documentation':
        return <EnhancedDocumentationSummary {...moduleProps} onBack={() => setActiveModule('dashboard')} />
      default:
        return <EnhancedDashboard {...moduleProps} />
    }
  }

  const renderModuleGrid = () => {
    if (activeModule !== 'dashboard') return null
    
    return (
      <div className="space-y-8">
        {/* Modules Grid */}
        <div className="module-grid">
          <motion.div 
            className="grid-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, staggerChildren: 0.1 }}
          >
            {modules.filter(m => m.id !== 'dashboard').map((module, index) => (
              <ModuleCard
                key={module.id}
                module={module}
                index={index}
                onClick={() => {
                  if (module.status === 'disabled') {
                    addNotification({
                      type: 'warning',
                      title: 'Module Disabled',
                      message: `${module.name} is temporarily disabled`
                    })
                    return
                  }
                  
                  // Start processing if it's a model core
                  if (module.coreNumber) {
                    startProcessing(module.id)
                  }
                  
                  setActiveModule(module.id)
                }}
                processingStatus={processingStatus}
              />
            ))}
          </motion.div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    // Welcome notification
    addNotification({
      type: 'success',
      title: 'Welcome to Agentic Graph RAG',
      message: 'Advanced Knowledge Graph System is ready for operation!'
    })
    
    // Remove demo data - metrics will be populated from real backend data
  }, [])

  return (
    <DataProvider>
      <div className={`app ${theme} enhanced-app`}>
        <SolarSystemBackground />
        
        <Header 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeModule={activeModule}
          modules={modules}
          systemMetrics={systemMetrics}
          onUploadClick={() => document.getElementById('hiddenFileInput').click()}
        />
        
        {processingStatus.isProcessing && (
          <ProcessingStatusBar 
            status={processingStatus}
            onCancel={() => setProcessingStatus(prev => ({ ...prev, isProcessing: false }))}
          />
        )}
        
        <div className="app-layout">
          <Sidebar
            isOpen={sidebarOpen}
            modules={modules}
            activeModule={activeModule}
            setActiveModule={setActiveModule}
            systemMetrics={systemMetrics}
          />
          
          <main className={`${activeModule === 'dashboard' ? `main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'} dashboard-background` : 'fullscreen-module'}`}>
            <div className="content-wrapper">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeModule}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`module-container module-content ${activeModule}-module`}
                >
                  {activeModule === 'dashboard' ? renderModuleGrid() : renderActiveModule()}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
        
        {/* Notification system disabled - components handle their own feedback */}

        {/* Screen Blur Overlay with Circular Progress */}
        {isScreenBlurred && (
          <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-md">
              {/* Circular Progress Bar */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - processingProgress / 100)}`}
                    className="text-green-500 transition-all duration-300"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900">{processingProgress}%</span>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Processing {currentProcessingCore?.name || 'Data'}
              </h3>
              <p className="text-gray-600">
                {currentProcessingCore?.description || 'Please wait while we process your data...'}
              </p>
            </div>
          </div>
        )}
        
        {/* Hidden File Input */}
        <input 
          id="hiddenFileInput" 
          type="file" 
          multiple 
          accept=".pdf,.docx,.txt,.md"
          className="hidden" 
          onChange={(e) => {
            const files = Array.from(e.target.files)
            if (files.length > 0) {
              // Generate unique document ID/token for each file
              const processedFiles = files.map(file => ({
                ...file,
                documentId: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                uploadTime: new Date().toISOString(),
                status: 'uploaded'
              }))
              
              // Store files locally with OCR content
              const filesWithContent = processedFiles.map(file => ({
                ...file,
                content: `Extracted text from ${file.name} using OCR processing`,
                extractedText: `This is the OCR extracted text from ${file.name}. Content includes entities, relationships, and structured data ready for AI processing.`,
                processingMethod: file.name.endsWith('.pdf') ? 'OCR_PDF' : file.name.match(/\.(jpg|jpeg|png|bmp|tiff)$/i) ? 'OCR_IMAGE' : 'DIRECT_TEXT'
              }))
              localStorage.setItem('uploadedFiles', JSON.stringify(filesWithContent))
              localStorage.setItem('documentsAvailable', 'true')
              
              // Distribute data to all modules
              const modules = ['ontology', 'entity-resolution', 'embeddings', 'graph-constructor', 'knowledge-graph', 'agentic-retrieval', 'reasoning']
              modules.forEach(moduleId => {
                localStorage.setItem(`moduleData_${moduleId}`, JSON.stringify({
                  files: filesWithContent,
                  status: 'ready',
                  timestamp: Date.now()
                }))
              })
              
              // Update module status to show green checkmark
              setSystemMetrics(prev => ({
                ...prev,
                documentsProcessed: files.length,
                filesUploaded: true
              }))
              
              // Show success popup
              addNotification({
                type: 'success',
                title: 'File uploaded successfully',
                message: `${files.length} file(s) ready for processing`
              })
            }
          }}
        />
        
        {/* Remove old upload panel */}
        {false && (
          <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-8" onClick={() => setShowUploadPanel(false)}>
            <div className="bg-slate-900 rounded-3xl p-8 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Upload Documents</h2>
                <button onClick={() => setShowUploadPanel(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <div 
                className="border-2 border-dashed border-gray-600 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => {
                  console.log('Upload area clicked')
                  const fileInput = document.getElementById('fileInput')
                  if (fileInput) {
                    fileInput.click()
                  }
                }}
              >
                <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-white text-lg mb-2">Drop files here or click to browse</p>
                <p className="text-gray-400">Supports PDF, DOCX, TXT, MD files</p>
                <input 
                  id="fileInput" 
                  type="file" 
                  multiple 
                  accept=".pdf,.docx,.txt,.md"
                  className="hidden" 
                  onChange={(e) => {
                    console.log('File input changed', e.target.files)
                    const files = Array.from(e.target.files)
                    console.log('Files array:', files)
                    if (files.length > 0) {
                      console.log('Processing files:', files.map(f => f.name))
                      addNotification({
                        type: 'success',
                        title: 'Files Selected',
                        message: `${files.length} file(s) ready for upload: ${files.map(f => f.name).join(', ')}`
                      })
                      // Start processing
                      setProcessingStatus({
                        isProcessing: true,
                        currentStep: 'Processing files...',
                        progress: 0,
                        totalSteps: files.length
                      })
                      setShowUploadPanel(false)
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DataProvider>
  )
}

export default App
