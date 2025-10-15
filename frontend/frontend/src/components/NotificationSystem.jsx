import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

const NotificationSystem = ({ notifications }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'success': return CheckCircle
      case 'error': return AlertCircle
      case 'info': return Info
      default: return Info
    }
  }

  const getColor = (type) => {
    switch (type) {
      case 'success': return '#10b981'
      case 'error': return '#ef4444'
      case 'warning': return '#f59e0b'
      case 'info': return '#3b82f6'
      default: return '#6b7280'
    }
  }

  return (
    <div className="notification-container">
      <AnimatePresence>
        {notifications.map((notification) => {
          const Icon = getIcon(notification.type)
          const color = getColor(notification.type)
          
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="notification"
              style={{ borderLeftColor: color }}
            >
              <div className="notification-content">
                <div className="notification-icon" style={{ color }}>
                  <Icon size={20} />
                </div>
                <div className="notification-text">
                  <h4 className="notification-title">{notification.title}</h4>
                  <p className="notification-message">{notification.message}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
      
      <style jsx>{`
        .notification-container {
          position: fixed;
          top: 80px;
          right: 20px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 400px;
        }
        
        .notification {
          background: rgba(26, 26, 26, 0.95);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-left: 4px solid;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .notification-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        
        .notification-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }
        
        .notification-text {
          flex: 1;
        }
        
        .notification-title {
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 4px 0;
        }
        
        .notification-message {
          font-size: 13px;
          color: #a1a1aa;
          margin: 0;
          line-height: 1.4;
        }
        
        @media (max-width: 768px) {
          .notification-container {
            right: 16px;
            left: 16px;
            max-width: none;
          }
        }
      `}</style>
    </div>
  )
}

export default NotificationSystem
