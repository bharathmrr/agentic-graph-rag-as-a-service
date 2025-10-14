import React from 'react'
import { motion } from 'framer-motion'
import { 
  AlertTriangle, 
  Upload, 
  Brain, 
  Search, 
  Database,
  ArrowRight,
  CheckCircle,
  FileText
} from 'lucide-react'

const NoDataAlert = ({ 
  type = 'general',
  title,
  message,
  requiredSteps = [],
  onAction,
  actionText = 'Go to Dashboard',
  className = ''
}) => {
  const getIcon = () => {
    switch (type) {
      case 'upload': return <Upload size={48} />
      case 'ontology': return <Brain size={48} />
      case 'entity': return <Search size={48} />
      case 'embedding': return <Database size={48} />
      case 'graph': return <FileText size={48} />
      default: return <AlertTriangle size={48} />
    }
  }

  const getDefaultTitle = () => {
    switch (type) {
      case 'upload': return 'No Documents Uploaded'
      case 'ontology': return 'No Ontology Generated'
      case 'entity': return 'No Entity Resolution Data'
      case 'embedding': return 'No Embeddings Generated'
      case 'graph': return 'No Graph Data Available'
      default: return 'No Data Available'
    }
  }

  const getDefaultMessage = () => {
    switch (type) {
      case 'upload': return 'Upload documents to begin processing and analysis.'
      case 'ontology': return 'Generate ontology data from your uploaded documents first.'
      case 'entity': return 'Complete the previous steps to enable entity resolution.'
      case 'embedding': return 'Generate embeddings from your processed data.'
      case 'graph': return 'Build your knowledge graph from the processed entities.'
      default: return 'Complete the required steps to view data here.'
    }
  }

  const getDefaultSteps = () => {
    switch (type) {
      case 'entity': return [
        'Upload documents',
        'Generate ontology data',
        'Run entity resolution'
      ]
      case 'embedding': return [
        'Upload documents', 
        'Generate ontology data',
        'Complete entity resolution'
      ]
      case 'graph': return [
        'Upload documents',
        'Generate ontology data', 
        'Resolve entities',
        'Generate embeddings'
      ]
      default: return ['Upload documents', 'Process data']
    }
  }

  const displayTitle = title || getDefaultTitle()
  const displayMessage = message || getDefaultMessage()
  const displaySteps = requiredSteps.length > 0 ? requiredSteps : getDefaultSteps()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`no-data-alert ${className}`}
    >
      <div className="alert-card warning">
        <div className="alert-card-icon">
          {getIcon()}
        </div>
        
        <div className="alert-card-content">
          <h3>{displayTitle}</h3>
          <p>{displayMessage}</p>
          
          {displaySteps.length > 0 && (
            <div className="required-steps">
              <h4>Required Steps:</h4>
              <ul className="steps-list">
                {displaySteps.map((step, index) => (
                  <li key={index} className="step-item">
                    <CheckCircle size={16} className="step-icon" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {onAction && (
            <motion.button
              className="btn btn-primary action-button"
              onClick={onAction}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {actionText}
              <ArrowRight size={16} />
            </motion.button>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .no-data-alert {
          width: 100%;
          max-width: 600px;
          margin: 2rem auto;
        }
        
        .alert-card {
          padding: 2rem;
          border-radius: 1rem;
          border-left: 4px solid;
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        
        .alert-card.warning {
          background-color: #FFF3CD;
          border-left-color: #FFC107;
        }
        
        .alert-card-icon {
          flex-shrink: 0;
          width: 64px;
          height: 64px;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #FFC107;
          color: white;
        }
        
        .alert-card-content {
          flex: 1;
        }
        
        .alert-card-content h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #333333;
          margin-bottom: 0.5rem;
        }
        
        .alert-card-content p {
          color: #666666;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
        
        .required-steps h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #333333;
          margin-bottom: 1rem;
        }
        
        .steps-list {
          list-style: none;
          padding-left: 0;
          margin-bottom: 1.5rem;
        }
        
        .step-item {
          padding: 0.5rem 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #666666;
          font-weight: 500;
        }
        
        .step-icon {
          color: #28A745;
          flex-shrink: 0;
        }
        
        .action-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background-color: #007BFF;
          color: white;
          border: none;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .action-button:hover {
          background-color: #0056b3;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }
        
        @media (max-width: 768px) {
          .alert-card {
            flex-direction: column;
            text-align: center;
            padding: 1.5rem;
          }
          
          .alert-card-icon {
            align-self: center;
            width: 56px;
            height: 56px;
          }
        }
      `}</style>
    </motion.div>
  )
}

export default NoDataAlert
