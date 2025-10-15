import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Info, Search, HelpCircle, MessageSquare, ChevronDown, ChevronRight } from 'lucide-react'

const StaticChatbox = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategory, setExpandedCategory] = useState('general')

  const faqData = {
    general: {
      title: 'General Questions',
      icon: Info,
      questions: [
        {
          q: 'What does Ontology Generation do?',
          a: 'Ontology Generation (Model Core 1) extracts entities and relationships from your documents using advanced NLP and LLM technology. It creates a hierarchical structure of concepts and their connections.'
        },
        {
          q: 'Who created this application?',
          a: 'This Agentic Graph RAG application was developed as a comprehensive knowledge management platform, integrating Neo4j, ChromaDB, and advanced AI technologies for intelligent document processing.'
        },
        {
          q: 'How to upload a file?',
          a: 'Click the "Upload Files" button in the header, select your files (PDF, DOCX, TXT, MD), and they will be automatically processed through our 14 Model Cores for comprehensive analysis.'
        },
        {
          q: 'What file formats are supported?',
          a: 'We support PDF, DOCX, TXT, and MD file formats. Each file is processed through multiple AI models for entity extraction, relationship mapping, and knowledge graph construction.'
        }
      ]
    },
    cores: {
      title: 'Model Cores',
      icon: MessageSquare,
      questions: [
        {
          q: 'What is Entity Resolution?',
          a: 'Entity Resolution (Model Core 2) identifies and removes duplicate entities using fuzzy matching and NLP. It ensures your knowledge graph has clean, non-redundant data.'
        },
        {
          q: 'How does Embedding Generation work?',
          a: 'Embedding Generation (Model Core 3) converts your text content into vector embeddings using Ollama models, storing them in ChromaDB for semantic search and similarity-based retrieval.'
        },
        {
          q: 'What is the Graph Constructor?',
          a: 'Graph Constructor (Model Core 4) builds interactive knowledge graphs using Neo4j, creating visual representations of entities and their relationships with animated layouts.'
        },
        {
          q: 'How does Agentic Retrieval work?',
          a: 'Agentic Retrieval (Model Core 6) is a RAG system that dynamically interacts with stored embeddings and graph data to answer queries using intelligent agent routing.'
        }
      ]
    },
    technical: {
      title: 'Technical Details',
      icon: HelpCircle,
      questions: [
        {
          q: 'What technologies are used?',
          a: 'The platform uses React + Tailwind CSS for frontend, FastAPI for backend, Neo4j for graph storage, ChromaDB for vector embeddings, and various AI models including GPT-4 and Ollama.'
        },
        {
          q: 'How is data stored?',
          a: 'Data is stored in multiple systems: Neo4j for graph relationships, ChromaDB for vector embeddings, and local storage for file metadata and processing history.'
        },
        {
          q: 'What happens during processing?',
          a: 'Files go through 14 Model Cores: ontology generation, entity resolution, embedding creation, graph construction, and various analysis stages with real-time progress tracking.'
        },
        {
          q: 'Is my data secure?',
          a: 'Yes, the Encryption File Processing (Model Core 9) tracks all file workflows with timestamps and secure processing. Data is processed locally with optional cloud AI integration.'
        }
      ]
    },
    troubleshooting: {
      title: 'Troubleshooting',
      icon: Search,
      questions: [
        {
          q: 'Why is a Model Core disabled?',
          a: 'Reasoning Stream (Model Core 7) is temporarily disabled as mentioned in the specifications. Other cores may be disabled if backend services are unavailable.'
        },
        {
          q: 'File upload not working?',
          a: 'Ensure your file is in supported format (PDF, DOCX, TXT, MD) and under size limits. Check browser console for any error messages.'
        },
        {
          q: 'Processing stuck at certain percentage?',
          a: 'This may indicate backend service issues. Try refreshing the page or check if Neo4j/ChromaDB services are running properly.'
        },
        {
          q: 'How to clear temporary data?',
          a: 'Temporary embeddings and session data are automatically cleared on browser refresh. You can also manually clear browser storage if needed.'
        }
      ]
    }
  }

  const filteredQuestions = Object.entries(faqData).reduce((acc, [key, category]) => {
    const filtered = category.questions.filter(
      item => 
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
    if (filtered.length > 0) {
      acc[key] = { ...category, questions: filtered }
    }
    return acc
  }, {})

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-white">
      <div className="h-full flex flex-col">
        {/* Premium Header */}
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
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Info size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Application Chatbox</h1>
                  <p className="text-gray-500 text-sm">Model Core 11: Static Q&A about application functionality</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{Object.values(faqData).reduce((sum, cat) => sum + cat.questions.length, 0)}</div>
                <div className="text-gray-500 text-sm">FAQs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{Object.keys(faqData).length}</div>
                <div className="text-gray-500 text-sm">Categories</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-auto">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* FAQ Categories */}
          <div className="max-w-4xl mx-auto space-y-6">
            {Object.entries(searchQuery ? filteredQuestions : faqData).map(([key, category]) => (
              <motion.div
                key={key}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <button
                  onClick={() => setExpandedCategory(expandedCategory === key ? '' : key)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <category.icon size={24} className="text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                    <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-sm">
                      {category.questions.length}
                    </span>
                  </div>
                  {expandedCategory === key ? (
                    <ChevronDown size={20} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={20} className="text-gray-400" />
                  )}
                </button>

                {expandedCategory === key && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-gray-100"
                  >
                    <div className="p-6 space-y-4">
                      {category.questions.map((item, index) => (
                        <motion.div
                          key={index}
                          className="border-l-4 border-purple-200 pl-4 py-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <h4 className="font-semibold text-gray-900 mb-2">{item.q}</h4>
                          <p className="text-gray-600 leading-relaxed">{item.a}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* No Results */}
          {searchQuery && Object.keys(filteredQuestions).length === 0 && (
            <div className="text-center py-12">
              <Search size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
              <p className="text-gray-500">Try different search terms or browse categories above</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StaticChatbox
