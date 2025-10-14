import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, Code, Server, Layers, Rocket, BookOpen, Database, Network,
  Zap, Search, MessageSquare, Shield, BarChart3, Cpu, Globe, Settings, Maximize2, ArrowLeft
} from 'lucide-react'

const EnhancedDocumentationSummary = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('overview')
  
  const tabs = [
    { id: 'overview', label: 'System Overview', icon: BookOpen },
    { id: 'architecture', label: 'Architecture', icon: Layers },
    { id: 'tech-stack', label: 'Tech Stack', icon: Code },
    { id: 'api', label: 'API Reference', icon: Server }
  ]

  const systemFeatures = [
    { icon: Brain, title: 'AI-Powered Processing', desc: 'Advanced NLP with GPT-4 and local LLMs' },
    { icon: Database, title: 'Multi-Database', desc: 'Neo4j graphs + ChromaDB vectors' },
    { icon: Network, title: 'Knowledge Graphs', desc: 'Interactive D3.js visualizations' },
    { icon: Search, title: 'Hybrid Search', desc: 'Vector + Graph + Logical filtering' },
    { icon: Zap, title: 'Real-time Updates', desc: 'SSE streaming and live progress' },
    { icon: Shield, title: 'Enterprise Security', desc: 'JWT auth and role-based access' }
  ]

  const techStack = {
    'Backend': [
      { name: 'FastAPI', version: '0.104+', desc: 'High-performance async web framework' },
      { name: 'Python', version: '3.9+', desc: 'Modern Python with type hints' },
      { name: 'Neo4j', version: '5.x', desc: 'Graph database for relationships' },
      { name: 'ChromaDB', version: '0.4+', desc: 'Vector embeddings store' }
    ],
    'Frontend': [
      { name: 'React', version: '18+', desc: 'Modern React with hooks' },
      { name: 'Tailwind CSS', version: '3.x', desc: 'Utility-first styling' },
      { name: 'Framer Motion', version: '10+', desc: 'Production animations' },
      { name: 'D3.js', version: '7.x', desc: 'Data visualization' }
    ],
    'AI & ML': [
      { name: 'OpenAI GPT-4', version: 'Latest', desc: 'Advanced language model' },
      { name: 'Ollama', version: '0.1+', desc: 'Local LLM deployment' },
      { name: 'spaCy', version: '3.7+', desc: 'NLP processing pipeline' },
      { name: 'Transformers', version: '4.x', desc: 'Hugging Face models' }
    ]
  }

  const apiCategories = {
    'Document Processing': [
      { method: 'POST', path: '/api/upload', desc: 'Upload and process documents' },
      { method: 'GET', path: '/api/documents/{id}', desc: 'Retrieve document data' }
    ],
    'Knowledge Graph': [
      { method: 'POST', path: '/api/ontology/generate', desc: 'Extract entities and relations' },
      { method: 'GET', path: '/api/graph/visualization', desc: 'Get graph visualization' }
    ],
    'Search & Retrieval': [
      { method: 'POST', path: '/api/search/vector', desc: 'Semantic vector search' },
      { method: 'POST', path: '/api/reasoning/query', desc: 'RAG query execution' }
    ]
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-4">🚀 Agentic Graph RAG Platform</h2>
              <p className="text-xl text-gray-200 max-w-4xl mx-auto">
                Enterprise-grade knowledge management platform combining AI, graph databases, 
                and vector embeddings for intelligent document processing and retrieval.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {systemFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-slate-800/80 rounded-xl p-6 border border-gray-600/40 backdrop-blur-sm"
                  whileHover={{ scale: 1.02, y: -2 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <feature.icon className="w-8 h-8 text-cyan-400 mb-3" />
                  <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-300 text-sm">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-900/40 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">99.9%</div>
                <div className="text-blue-300 text-sm">Uptime</div>
              </div>
              <div className="bg-green-900/40 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">&lt;100ms</div>
                <div className="text-green-300 text-sm">Response Time</div>
              </div>
              <div className="bg-purple-900/40 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">1M+</div>
                <div className="text-purple-300 text-sm">Documents</div>
              </div>
              <div className="bg-orange-900/40 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">10TB+</div>
                <div className="text-orange-300 text-sm">Knowledge</div>
              </div>
            </div>
          </div>
        )
        
      case 'tech-stack':
        return (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-white text-center">🛠️ Technical Stack</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {Object.entries(techStack).map(([category, technologies]) => (
                <motion.div
                  key={category}
                  className="bg-slate-800/80 rounded-xl p-6 border border-gray-600/40"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    {category === 'Backend' && <Server className="w-6 h-6 mr-2 text-blue-400" />}
                    {category === 'Frontend' && <Globe className="w-6 h-6 mr-2 text-green-400" />}
                    {category === 'AI & ML' && <Brain className="w-6 h-6 mr-2 text-purple-400" />}
                    {category}
                  </h3>
                  <div className="space-y-3">
                    {technologies.map((tech, index) => (
                      <div key={index} className="border-l-2 border-cyan-400/30 pl-4">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">{tech.name}</span>
                          <span className="text-cyan-400 text-sm">{tech.version}</span>
                        </div>
                        <p className="text-gray-400 text-sm">{tech.desc}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )
        
      case 'api':
        return (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-white text-center">📡 API Reference</h2>
            <div className="space-y-6">
              {Object.entries(apiCategories).map(([category, endpoints]) => (
                <motion.div
                  key={category}
                  className="bg-slate-800/80 rounded-xl p-6 border border-gray-600/40"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="text-xl font-bold text-white mb-4">{category}</h3>
                  <div className="space-y-3">
                    {endpoints.map((endpoint, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-gray-900/50 rounded-lg">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          endpoint.method === 'GET' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                        }`}>
                          {endpoint.method}
                        </span>
                        <code className="text-cyan-400 font-mono">{endpoint.path}</code>
                        <span className="text-gray-300 text-sm flex-1">{endpoint.desc}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )
        
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Simple Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={onBack}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl border border-gray-200 transition-all duration-200"
              whileHover={{ scale: 1.02 }}
            >
              <ArrowLeft size={18} className="text-gray-600" />
              <span className="text-gray-700">Back</span>
            </motion.button>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Documentation</h1>
              <p className="text-gray-600">Complete platform overview and specifications</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-center">
              <div className="text-xl font-bold text-purple-400">20+</div>
              <div className="text-gray-400">API Endpoints</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-cyan-400">v2.0</div>
              <div className="text-gray-400">Version</div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Brain className="w-12 h-12 text-cyan-400 animate-pulse" />
            <h1 className="text-5xl font-black text-white">Documentation</h1>
          </div>
          <p className="text-xl text-gray-300">Complete system overview and technical specifications</p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-slate-800/60 rounded-2xl p-2 backdrop-blur-sm border border-gray-600/40">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all ${
                  activeTab === tab.id 
                    ? 'bg-cyan-500 text-white shadow-lg' 
                    : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
                }`}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default EnhancedDocumentationSummary
