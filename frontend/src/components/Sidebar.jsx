import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const Sidebar = ({ isOpen, modules, activeModule, setActiveModule }) => {
  return (
    <motion.aside
      className={`sidebar ${!isOpen ? 'hidden' : ''}`}
      initial={false}
      animate={{
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)'
      }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
          <div className="sidebar-content">
            <nav className="sidebar-nav">
              {modules.filter(module => module.id !== 'upload' && module.id !== 'core-modules').map((module) => {
                const Icon = module.icon
                const isActive = activeModule === module.id
                
                return (
                  <motion.button
                    key={module.id}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveModule(module.id)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="nav-item-content">
                      <Icon 
                        size={20} 
                        className="nav-icon"
                        style={{ color: isActive ? module.color : '#a1a1aa' }}
                      />
                      <span className="nav-text">{module.name}</span>
                    </div>
                    
                    {isActive && (
                      <motion.div
                        className="active-indicator"
                        layoutId="activeIndicator"
                        style={{ backgroundColor: module.color }}
                      />
                    )}
                  </motion.button>
                )
              })}
            </nav>
            
            <div className="sidebar-footer">
              <div className="version-info">
                <span className="version-label">Version</span>
                <span className="version-number">2.0.0</span>
              </div>
            </div>
          </div>
          
          <style jsx>{`
            .sidebar {
              /* Positioning handled by App.css */
              background: rgba(26, 26, 26, 0.95);
              backdrop-filter: blur(10px);
              border-right: 1px solid #374151;
            }
            
            .sidebar-content {
              display: flex;
              flex-direction: column;
              height: 100%;
              padding: 24px 0;
            }
            
            .sidebar-nav {
              flex: 1;
              padding: 0 16px;
            }
            
            .nav-item {
              position: relative;
              display: flex;
              align-items: center;
              width: 100%;
              padding: 0;
              margin-bottom: 4px;
              background: transparent;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.2s ease;
              overflow: hidden;
            }
            
            .nav-item:hover {
              background: rgba(255, 255, 255, 0.05);
            }
            
            .nav-item.active {
              background: rgba(255, 255, 255, 0.1);
            }
            
            .nav-item-content {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 12px 16px;
              width: 100%;
            }
            
            .nav-icon {
              flex-shrink: 0;
              transition: color 0.2s ease;
            }
            
            .nav-text {
              font-size: 14px;
              font-weight: 500;
              color: #ffffff;
              transition: color 0.2s ease;
            }
            
            .nav-item:not(.active) .nav-text {
              color: #a1a1aa;
            }
            
            .nav-item:hover .nav-text {
              color: #ffffff;
            }
            
            .active-indicator {
              position: absolute;
              right: 0;
              top: 0;
              bottom: 0;
              width: 3px;
              border-radius: 1.5px 0 0 1.5px;
            }
            
            .sidebar-footer {
              padding: 16px 24px;
              border-top: 1px solid #374151;
            }
            
            .version-info {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            
            .version-label {
              font-size: 12px;
              color: #6b7280;
            }
            
            .version-number {
              font-size: 12px;
              font-weight: 600;
              color: #3b82f6;
            }
            
            @media (max-width: 768px) {
              .sidebar {
                width: 100vw;
              }
            }
          `}</style>
    </motion.aside>
  )
}

export default Sidebar
