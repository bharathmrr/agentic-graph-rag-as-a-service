import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                {this.props.onBack && (
                  <motion.button
                    onClick={this.props.onBack}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </motion.button>
                )}
                <h1 className="text-3xl font-bold text-red-400 flex items-center">
                  <AlertTriangle className="w-8 h-8 mr-3" />
                  Component Error
                </h1>
              </div>
            </div>
            
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-semibold text-red-300">Something went wrong</h2>
              <p className="text-red-200">The component encountered an error and couldn't render properly.</p>
              
              {this.state.error && (
                <div className="bg-gray-800 rounded p-4 mt-4">
                  <p className="text-sm text-gray-300 font-mono">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                Reload Page
              </motion.button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
