import React from 'react'

const SimpleKnowledgeGraph = ({ onBack }) => {
  console.log('🔥 SimpleKnowledgeGraph rendered')
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#1f2937', 
      color: 'white', 
      padding: '24px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          {onBack && (
            <button 
              onClick={onBack}
              style={{
                padding: '8px 16px',
                backgroundColor: '#374151',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                marginRight: '16px'
              }}
            >
              ← Back
            </button>
          )}
          <h1 style={{ display: 'inline', fontSize: '32px', fontWeight: 'bold' }}>
            Knowledge Graph Explorer
          </h1>
        </div>
        
        <div style={{
          backgroundColor: '#374151',
          border: '1px solid #4b5563',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🕸️</div>
            <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Knowledge Graph</h2>
            <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
              This is a simple test version of the knowledge graph component.
            </p>
            <button style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}>
              Test Button
            </button>
          </div>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '16px',
          marginTop: '24px'
        }}>
          <div style={{ backgroundColor: '#374151', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#60a5fa' }}>42</div>
            <div style={{ fontSize: '14px', color: '#9ca3af' }}>Total Nodes</div>
          </div>
          <div style={{ backgroundColor: '#374151', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#34d399' }}>38</div>
            <div style={{ fontSize: '14px', color: '#9ca3af' }}>Total Edges</div>
          </div>
          <div style={{ backgroundColor: '#374151', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#a78bfa' }}>6</div>
            <div style={{ fontSize: '14px', color: '#9ca3af' }}>Entity Types</div>
          </div>
          <div style={{ backgroundColor: '#374151', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fb7185' }}>1.0x</div>
            <div style={{ fontSize: '14px', color: '#9ca3af' }}>Zoom Level</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimpleKnowledgeGraph
