import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  ArrowRight, 
  Building, 
  MapPin, 
  Brain, 
  Zap, 
  Network,
  Eye,
  ChevronRight,
  Sparkles
} from 'lucide-react'

const EntityExplorer = ({ data, onEntityClick }) => {
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [hoveredRelation, setHoveredRelation] = useState(null)
  const [animationPhase, setAnimationPhase] = useState(0)

  // Mock enhanced entity data with relationships
  const mockEntityData = {
    entities: [
      {
        id: 'bharath',
        name: 'Bharath',
        type: 'PERSON',
        color: '#FF6B6B',
        description: 'Software Engineer and AI Researcher',
        properties: {
          role: 'Lead Developer',
          expertise: ['Machine Learning', 'Graph Databases', 'RAG Systems'],
          experience: '5+ years'
        }
      },
      {
        id: 'lyzr',
        name: 'Lyzr AI',
        type: 'ORGANIZATION',
        color: '#4ECDC4',
        description: 'AI-powered automation platform',
        properties: {
          industry: 'Artificial Intelligence',
          founded: '2023',
          focus: 'Enterprise AI Solutions'
        }
      },
      {
        id: 'microsoft',
        name: 'Microsoft',
        type: 'ORGANIZATION',
        color: '#45B7D1',
        description: 'Technology corporation',
        properties: {
          industry: 'Technology',
          founded: '1975',
          headquarters: 'Redmond, WA'
        }
      },
      {
        id: 'salary',
        name: 'Competitive Salary',
        type: 'CONCEPT',
        color: '#96CEB4',
        description: 'Compensation package',
        properties: {
          type: 'Financial Benefit',
          category: 'Compensation'
        }
      }
    ],
    relationships: [
      {
        id: 'rel1',
        source: 'bharath',
        target: 'lyzr',
        type: 'WORKS_AT',
        strength: 0.95,
        description: 'Current employment relationship',
        properties: {
          since: '2023',
          position: 'Lead AI Engineer'
        }
      },
      {
        id: 'rel2',
        source: 'bharath',
        target: 'microsoft',
        type: 'PREVIOUSLY_WORKED_AT',
        strength: 0.8,
        description: 'Previous employment',
        properties: {
          duration: '2020-2023',
          position: 'Senior Software Engineer'
        }
      },
      {
        id: 'rel3',
        source: 'lyzr',
        target: 'salary',
        type: 'OFFERS',
        strength: 0.9,
        description: 'Employment benefit',
        properties: {
          type: 'Compensation Package'
        }
      }
    ]
  }

  useEffect(() => {
    // Animate entities appearing one by one
    const timer = setInterval(() => {
      setAnimationPhase(prev => {
        if (prev < mockEntityData.entities.length + mockEntityData.relationships.length) {
          return prev + 1
        }
        clearInterval(timer)
        return prev
      })
    }, 300)

    return () => clearInterval(timer)
  }, [])

  const getEntityIcon = (type) => {
    switch (type) {
      case 'PERSON': return Users
      case 'ORGANIZATION': return Building
      case 'LOCATION': return MapPin
      case 'CONCEPT': return Brain
      default: return Sparkles
    }
  }

  const getRelationshipPath = (relationship) => {
    const source = mockEntityData.entities.find(e => e.id === relationship.source)
    const target = mockEntityData.entities.find(e => e.id === relationship.target)
    return `${source?.name} → ${relationship.type} → ${target?.name}`
  }

  return (
    <div className="premium-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="section-title">Entity Relationship Explorer</h3>
          <p className="text-muted">Discover connections in your knowledge graph</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="status-chip success">
            <Network size={14} />
            {mockEntityData.entities.length} Entities
          </span>
          <span className="status-chip info">
            <Zap size={14} />
            {mockEntityData.relationships.length} Relations
          </span>
        </div>
      </div>

      {/* Entity Network Visualization */}
      <div className="bg-gray-900/50 rounded-xl p-8 mb-6 min-h-96 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5"></div>
        
        {/* Entities */}
        <div className="relative z-10">
          {mockEntityData.entities.map((entity, index) => {
            const Icon = getEntityIcon(entity.type)
            const isVisible = animationPhase > index
            
            return (
              <AnimatePresence key={entity.id}>
                {isVisible && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 200, 
                      damping: 20,
                      delay: index * 0.1 
                    }}
                    className={`absolute cursor-pointer group ${
                      selectedEntity?.id === entity.id ? 'z-20' : 'z-10'
                    }`}
                    style={{
                      left: `${20 + (index % 3) * 200}px`,
                      top: `${50 + Math.floor(index / 3) * 120}px`
                    }}
                    onClick={() => setSelectedEntity(entity)}
                    whileHover={{ scale: 1.1 }}
                  >
                    {/* Entity Node */}
                    <div 
                      className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                        selectedEntity?.id === entity.id 
                          ? 'ring-4 ring-blue-400 ring-opacity-50' 
                          : 'hover:shadow-xl'
                      }`}
                      style={{ backgroundColor: entity.color }}
                    >
                      <Icon size={24} className="text-white" />
                    </div>
                    
                    {/* Entity Label */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                      <div className="bg-gray-800 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
                        {entity.name}
                      </div>
                    </div>
                    
                    {/* Hover Details */}
                    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm text-white shadow-xl min-w-48">
                        <div className="font-medium mb-1">{entity.name}</div>
                        <div className="text-gray-400 text-xs mb-2">{entity.type}</div>
                        <div className="text-gray-300 text-xs">{entity.description}</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )
          })}
          
          {/* Relationship Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {mockEntityData.relationships.map((rel, index) => {
              const isVisible = animationPhase > mockEntityData.entities.length + index
              const sourceIndex = mockEntityData.entities.findIndex(e => e.id === rel.source)
              const targetIndex = mockEntityData.entities.findIndex(e => e.id === rel.target)
              
              if (sourceIndex === -1 || targetIndex === -1) return null
              
              const x1 = 52 + (sourceIndex % 3) * 200
              const y1 = 82 + Math.floor(sourceIndex / 3) * 120
              const x2 = 52 + (targetIndex % 3) * 200
              const y2 = 82 + Math.floor(targetIndex / 3) * 120
              
              return isVisible ? (
                <motion.g key={rel.id}>
                  <motion.line
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.6 }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#4B5563"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    className="hover:stroke-blue-400 transition-colors cursor-pointer"
                    onMouseEnter={() => setHoveredRelation(rel)}
                    onMouseLeave={() => setHoveredRelation(null)}
                  />
                  
                  {/* Relationship Label */}
                  <motion.text
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ delay: index * 0.2 + 0.5 }}
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2}
                    fill="#9CA3AF"
                    fontSize="10"
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {rel.type}
                  </motion.text>
                </motion.g>
              ) : null
            })}
          </svg>
        </div>
      </div>

      {/* Entity Details Panel */}
      <AnimatePresence>
        {selectedEntity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="premium-card muted"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: selectedEntity.color }}
                >
                  {React.createElement(getEntityIcon(selectedEntity.type), { 
                    size: 20, 
                    className: "text-white" 
                  })}
                </div>
                <div>
                  <h4 className="section-subtitle">{selectedEntity.name}</h4>
                  <span className="status-chip info">{selectedEntity.type}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedEntity(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            
            <p className="text-gray-300 mb-4">{selectedEntity.description}</p>
            
            {/* Properties */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-300">Properties:</h5>
              {Object.entries(selectedEntity.properties).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-400 capitalize">{key}:</span>
                  <span className="text-white">
                    {Array.isArray(value) ? value.join(', ') : value}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Related Connections */}
            <div className="mt-4 pt-4 border-t border-gray-600">
              <h5 className="text-sm font-medium text-gray-300 mb-2">Connections:</h5>
              <div className="space-y-2">
                {mockEntityData.relationships
                  .filter(rel => rel.source === selectedEntity.id || rel.target === selectedEntity.id)
                  .map(rel => (
                    <div key={rel.id} className="flex items-center space-x-2 text-sm">
                      <ChevronRight size={14} className="text-gray-500" />
                      <span className="text-gray-300">{getRelationshipPath(rel)}</span>
                      <span className="text-green-400 text-xs">
                        {Math.round(rel.strength * 100)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Relationship Tooltip */}
      <AnimatePresence>
        {hoveredRelation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-50 bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm text-white shadow-xl pointer-events-none"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="font-medium mb-1">{hoveredRelation.type}</div>
            <div className="text-gray-300 text-xs mb-2">{hoveredRelation.description}</div>
            <div className="text-green-400 text-xs">
              Strength: {Math.round(hoveredRelation.strength * 100)}%
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default EntityExplorer
