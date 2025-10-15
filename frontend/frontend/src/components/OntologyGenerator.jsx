import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Upload, Download, Eye, Settings } from 'lucide-react'

const OntologyGenerator = ({ onNotification }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [ontologyData, setOntologyData] = useState(null)

  const generateOntology = async () => {
    setIsLoading(true)
    try {
      // Placeholder for ontology generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockOntology = {
        entities: {
          PERSON: { count: 5, items: ['Alice Johnson', 'Bob Smith'] },
          ORGANIZATION: { count: 3, items: ['TechCorp Inc', 'DataSoft'] },
          LOCATION: { count: 2, items: ['San Francisco', 'New York'] }
        },
        relationships: [
          { source: 'Alice Johnson', target: 'TechCorp Inc', type: 'WORKS_FOR' },
          { source: 'TechCorp Inc', target: 'San Francisco', type: 'LOCATED_IN' }
        ]
      }
      
      setOntologyData(mockOntology)
      onNotification?.({
        type: 'success',
        title: 'Ontology Generated',
        message: 'Successfully generated ontology from document'
      })
    } catch (error) {
      onNotification?.({
        type: 'error',
        title: 'Generation Failed',
        message: error.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Brain className="w-6 h-6 mr-2 text-purple-400" />
            Ontology Generator
          </h2>
          <p className="text-gray-400 mt-1">Generate hierarchical ontologies from documents</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={generateOntology}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg flex items-center space-x-2"
        >
          <Brain className="w-4 h-4" />
          <span>{isLoading ? 'Generating...' : 'Generate Ontology'}</span>
        </motion.button>
      </div>

      {ontologyData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Generated Ontology</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium text-gray-300 mb-3">Entities</h4>
              <div className="space-y-2">
                {Object.entries(ontologyData.entities).map(([type, data]) => (
                  <div key={type} className="bg-gray-700/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{type}</span>
                      <span className="text-blue-400 text-sm">{data.count} items</span>
                    </div>
                    <div className="text-gray-400 text-sm">
                      {data.items.slice(0, 3).join(', ')}
                      {data.items.length > 3 && '...'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-md font-medium text-gray-300 mb-3">Relationships</h4>
              <div className="space-y-2">
                {ontologyData.relationships.map((rel, index) => (
                  <div key={index} className="bg-gray-700/30 rounded-lg p-3">
                    <div className="text-white text-sm">
                      <span className="text-blue-400">{rel.source}</span>
                      <span className="text-gray-400 mx-2">→</span>
                      <span className="text-green-400">{rel.type}</span>
                      <span className="text-gray-400 mx-2">→</span>
                      <span className="text-blue-400">{rel.target}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default OntologyGenerator
