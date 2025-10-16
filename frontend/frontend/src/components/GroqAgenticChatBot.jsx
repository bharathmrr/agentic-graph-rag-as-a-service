import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Zap, 
  Brain,
  Search,
  Download,
  Copy,
  Loader,
  AlertCircle,
  CheckCircle,
  Eye,
  Settings
} from 'lucide-react'

const GroqAgenticChatBot = ({ onNotification }) => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [groqStatus, setGroqStatus] = useState({ initialized: false })
  const [showSettings, setShowSettings] = useState(false)
  const [config, setConfig] = useState({
    model: 'llama3-8b-8192',
    includeEntities: true,
    streamResponse: true
  })
  
  const messagesEndRef = useRef(null)
  const eventSourceRef = useRef(null)

  useEffect(() => {
    checkGroqStatus()
    addWelcomeMessage()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const checkGroqStatus = async () => {
    try {
      const response = await fetch('/api/groq/status')
      const status = await response.json()
      setGroqStatus(status)
      
      if (!status.initialized) {
        await initializeGroq()
      }
    } catch (error) {
      console.error('Error checking Groq status:', error)
      onNotification?.({
        type: 'error',
        title: 'Groq Connection Error',
        message: 'Failed to connect to Groq service'
      })
    }
  }

  const initializeGroq = async () => {
    try {
      const response = await fetch('/api/groq/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: config.model,
          embedding_model: 'BAAI/bge-small-en-v1.5'
        })
      })
      
      if (response.ok) {
        setGroqStatus({ initialized: true })
        onNotification?.({
          type: 'success',
          title: 'Groq Initialized',
          message: 'High-speed AI processing ready!'
        })
      }
    } catch (error) {
      console.error('Error initializing Groq:', error)
    }
  }

  const addWelcomeMessage = () => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'bot',
      content: '🚀 Welcome to Groq-Powered Agentic AI! I can help you find entities, analyze data, and answer questions with lightning-fast responses.',
      timestamp: new Date(),
      entities: [],
      reasoning: ['🧠 Groq LLM initialized', '🔍 Entity extraction ready', '📚 RAG system active']
    }
    setMessages([welcomeMessage])
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      if (config.streamResponse) {
        await handleStreamingResponse(inputMessage)
      } else {
        await handleRegularResponse(inputMessage)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      addErrorMessage('Failed to get response from Groq AI')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStreamingResponse = async (query) => {
    const botMessage = {
      id: Date.now() + 1,
      type: 'bot',
      content: '',
      timestamp: new Date(),
      entities: [],
      reasoning: [],
      isStreaming: true
    }

    setMessages(prev => [...prev, botMessage])
    setIsStreaming(true)

    try {
      const response = await fetch('/api/groq/rag/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          include_entities: config.includeEntities,
          stream: true
        })
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              setIsStreaming(false)
              return
            }

            try {
              const parsed = JSON.parse(data)
              
              if (parsed.type === 'content') {
                setMessages(prev => prev.map(msg => 
                  msg.id === botMessage.id 
                    ? { ...msg, content: msg.content + ' ' + parsed.content }
                    : msg
                ))
              } else if (parsed.type === 'complete') {
                setMessages(prev => prev.map(msg => 
                  msg.id === botMessage.id 
                    ? { 
                        ...msg, 
                        entities: parsed.response.entities_found || [],
                        reasoning: parsed.response.reasoning_steps || [],
                        confidence: parsed.response.confidence_score,
                        isStreaming: false
                      }
                    : msg
                ))
              }
            } catch (e) {
              console.warn('Failed to parse streaming data:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error)
      addErrorMessage('Streaming response failed')
    } finally {
      setIsStreaming(false)
    }
  }

  const handleRegularResponse = async (query) => {
    try {
      const response = await fetch('/api/groq/chat/agentic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          include_entities: config.includeEntities
        })
      })

      const data = await response.json()

      if (data.success) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: data.answer,
          timestamp: new Date(),
          entities: data.response_entities || [],
          queryEntities: data.query_entities || [],
          similarEntities: data.similar_entities || [],
          reasoning: data.reasoning_steps || [],
          confidence: data.confidence_score,
          processingTime: data.processing_time
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        addErrorMessage(data.detail || 'Unknown error occurred')
      }
    } catch (error) {
      addErrorMessage('Failed to get response from Groq AI')
    }
  }

  const addErrorMessage = (errorText) => {
    const errorMessage = {
      id: Date.now() + 1,
      type: 'bot',
      content: `❌ ${errorText}`,
      timestamp: new Date(),
      isError: true
    }
    setMessages(prev => [...prev, errorMessage])
  }

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content)
    onNotification?.({
      type: 'success',
      title: 'Copied',
      message: 'Message copied to clipboard'
    })
  }

  const exportChat = () => {
    const chatData = {
      messages,
      timestamp: new Date().toISOString(),
      config
    }
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `groq-chat-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="groq-chatbot enhanced-card">
      <div className="chatbot-header">
        <div className="header-info">
          <div className="header-icon">
            <Zap className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Groq Agentic AI</h2>
            <p className="text-sm text-gray-400">
              {groqStatus.initialized ? 'High-speed AI ready' : 'Initializing...'}
            </p>
          </div>
        </div>
        
        <div className="header-controls">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="control-btn"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button onClick={exportChat} className="control-btn">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showSettings && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="settings-panel"
        >
          <div className="setting-item">
            <label>Model:</label>
            <select 
              value={config.model} 
              onChange={(e) => setConfig(prev => ({ ...prev, model: e.target.value }))}
            >
              <option value="llama3-8b-8192">Llama 3 8B (Fast)</option>
              <option value="llama3-70b-8192">Llama 3 70B (Quality)</option>
              <option value="mixtral-8x7b-32768">Mixtral 8x7B (Large Context)</option>
            </select>
          </div>
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={config.includeEntities}
                onChange={(e) => setConfig(prev => ({ ...prev, includeEntities: e.target.checked }))}
              />
              Extract Entities
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={config.streamResponse}
                onChange={(e) => setConfig(prev => ({ ...prev, streamResponse: e.target.checked }))}
              />
              Stream Responses
            </label>
          </div>
        </motion.div>
      )}

      <div className="messages-container">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageComponent 
              key={message.id} 
              message={message} 
              onCopy={copyMessage}
            />
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <div className="loading-message">
            <Loader className="w-4 h-4 animate-spin" />
            <span>Processing with Groq AI...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <div className="input-container">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about entities, data, or anything..."
            className="message-input enhanced-input"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="send-button enhanced-button"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      <style jsx>{`
        .groq-chatbot {
          height: 600px;
          display: flex;
          flex-direction: column;
          background: rgba(15, 23, 42, 0.8);
          border-radius: 16px;
          overflow: hidden;
        }
        
        .chatbot-header {
          padding: 1rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(30, 41, 59, 0.5);
        }
        
        .header-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .header-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(59, 130, 246, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .header-controls {
          display: flex;
          gap: 0.5rem;
        }
        
        .control-btn {
          padding: 0.5rem;
          border-radius: 6px;
          background: rgba(148, 163, 184, 0.1);
          border: 1px solid rgba(148, 163, 184, 0.2);
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .control-btn:hover {
          background: rgba(148, 163, 184, 0.2);
          color: #f8fafc;
        }
        
        .settings-panel {
          padding: 1rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          background: rgba(0, 0, 0, 0.2);
        }
        
        .setting-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          color: #e2e8f0;
          font-size: 0.875rem;
        }
        
        .setting-item select {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 4px;
          color: #f8fafc;
          padding: 0.25rem 0.5rem;
        }
        
        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .loading-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #94a3b8;
          font-size: 0.875rem;
          padding: 0.75rem;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }
        
        .input-area {
          padding: 1rem;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
          background: rgba(30, 41, 59, 0.3);
        }
        
        .input-container {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }
        
        .message-input {
          flex: 1;
          padding: 0.75rem;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(148, 163, 184, 0.2);
          color: #f8fafc;
        }
        
        .send-button {
          padding: 0.75rem;
          border-radius: 8px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border: none;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .send-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        
        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}

const MessageComponent = ({ message, onCopy }) => {
  const [showDetails, setShowDetails] = useState(false)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`message ${message.type}`}
    >
      <div className="message-header">
        <div className="message-avatar">
          {message.type === 'user' ? (
            <User className="w-4 h-4" />
          ) : (
            <Bot className="w-4 h-4" />
          )}
        </div>
        <div className="message-info">
          <span className="message-sender">
            {message.type === 'user' ? 'You' : 'Groq AI'}
          </span>
          <span className="message-time">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
        <div className="message-actions">
          {message.entities && message.entities.length > 0 && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="action-btn"
              title="View entities"
            >
              <Eye className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={() => onCopy(message.content)}
            className="action-btn"
            title="Copy message"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      <div className="message-content">
        {message.content}
        {message.isStreaming && (
          <span className="streaming-indicator">▋</span>
        )}
      </div>
      
      {showDetails && message.entities && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="message-details"
        >
          {message.entities.length > 0 && (
            <div className="entities-section">
              <h4>🔍 Entities Found:</h4>
              <div className="entities-list">
                {message.entities.map((entity, idx) => (
                  <span key={idx} className={`entity-tag ${entity.type?.toLowerCase()}`}>
                    {entity.text} ({entity.type})
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {message.reasoning && message.reasoning.length > 0 && (
            <div className="reasoning-section">
              <h4>🧠 Reasoning Steps:</h4>
              <ul className="reasoning-list">
                {message.reasoning.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
      
      <style jsx>{`
        .message {
          background: rgba(30, 41, 59, 0.4);
          border-radius: 12px;
          padding: 1rem;
          border: 1px solid rgba(148, 163, 184, 0.1);
        }
        
        .message.user {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.2);
          margin-left: 2rem;
        }
        
        .message.bot {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.2);
          margin-right: 2rem;
        }
        
        .message-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }
        
        .message-avatar {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: rgba(148, 163, 184, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
        }
        
        .message-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }
        
        .message-sender {
          font-weight: 500;
          color: #f8fafc;
          font-size: 0.875rem;
        }
        
        .message-time {
          font-size: 0.75rem;
          color: #94a3b8;
        }
        
        .message-actions {
          display: flex;
          gap: 0.25rem;
        }
        
        .action-btn {
          padding: 0.25rem;
          border-radius: 4px;
          background: rgba(148, 163, 184, 0.1);
          border: none;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .action-btn:hover {
          background: rgba(148, 163, 184, 0.2);
          color: #f8fafc;
        }
        
        .message-content {
          color: #e2e8f0;
          line-height: 1.6;
          white-space: pre-wrap;
        }
        
        .streaming-indicator {
          animation: blink 1s infinite;
          color: #3b82f6;
        }
        
        .message-details {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
        }
        
        .entities-section, .reasoning-section {
          margin-bottom: 1rem;
        }
        
        .entities-section h4, .reasoning-section h4 {
          color: #f8fafc;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }
        
        .entities-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .entity-tag {
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          background: rgba(59, 130, 246, 0.2);
          color: #93c5fd;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
        
        .entity-tag.person { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border-color: rgba(239, 68, 68, 0.3); }
        .entity-tag.organization { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border-color: rgba(245, 158, 11, 0.3); }
        .entity-tag.location { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border-color: rgba(16, 185, 129, 0.3); }
        .entity-tag.technology { background: rgba(139, 92, 246, 0.2); color: #c4b5fd; border-color: rgba(139, 92, 246, 0.3); }
        
        .reasoning-list {
          list-style: none;
          padding: 0;
        }
        
        .reasoning-list li {
          padding: 0.25rem 0;
          color: #94a3b8;
          font-size: 0.875rem;
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </motion.div>
  )
}

export default GroqAgenticChatBot
