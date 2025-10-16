import React from 'react'
import { motion } from 'framer-motion'
import { X, Activity, Clock, CheckCircle } from 'lucide-react'

const ProcessingStatusBar = ({ status, onCancel }) => {
  const { isProcessing, currentStep, progress, totalSteps } = status
  
  if (!isProcessing) return null

  const progressPercentage = totalSteps > 0 ? (progress / totalSteps) * 100 : 0

  return (
    <motion.div
      className="processing-status-bar"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="processing-content">
        <div className="processing-info">
          <motion.div
            className="processing-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <div className="processing-details">
            <div className="processing-text">
              {currentStep || 'Processing...'}
            </div>
            <div className="processing-substep">
              Step {progress} of {totalSteps}
            </div>
          </div>
        </div>
        
        <div className="processing-progress">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          <div className="progress-text">
            {Math.round(progressPercentage)}%
          </div>
        </div>
        
        <motion.button
          className="processing-cancel"
          onClick={onCancel}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <X size={16} />
          Cancel
        </motion.button>
      </div>
      
      {/* Progress indicators */}
      <div className="progress-indicators">
        {Array.from({ length: totalSteps }, (_, i) => (
          <motion.div
            key={i}
            className={`progress-indicator ${i < progress ? 'completed' : i === progress ? 'active' : 'pending'}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            {i < progress ? (
              <CheckCircle size={16} />
            ) : i === progress ? (
              <Activity size={16} className="animate-pulse" />
            ) : (
              <Clock size={16} />
            )}
          </motion.div>
        ))}
      </div>
      
      <style jsx>{`
        .processing-status-bar {
          position: fixed;
          top: 64px;
          left: 0;
          right: 0;
          background: rgba(15, 23, 42, 0.95);
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          backdrop-filter: blur(20px);
          padding: 1rem 2rem;
          z-index: 100;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        
        .processing-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto;
          gap: 2rem;
        }
        
        .processing-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .processing-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid rgba(59, 130, 246, 0.3);
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
        }
        
        .processing-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .processing-text {
          color: #f8fafc;
          font-weight: 600;
          font-size: 0.875rem;
        }
        
        .processing-substep {
          color: #94a3b8;
          font-size: 0.75rem;
        }
        
        .processing-progress {
          flex: 1;
          position: relative;
          height: 8px;
          background: rgba(148, 163, 184, 0.2);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #10b981, #8b5cf6);
          background-size: 200% 100%;
          border-radius: 4px;
          animation: shimmer 2s infinite;
        }
        
        .progress-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #f8fafc;
          font-size: 0.75rem;
          font-weight: 600;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }
        
        .processing-cancel {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .processing-cancel:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.5);
        }
        
        .progress-indicators {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
        }
        
        .progress-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        
        .progress-indicator.completed {
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid rgba(16, 185, 129, 0.5);
          color: #10b981;
        }
        
        .progress-indicator.active {
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.5);
          color: #3b82f6;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
        }
        
        .progress-indicator.pending {
          background: rgba(148, 163, 184, 0.1);
          border: 1px solid rgba(148, 163, 184, 0.3);
          color: #94a3b8;
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @media (max-width: 768px) {
          .processing-content {
            flex-direction: column;
            gap: 1rem;
          }
          
          .processing-progress {
            order: -1;
            width: 100%;
          }
          
          .progress-indicators {
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          
          .progress-indicator {
            width: 24px;
            height: 24px;
          }
        }
      `}</style>
    </motion.div>
  )
}

export default ProcessingStatusBar
