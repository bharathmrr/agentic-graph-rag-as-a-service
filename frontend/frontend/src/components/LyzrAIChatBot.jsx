import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, Bot, User, Download, Copy, Trash2, Settings } from 'lucide-react'

const LyzrAIChatBot = ({ onNotification }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you explore the knowledge graph, answer questions about your data, and provide insights. What would you like to know?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const suggestedQuestions = [
    "What entities are in the knowledge graph?",
    "Show me relationships between people and organizations",
    "Find similar concepts to machine learning",
    "What are the main topics in the documents?"
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const aiResponse = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `I understand you're asking about "${inputMessage}". Based on the knowledge graph data, I can provide insights about entities, relationships, and concepts. This is a simulated response that would normally come from the agentic retrieval system.`,
        timestamp: new Date(),
        reasoning: [
          { step: 'Query Analysis', description: 'Analyzed user intent and extracted key entities' },
          { step: 'Information Retrieval', description: 'Retrieved relevant data from vector and graph stores' },
          { step: 'Response Generation', description: 'Synthesized information into coherent response' }
        ]
      }

      setMessages(prev => [...prev, aiResponse])
      
      onNotification?.({
        type: 'success',
        title: 'Response Generated',
        message: 'AI assistant provided a response'
      })
    } catch (error) {
      onNotification?.({
        type: 'error',
        title: 'Response Failed',
        message: error.message
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
    setMessages([{
      id: 1,
      role: 'assistant',
      content: 'Chat cleared. How can I help you explore the knowledge graph?',
      timestamp: new Date()
    }])
  }

  const exportChat = () => {
    const chatData = {
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      })),
      exported_at: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `chat_export_${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-white">
      <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">AI Chat Assistant</h2>
            <p className="text-sm text-gray-400">Powered by Agentic Graph RAG</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportChat}
            className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
          >
            <Download className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearChat}
            className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map(message => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-3xl ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-start space-x-3 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'
                  }`}>
                    {message.role === 'user' ? 
                      <User className="w-4 h-4 text-white" /> : 
                      <Bot className="w-4 h-4 text-white" />
                    }
                  </div>
                  
                  {/* Message Content */}
                  <div className={`flex-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-4 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-800 text-white'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
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
                    </div>
                    
                    {/* Reasoning Steps */}
                    {message.reasoning && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 space-y-2"
                      >
                        <h4 className="text-sm font-medium text-gray-300">Reasoning Steps:</h4>
                        {message.reasoning.map((step, index) => (
                          <div key={index} className="p-2 bg-gray-700/30 rounded text-sm">
                            <span className="font-medium text-blue-400">{step.step}:</span>
                            <span className="text-gray-300 ml-2">{step.description}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Loading Message */}
        {isLoading && (
          <motion.div className="flex justify-start mb-4">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 max-w-xs">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <span className="text-gray-400 text-sm">AI is thinking...</span>
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
                onClick={() => setInputMessage(question)}
                className="p-3 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-lg text-left text-sm text-gray-300 hover:text-white transition-colors"
              >
                {question}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me about the knowledge graph..."
              className="w-full p-3 pr-12 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              disabled={isLoading}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}

export default LyzrAIChatBot
