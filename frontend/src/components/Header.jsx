import React from 'react'
import { motion } from 'framer-motion'
import { Menu, X, Zap, Activity, Upload, Plus } from 'lucide-react'
import { useData } from '../context/DataContext'
import LYzrLogo from './LYzrLogo'

const Header = ({ sidebarOpen, setSidebarOpen, activeModule, modules, onUploadClick }) => {
  const { backendStatus } = useData()
  
  const activeModuleData = modules.find(m => m.id === activeModule)
  
  const getStatusColor = () => {
    switch (backendStatus) {
      case 'online': return '#10b981'
      case 'offline': return '#ef4444'
      default: return '#f59e0b'
    }
  }

  return (
    <motion.header 
      className="header"
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="header-content">
        <div className="header-left">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <LYzrLogo className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Lyzr.AI</h1>
          </div>
          
          {activeModuleData && (
            <div className="breadcrumb">
              <span className="breadcrumb-separator">/</span>
              <activeModuleData.icon size={16} />
              <span>{activeModuleData.name}</span>
            </div>
          )}
        </div>
        
        <div className="header-right">
          <div className="flex items-center space-x-4">
            {/* File Management */}
            {localStorage.getItem('documentsAvailable') === 'true' && (
              <button
                onClick={() => {
                  localStorage.removeItem('uploadedFiles')
                  localStorage.removeItem('documentsAvailable')
                  // Clear all module data
                  Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('moduleData_')) {
                      localStorage.removeItem(key)
                    }
                  })
                  window.location.reload()
                }}
                className="flex items-center space-x-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-white rounded-lg transition-all duration-200"
              >
                <X size={16} />
                <span className="text-sm">Clear Files</span>
              </button>
            )}
            
            <div className="system-status">
              <div className="status-indicator">
                <div className="status-dot status-online"></div>
                <span>System Online</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="header-right">
          <motion.button
            className="upload-button"
            onClick={onUploadClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Upload size={18} />
            <span>Upload Files</span>
          </motion.button>
          
          <div className="status-indicator">
            <div 
              className="status-dot"
              style={{ backgroundColor: getStatusColor() }}
            />
            <span className="status-text">
              Backend {backendStatus}
            </span>
          </div>
          
          <div className="header-actions">
            <Activity size={18} className="activity-icon" />
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 64px;
          background: rgba(26, 26, 26, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid #374151;
          z-index: 1000;
        }
        
        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          padding: 0 24px;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .sidebar-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: #a1a1aa;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .sidebar-toggle:hover {
          background: #2a2a2a;
          color: #ffffff;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .logo-icon {
          color: #3b82f6;
        }
        
        .logo-text {
          font-size: 18px;
          font-weight: 600;
          color: #ffffff;
        }
        
        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #a1a1aa;
          font-size: 14px;
        }
        
        .breadcrumb-separator {
          color: #4b5563;
        }
        
        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        
        .status-text {
          font-size: 12px;
          color: #a1a1aa;
          text-transform: capitalize;
        }
        
        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .activity-icon {
          color: #a1a1aa;
          cursor: pointer;
          transition: color 0.2s ease;
        }
        
        .activity-icon:hover {
          color: #ffffff;
        }
        
        .upload-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .upload-button:hover {
          background: linear-gradient(135deg, #2563eb, #1e40af);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        @media (max-width: 768px) {
          .header-content {
            padding: 0 16px;
          }
          
          .logo-text {
            display: none;
          }
          
          .breadcrumb {
            display: none;
          }
        }
      `}</style>
    </motion.header>
  )
}

export default Header
