import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Brain, BookOpen, TrendingUp, Award, Target, Lightbulb } from 'lucide-react'

const GroupManagementAI = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('insights')
  const [learningProgress, setLearningProgress] = useState({
    graphAI: 85,
    ragSystems: 92,
    knowledgeGraphs: 78,
    entityResolution: 88
  })

  const educationalContent = {
    insights: {
      title: 'Graph-Based AI Insights',
      icon: Brain,
      content: [
        {
          title: 'Understanding Knowledge Graphs',
          description: 'Knowledge graphs represent information as interconnected entities and relationships, enabling AI systems to understand context and make intelligent connections.',
          keyPoints: [
            'Entities are nodes representing real-world objects or concepts',
            'Relationships are edges that define how entities connect',
            'Semantic meaning emerges from the graph structure',
            'AI can traverse paths to discover new insights'
          ]
        },
        {
          title: 'RAG System Architecture',
          description: 'Retrieval-Augmented Generation combines the power of large language models with dynamic information retrieval from knowledge bases.',
          keyPoints: [
            'Vector embeddings enable semantic similarity search',
            'Graph traversal provides contextual relationships',
            'Hybrid retrieval combines multiple search strategies',
            'Real-time reasoning enhances response accuracy'
          ]
        },
        {
          title: 'Entity Resolution Techniques',
          description: 'Advanced algorithms identify and merge duplicate entities to maintain clean, consistent knowledge representations.',
          keyPoints: [
            'Fuzzy matching handles spelling variations',
            'Semantic similarity detects conceptual duplicates',
            'Confidence scoring guides merge decisions',
            'Batch processing scales to large datasets'
          ]
        }
      ]
    },
    workflows: {
      title: 'Project Workflows',
      icon: Target,
      content: [
        {
          title: 'Document Processing Pipeline',
          description: 'Our 14 Model Cores work together to transform raw documents into intelligent knowledge graphs.',
          keyPoints: [
            'Upload → Ontology Generation → Entity Resolution',
            'Embedding Generation → Graph Construction',
            'Knowledge Graph Visualization → Agentic Retrieval',
            'Real-time reasoning and AI-powered insights'
          ]
        },
        {
          title: 'Quality Assurance Process',
          description: 'Multi-layered validation ensures high-quality knowledge extraction and graph construction.',
          keyPoints: [
            'Automated entity validation and scoring',
            'Relationship confidence assessment',
            'Duplicate detection and resolution',
            'Continuous learning from user feedback'
          ]
        }
      ]
    },
    company: {
      title: 'Company Insights',
      icon: Award,
      content: [
        {
          title: 'Technology Stack Excellence',
          description: 'Our platform leverages cutting-edge technologies to deliver enterprise-grade knowledge management.',
          keyPoints: [
            'Neo4j for scalable graph storage and querying',
            'ChromaDB for high-performance vector operations',
            'FastAPI for robust, async backend services',
            'React with modern UI/UX design patterns'
          ]
        },
        {
          title: 'Innovation Focus Areas',
          description: 'Continuous research and development in AI-powered knowledge management systems.',
          keyPoints: [
            'Multi-modal AI integration (text, images, structured data)',
            'Real-time collaborative knowledge building',
            'Automated quality assessment and improvement',
            'Scalable enterprise deployment solutions'
          ]
        }
      ]
    }
  }

  const learningMetrics = [
    { name: 'Graph AI Concepts', progress: learningProgress.graphAI, color: 'bg-blue-500' },
    { name: 'RAG Systems', progress: learningProgress.ragSystems, color: 'bg-green-500' },
    { name: 'Knowledge Graphs', progress: learningProgress.knowledgeGraphs, color: 'bg-purple-500' },
    { name: 'Entity Resolution', progress: learningProgress.entityResolution, color: 'bg-orange-500' }
  ]

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-white">
      <div className="h-full flex flex-col">
        {/* Premium Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                <ArrowLeft size={18} className="text-gray-600" />
                <span className="text-gray-700 font-medium">Back</span>
              </motion.button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Users size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Group Management AI</h1>
                  <p className="text-gray-500 text-sm">Model Core 12: Educational RAG for graph-based AI insights</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-600">94%</div>
                <div className="text-gray-500 text-sm">Learning Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-gray-500 text-sm">Topics</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200 px-8">
          <div className="flex space-x-8">
            {Object.entries(educationalContent).map(([key, tab]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === key
                    ? 'border-cyan-500 text-cyan-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={18} />
                <span className="font-medium">{tab.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {/* Learning Progress */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {learningMetrics.map((metric, index) => (
                  <motion.div
                    key={metric.name}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{metric.name}</span>
                      <span className="text-sm font-bold text-gray-900">{metric.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full ${metric.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.progress}%` }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Educational Content */}
            <div className="space-y-6">
              {educationalContent[activeTab].content.map((section, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Lightbulb size={24} className="text-cyan-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-gray-900 mb-3">{section.title}</h4>
                      <p className="text-gray-600 mb-4 leading-relaxed">{section.description}</p>
                      
                      <div className="space-y-2">
                        <h5 className="font-medium text-gray-900">Key Points:</h5>
                        <ul className="space-y-2">
                          {section.keyPoints.map((point, pointIndex) => (
                            <motion.li
                              key={pointIndex}
                              className="flex items-start space-x-3"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: (index * 0.1) + (pointIndex * 0.05) }}
                            >
                              <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-gray-600">{point}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Interactive Learning Section */}
            <motion.div
              className="mt-8 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <TrendingUp size={24} className="text-cyan-600" />
                <h3 className="text-lg font-semibold text-gray-900">Interactive Learning</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Enhance your understanding through hands-on experience with our Model Cores. 
                Each component provides real-world applications of graph-based AI concepts.
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
                  Try Ontology Generation
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Explore Knowledge Graphs
                </button>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Test RAG Queries
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GroupManagementAI
