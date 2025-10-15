import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const DataContext = createContext()

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export const DataProvider = ({ children }) => {
  const [documents, setDocuments] = useState([])
  const [ontologyData, setOntologyData] = useState(null)
  const [entityData, setEntityData] = useState(null)
  const [embeddingData, setEmbeddingData] = useState(null)
  const [graphData, setGraphData] = useState(null)
  const [neo4jData, setNeo4jData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [backendStatus, setBackendStatus] = useState('checking')
  const [hasDocuments, setHasDocuments] = useState(false)

  const API_BASE = 'http://localhost:8000'

  // Check backend status
  const checkBackendStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/health`, { timeout: 5000 })
      setBackendStatus('online')
      return true
    } catch (error) {
      setBackendStatus('offline')
      return false
    }
  }

  // Upload document
  const uploadDocument = async (file) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      const newDoc = {
        id: response.data.file_id,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        status: 'uploaded'
      }
      
      setDocuments(prev => [...prev, newDoc])
      setHasDocuments(true)
      return response.data
    } catch (error) {
      setError(error.response?.data?.detail || 'Upload failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Generate ontology
  const generateOntology = async (documentId) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await axios.post(`${API_BASE}/ontology/generate`, {
        document_id: documentId
      })
      
      setOntologyData(response.data)
      return response.data
    } catch (error) {
      setError(error.response?.data?.detail || 'Ontology generation failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Resolve entities
  const resolveEntities = async (ontologyData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await axios.post(`${API_BASE}/entity-resolution/detect-duplicates`, {
        entities: ontologyData.entities
      })
      
      setEntityData(response.data)
      return response.data
    } catch (error) {
      setError(error.response?.data?.detail || 'Entity resolution failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Generate embeddings
  const generateEmbeddings = async (entities) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await axios.post(`${API_BASE}/embeddings/store`, {
        entities: entities
      })
      
      setEmbeddingData(response.data)
      return response.data
    } catch (error) {
      setError(error.response?.data?.detail || 'Embedding generation failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Build graph
  const buildGraph = async (ontologyData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await axios.post(`${API_BASE}/graph/build-from-ontology`, {
        ontology: ontologyData
      })
      
      setGraphData(response.data)
      return response.data
    } catch (error) {
      setError(error.response?.data?.detail || 'Graph construction failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Get Neo4j visualization data
  const getNeo4jData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await axios.get(`${API_BASE}/graph/neo4j-visualization`)
      setNeo4jData(response.data)
      return response.data
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to fetch Neo4j data')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Query with reasoning
  const queryWithReasoning = async (query, context = []) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await axios.post(`${API_BASE}/reasoning/query`, {
        query: query,
        context: context
      })
      
      return response.data
    } catch (error) {
      setError(error.response?.data?.detail || 'Query failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Clear all data
  const clearAllData = () => {
    setDocuments([])
    setOntologyData(null)
    setEntityData(null)
    setEmbeddingData(null)
    setGraphData(null)
    setNeo4jData(null)
    setError(null)
  }

  // Auto-refresh data
  useEffect(() => {
    checkBackendStatus()
    
    const interval = setInterval(() => {
      checkBackendStatus()
    }, 30000) // Check every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  const value = {
    // Data
    documents,
    ontologyData,
    entityData,
    embeddingData,
    graphData,
    neo4jData,
    
    // State
    isLoading,
    error,
    backendStatus,
    hasDocuments,
    
    // Actions
    uploadDocument,
    generateOntology,
    resolveEntities,
    generateEmbeddings,
    buildGraph,
    getNeo4jData,
    queryWithReasoning,
    clearAllData,
    checkBackendStatus,
    
    // Setters
    setDocuments,
    setOntologyData,
    setEntityData,
    setEmbeddingData,
    setGraphData,
    setNeo4jData,
    setError
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}
