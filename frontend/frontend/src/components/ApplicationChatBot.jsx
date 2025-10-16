import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Sparkles,
  Key,
  Database,
  TrendingUp,
  Copy,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react'

/**
 * Step 10: Application Chatbot Integration
 * 
 * Features:
 * - Intelligent query analysis with keyword extraction
 * - Knowledge base retrieval from embeddings & graph
 * - Predictive and context-aware responses
 * - Source attribution with confidence scores
 */
const ApplicationChatBot = ({ onNotification, onChatbotComplete }) => {
  // Step 10 specific states
  const [currentStep, setCurrentStep] = useState(10)
  const [totalSteps] = useState(12)
  const [isStep10Complete, setIsStep10Complete] = useState(false)
  const [showReadyButton, setShowReadyButton] = useState(false)
  const [chatbotStats, setChatbotStats] = useState({})
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [keywords, setKeywords] = useState([])
  const [confidenceScore, setConfidenceScore] = useState(null)
  const [queriesProcessed, setQueriesProcessed] = useState(0)
  
  const messagesEndRef = useRef(null)

  const suggestedQueries = [
    "What entities exist in the knowledge graph?",
    "Show me relationships between organizations",
    "Find documents about machine learning",
    "Summarize the uploaded data",
    "What are the main topics discussed?"
  ]

  useEffect(() => {
    addWelcomeMessage()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const addWelcomeMessage = () => {
    const welcome = {
      id: Date.now(),
      type: 'bot',
      content: '👋 Welcome to the Application Chatbot! I can help you explore your knowledge base, answer questions about your data, and provide intelligent insights. Ask me anything!',
      timestamp: new Date(),
      keywords: [],
      sources: []
    }
    setMessages([welcome])
  }

  const extractKeywordsFromText = (text) => {
    // Simple keyword extraction (client-side preview)
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3)
      .filter(w => !['this', 'that', 'what', 'where', 'when', 'who', 'how', 'with', 'from', 'about'].includes(w))
    
    // Get unique keywords (top 5)
    const unique = [...new Set(words)].slice(0, 5)
    return unique
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    // Extract keywords for preview
    const extractedKeywords = extractKeywordsFromText(inputMessage)
    setKeywords(extractedKeywords)

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const queryText = inputMessage
    setInputMessage('')
    setIsLoading(true)

    try {
      // Call Application Chatbot API (Step 10)
      const response = await fetch('http://127.0.0.1:8000/v2/chat/app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText,
          top_k: 10,
          strategy: 'hybrid'
        })
      })

      const data = await response.json()

      if (data.success && data.data) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: data.data.answer || 'I found relevant information in the knowledge base.',
          timestamp: new Date(),
          keywords: data.data.keywords || extractedKeywords,
          sources: data.data.sources || [],
          confidence: data.data.confidence || 0
        }

        setMessages(prev => [...prev, botMessage])
        setConfidenceScore(data.data.confidence || 0)
        setKeywords(data.data.keywords || extractedKeywords)

        onNotification?.({
          type: 'success',
          title: 'Response Generated',
          message: `Found ${data.data.sources?.length || 0} relevant sources`
        })
      } else {
        throw new Error(data.error || 'Failed to get response')
      }

    } catch (error) {
      console.error('Chat error:', error)
      
      // Fallback response
      const fallbackMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: `I understand you're asking about "${queryText}". While I'm currently unable to connect to the knowledge base, I've extracted these keywords: ${extractedKeywords.join(', ')}. Please ensure your data is uploaded and processed.`,
        timestamp: new Date(),
        keywords: extractedKeywords,
        sources: [],
        confidence: 0.3,
        isError: true
      }

      setMessages(prev => [...prev, fallbackMessage])

      onNotification?.({
        type: 'warning',
        title: 'Limited Response',
        message: 'Using fallback mode - knowledge base unavailable'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content)
    onNotification?.({
      type: 'success',
      title: 'Copied',
      message: 'Message copied to clipboard'
    })
  }

  const clearChat = () => {
    addWelcomeMessage()
    setKeywords([])
    setConfidenceScore(null)
  }

  const exportChat = () => {
    const exportData = {
      messages: messages.map(m => ({
        type: m.type,
        content: m.content,
        keywords: m.keywords,
        sources: m.sources,
        confidence: m.confidence,
        timestamp: m.timestamp
      })),
      exported_at: new Date().toISOString(),
      total_messages: messages.length
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `app-chatbot-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="application-chatbot-container">
      {/* Header */}
      <div className="chatbot-header">
        <div className="header-left">
          <div className="header-icon">
            <MessageSquare className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Application Chatbot</h2>
            <p className="text-sm text-gray-400">Intelligent Knowledge Base Assistant</p>
          </div>
        </div>
        
        <div className="header-actions">
          <button onClick={clearChat} className="action-btn" title="Clear chat">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={exportChat} className="action-btn" title="Export chat">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Keywords Bar */}
      {keywords.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="keywords-bar"
        >
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">Keywords:</span>
          </div>
          <div className="keywords-list">
            {keywords.map((kw, idx) => (
              <span key={idx} className="keyword-tag">
                {kw}
              </span>
            ))}
          </div>
          {confidenceScore !== null && (
            <div className="confidence-indicator">
              <TrendingUp className="w-4 h-4" />
              <span>{(confidenceScore * 100).toFixed(0)}%</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Messages */}
      <div className="messages-area">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              onCopy={copyMessage}
            />
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="loading-indicator"
          >
            <Loader className="w-5 h-5 animate-spin text-blue-400" />
            <span className="text-gray-400">Analyzing query and retrieving from knowledge base...</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Queries */}
      {messages.length === 1 && (
        <div className="suggested-queries">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Try asking:</h3>
          <div className="queries-grid">
            {suggestedQueries.map((query, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setInputMessage(query)}
                className="suggested-query-btn"
              >
                <Sparkles className="w-4 h-4" />
                {query}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="input-area">
        <div className="input-wrapper">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask anything about your data..."
            className="message-input"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="send-btn"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <style jsx>{`
        .application-chatbot-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 800px;
          background: rgba(15, 23, 42, 0.9);
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .chatbot-header {
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
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2));
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .header-actions {
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

        .keywords-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1.25rem;
          background: rgba(139, 92, 246, 0.1);
          border-bottom: 1px solid rgba(139, 92, 246, 0.2);
        }

        .keywords-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          flex: 1;
        }

        .keyword-tag {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          background: rgba(59, 130, 246, 0.2);
          color: #93c5fd;
          font-size: 0.75rem;
          font-weight: 500;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .confidence-indicator {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          background: rgba(16, 185, 129, 0.2);
          color: #6ee7b7;
          font-size: 0.75rem;
          font-weight: 600;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .loading-indicator {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 12px;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .suggested-queries {
          padding: 1rem 1.25rem;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
          background: rgba(0, 0, 0, 0.2);
        }

        .queries-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 0.5rem;
        }

        .suggested-query-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 8px;
          color: #93c5fd;
          font-size: 0.875rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
        }

        .suggested-query-btn:hover {
          background: rgba(59, 130, 246, 0.2);
          border-color: rgba(59, 130, 246, 0.4);
          color: #dbeafe;
        }

        .input-area {
          padding: 1.25rem;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
          background: rgba(30, 41, 59, 0.4);
        }

        .input-wrapper {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .message-input {
          flex: 1;
          padding: 0.875rem 1rem;
          border-radius: 10px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(148, 163, 184, 0.2);
          color: #f8fafc;
          font-size: 0.9375rem;
          transition: all 0.2s;
        }

        .message-input:focus {
          outline: none;
          border-color: rgba(59, 130, 246, 0.5);
          background: rgba(0, 0, 0, 0.4);
        }

        .send-btn {
          padding: 0.875rem 1.25rem;
          border-radius: 10px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border: none;
          color: white;
          cursor: pointer;
          transition: all 0.3s;
          font-weight: 500;
        }

        .send-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(59, 130, 246, 0.4);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>
    </div>
  )
}

const MessageBubble = ({ message, onCopy }) => {
  const [showSources, setShowSources] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`message-bubble ${message.type}`}
    >
      <div className="message-header">
        <div className="avatar">
          {message.type === 'user' ? (
            <User className="w-4 h-4" />
          ) : (
            <Bot className="w-4 h-4" />
          )}
        </div>
        <div className="message-meta">
          <span className="sender-name">
            {message.type === 'user' ? 'You' : 'AI Assistant'}
          </span>
          <span className="timestamp">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
        <button 
          onClick={() => onCopy(message.content)}
          className="copy-btn"
          title="Copy message"
        >
          <Copy className="w-3 h-3" />
        </button>
      </div>

      <div className="message-content">
        {message.content}
      </div>

      {message.sources && message.sources.length > 0 && (
        <div className="sources-section">
          <button 
            onClick={() => setShowSources(!showSources)}
            className="sources-toggle"
          >
            <Database className="w-4 h-4" />
            {message.sources.length} Sources
            {message.confidence && (
              <span className="confidence-badge">
                {(message.confidence * 100).toFixed(0)}% confidence
              </span>
            )}
          </button>

          {showSources && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="sources-list"
            >
              {message.sources.slice(0, 3).map((source, idx) => (
                <div key={idx} className="source-item">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <div>
                    <div className="source-name">
                      {source.name || source.metadata?.entity_name || 'Source'}
                    </div>
                    <div className="source-text">
                      {source.anchor_text || source.content || ''}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      )}

      <style jsx>{`
        .message-bubble {
          max-width: 80%;
          padding: 1rem;
          border-radius: 12px;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(148, 163, 184, 0.1);
        }

        .message-bubble.user {
          align-self: flex-end;
          background: rgba(59, 130, 246, 0.15);
          border-color: rgba(59, 130, 246, 0.3);
        }

        .message-bubble.bot {
          align-self: flex-start;
          background: rgba(139, 92, 246, 0.15);
          border-color: rgba(139, 92, 246, 0.3);
        }

        .message-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(148, 163, 184, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
        }

        .message-meta {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .sender-name {
          font-weight: 600;
          color: #f8fafc;
          font-size: 0.875rem;
        }

        .timestamp {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .copy-btn {
          padding: 0.375rem;
          border-radius: 6px;
          background: rgba(148, 163, 184, 0.1);
          border: none;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s;
        }

        .copy-btn:hover {
          background: rgba(148, 163, 184, 0.2);
          color: #f8fafc;
        }

        .message-content {
          color: #e2e8f0;
          line-height: 1.6;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .sources-section {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
        }

        .sources-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 8px;
          color: #93c5fd;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
        }

        .sources-toggle:hover {
          background: rgba(59, 130, 246, 0.2);
        }

        .confidence-badge {
          margin-left: auto;
          padding: 0.125rem 0.5rem;
          border-radius: 12px;
          background: rgba(16, 185, 129, 0.2);
          color: #6ee7b7;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .sources-list {
          margin-top: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .source-item {
          display: flex;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          font-size: 0.875rem;
        }

        .source-name {
          font-weight: 500;
          color: #f8fafc;
          margin-bottom: 0.25rem;
        }

        .source-text {
          color: #94a3b8;
          font-size: 0.8125rem;
          line-height: 1.5;
        }
      `}</style>
    </motion.div>
  )
}

export default ApplicationChatBot
