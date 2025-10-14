import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, SlidersHorizontal, Zap, Target, Layers } from 'lucide-react'

const ModernSearchInterface = ({ 
  onSearch, 
  placeholder = "Search your knowledge graph...",
  showFilters = true,
  searchStrategies = ['vector', 'graph', 'hybrid', 'adaptive'],
  selectedStrategy = 'adaptive',
  onStrategyChange
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [filters, setFilters] = useState({
    entityType: '',
    confidence: 0.7,
    maxResults: 10
  })

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearch?.(searchQuery, selectedStrategy, filters)
    }
  }

  const strategyConfig = {
    vector: {
      name: 'Vector Search',
      icon: <Target size={16} />,
      description: 'Semantic similarity search',
      color: '#007BFF'
    },
    graph: {
      name: 'Graph Traversal', 
      icon: <Layers size={16} />,
      description: 'Relationship-based search',
      color: '#28A745'
    },
    hybrid: {
      name: 'Hybrid Search',
      icon: <SlidersHorizontal size={16} />,
      description: 'Combined vector + graph',
      color: '#FFC107'
    },
    adaptive: {
      name: 'Adaptive AI',
      icon: <Zap size={16} />,
      description: 'AI-powered strategy selection',
      color: '#DC3545'
    }
  }

  return (
    <div className="modern-search-interface">
      {/* Search Strategy Selection */}
      {showFilters && (
        <div className="strategy-selector">
          <h3>Retrieval Strategy</h3>
          <div className="strategy-options">
            {searchStrategies.map((strategy) => {
              const config = strategyConfig[strategy]
              const isActive = selectedStrategy === strategy
              
              return (
                <motion.button
                  key={strategy}
                  className={`strategy-option ${isActive ? 'active' : ''}`}
                  onClick={() => onStrategyChange?.(strategy)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    '--strategy-color': config.color
                  }}
                >
                  <div className="strategy-icon">
                    {config.icon}
                  </div>
                  <div className="strategy-content">
                    <span className="strategy-name">{config.name}</span>
                    <span className="strategy-description">{config.description}</span>
                  </div>
                  {isActive && (
                    <motion.div
                      className="strategy-indicator"
                      layoutId="activeStrategy"
                    />
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
      )}

      {/* Main Search Bar */}
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder}
              className="search-input"
            />
          </div>
          
          <div className="search-actions">
            {showFilters && (
              <button
                type="button"
                className={`filter-toggle ${showAdvanced ? 'active' : ''}`}
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <Filter size={16} />
                Filters
              </button>
            )}
            
            <button type="submit" className="search-button">
              <Search size={16} />
              Search
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && showFilters && (
          <motion.div
            className="advanced-filters"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="filter-row">
              <div className="filter-group">
                <label>Entity Type</label>
                <select
                  value={filters.entityType}
                  onChange={(e) => setFilters(prev => ({ ...prev, entityType: e.target.value }))}
                  className="filter-select"
                >
                  <option value="">All Types</option>
                  <option value="person">Person</option>
                  <option value="organization">Organization</option>
                  <option value="location">Location</option>
                  <option value="concept">Concept</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Confidence Threshold</label>
                <div className="slider-container">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={filters.confidence}
                    onChange={(e) => setFilters(prev => ({ ...prev, confidence: parseFloat(e.target.value) }))}
                    className="confidence-slider"
                  />
                  <span className="slider-value">{(filters.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
              
              <div className="filter-group">
                <label>Max Results</label>
                <select
                  value={filters.maxResults}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxResults: parseInt(e.target.value) }))}
                  className="filter-select"
                >
                  <option value={5}>5 results</option>
                  <option value={10}>10 results</option>
                  <option value={20}>20 results</option>
                  <option value={50}>50 results</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </form>

      <style jsx>{`
        .modern-search-interface {
          background: #FFFFFF;
          border-radius: 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .strategy-selector {
          margin-bottom: 2rem;
        }

        .strategy-selector h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #333333;
          margin-bottom: 1rem;
        }

        .strategy-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .strategy-option {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: #F8F9FA;
          border: 2px solid transparent;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .strategy-option:hover {
          background: #E9ECEF;
          transform: translateY(-1px);
        }

        .strategy-option.active {
          background: rgba(var(--strategy-color-rgb, 0, 123, 255), 0.1);
          border-color: var(--strategy-color);
          box-shadow: 0 0 0 3px rgba(var(--strategy-color-rgb, 0, 123, 255), 0.1);
        }

        .strategy-icon {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          background: rgba(var(--strategy-color-rgb, 0, 123, 255), 0.1);
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--strategy-color);
        }

        .strategy-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .strategy-name {
          font-weight: 600;
          color: #333333;
          margin-bottom: 0.25rem;
        }

        .strategy-description {
          font-size: 0.875rem;
          color: #666666;
        }

        .strategy-indicator {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          width: 8px;
          height: 8px;
          background: var(--strategy-color);
          border-radius: 50%;
        }

        .search-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .search-container {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .search-input-wrapper {
          position: relative;
          flex: 1;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #666666;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: 2px solid #E5E5E5;
          border-radius: 2rem;
          font-size: 1rem;
          color: #333333;
          background: #FFFFFF;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .search-input:focus {
          outline: none;
          border-color: #007BFF;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }

        .search-input::placeholder {
          color: #999999;
        }

        .search-actions {
          display: flex;
          gap: 0.75rem;
        }

        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          background: #F8F9FA;
          border: 1px solid #E5E5E5;
          border-radius: 0.75rem;
          color: #666666;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-toggle:hover {
          background: #E9ECEF;
        }

        .filter-toggle.active {
          background: #007BFF;
          color: white;
          border-color: #007BFF;
        }

        .search-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: #007BFF;
          color: white;
          border: none;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
        }

        .search-button:hover {
          background: #0056b3;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
        }

        .advanced-filters {
          background: #F8F9FA;
          border-radius: 0.75rem;
          padding: 1.5rem;
          border: 1px solid #E5E5E5;
        }

        .filter-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          font-weight: 600;
          color: #333333;
          font-size: 0.875rem;
        }

        .filter-select {
          padding: 0.75rem;
          border: 1px solid #DDDDDD;
          border-radius: 0.5rem;
          background: #FFFFFF;
          color: #333333;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .filter-select:focus {
          outline: none;
          border-color: #007BFF;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
        }

        .slider-container {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .confidence-slider {
          flex: 1;
          height: 4px;
          background: #E5E5E5;
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }

        .confidence-slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #007BFF;
          border-radius: 50%;
          cursor: pointer;
        }

        .slider-value {
          font-weight: 600;
          color: #007BFF;
          min-width: 40px;
          text-align: right;
        }

        @media (max-width: 768px) {
          .modern-search-interface {
            padding: 1rem;
          }

          .strategy-options {
            grid-template-columns: 1fr;
          }

          .search-container {
            flex-direction: column;
            gap: 1rem;
          }

          .search-actions {
            width: 100%;
            justify-content: center;
          }

          .filter-row {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  )
}

export default ModernSearchInterface
