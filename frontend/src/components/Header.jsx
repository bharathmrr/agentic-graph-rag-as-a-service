import React from 'react'
import { motion } from 'framer-motion'
import { Menu, X, Zap, Activity, Upload, Plus, Brain, Sparkles } from 'lucide-react'
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
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg"
              >
                <Brain size={24} className="text-white" />
              </motion.div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Agentic Graph RAG
                </h1>
                <div className="flex items-center space-x-1">
                  <Sparkles size={12} className="text-yellow-400" />
                  <p className="text-xs text-gray-300 font-medium">Powered by Lyzr.AI</p>
                </div>
              </div>
            </div>
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
                className="flex items-center space-x-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-lg transition-all duration-200 border border-red-500/30"
              >
                <X size={14} />
                <span className="text-sm font-medium">Clear Files</span>
              </button>
            )}
            
            {/* Backend Status */}
            <div className="flex items-center space-x-2">
              <div 
                className={`w-2 h-2 rounded-full animate-pulse ${
                  backendStatus === 'online' ? 'bg-green-400' : 
                  backendStatus === 'offline' ? 'bg-red-400' : 'bg-yellow-400'
                }`}
              />
              <span className={`text-sm font-medium ${
                backendStatus === 'online' ? 'text-green-400' : 
                backendStatus === 'offline' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {backendStatus === 'online' ? 'Online' : backendStatus === 'offline' ? 'Offline' : 'Connecting'}
              </span>
            </div>
            
            {/* Upload Button */}
            <motion.button
              onClick={onUploadClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              <Upload size={16} />
              <span>Upload</span>
            </motion.button>
            
            {/* Activity Indicator */}
            <div className="w-8 h-8 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
              <Activity size={16} className="text-gray-400 hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 80px;
          background: linear-gradient(135deg, rgba(88, 28, 135, 0.95) 0%, rgba(30, 58, 138, 0.95) 50%, rgba(67, 56, 202, 0.95) 100%);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(139, 92, 246, 0.3);
          z-index: 1000;
          box-shadow: 0 8px 32px rgba(139, 92, 246, 0.15);
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
