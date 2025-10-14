import React from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  CheckCircle, 
  Zap, 
  Database, 
  Network, 
  Brain,
  Search,
  MessageSquare,
  ArrowRight,
  ExternalLink
} from 'lucide-react'

const DocumentationSummary = () => {
  const features = [
    {
      icon: Brain,
      title: 'Advanced NLP Processing',
      description: 'Extract entities and relationships using state-of-the-art language models'
    },
    {
      icon: Database,
      title: 'Vector Embeddings',
      description: 'Semantic search with ChromaDB integration and similarity matching'
    },
    {
      icon: Network,
      title: 'Knowledge Graphs',
      description: 'Interactive Neo4j graphs with D3.js visualization and exploration'
    },
    {
      icon: Search,
      title: 'Multi-Strategy Retrieval',
      description: 'Hybrid search combining vector, graph, and logical filtering'
    },
    {
      icon: Zap,
      title: 'Real-time Processing',
      description: 'SSE streaming for live updates and progress tracking'
    },
    {
      icon: MessageSquare,
      title: 'Conversational AI',
      description: 'Context-aware chatbot with reasoning chain visualization'
    }
  ]

  const technicalSpecs = [
    { label: 'Backend Framework', value: 'FastAPI + Python' },
    { label: 'Graph Database', value: 'Neo4j Community' },
    { label: 'Vector Store', value: 'ChromaDB' },
    { label: 'LLM Integration', value: 'OpenAI GPT-4 / Ollama' },
    { label: 'Frontend', value: 'React + Framer Motion' },
    { label: 'Visualization', value: 'D3.js + Three.js' }
  ]

  const apiEndpoints = [
    { method: 'POST', path: '/api/ontology/generate', description: 'Generate ontology from documents' },
    { method: 'POST', path: '/api/entity-resolution/detect-duplicates', description: 'Detect duplicate entities' },
    { method: 'POST', path: '/api/embeddings/search', description: 'Semantic vector search' },
    { method: 'GET', path: '/api/graph/visualization', description: 'Get graph visualization data' },
    { method: 'POST', path: '/api/reasoning/query', description: 'Execute RAG queries' },
    { method: 'GET', path: '/api/sse/progress', description: 'Real-time progress updates' }
  ]

  return (
    <motion.div
      className="documentation-summary"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div className="documentation-header">
        <motion.div 
          className="documentation-icon"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          <FileText size={24} />
        </motion.div>
        <div>
          <h2 className="documentation-title">System Overview</h2>
          <p className="documentation-subtitle">
            Advanced Knowledge Graph Processing Platform
          </p>
        </div>
      </div>
      
      <div className="documentation-content">
        <p>
          The Agentic Graph RAG system combines cutting-edge natural language processing, 
          graph databases, and vector embeddings to create an intelligent knowledge management 
          platform. Process documents, extract entities, build knowledge graphs, and query 
          your data using advanced retrieval techniques.
        </p>
      </div>
      
      <div className="documentation-grid">
        {/* Features Section */}
        <div className="doc-section">
          <h3 className="section-title">Core Features</h3>
          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
              >
                <div className="feature-icon">
                  <feature.icon size={18} />
                </div>
                <div className="feature-content">
                  <h4 className="feature-title">{feature.title}</h4>
                  <p className="feature-description">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Technical Specifications */}
        <div className="doc-section">
          <h3 className="section-title">Technical Stack</h3>
          <div className="tech-specs">
            {technicalSpecs.map((spec, index) => (
              <motion.div
                key={index}
                className="spec-item"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <span className="spec-label">{spec.label}</span>
                <span className="spec-value">{spec.value}</span>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* API Endpoints */}
        <div className="doc-section">
          <h3 className="section-title">Key API Endpoints</h3>
          <div className="api-endpoints">
            {apiEndpoints.map((endpoint, index) => (
              <motion.div
                key={index}
                className="endpoint-item"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ x: -4, transition: { duration: 0.2 } }}
              >
                <div className="endpoint-method">
                  {endpoint.method}
                </div>
                <div className="endpoint-details">
                  <code className="endpoint-path">{endpoint.path}</code>
                  <p className="endpoint-description">{endpoint.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Quick Start */}
        <div className="doc-section">
          <h3 className="section-title">Quick Start Guide</h3>
          <div className="quick-start-steps">
            <motion.div 
              className="step-item"
              whileHover={{ scale: 1.02 }}
            >
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Upload Documents</h4>
                <p>Start by uploading your documents through the Upload Documents module</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="step-item"
              whileHover={{ scale: 1.02 }}
            >
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Generate Ontology</h4>
                <p>Extract entities and relationships using the Ontology Generator</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="step-item"
              whileHover={{ scale: 1.02 }}
            >
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Build Knowledge Graph</h4>
                <p>Construct and visualize your knowledge graph with Neo4j integration</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="step-item"
              whileHover={{ scale: 1.02 }}
            >
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Query & Explore</h4>
                <p>Use the Reasoning Stream or Query Console to interact with your data</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="documentation-actions">
        <motion.button
          className="action-button primary"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>View Full Documentation</span>
          <ExternalLink size={16} />
        </motion.button>
        
        <motion.button
          className="action-button secondary"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>API Reference</span>
          <ArrowRight size={16} />
        </motion.button>
      </div>
      
      <style jsx>{`
        .documentation-summary {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 16px;
          padding: 2rem;
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          margin-top: 2rem;
        }
        
        .documentation-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .documentation-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6366f1;
        }
        
        .documentation-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #f8fafc;
          margin: 0;
        }
        
        .documentation-subtitle {
          color: #94a3b8;
          font-size: 0.875rem;
          margin: 0.25rem 0 0 0;
        }
        
        .documentation-content {
          color: #94a3b8;
          line-height: 1.6;
          margin-bottom: 2rem;
          font-size: 0.95rem;
        }
        
        .documentation-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }
        
        .doc-section {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid rgba(148, 163, 184, 0.05);
        }
        
        .section-title {
          color: #f8fafc;
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .section-title::before {
          content: '';
          width: 4px;
          height: 20px;
          background: linear-gradient(135deg, #3b82f6, #10b981);
          border-radius: 2px;
        }
        
        .features-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(148, 163, 184, 0.05);
          border-radius: 8px;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .feature-item:hover {
          background: rgba(148, 163, 184, 0.1);
        }
        
        .feature-icon {
          color: #10b981;
          flex-shrink: 0;
          margin-top: 0.125rem;
        }
        
        .feature-content {
          flex: 1;
        }
        
        .feature-title {
          color: #e2e8f0;
          font-size: 0.875rem;
          font-weight: 500;
          margin: 0 0 0.25rem 0;
        }
        
        .feature-description {
          color: #94a3b8;
          font-size: 0.8rem;
          line-height: 1.4;
          margin: 0;
        }
        
        .tech-specs {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .spec-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }
        
        .spec-item:last-child {
          border-bottom: none;
        }
        
        .spec-label {
          color: #94a3b8;
          font-size: 0.875rem;
        }
        
        .spec-value {
          color: #e2e8f0;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .api-endpoints {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .endpoint-item {
          display: flex;
          gap: 1rem;
          padding: 0.75rem;
          background: rgba(148, 163, 184, 0.05);
          border-radius: 8px;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .endpoint-item:hover {
          background: rgba(148, 163, 184, 0.1);
        }
        
        .endpoint-method {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          flex-shrink: 0;
          height: fit-content;
        }
        
        .endpoint-details {
          flex: 1;
        }
        
        .endpoint-path {
          color: #10b981;
          font-size: 0.8rem;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          background: rgba(16, 185, 129, 0.1);
          padding: 0.125rem 0.25rem;
          border-radius: 3px;
          display: block;
          margin-bottom: 0.25rem;
        }
        
        .endpoint-description {
          color: #94a3b8;
          font-size: 0.8rem;
          margin: 0;
        }
        
        .quick-start-steps {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .step-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: rgba(148, 163, 184, 0.05);
          border-radius: 8px;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .step-item:hover {
          background: rgba(148, 163, 184, 0.1);
        }
        
        .step-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #10b981);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
          flex-shrink: 0;
        }
        
        .step-content h4 {
          color: #e2e8f0;
          font-size: 0.9rem;
          font-weight: 500;
          margin: 0 0 0.25rem 0;
        }
        
        .step-content p {
          color: #94a3b8;
          font-size: 0.8rem;
          line-height: 1.4;
          margin: 0;
        }
        
        .documentation-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
        }
        
        .action-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
        }
        
        .action-button.primary {
          background: linear-gradient(135deg, #3b82f6, #10b981);
          color: white;
          border: none;
        }
        
        .action-button.secondary {
          background: rgba(148, 163, 184, 0.1);
          color: #e2e8f0;
          border: 1px solid rgba(148, 163, 184, 0.2);
        }
        
        .action-button:hover {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        
        @media (max-width: 768px) {
          .documentation-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .documentation-actions {
            flex-direction: column;
          }
          
          .action-button {
            justify-content: center;
          }
        }
      `}</style>
    </motion.div>
  )
}

export default DocumentationSummary
