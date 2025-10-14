import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import * as d3 from 'd3'
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Play, 
  Pause, 
  Settings,
  Download,
  Filter,
  Search,
  Maximize2
} from 'lucide-react'
import { useData } from '../context/DataContext'

const InteractiveKnowledgeGraph = ({ onNotification }) => {
  const svgRef = useRef()
  const { neo4jData, getNeo4jData, isLoading, error } = useData()
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })
  const [selectedNode, setSelectedNode] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [filterType, setFilterType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [graphStats, setGraphStats] = useState({})
  const [simulation, setSimulation] = useState(null)

  // Entity type colors
  const entityColors = {
    'PERSON': '#3b82f6',
    'ORGANIZATION': '#10b981',
    'LOCATION': '#f59e0b',
    'EVENT': '#8b5cf6',
    'CONCEPT': '#06b6d4',
    'PRODUCT': '#ec4899',
    'DATE': '#84cc16',
    'MONEY': '#f97316',
    'default': '#6b7280'
  }

  // Initialize graph data
  useEffect(() => {
    const loadGraphData = async () => {
      try {
        if (!neo4jData) {
          await getNeo4jData()
        }
        
        if (neo4jData?.data) {
          processGraphData(neo4jData.data)
        } else {
          // Use sample data if no real data available
          const sampleData = generateSampleGraphData()
          processGraphData(sampleData)
        }
      } catch (error) {
        console.error('Error loading graph data:', error)
        onNotification({
          type: 'error',
          title: 'Graph Loading Error',
          message: 'Failed to load graph data. Using sample data.'
        })
        
        // Fallback to sample data
        const sampleData = generateSampleGraphData()
        processGraphData(sampleData)
      }
    }

    loadGraphData()
  }, [neo4jData, getNeo4jData])

  const generateSampleGraphData = () => {
    const nodes = [
      { id: 'n1', label: 'Alice Johnson', type: 'PERSON', color: entityColors.PERSON, size: 15 },
      { id: 'n2', label: 'TechCorp Inc', type: 'ORGANIZATION', color: entityColors.ORGANIZATION, size: 20 },
      { id: 'n3', label: 'San Francisco', type: 'LOCATION', color: entityColors.LOCATION, size: 12 },
      { id: 'n4', label: 'AI Conference 2024', type: 'EVENT', color: entityColors.EVENT, size: 18 },
      { id: 'n5', label: 'Machine Learning', type: 'CONCEPT', color: entityColors.CONCEPT, size: 16 },
      { id: 'n6', label: 'Bob Smith', type: 'PERSON', color: entityColors.PERSON, size: 14 },
      { id: 'n7', label: 'DataViz Pro', type: 'PRODUCT', color: entityColors.PRODUCT, size: 13 }
    ]

    const edges = [
      { id: 'e1', source: 'n1', target: 'n2', relation_type: 'works_for', weight: 0.9 },
      { id: 'e2', source: 'n2', target: 'n3', relation_type: 'located_in', weight: 0.8 },
      { id: 'e3', source: 'n1', target: 'n4', relation_type: 'attended', weight: 0.7 },
      { id: 'e4', source: 'n4', target: 'n5', relation_type: 'focuses_on', weight: 0.9 },
      { id: 'e5', source: 'n1', target: 'n6', relation_type: 'colleague_of', weight: 0.6 },
      { id: 'e6', source: 'n2', target: 'n7', relation_type: 'develops', weight: 0.8 }
    ]

    return { nodes, edges }
  }

  const processGraphData = (data) => {
    const processedNodes = data.nodes?.map(node => ({
      ...node,
      x: Math.random() * 800,
      y: Math.random() * 600,
      color: entityColors[node.type] || entityColors.default,
      size: node.size || 10
    })) || []

    const processedLinks = data.edges?.map(edge => ({
      ...edge,
      source: edge.source,
      target: edge.target,
      strength: edge.weight || 0.5
    })) || []

    setGraphData({ nodes: processedNodes, links: processedLinks })
    
    // Update stats
    const typeCount = {}
    processedNodes.forEach(node => {
      typeCount[node.type] = (typeCount[node.type] || 0) + 1
    })
    
    setGraphStats({
      nodeCount: processedNodes.length,
      linkCount: processedLinks.length,
      typeCount
    })
  }

  // Initialize D3 force simulation
  useEffect(() => {
    if (!graphData.nodes.length) return

    const svg = d3.select(svgRef.current)
    const width = 1000
    const height = 600

    // Clear previous content
    svg.selectAll('*').remove()

    // Create zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform)
        setZoomLevel(event.transform.k)
      })

    svg.call(zoom)

    // Create container for graph elements
    const container = svg.append('g')

    // Create force simulation
    const sim = d3.forceSimulation(graphData.nodes)
      .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => d.size + 5))

    setSimulation(sim)

    // Create links
    const links = container.selectAll('.link')
      .data(graphData.links)
      .enter().append('line')
      .attr('class', 'link')
      .style('stroke', '#4b5563')
      .style('stroke-width', d => Math.sqrt(d.strength * 5))
      .style('stroke-opacity', 0.6)

    // Create nodes
    const nodes = container.selectAll('.node')
      .data(graphData.nodes)
      .enter().append('circle')
      .attr('class', 'node')
      .attr('r', d => d.size)
      .style('fill', d => d.color)
      .style('stroke', '#ffffff')
      .style('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('click', (event, d) => {
        setSelectedNode(d)
        highlightConnections(d)
      })
      .on('mouseover', (event, d) => {
        // Show tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'graph-tooltip')
          .style('opacity', 0)
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')

        tooltip.transition().duration(200).style('opacity', 1)
        tooltip.html(`
          <strong>${d.label}</strong><br/>
          Type: ${d.type}<br/>
          Connections: ${graphData.links.filter(l => l.source.id === d.id || l.target.id === d.id).length}
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px')
      })
      .on('mouseout', () => {
        d3.selectAll('.graph-tooltip').remove()
      })

    // Create labels
    const labels = container.selectAll('.label')
      .data(graphData.nodes)
      .enter().append('text')
      .attr('class', 'label')
      .text(d => d.label)
      .style('font-size', '12px')
      .style('font-weight', '500')
      .style('fill', '#ffffff')
      .style('text-anchor', 'middle')
      .style('pointer-events', 'none')

    // Update positions on simulation tick
    sim.on('tick', () => {
      links
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      nodes
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)

      labels
        .attr('x', d => d.x)
        .attr('y', d => d.y + d.size + 15)
    })

    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) sim.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event, d) {
      d.fx = event.x
      d.fy = event.y
    }

    function dragended(event, d) {
      if (!event.active) sim.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

    // Highlight connections function
    function highlightConnections(node) {
      const connectedLinks = graphData.links.filter(l => 
        l.source.id === node.id || l.target.id === node.id
      )
      const connectedNodeIds = new Set()
      connectedLinks.forEach(l => {
        connectedNodeIds.add(l.source.id)
        connectedNodeIds.add(l.target.id)
      })

      // Fade non-connected elements
      nodes.style('opacity', d => connectedNodeIds.has(d.id) ? 1 : 0.3)
      links.style('opacity', d => 
        d.source.id === node.id || d.target.id === node.id ? 1 : 0.1
      )
      labels.style('opacity', d => connectedNodeIds.has(d.id) ? 1 : 0.3)
    }

    return () => {
      sim.stop()
    }
  }, [graphData])

  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current)
    svg.transition().call(
      d3.zoom().transform,
      d3.zoomTransform(svg.node()).scale(zoomLevel * 1.2)
    )
  }

  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current)
    svg.transition().call(
      d3.zoom().transform,
      d3.zoomTransform(svg.node()).scale(zoomLevel * 0.8)
    )
  }

  const handleReset = () => {
    const svg = d3.select(svgRef.current)
    svg.transition().call(
      d3.zoom().transform,
      d3.zoomIdentity
    )
    setSelectedNode(null)
    
    // Reset all opacities
    svg.selectAll('.node').style('opacity', 1)
    svg.selectAll('.link').style('opacity', 0.6)
    svg.selectAll('.label').style('opacity', 1)
  }

  const toggleSimulation = () => {
    if (simulation) {
      if (isPlaying) {
        simulation.stop()
      } else {
        simulation.restart()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const exportGraph = () => {
    const svg = svgRef.current
    const serializer = new XMLSerializer()
    const source = serializer.serializeToString(svg)
    const blob = new Blob([source], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'knowledge-graph.svg'
    link.click()
    URL.revokeObjectURL(url)
    
    onNotification({
      type: 'success',
      title: 'Graph Exported',
      message: 'Knowledge graph exported as SVG file'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="loading"></div>
        <span className="ml-3">Loading knowledge graph...</span>
      </div>
    )
  }

  return (
    <div className="knowledge-graph-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="graph-header"
      >
        <div className="header-info">
          <h2 className="graph-title">Interactive Knowledge Graph</h2>
          <div className="graph-stats">
            <span className="stat-item">
              {graphStats.nodeCount} nodes
            </span>
            <span className="stat-separator">•</span>
            <span className="stat-item">
              {graphStats.linkCount} edges
            </span>
          </div>
        </div>
        
        <div className="graph-controls">
          <button onClick={handleZoomIn} className="control-btn">
            <ZoomIn size={16} />
          </button>
          <button onClick={handleZoomOut} className="control-btn">
            <ZoomOut size={16} />
          </button>
          <button onClick={handleReset} className="control-btn">
            <RotateCcw size={16} />
          </button>
          <button onClick={toggleSimulation} className="control-btn">
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button onClick={exportGraph} className="control-btn">
            <Download size={16} />
          </button>
        </div>
      </motion.div>

      <div className="graph-content">
        <div className="graph-main">
          <svg
            ref={svgRef}
            width="100%"
            height="600"
            className="knowledge-graph-svg"
          />
        </div>

        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="node-details-panel"
          >
            <h3 className="panel-title">Node Details</h3>
            <div className="node-info">
              <div className="info-row">
                <span className="info-label">Name:</span>
                <span className="info-value">{selectedNode.label}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Type:</span>
                <span 
                  className="info-value type-badge"
                  style={{ backgroundColor: selectedNode.color }}
                >
                  {selectedNode.type}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Connections:</span>
                <span className="info-value">
                  {graphData.links.filter(l => 
                    l.source.id === selectedNode.id || l.target.id === selectedNode.id
                  ).length}
                </span>
              </div>
              {selectedNode.metadata && (
                <div className="metadata-section">
                  <span className="info-label">Attributes:</span>
                  <div className="metadata-list">
                    {Object.entries(selectedNode.metadata).map(([key, value]) => (
                      <div key={key} className="metadata-item">
                        <span className="metadata-key">{key}:</span>
                        <span className="metadata-value">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <style jsx>{`
        .knowledge-graph-container {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 24px;
          height: 100%;
        }
        
        .graph-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .header-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .graph-title {
          font-size: 24px;
          font-weight: 600;
          color: #ffffff;
          margin: 0;
        }
        
        .graph-stats {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #a1a1aa;
        }
        
        .stat-item {
          font-weight: 500;
        }
        
        .stat-separator {
          color: #4b5563;
        }
        
        .graph-controls {
          display: flex;
          gap: 8px;
        }
        
        .control-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .control-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }
        
        .graph-content {
          display: flex;
          gap: 20px;
          height: 600px;
        }
        
        .graph-main {
          flex: 1;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        
        .knowledge-graph-svg {
          background: radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
        }
        
        .node-details-panel {
          width: 300px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 20px;
          height: fit-content;
        }
        
        .panel-title {
          font-size: 18px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 16px;
        }
        
        .node-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .info-label {
          font-size: 14px;
          color: #a1a1aa;
          font-weight: 500;
        }
        
        .info-value {
          font-size: 14px;
          color: #ffffff;
          font-weight: 500;
        }
        
        .type-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          color: #ffffff;
        }
        
        .metadata-section {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .metadata-list {
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .metadata-item {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
        }
        
        .metadata-key {
          color: #a1a1aa;
        }
        
        .metadata-value {
          color: #ffffff;
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}

export default InteractiveKnowledgeGraph
