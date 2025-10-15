import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Loader, ArrowLeft } from 'lucide-react'
import { useData } from '../context/DataContext'

const SimpleChatBot = ({ onBack }) => {
  const { hasDocuments, backendStatus } = useData()
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Add welcome message
    if (messages.length === 0) {
      setMessages([{
        id: 1,
        type: 'bot',
        content: hasDocuments 
          ? 'Hello! I can help you explore your uploaded documents and knowledge graph. What would you like to know?'
          : 'Hello! Please upload some documents first so I can help you explore your knowledge graph.',
        timestamp: new Date()
      }])
    }
  }, [hasDocuments, messages.length])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      if (backendStatus === 'offline') {
        // Fallback response when backend is offline
        const botResponse = {
          id: Date.now() + 1,
          type: 'bot',
          content: 'I apologize, but the backend service is currently offline. Please ensure the backend server is running to get AI-powered responses based on your documents.',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botResponse])
        return
      }

      if (!hasDocuments) {
        const botResponse = {
          id: Date.now() + 1,
          type: 'bot',
          content: 'Please upload and process some documents first. I need document data to provide meaningful responses about your knowledge graph.',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botResponse])
        return
      }

      // Call backend RAG endpoint
      const response = await fetch('http://localhost:8000/reasoning/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: inputMessage.trim(),
          context: messages.slice(-6).map(m => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.content }))
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response from AI')
      }

      const result = await response.json()
      
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: result.response || result.answer || 'I apologize, but I could not generate a proper response.',
        timestamp: new Date(),
        reasoning: result.reasoning_steps || []
      }

      setMessages(prev => [...prev, botResponse])

    } catch (error) {
      console.error('Chat error:', error)
      const errorResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'I encountered an error while processing your request. Please try again or check if the backend service is running properly.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="premium-card mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="btn-secondary">
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h1 className="section-title">AI Assistant</h1>
                <p className="text-muted">Chat with your knowledge graph using LLM</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`status-chip ${backendStatus === 'online' ? 'success' : 'error'}`}>
              {backendStatus === 'online' ? 'AI Online' : 'AI Offline'}
            </span>
            {hasDocuments && (
              <span className="status-chip info">Documents Ready</span>
            )}
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="premium-card flex flex-col h-[600px]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-[80%] ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-blue-500' 
                      : 'bg-gradient-to-br from-green-500 to-blue-500'
                  }`}>
                    {message.type === 'user' ? (
                      <User size={16} className="text-white" />
                    ) : (
                      <Bot size={16} className="text-white" />
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div className={`rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-100 border border-gray-700'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    
                    {/* Reasoning Steps */}
                    {message.reasoning && message.reasoning.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <p className="text-xs text-gray-400 mb-2">AI Reasoning:</p>
                        <div className="space-y-1">
                          {message.reasoning.slice(0, 3).map((step, index) => (
                            <div key={index} className="text-xs text-gray-300">
                              {index + 1}. {step.description || step}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-400 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Loader size={16} className="animate-spin text-blue-400" />
                    <span className="text-sm text-gray-300">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={hasDocuments 
                ? "Ask me anything about your documents..." 
                : "Upload documents first to start chatting..."
              }
              disabled={!hasDocuments || isLoading}
              className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              rows="1"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || !hasDocuments || isLoading}
              className="btn-primary"
            >
              <Send size={16} />
            </button>
          </div>
          
          {!hasDocuments && (
            <p className="text-xs text-gray-400 mt-2">
              Upload and process documents to enable AI chat functionality
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default SimpleChatBot
