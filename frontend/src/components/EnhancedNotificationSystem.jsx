import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  AlertTriangle,
  Zap,
  Clock
} from 'lucide-react'

const EnhancedNotificationSystem = ({ notifications, onRemove }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />
      case 'error':
        return <AlertCircle size={20} />
      case 'warning':
        return <AlertTriangle size={20} />
      case 'info':
        return <Info size={20} />
      case 'processing':
        return <Zap size={20} />
      default:
        return <Clock size={20} />
    }
  }

  const getNotificationColors = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'rgba(16, 185, 129, 0.1)',
          border: 'rgba(16, 185, 129, 0.3)',
          icon: '#10b981',
          progress: '#10b981'
        }
      case 'error':
        return {
          bg: 'rgba(239, 68, 68, 0.1)',
          border: 'rgba(239, 68, 68, 0.3)',
          icon: '#ef4444',
          progress: '#ef4444'
        }
      case 'warning':
        return {
          bg: 'rgba(245, 158, 11, 0.1)',
          border: 'rgba(245, 158, 11, 0.3)',
          icon: '#f59e0b',
          progress: '#f59e0b'
        }
      case 'info':
        return {
          bg: 'rgba(59, 130, 246, 0.1)',
          border: 'rgba(59, 130, 246, 0.3)',
          icon: '#3b82f6',
          progress: '#3b82f6'
        }
      case 'processing':
        return {
          bg: 'rgba(139, 92, 246, 0.1)',
          border: 'rgba(139, 92, 246, 0.3)',
          icon: '#8b5cf6',
          progress: '#8b5cf6'
        }
      default:
        return {
          bg: 'rgba(148, 163, 184, 0.1)',
          border: 'rgba(148, 163, 184, 0.3)',
          icon: '#94a3b8',
          progress: '#94a3b8'
        }
    }
  }

  return (
    <div className="enhanced-notification-system">
      <AnimatePresence>
        {notifications.map((notification, index) => {
          const colors = getNotificationColors(notification.type)
          
          return (
            <motion.div
              key={notification.id}
              className="notification-item"
              style={{
                '--notification-bg': colors.bg,
                '--notification-border': colors.border,
                '--notification-icon': colors.icon,
                '--notification-progress': colors.progress
              }}
              initial={{ 
                opacity: 0, 
                x: 300, 
                scale: 0.8,
                rotateY: 90
              }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                scale: 1,
                rotateY: 0
              }}
              exit={{ 
                opacity: 0, 
                x: 300, 
                scale: 0.8,
                rotateY: -90,
                transition: { duration: 0.3 }
              }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                delay: index * 0.1
              }}
              whileHover={{ 
                scale: 1.02,
                y: -2,
                transition: { duration: 0.2 }
              }}
              layout
            >
              <div className="notification-content">
                <div className="notification-header">
                  <motion.div 
                    className="notification-icon"
                    animate={notification.type === 'processing' ? {
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    } : {}}
                    transition={{
                      rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                      scale: { duration: 1, repeat: Infinity }
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </motion.div>
                  
                  <div className="notification-text">
                    <h4 className="notification-title">
                      {notification.title}
                    </h4>
                    <p className="notification-message">
                      {notification.message}
                    </p>
                  </div>
                  
                  <motion.button
                    className="notification-close"
                    onClick={() => onRemove?.(notification.id)}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={16} />
                  </motion.button>
                </div>
                
                {notification.progress !== undefined && (
                  <div className="notification-progress-container">
                    <motion.div
                      className="notification-progress-bar"
                      initial={{ width: 0 }}
                      animate={{ width: `${notification.progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                )}
                
                {notification.actions && (
                  <div className="notification-actions">
                    {notification.actions.map((action, actionIndex) => (
                      <motion.button
                        key={actionIndex}
                        className="notification-action"
                        onClick={action.onClick}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {action.icon && <action.icon size={14} />}
                        {action.label}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Auto-dismiss progress indicator */}
              {notification.autoRemove !== false && (
                <motion.div
                  className="auto-dismiss-indicator"
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: 5, ease: "linear" }}
                />
              )}
              
              {/* Glow effect */}
              <motion.div
                className="notification-glow"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          )
        })}
      </AnimatePresence>
      
      <style jsx>{`
        .enhanced-notification-system {
          position: fixed;
          top: 80px;
          right: 20px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 400px;
          pointer-events: none;
        }
        
        .notification-item {
          background: var(--notification-bg);
          border: 1px solid var(--notification-border);
          border-radius: 12px;
          backdrop-filter: blur(20px);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.3),
            0 0 20px var(--notification-border);
          overflow: hidden;
          position: relative;
          pointer-events: auto;
          min-width: 320px;
        }
        
        .notification-content {
          padding: 16px;
          position: relative;
          z-index: 2;
        }
        
        .notification-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        
        .notification-icon {
          color: var(--notification-icon);
          flex-shrink: 0;
          margin-top: 2px;
        }
        
        .notification-text {
          flex: 1;
          min-width: 0;
        }
        
        .notification-title {
          color: #f8fafc;
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 4px 0;
          line-height: 1.3;
        }
        
        .notification-message {
          color: #cbd5e1;
          font-size: 13px;
          line-height: 1.4;
          margin: 0;
          word-wrap: break-word;
        }
        
        .notification-close {
          background: rgba(148, 163, 184, 0.1);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 6px;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        
        .notification-close:hover {
          background: rgba(148, 163, 184, 0.2);
          color: #f8fafc;
        }
        
        .notification-progress-container {
          margin-top: 12px;
          height: 3px;
          background: rgba(148, 163, 184, 0.2);
          border-radius: 2px;
          overflow: hidden;
        }
        
        .notification-progress-bar {
          height: 100%;
          background: var(--notification-progress);
          border-radius: 2px;
          position: relative;
        }
        
        .notification-progress-bar::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          animation: shimmer 2s infinite;
        }
        
        .notification-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
        }
        
        .notification-action {
          background: rgba(148, 163, 184, 0.1);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 6px;
          color: #e2e8f0;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .notification-action:hover {
          background: rgba(148, 163, 184, 0.2);
          border-color: rgba(148, 163, 184, 0.3);
        }
        
        .auto-dismiss-indicator {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 2px;
          background: var(--notification-progress);
          transform-origin: left;
          opacity: 0.6;
        }
        
        .notification-glow {
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: var(--notification-border);
          border-radius: 14px;
          z-index: -1;
          filter: blur(8px);
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @media (max-width: 768px) {
          .enhanced-notification-system {
            top: 70px;
            right: 16px;
            left: 16px;
            max-width: none;
          }
          
          .notification-item {
            min-width: auto;
          }
          
          .notification-content {
            padding: 14px;
          }
          
          .notification-title {
            font-size: 13px;
          }
          
          .notification-message {
            font-size: 12px;
          }
        }
        
        @media (max-width: 480px) {
          .notification-header {
            gap: 10px;
          }
          
          .notification-actions {
            flex-direction: column;
          }
          
          .notification-action {
            justify-content: center;
          }
        }
        
        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          .notification-item {
            transition: none;
          }
          
          .notification-icon {
            animation: none !important;
          }
          
          .notification-glow {
            animation: none !important;
          }
          
          .notification-progress-bar::after {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}

export default EnhancedNotificationSystem
