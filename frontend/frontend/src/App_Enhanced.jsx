import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  Brain, 
  Network, 
  Search, 
  MessageSquare, 
  Settings, 
  Database,
  Activity,
  FileText,
  Zap,
  Globe,
  Shield,
  Terminal,
  Play,
  Pause,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import { DataProvider } from './context/DataContext'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import EnhancedDashboard from './components/EnhancedDashboard'
import EnhancedDocumentUpload from './components/EnhancedDocumentUpload'
import OntologyGenerator from './components/OntologyGenerator'
import EntityResolution from './components/EntityResolution'
import EmbeddingGenerator from './components/EmbeddingGenerator'
import GraphConstructor from './components/GraphConstructor'
import EnhancedKnowledgeGraph from './components/EnhancedKnowledgeGraph'
import AgenticRetrieval from './components/AgenticRetrieval'
import EnhancedReasoningBot from './components/EnhancedReasoningBot'
import LyzrAIChatBot from './components/LyzrAIChatBot'
import SettingsPanel from './components/SettingsPanel'
import LiveQueryConsole from './components/LiveQueryConsole'
import EnhancedBackgroundAnimation from './components/EnhancedBackgroundAnimation'
import NotificationSystem from './components/NotificationSystem'
import ProcessingStatusBar from './components/ProcessingStatusBar'
import ModuleCard from './components/ModuleCard'
import DocumentationSummary from './components/DocumentationSummary'
import './App.css'
import './enhanced-animations.css'

const App = () => {
  const [activeModule, setActiveModule] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [theme, setTheme] = useState('dark')
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
      id: 'upload', 
      name: 'Upload Documents', 
      icon: Upload, 
      color: '#10b981',
      description: 'Upload and process documents with real-time progress',
      status: 'ready'
    },
    { 
      id: 'ontology', 
      name: 'Ontology Generator', 
      icon: Brain, 
      color: '#8b5cf6',
      description: 'Extract entities and relationships using advanced NLP',
      status: 'ready'
    },
    { 
      id: 'entity-resolution', 
      name: 'Entity Resolution', 
      icon: Search, 
      color: '#f59e0b',
      description: 'Detect and resolve duplicate entities with fuzzy matching',
      status: 'ready'
    },
    { 
      id: 'embeddings', 
      name: 'Embedding Generator', 
      icon: Database, 
      color: '#06b6d4',
      description: 'Generate semantic embeddings with ChromaDB integration',
      status: 'ready'
    },
    { 
      id: 'graph-constructor', 
      name: 'Graph Constructor', 
      icon: Network, 
      color: '#ec4899',
      description: 'Build interactive knowledge graphs with Neo4j',
      status: 'ready'
    },
    { 
      id: 'knowledge-graph', 
      name: 'Knowledge Graph', 
      icon: Globe, 
      color: '#84cc16',
      description: 'Visualize and explore your knowledge graph',
      status: 'ready'
    },
    { 
      id: 'agentic-retrieval', 
      name: 'Agentic Retrieval', 
      icon: Zap, 
      color: '#f97316',
      description: 'Multi-strategy retrieval with intelligent agents',
      status: 'ready'
    },
    { 
      id: 'reasoning', 
      name: 'Reasoning Stream', 
      icon: FileText, 
      color: '#6366f1',
      description: 'Advanced RAG with real-time reasoning visualization',
      status: 'ready'
    },
    { 
      id: 'chatbot', 
      name: 'AI ChatBot', 
      icon: MessageSquare, 
      color: '#14b8a6',
      description: 'Conversational AI with context-aware responses',
      status: 'ready'
    },
    { 
      id: 'query-console', 
      name: 'Live Query Console', 
      icon: Terminal, 
      color: '#64748b',
      description: 'Execute queries and commands in real-time',
      status: 'ready'
    },
    { 
      id: 'settings', 
      name: 'Settings', 
      icon: Settings, 
      color: '#64748b',
      description: 'Configure system preferences and integrations',
      status: 'ready'
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
    const id = Date.now() + Math.random()
    setNotifications(prev => [...prev, { ...notification, id }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }

  const renderActiveModule = () => {
    const moduleProps = {
      onNotification: addNotification,
      processingStatus,
      setProcessingStatus,
      systemMetrics
    }

    switch (activeModule) {
      case 'dashboard':
        return <EnhancedDashboard {...moduleProps} />
      case 'upload':
        return <EnhancedDocumentUpload {...moduleProps} />
      case 'ontology':
        return <OntologyGenerator {...moduleProps} />
      case 'entity-resolution':
        return <EntityResolution {...moduleProps} />
      case 'embeddings':
        return <EmbeddingGenerator {...moduleProps} />
      case 'graph-constructor':
        return <GraphConstructor {...moduleProps} />
      case 'knowledge-graph':
        return <EnhancedKnowledgeGraph {...moduleProps} />
      case 'agentic-retrieval':
        return <AgenticRetrieval {...moduleProps} />
      case 'reasoning':
        return <EnhancedReasoningBot {...moduleProps} />
      case 'chatbot':
        return <LyzrAIChatBot {...moduleProps} />
      case 'query-console':
        return <LiveQueryConsole {...moduleProps} />
      case 'settings':
        return <SettingsPanel {...moduleProps} theme={theme} setTheme={setTheme} />
      default:
        return <EnhancedDashboard {...moduleProps} />
    }
  }

  const renderModuleGrid = () => {
    if (activeModule !== 'dashboard') return null
    
    return (
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
              onClick={() => setActiveModule(module.id)}
              processingStatus={processingStatus}
            />
          ))}
        </motion.div>
        
        <DocumentationSummary />
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
    
    // Simulate initial metrics load
    setTimeout(() => {
      setSystemMetrics(prev => ({
        ...prev,
        documentsProcessed: 12,
        entitiesExtracted: 1247,
        relationshipsFound: 892,
        embeddingsGenerated: 3456,
        graphNodes: 1139
      }))
    }, 2000)
  }, [])

  return (
    <DataProvider>
      <div className={`app ${theme} enhanced-app`}>
        <EnhancedBackgroundAnimation />
        
        <Header 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeModule={activeModule}
          modules={modules}
          systemMetrics={systemMetrics}
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
          
          <main className="main-content">
            <div className="content-wrapper">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeModule}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="module-container"
                >
                  {activeModule === 'dashboard' ? renderModuleGrid() : renderActiveModule()}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
        
        <NotificationSystem notifications={notifications} />
        
        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Agentic Graph RAG</h4>
              <p>Advanced Knowledge Graph Processing Platform</p>
            </div>
            <div className="footer-section">
              <h4>Technology Stack</h4>
              <div className="tech-badges">
                <span className="tech-badge">React</span>
                <span className="tech-badge">FastAPI</span>
                <span className="tech-badge">Neo4j</span>
                <span className="tech-badge">ChromaDB</span>
                <span className="tech-badge">OpenAI</span>
              </div>
            </div>
            <div className="footer-section">
              <h4>Status</h4>
              <div className="status-indicators">
                <div className="status-item">
                  <div className="status-dot active"></div>
                  <span>System Online</span>
                </div>
                <div className="status-item">
                  <div className="status-dot active"></div>
                  <span>Real-time Processing</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </DataProvider>
  )
}

export default App
