import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Terminal, 
  Play, 
  Pause, 
  Trash2, 
  Download, 
  Copy, 
  ChevronRight,
  Database,
  Search,
  Zap,
  Clock
} from 'lucide-react'

const LiveQueryConsole = ({ onNotification }) => {
  const [isRunning, setIsRunning] = useState(false)
  const [currentQuery, setCurrentQuery] = useState('')
  const [queryHistory, setQueryHistory] = useState([])
  const [output, setOutput] = useState([
    { 
      type: 'system', 
      content: 'Agentic Graph RAG Console v2.0.0', 
      timestamp: new Date().toISOString() 
    },
    { 
      type: 'system', 
      content: 'Connected to Neo4j and ChromaDB', 
      timestamp: new Date().toISOString() 
    },
    { 
      type: 'info', 
      content: 'Type "help" for available commands', 
      timestamp: new Date().toISOString() 
    }
  ])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const outputRef = useRef(null)
  const inputRef = useRef(null)

  const predefinedQueries = [
    {
      name: 'Show Graph Statistics',
      query: 'MATCH (n) RETURN labels(n) as NodeType, count(n) as Count',
      type: 'cypher'
    },
    {
      name: 'Search Entities',
      query: 'search_entities("artificial intelligence", limit=10)',
      type: 'semantic'
    },
    {
      name: 'Find Relationships',
      query: 'MATCH (a)-[r]->(b) RETURN type(r) as RelationType, count(r) as Count ORDER BY Count DESC LIMIT 10',
      type: 'cypher'
    },
    {
      name: 'Vector Similarity',
      query: 'find_similar("machine learning", threshold=0.8)',
      type: 'vector'
    }
  ]

  const commands = {
    help: () => [
      'Available commands:',
      '  help - Show this help message',
      '  clear - Clear console output',
      '  status - Show system status',
      '  history - Show query history',
      '  export - Export query results',
      '',
      'Query types:',
      '  Cypher: Neo4j graph queries',
      '  Semantic: Natural language search',
      '  Vector: Similarity search',
      '  Hybrid: Combined retrieval'
    ],
    clear: () => {
      setOutput([])
      return ['Console cleared']
    },
    status: () => [
      'System Status:',
      '  Neo4j: Connected ✓',
      '  ChromaDB: Connected ✓',
      '  Embeddings: Ready ✓',
      '  Graph Nodes: 1,247',
      '  Vector Dimensions: 1536',
      '  Last Update: ' + new Date().toLocaleString()
    ],
    history: () => [
      'Query History:',
      ...queryHistory.slice(-10).map((q, i) => `  ${i + 1}. ${q}`)
    ],
    export: () => [
      'Exporting query results...',
      'Results exported to downloads folder'
    ]
  }

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

  const addOutput = (content, type = 'output') => {
    const newEntry = {
      type,
      content: Array.isArray(content) ? content.join('\n') : content,
      timestamp: new Date().toISOString()
    }
    setOutput(prev => [...prev, newEntry])
  }

  const executeQuery = async (query) => {
    if (!query.trim()) return

    setIsRunning(true)
    setQueryHistory(prev => [...prev, query])
    addOutput(`> ${query}`, 'input')

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    try {
      // Check if it's a command
      if (query.startsWith('/') || commands[query.toLowerCase()]) {
        const command = query.replace('/', '').toLowerCase()
        if (commands[command]) {
          addOutput(commands[command](), 'success')
        } else {
          addOutput(`Unknown command: ${command}`, 'error')
        }
      } else {
        // Simulate different query types
        if (query.toUpperCase().includes('MATCH') || query.toUpperCase().includes('RETURN')) {
          // Cypher query
          addOutput([
            'Executing Cypher query...',
            '',
            '┌─────────────────┬───────┐',
            '│ NodeType        │ Count │',
            '├─────────────────┼───────┤',
            '│ Entity          │   847 │',
            '│ Document        │    23 │',
            '│ Concept         │   377 │',
            '└─────────────────┴───────┘',
            '',
            'Query executed in 0.234s'
          ], 'success')
        } else if (query.includes('search_entities') || query.includes('find_similar')) {
          // Semantic/Vector query
          addOutput([
            'Executing semantic search...',
            '',
            'Results:',
            '1. Artificial Intelligence (similarity: 0.95)',
            '2. Machine Learning (similarity: 0.89)',
            '3. Deep Learning (similarity: 0.87)',
            '4. Neural Networks (similarity: 0.84)',
            '5. Natural Language Processing (similarity: 0.82)',
            '',
            'Found 5 results in 0.156s'
          ], 'success')
        } else {
          // Generic query
          addOutput([
            'Processing query...',
            '',
            'Results: ' + Math.floor(Math.random() * 100) + ' entities found',
            'Execution time: ' + (Math.random() * 2).toFixed(3) + 's'
          ], 'success')
        }
      }
    } catch (error) {
      addOutput(`Error: ${error.message}`, 'error')
    }

    setIsRunning(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      executeQuery(currentQuery)
      setCurrentQuery('')
      setHistoryIndex(-1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (historyIndex < queryHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setCurrentQuery(queryHistory[queryHistory.length - 1 - newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCurrentQuery(queryHistory[queryHistory.length - 1 - newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setCurrentQuery('')
      }
    }
  }

  const copyOutput = () => {
    const text = output.map(entry => `[${entry.timestamp}] ${entry.content}`).join('\n')
    navigator.clipboard.writeText(text)
    onNotification?.({
      type: 'success',
      title: 'Copied',
      message: 'Console output copied to clipboard'
    })
  }

  const exportResults = () => {
    const data = {
      timestamp: new Date().toISOString(),
      queries: queryHistory,
      output: output
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `console-session-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getOutputIcon = (type) => {
    switch (type) {
      case 'input': return <ChevronRight size={14} className="text-blue-400" />
      case 'success': return <Database size={14} className="text-green-400" />
      case 'error': return <Zap size={14} className="text-red-400" />
      case 'system': return <Terminal size={14} className="text-purple-400" />
      default: return <Clock size={14} className="text-gray-400" />
    }
  }

  const getOutputColor = (type) => {
    switch (type) {
      case 'input': return 'text-blue-300'
      case 'success': return 'text-green-300'
      case 'error': return 'text-red-300'
      case 'system': return 'text-purple-300'
      default: return 'text-gray-300'
    }
  }

  return (
    <div className="live-query-console">
      <motion.div
        className="query-console"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="console-header">
          <div className="console-title">
            <Terminal size={20} />
            <span>Live Query Console</span>
            {isRunning && (
              <motion.div
                className="running-indicator"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </motion.div>
            )}
          </div>
          
          <div className="console-controls">
            <motion.button
              className="console-button"
              onClick={() => setIsRunning(!isRunning)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={isRunning ? 'Pause' : 'Resume'}
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} />}
            </motion.button>
            
            <motion.button
              className="console-button"
              onClick={() => commands.clear()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Clear Console"
            >
              <Trash2 size={16} />
            </motion.button>
            
            <motion.button
              className="console-button"
              onClick={copyOutput}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Copy Output"
            >
              <Copy size={16} />
            </motion.button>
            
            <motion.button
              className="console-button"
              onClick={exportResults}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Export Results"
            >
              <Download size={16} />
            </motion.button>
          </div>
        </div>
        
        <div className="console-output" ref={outputRef}>
          <AnimatePresence>
            {output.map((entry, index) => (
              <motion.div
                key={index}
                className={`output-line ${getOutputColor(entry.type)}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="output-icon">
                  {getOutputIcon(entry.type)}
                </div>
                <div className="output-content">
                  <pre>{entry.content}</pre>
                </div>
                <div className="output-timestamp">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isRunning && (
            <motion.div
              className="processing-indicator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center gap-2 text-blue-400">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Search size={14} />
                </motion.div>
                <span>Processing query...</span>
              </div>
            </motion.div>
          )}
        </div>
        
        <div className="console-input-area">
          <div className="input-prompt">
            <ChevronRight size={16} className="text-blue-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            className="console-input"
            value={currentQuery}
            onChange={(e) => setCurrentQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter query or command (type 'help' for commands)..."
            disabled={isRunning}
          />
          <motion.button
            className="console-send"
            onClick={() => executeQuery(currentQuery)}
            disabled={isRunning || !currentQuery.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play size={16} />
          </motion.button>
        </div>
      </motion.div>
      
      {/* Predefined Queries Panel */}
      <motion.div
        className="predefined-queries"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Quick Queries</h3>
        <div className="space-y-2">
          {predefinedQueries.map((query, index) => (
            <motion.button
              key={index}
              className="predefined-query-button"
              onClick={() => setCurrentQuery(query.query)}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="query-type-badge">
                {query.type}
              </div>
              <div className="query-name">
                {query.name}
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
      
      <style jsx>{`
        .live-query-console {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 2rem;
          height: calc(100vh - 200px);
          padding: 2rem;
        }
        
        .query-console {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 16px;
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .console-header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(0, 0, 0, 0.2);
        }
        
        .console-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #f8fafc;
          font-weight: 500;
        }
        
        .running-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .console-controls {
          display: flex;
          gap: 0.5rem;
        }
        
        .console-button {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid rgba(148, 163, 184, 0.2);
          background: rgba(148, 163, 184, 0.1);
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .console-button:hover {
          background: rgba(148, 163, 184, 0.2);
          color: #f8fafc;
          border-color: rgba(148, 163, 184, 0.3);
        }
        
        .console-output {
          flex: 1;
          padding: 1rem 1.5rem;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875rem;
          line-height: 1.5;
          overflow-y: auto;
          background: rgba(0, 0, 0, 0.3);
        }
        
        .output-line {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
          padding: 0.25rem 0;
        }
        
        .output-icon {
          flex-shrink: 0;
          margin-top: 0.125rem;
        }
        
        .output-content {
          flex: 1;
        }
        
        .output-content pre {
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
        }
        
        .output-timestamp {
          flex-shrink: 0;
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 0.125rem;
        }
        
        .processing-indicator {
          padding: 0.5rem 0;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
        }
        
        .console-input-area {
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(0, 0, 0, 0.2);
        }
        
        .input-prompt {
          color: #3b82f6;
          flex-shrink: 0;
        }
        
        .console-input {
          flex: 1;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 8px;
          padding: 0.75rem;
          color: #f8fafc;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875rem;
          transition: all 0.3s ease;
        }
        
        .console-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
        
        .console-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .console-send {
          background: #3b82f6;
          border: none;
          border-radius: 8px;
          padding: 0.75rem;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .console-send:hover:not(:disabled) {
          background: #2563eb;
        }
        
        .console-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .predefined-queries {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          height: fit-content;
        }
        
        .predefined-query-button {
          width: 100%;
          background: rgba(148, 163, 184, 0.05);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 8px;
          padding: 0.75rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .predefined-query-button:hover {
          background: rgba(148, 163, 184, 0.1);
          border-color: rgba(148, 163, 184, 0.2);
        }
        
        .query-type-badge {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          width: fit-content;
        }
        
        .query-name {
          color: #e2e8f0;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        @media (max-width: 1024px) {
          .live-query-console {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .predefined-queries {
            order: -1;
          }
        }
        
        @media (max-width: 768px) {
          .live-query-console {
            padding: 1rem;
          }
          
          .console-header {
            padding: 0.75rem 1rem;
          }
          
          .console-output {
            padding: 0.75rem 1rem;
          }
          
          .console-input-area {
            padding: 0.75rem 1rem;
          }
        }
      `}</style>
    </div>
  )
}

export default LiveQueryConsole
