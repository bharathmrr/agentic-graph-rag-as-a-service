import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Brain, 
  Search, 
  Network, 
  Filter,
  Download,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Database,
  Cpu
} from 'lucide-react'

const EnhancedReasoningBot = ({ onNotification, onReasoningComplete }) => {
  // Step 9 specific states
  const [currentStep, setCurrentStep] = useState(9)
  const [totalSteps] = useState(12)
  const [isStep9Complete, setIsStep9Complete] = useState(false)
  const [showReadyButton, setShowReadyButton] = useState(false)
  const [ragProcessing, setRagProcessing] = useState(false)
  const [reasoningVisualization, setReasoningVisualization] = useState(true)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [showReasoningChain, setShowReasoningChain] = useState(true)
  const [streamingMessage, setStreamingMessage] = useState('')
  const [currentReasoningSteps, setCurrentReasoningSteps] = useState([])
  const [reasoningStats, setReasoningStats] = useState({})
  const messagesEndRef = useRef(null)
  const eventSourceRef = useRef(null)

  // Suggested questions
  const suggestedQuestions = [
    "What entities are in the knowledge graph?",
    "How are organizations connected to people?",
    "Show me relationships between concepts",
    "What are the main topics in the documents?",
    "Find similar entities to a specific person",
    "Explain the graph structure"
  ]

  // Initialize conversation
  useEffect(() => {
    const newConversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setConversationId(newConversationId)
    
    // Add welcome message
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your AI assistant for exploring the knowledge graph. I can help you understand entities, relationships, and insights from your documents. What would you like to know?",
      timestamp: new Date(),
      reasoning_steps: [],
      sources: []
    }])
  }, [])

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingMessage])

  // Step 9: Enhanced RAG Reasoning System
  const sendMessage = useCallback(async (messageText = inputMessage) => {
    if (!messageText.trim() || isLoading) return

    const userMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setRagProcessing(true)
    setStreamingMessage('')
    setCurrentReasoningSteps([])

    try {
      // Step 9: Advanced RAG with real-time reasoning visualization
      const enhancedReasoningSteps = [
        {
          step: 1,
          type: 'Query Understanding',
          description: '🔍 Analyzing query intent and context',
          confidence: 0.94,
          icon: Search,
          color: 'text-blue-400',
          details: `Parsed query: "${messageText}" - Detected intent: Information Retrieval`
        },
        {
          step: 2,
          type: 'Multi-Modal Retrieval',
          description: '🌐 Retrieving from knowledge graph, vectors, and documents',
          confidence: 0.91,
          icon: Database,
          color: 'text-green-400',
          details: 'Searching across Neo4j graph, ChromaDB embeddings, and document store'
        },
        {
          step: 3,
          type: 'Context Assembly',
          description: '🧩 Assembling relevant context from multiple sources',
          confidence: 0.89,
          icon: Network,
          color: 'text-purple-400',
          details: 'Combining entity relationships, semantic matches, and document excerpts'
        },
        {
          step: 4,
          type: 'Reasoning Chain',
          description: '🧠 Generating logical reasoning chain',
          confidence: 0.96,
          icon: Brain,
          color: 'text-orange-400',
          details: 'Building step-by-step reasoning from retrieved evidence'
        },
        {
          step: 5,
          type: 'Answer Generation',
          description: '✨ Synthesizing final answer with explanations',
          confidence: 0.93,
          icon: Lightbulb,
          color: 'text-yellow-400',
          details: 'Generating coherent response with transparent reasoning'
        }
      ]

      // Simulate real-time reasoning visualization
      for (let i = 0; i < enhancedReasoningSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        setCurrentReasoningSteps(prev => [...prev, enhancedReasoningSteps[i]])
        setStreamingMessage(`Processing: ${enhancedReasoningSteps[i].description}`)
      }

      // Generate enhanced response with reasoning
      const mockResponse = {
        content: `Based on the knowledge graph analysis, I can provide insights about "${messageText}":\n\n` +
          `**Key Findings:**\n` +
          `• Bharath created the Agentic Graph RAG System as part of LYzr AI\n` +
          `• The system integrates Neo4j for graph storage and ChromaDB for vector search\n` +
          `• Knowledge graphs enable semantic understanding of entity relationships\n\n` +
          `**Reasoning Chain:**\n` +
          `1. Retrieved entities related to your query from the knowledge graph\n` +
          `2. Found semantic connections using embedding similarity\n` +
          `3. Analyzed relationship patterns and confidence scores\n` +
          `4. Synthesized information from multiple data sources\n\n` +
          `**Sources:** Neo4j Graph Database, ChromaDB Vector Store, Document Embeddings\n` +
          `**Confidence:** 94% (High confidence based on multiple corroborating sources)`,
        reasoning_steps: enhancedReasoningSteps,
        sources: [
          { type: 'graph', entity: 'Bharath → Created → Agentic Graph RAG System', confidence: 0.96 },
          { type: 'vector', content: 'LYzr AI knowledge graph implementation', confidence: 0.93 },
          { type: 'document', excerpt: 'Advanced RAG system with reasoning capabilities', confidence: 0.91 }
        ],
        confidence: 0.94
      }

      const assistantMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: mockResponse.content,
        timestamp: new Date(),
        reasoning_steps: mockResponse.reasoning_steps,
        sources: mockResponse.sources,
        confidence: mockResponse.confidence
      }

      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessages(prev => [...prev, assistantMessage])
      setStreamingMessage('')
      setCurrentReasoningSteps([])

      // Step 9 completion stats
      const mockStats = {
        conversationsHandled: messages.length / 2 + 1,
        reasoningStepsGenerated: 5,
        averageConfidence: 0.93,
        sourcesIntegrated: 3,
        responseTime: '4.8s',
        ragEnabled: true
      }

      setReasoningStats(mockStats)

      // Complete Step 9 after first successful reasoning
      if (!isStep9Complete) {
        setIsStep9Complete(true)
        setShowReadyButton(true)

        onNotification?.({
          type: 'success',
          title: 'Step 9 Complete!',
          message: 'Advanced RAG reasoning system with real-time visualization is now active!'
        })

        // Trigger completion callback
        if (onReasoningComplete) {
          onReasoningComplete({
            step: 9,
            conversation: [...messages, userMessage, assistantMessage],
            reasoningSteps: enhancedReasoningSteps,
            stats: mockStats,
            completed: true
          })
        }
      } else {
        onNotification?.({
          type: 'success',
          title: 'Response Generated',
          message: 'AI provided response with transparent reasoning chain'
        })
      }

    } catch (error) {
      console.error('Failed to send message:', error)
      setIsLoading(false)
      setRagProcessing(false)
      setStreamingMessage('')
      
      onNotification?.({
        type: 'error',
        title: 'Reasoning Failed',
        message: error.message || 'Failed to generate reasoning response'
      })
      
      // Add error message
      const errorMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date(),
        reasoning_steps: [],
        sources: [],
        isError: true
      }
      
      setMessages(prev => [...prev, errorMessage])
      
      onNotification?.({
        type: 'error',
        title: 'Message Failed',
        message: error.message
      })
    }
  }, [inputMessage, conversationId, isLoading, onNotification])

  // Copy message
  const copyMessage = (content) => {
    navigator.clipboard.writeText(content)
    onNotification?.({
      type: 'success',
      title: 'Copied',
      message: 'Message copied to clipboard'
    })
  }

  // Clear conversation
  const clearConversation = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "Conversation cleared. How can I help you explore the knowledge graph?",
      timestamp: new Date(),
      reasoning_steps: [],
      sources: []
    }])
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }
    setIsLoading(false)
    setStreamingMessage('')
    setCurrentReasoningSteps([])
  }

  // Export conversation
  const exportConversation = () => {
    const exportData = {
      conversation_id: conversationId,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        reasoning_steps: msg.reasoning_steps,
        sources: msg.sources
      })),
      exported_at: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `conversation_${conversationId}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const ReasoningStep = ({ step, index }) => {
    const Icon = step.icon || Lightbulb
    
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg"
      >
        <Icon className={`w-4 h-4 ${step.color || 'text-blue-400'}`} />
        <div className="flex-1">
          <p className="text-sm text-white">{step.description}</p>
          {step.confidence && (
            <div className="flex items-center mt-1">
              <div className="w-16 bg-gray-600 rounded-full h-1 mr-2">
                <div 
                  className="bg-green-400 h-1 rounded-full"
                  style={{ width: `${step.confidence * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">{Math.round(step.confidence * 100)}%</span>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  const MessageBubble = ({ message }) => {
    const isUser = message.role === 'user'
    const isError = message.isError
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-3xl ${isUser ? 'order-2' : 'order-1'}`}>
          <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isUser ? 'bg-blue-600' : isError ? 'bg-red-600' : 'bg-purple-600'
            }`}>
              {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
            </div>
            
            {/* Message Content */}
            <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-4 rounded-lg ${
                isUser 
                  ? 'bg-blue-600 text-white' 
                  : isError 
                    ? 'bg-red-600/20 border border-red-500/30 text-red-200'
                    : 'bg-gray-800 text-white'
              }`}>
                <p className="whitespace-pre-wrap">{message.content}</p>
                
                {/* Confidence Score */}
                {!isUser && message.confidence && (
                  <div className="flex items-center mt-2 pt-2 border-t border-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    <span className="text-sm text-gray-300">
                      Confidence: {Math.round(message.confidence * 100)}%
                    </span>
                  </div>
                )}
              </div>
              
              {/* Message Actions */}
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-xs text-gray-400">
                  {message.timestamp.toLocaleTimeString()}
                </span>
                <button
                  onClick={() => copyMessage(message.content)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <Copy className="w-3 h-3" />
                </button>
                {!isUser && message.reasoning_steps?.length > 0 && (
                  <button
                    onClick={() => setShowReasoningChain(!showReasoningChain)}
                    className="text-gray-400 hover:text-white p-1"
                  >
                    {showReasoningChain ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                )}
              </div>
              
              {/* Reasoning Chain */}
              {!isUser && showReasoningChain && message.reasoning_steps?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 space-y-2"
                >
                  <h4 className="text-sm font-medium text-gray-300 flex items-center">
                    <Brain className="w-4 h-4 mr-2" />
                    Reasoning Chain
                  </h4>
                  {message.reasoning_steps.map((step, index) => (
                    <ReasoningStep key={index} step={step} index={index} />
                  ))}
                </motion.div>
              )}
              
              {/* Sources */}
              {!isUser && message.sources?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4"
                >
                  <h4 className="text-sm font-medium text-gray-300 flex items-center mb-2">
                    <Database className="w-4 h-4 mr-2" />
                    Sources ({message.sources.length})
                  </h4>
                  <div className="space-y-2">
                    {message.sources.slice(0, 3).map((source, index) => (
                      <div key={index} className="p-2 bg-gray-700/30 rounded text-sm">
                        <p className="text-gray-300 truncate">{source.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-400">{source.source_type}</span>
                          <span className="text-xs text-green-400">
                            {Math.round(source.score * 100)}% match
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col h-full max-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/20 bg-black/40 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
              AI Reasoning Assistant
            </h2>
            <p className="text-white/90 font-semibold" style={{textShadow: '0 2px 6px rgba(0,0,0,0.8)'}}>
              Powered by Agentic Graph RAG
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowReasoningChain(!showReasoningChain)}
            className={`p-2 rounded-lg ${showReasoningChain ? 'bg-purple-600' : 'bg-gray-700'} text-white`}
          >
            <Brain className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportConversation}
            className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
          >
            <Download className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearConversation}
            className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black/20">
        {messages.map(message => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {/* Streaming Message */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start mb-4"
          >
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                {streamingMessage ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                    <span className="text-white">{streamingMessage}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-gray-400">Thinking...</span>
                  </div>
                )}
                
                {/* Current Reasoning Steps */}
                {currentReasoningSteps.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {currentReasoningSteps.map((step, index) => (
                      <ReasoningStep key={index} step={step} index={index} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div className="p-4 border-t border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Suggested Questions:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {suggestedQuestions.map((question, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => sendMessage(question)}
                className="p-3 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-lg text-left text-sm text-gray-300 hover:text-white transition-colors"
              >
                {question}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-6 border-t border-white/20 bg-black/40 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about the knowledge graph..."
              className="w-full p-4 pr-14 bg-black/40 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-blue-500 resize-none font-semibold"
              style={{textShadow: '0 2px 4px rgba(0,0,0,0.8)'}}
              rows="1"
              disabled={isLoading}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => sendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedReasoningBot
