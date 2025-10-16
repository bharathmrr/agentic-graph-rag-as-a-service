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
          
          <div className="flex items-center space-x-6">
            {/* Logo Section */}
            <div className="flex items-center space-x-4">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                className="relative w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl"
              >
                <Brain size={28} className="text-white drop-shadow-lg" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
              </motion.div>
              
              <div className="flex flex-col">
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-3xl font-black bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent tracking-tight"
                >
                  Agentic Graph RAG
                </motion.h1>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-2"
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles size={14} className="text-yellow-400" />
                  </motion.div>
                  <p className="text-sm font-semibold text-gray-200 tracking-wide">
                    Powered by <span className="text-yellow-400 font-bold">Lyzr.AI</span>
                  </p>
                </motion.div>
              </div>
            </div>
            
            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="hidden md:flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-green-400 rounded-full"
              />
              <span className="text-sm font-medium text-green-300">AI System Online</span>
            </motion.div>
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
          <div className="flex items-center space-x-3">
            {/* Backend Status */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm rounded-full px-3 py-2 border border-white/10"
            >
              <motion.div 
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-2 h-2 rounded-full ${
                  backendStatus === 'online' ? 'bg-green-400' : 
                  backendStatus === 'offline' ? 'bg-red-400' : 'bg-yellow-400'
                }`}
              />
              <span className={`text-xs font-semibold ${
                backendStatus === 'online' ? 'text-green-300' : 
                backendStatus === 'offline' ? 'text-red-300' : 'text-yellow-300'
              }`}>
                {backendStatus === 'online' ? 'ONLINE' : backendStatus === 'offline' ? 'OFFLINE' : 'CONNECTING'}
              </span>
            </motion.div>

            {/* File Management */}
            {localStorage.getItem('documentsAvailable') === 'true' && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  localStorage.removeItem('uploadedFiles')
                  localStorage.removeItem('documentsAvailable')
                  Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('moduleData_')) {
                      localStorage.removeItem(key)
                    }
                  })
                  window.location.reload()
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white rounded-xl transition-all duration-300 border border-red-400/30 hover:border-red-400/50 backdrop-blur-sm"
              >
                <X size={14} />
                <span className="text-sm font-bold">Clear</span>
              </motion.button>
            )}
            
            {/* Upload Button */}
            <motion.button
              onClick={onUploadClick}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl font-bold text-sm border border-white/20"
            >
              <Upload size={18} />
              <span>Upload Documents</span>
            </motion.button>
            
            {/* Activity Indicator */}
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer backdrop-blur-sm border border-white/10"
            >
              <Activity size={18} className="text-white/70 hover:text-white transition-colors" />
            </motion.div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 90px;
          background: linear-gradient(135deg, 
            rgba(79, 70, 229, 0.95) 0%, 
            rgba(139, 92, 246, 0.95) 25%, 
            rgba(219, 39, 119, 0.95) 75%, 
            rgba(236, 72, 153, 0.95) 100%
          );
          backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 1000;
          box-shadow: 0 10px 40px rgba(139, 92, 246, 0.2);
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.3) 0%, transparent 50%),
                      radial-gradient(circle at 40% 80%, rgba(139, 92, 246, 0.2) 0%, transparent 50%);
          animation: headerGlow 8s ease-in-out infinite alternate;
        }
        
        @keyframes headerGlow {
          0% { opacity: 0.5; }
          100% { opacity: 1; }
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
