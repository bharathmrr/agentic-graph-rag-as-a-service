import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const AnimatedRelationshipGraph = ({ ontologyData }) => {
  const svgRef = useRef()

  const getArrowSymbol = (type) => {
    if (type?.includes('work')) return '💼'
    if (type?.includes('family')) return '❤️'
    if (type?.includes('friend')) return '🤝'
    return '🔗'
  }

  const getNodeColor = (entityType) => {
    const colors = {
      'PERSON': '#8B5CF6',
      'ORGANIZATION': '#06B6D4', 
      'LOCATION': '#10B981',
      'EVENT': '#F59E0B'
    }
    return colors[entityType] || '#6B7280'
  }

  useEffect(() => {
    if (!ontologyData?.entities || !ontologyData?.relationships) return

    const entities = Object.values(ontologyData.entities).flat()
    const relationships = ontologyData.relationships || []

    // Simple positioning for demo
    const nodes = entities.slice(0, 8).map((entity, i) => ({
      ...entity,
      x: 150 + (i % 4) * 150,
      y: 100 + Math.floor(i / 4) * 150,
      color: getNodeColor(entity.type)
    }))

    const links = relationships.slice(0, 6).map(rel => ({
      ...rel,
      symbol: getArrowSymbol(rel.relation_type)
    }))

    // Render with D3 or simple SVG
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Add nodes and links with animations
    // Simplified implementation for demo
    
  }, [ontologyData])

  return (
    <div className="w-full h-96 bg-gray-900/50 rounded-lg p-4">
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  )
}

export default AnimatedRelationshipGraph
