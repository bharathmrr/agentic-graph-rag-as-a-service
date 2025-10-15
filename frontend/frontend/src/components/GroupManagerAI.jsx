import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  GraduationCap,
  Send, 
  Bot, 
  User, 
  BookOpen,
  Lightbulb,
  Code,
  Brain,
  Copy,
  Download,
  Trash2,
  Sparkles,
  Loader,
  Info
} from 'lucide-react'

/**
 * Step 11: Group Manager AI
 * 
 * Educational chatbot for:
 * - RAG (Retrieval-Augmented Generation) concepts
 * - AI and machine learning topics
 * - Lyzr AI and Bharath's projects
 * - Knowledge graph and graph RAG explanations
 * 
 * Focus: Educational, not personal chat
 */
const GroupManagerAI = ({ onNotification, onEducationComplete }) => {
  // Step 11 specific states
  const [currentStep, setCurrentStep] = useState(11)
  const [totalSteps] = useState(12)
  const [isStep11Complete, setIsStep11Complete] = useState(false)
  const [showReadyButton, setShowReadyButton] = useState(false)
  const [educationalStats, setEducationalStats] = useState({})
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [topicCategory, setTopicCategory] = useState(null)
  const [questionsAnswered, setQuestionsAnswered] = useState(0)
  
  const messagesEndRef = useRef(null)

  const educationalTopics = [
    {
      category: 'RAG Basics',
      icon: Brain,
      color: '#3b82f6',
      questions: [
        "What is RAG (Retrieval-Augmented Generation)?",
        "How does RAG differ from traditional LLMs?",
        "What are the main components of a RAG system?"
      ]
    },
    {
      category: 'Knowledge Graphs',
      icon: Code,
      color: '#8b5cf6',
      questions: [
        "What is a knowledge graph?",
        "How are knowledge graphs used in RAG?",
        "What is Neo4j and how does it work?"
      ]
    },
    {
      category: 'Vector Embeddings',
      icon: Sparkles,
      color: '#10b981',
      questions: [
        "What are vector embeddings?",
        "How does semantic search work?",
        "What is ChromaDB used for?"
      ]
    },
    {
      category: 'Lyzr AI Projects',
      icon: Lightbulb,
      color: '#f59e0b',
      questions: [
        "What is Lyzr AI?",
        "Tell me about Bharath's AI projects",
        "What makes Agentic Graph RAG unique?"
      ]
    }
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
      content: '🎓 Welcome to Group Manager AI! I\'m your educational assistant for learning about RAG, knowledge graphs, AI concepts, and the Lyzr AI project by Bharath. Ask me anything educational - I\'m here to teach, not chat personally!',
      timestamp: new Date(),
      category: 'welcome'
    }
    setMessages([welcome])
  }

  const detectTopicCategory = (text) => {
    const lower = text.toLowerCase()
    
    if (lower.includes('rag') || lower.includes('retrieval') || lower.includes('augmented')) {
      return 'RAG Basics'
    }
    if (lower.includes('graph') || lower.includes('neo4j') || lower.includes('node') || lower.includes('relationship')) {
      return 'Knowledge Graphs'
    }
    if (lower.includes('embedding') || lower.includes('vector') || lower.includes('semantic') || lower.includes('chromadb')) {
      return 'Vector Embeddings'
    }
    if (lower.includes('lyzr') || lower.includes('bharath') || lower.includes('project') || lower.includes('agentic')) {
      return 'Lyzr AI Projects'
    }
    return 'General AI'
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const category = detectTopicCategory(inputMessage)
    setTopicCategory(category)

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
      // Call Group Manager AI API (Step 11)
      const response = await fetch('http://127.0.0.1:8000/v2/chat/group-manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText
        })
      })

      const data = await response.json()

      if (data.success && data.data) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: data.data.answer || 'I found relevant educational information for you.',
          timestamp: new Date(),
          keywords: data.data.keywords || [],
          category: category
        }

        setMessages(prev => [...prev, botMessage])

        onNotification?.({
          type: 'success',
          title: 'Educational Response',
          message: `Category: ${category}`
        })
      } else {
        throw new Error(data.error || 'Failed to get response')
      }

    } catch (error) {
      console.error('Group Manager AI error:', error)
      
      // Fallback educational responses
      const fallbackResponses = {
        'RAG Basics': 'RAG (Retrieval-Augmented Generation) is an AI framework that combines a retriever (which searches for relevant information from a knowledge base) with a generator (an LLM that creates responses). This ensures answers are grounded in actual data rather than just model knowledge.',
        
        'Knowledge Graphs': 'A knowledge graph is a structured representation of information where entities (nodes) are connected by relationships (edges). In this system, we use Neo4j to store entities like people, organizations, and concepts, allowing complex queries about how they relate to each other.',
        
        'Vector Embeddings': 'Vector embeddings are numerical representations of text that capture semantic meaning. Similar concepts have similar vector representations, enabling semantic search. We use ChromaDB to store and query these embeddings efficiently.',
        
        'Lyzr AI Projects': 'Lyzr AI, developed by Bharath, focuses on building intelligent agentic systems. This Agentic Graph RAG project combines graph databases, vector embeddings, and LLMs to create a powerful knowledge exploration system that goes beyond traditional RAG implementations.',
        
        'General AI': 'AI (Artificial Intelligence) encompasses various techniques for creating intelligent systems. Modern AI often combines multiple approaches: neural networks for pattern recognition, knowledge graphs for structured reasoning, and retrieval systems for grounded responses.'
      }

      const fallbackMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: fallbackResponses[category] || fallbackResponses['General AI'],
        timestamp: new Date(),
        keywords: [],
        category: category,
        isFallback: true
      }

      setMessages(prev => [...prev, fallbackMessage])

      onNotification?.({
        type: 'info',
        title: 'Educational Content',
        message: 'Using built-in educational knowledge'
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
      message: 'Educational content copied to clipboard'
    })
  }

  const clearChat = () => {
    addWelcomeMessage()
    setTopicCategory(null)
  }

  const exportChat = () => {
    const exportData = {
      messages: messages.map(m => ({
        type: m.type,
        content: m.content,
        category: m.category,
        timestamp: m.timestamp
      })),
      exported_at: new Date().toISOString(),
      session_type: 'Educational',
      total_messages: messages.length
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `group-manager-ai-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="group-manager-container">
      {/* Header */}
      <div className="gm-header">
        <div className="header-left">
          <div className="header-icon">
            <GraduationCap className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Group Manager AI</h2>
            <p className="text-sm text-gray-400">Educational Assistant • RAG & AI Concepts</p>
          </div>
        </div>
        
        <div className="header-actions">
          <button onClick={clearChat} className="action-btn" title="New session">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={exportChat} className="action-btn" title="Export notes">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Topic Category Bar */}
      {topicCategory && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="topic-bar"
        >
          <BookOpen className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-gray-300">Current Topic:</span>
          <span className="topic-badge">{topicCategory}</span>
        </motion.div>
      )}

      {/* Messages */}
      <div className="messages-area">
        <AnimatePresence>
          {messages.map((message) => (
            <EducationalMessage 
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
            <Loader className="w-5 h-5 animate-spin text-yellow-400" />
            <span className="text-gray-400">Retrieving educational content...</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Educational Topics */}
      {messages.length === 1 && (
        <div className="topics-section">
          <h3 className="text-sm font-medium text-gray-300 mb-3">📚 Explore Topics:</h3>
          <div className="topics-grid">
            {educationalTopics.map((topic, idx) => (
              <TopicCard 
                key={idx} 
                topic={topic} 
                onQuestionClick={setInputMessage}
              />
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
            placeholder="Ask about RAG, AI, knowledge graphs, or Lyzr AI..."
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
        <div className="hint-text">
          <Info className="w-3 h-3" />
          <span>Ask educational questions only - no personal chat</span>
        </div>
      </div>

      <style jsx>{`
        .group-manager-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 800px;
          background: rgba(15, 23, 42, 0.9);
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .gm-header {
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
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(234, 179, 8, 0.2));
          display: flex;
          align-items: center;
          justify-center: center;
          border: 1px solid rgba(245, 158, 11, 0.3);
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

        .topic-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.25rem;
          background: rgba(59, 130, 246, 0.1);
          border-bottom: 1px solid rgba(59, 130, 246, 0.2);
        }

        .topic-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
          font-size: 0.75rem;
          font-weight: 600;
          border: 1px solid rgba(245, 158, 11, 0.3);
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
          background: rgba(245, 158, 11, 0.1);
          border-radius: 12px;
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .topics-section {
          padding: 1rem 1.25rem;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
          background: rgba(0, 0, 0, 0.2);
          max-height: 400px;
          overflow-y: auto;
        }

        .topics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
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
          margin-bottom: 0.5rem;
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
          border-color: rgba(245, 158, 11, 0.5);
          background: rgba(0, 0, 0, 0.4);
        }

        .send-btn {
          padding: 0.875rem 1.25rem;
          border-radius: 10px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          border: none;
          color: white;
          cursor: pointer;
          transition: all 0.3s;
          font-weight: 500;
        }

        .send-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(245, 158, 11, 0.4);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .hint-text {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #94a3b8;
          font-size: 0.75rem;
          padding-left: 0.5rem;
        }
      `}</style>
    </div>
  )
}

const TopicCard = ({ topic, onQuestionClick }) => {
  const [expanded, setExpanded] = useState(false)
  const Icon = topic.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="topic-card"
      style={{ borderColor: topic.color + '40' }}
    >
      <div className="topic-header" onClick={() => setExpanded(!expanded)}>
        <div className="topic-icon" style={{ background: topic.color + '20', borderColor: topic.color + '40' }}>
          <Icon className="w-5 h-5" style={{ color: topic.color }} />
        </div>
        <h4 className="topic-title" style={{ color: topic.color }}>
          {topic.category}
        </h4>
      </div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="topic-questions"
        >
          {topic.questions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => onQuestionClick(q)}
              className="question-btn"
            >
              <Lightbulb className="w-3 h-3" />
              {q}
            </button>
          ))}
        </motion.div>
      )}

      <style jsx>{`
        .topic-card {
          padding: 1rem;
          background: rgba(30, 41, 59, 0.4);
          border-radius: 12px;
          border: 1px solid;
          cursor: pointer;
          transition: all 0.3s;
        }

        .topic-card:hover {
          background: rgba(30, 41, 59, 0.6);
          transform: translateY(-2px);
        }

        .topic-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .topic-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid;
        }

        .topic-title {
          font-weight: 600;
          font-size: 0.9375rem;
        }

        .topic-questions {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .question-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 8px;
          color: #e2e8f0;
          font-size: 0.8125rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
        }

        .question-btn:hover {
          background: rgba(59, 130, 246, 0.2);
          border-color: rgba(59, 130, 246, 0.4);
          color: #dbeafe;
        }
      `}</style>
    </motion.div>
  )
}

const EducationalMessage = ({ message, onCopy }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`edu-message ${message.type}`}
    >
      <div className="message-header">
        <div className="avatar">
          {message.type === 'user' ? (
            <User className="w-4 h-4" />
          ) : (
            <GraduationCap className="w-4 h-4" />
          )}
        </div>
        <div className="message-meta">
          <span className="sender-name">
            {message.type === 'user' ? 'Student' : 'Educator AI'}
          </span>
          <span className="timestamp">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
        {message.category && message.category !== 'welcome' && (
          <span className="category-tag">{message.category}</span>
        )}
        <button 
          onClick={() => onCopy(message.content)}
          className="copy-btn"
          title="Copy content"
        >
          <Copy className="w-3 h-3" />
        </button>
      </div>

      <div className="message-content">
        {message.content}
      </div>

      {message.isFallback && (
        <div className="fallback-note">
          <Info className="w-3 h-3" />
          <span>Built-in educational content</span>
        </div>
      )}

      <style jsx>{`
        .edu-message {
          max-width: 85%;
          padding: 1rem;
          border-radius: 12px;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(148, 163, 184, 0.1);
        }

        .edu-message.user {
          align-self: flex-end;
          background: rgba(99, 102, 241, 0.15);
          border-color: rgba(99, 102, 241, 0.3);
        }

        .edu-message.bot {
          align-self: flex-start;
          background: rgba(245, 158, 11, 0.15);
          border-color: rgba(245, 158, 11, 0.3);
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

        .category-tag {
          padding: 0.25rem 0.625rem;
          border-radius: 12px;
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
          font-size: 0.6875rem;
          font-weight: 600;
          border: 1px solid rgba(245, 158, 11, 0.3);
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
          line-height: 1.7;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .fallback-note {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #94a3b8;
        }
      `}</style>
    </motion.div>
  )
}

export default GroupManagerAI
