import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Moon, Sun, Monitor, Database, Globe, Key, Bell, Save } from 'lucide-react'

const SettingsPanel = ({ onNotification, theme, setTheme }) => {
  const [settings, setSettings] = useState({
    apiEndpoint: 'http://localhost:8000',
    neo4jUri: 'bolt://localhost:7687',
    chromaHost: 'localhost:8000',
    openaiApiKey: '',
    notifications: true,
    autoRefresh: true,
    refreshInterval: 30,
    maxResults: 10,
    confidenceThreshold: 0.7
  })

  const [activeTab, setActiveTab] = useState('general')

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'connections', name: 'Connections', icon: Database },
    { id: 'api', name: 'API Keys', icon: Key },
    { id: 'notifications', name: 'Notifications', icon: Bell }
  ]

  const themeOptions = [
    { id: 'dark', name: 'Dark', icon: Moon },
    { id: 'light', name: 'Light', icon: Sun },
    { id: 'system', name: 'System', icon: Monitor }
  ]

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const saveSettings = () => {
    // In a real app, this would save to backend/localStorage
    onNotification?.({
      type: 'success',
      title: 'Settings Saved',
      message: 'Your preferences have been updated'
    })
  }

  const testConnection = async (type) => {
    onNotification?.({
      type: 'info',
      title: 'Testing Connection',
      message: `Testing ${type} connection...`
    })

    // Simulate connection test
    setTimeout(() => {
      onNotification?.({
        type: Math.random() > 0.5 ? 'success' : 'error',
        title: 'Connection Test',
        message: Math.random() > 0.5 ? `${type} connection successful` : `${type} connection failed`
      })
    }, 2000)
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Theme</label>
        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map((option) => {
            const Icon = option.icon
            return (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTheme(option.id)}
                className={`p-3 rounded-lg border text-center ${
                  theme === option.id
                    ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                    : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                }`}
              >
                <Icon className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm">{option.name}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Auto Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-300">Auto Refresh</label>
          <p className="text-xs text-gray-400">Automatically refresh data from backend</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSettingChange('autoRefresh', !settings.autoRefresh)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full ${
            settings.autoRefresh ? 'bg-blue-600' : 'bg-gray-600'
          }`}
        >
          <motion.span
            animate={{ x: settings.autoRefresh ? 20 : 4 }}
            className="inline-block h-4 w-4 transform rounded-full bg-white"
          />
        </motion.button>
      </div>

      {/* Refresh Interval */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Refresh Interval (seconds)
        </label>
        <input
          type="number"
          value={settings.refreshInterval}
          onChange={(e) => handleSettingChange('refreshInterval', parseInt(e.target.value))}
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          min="5"
          max="300"
        />
      </div>

      {/* Max Results */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Max Results per Query
        </label>
        <input
          type="number"
          value={settings.maxResults}
          onChange={(e) => handleSettingChange('maxResults', parseInt(e.target.value))}
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          min="1"
          max="100"
        />
      </div>

      {/* Confidence Threshold */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Confidence Threshold ({settings.confidenceThreshold})
        </label>
        <input
          type="range"
          value={settings.confidenceThreshold}
          onChange={(e) => handleSettingChange('confidenceThreshold', parseFloat(e.target.value))}
          className="w-full"
          min="0"
          max="1"
          step="0.1"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0.0</span>
          <span>1.0</span>
        </div>
      </div>
    </div>
  )

  const renderConnectionSettings = () => (
    <div className="space-y-6">
      {/* API Endpoint */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">API Endpoint</label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={settings.apiEndpoint}
            onChange={(e) => handleSettingChange('apiEndpoint', e.target.value)}
            className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder="http://localhost:8000"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => testConnection('API')}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
          >
            Test
          </motion.button>
        </div>
      </div>

      {/* Neo4j Connection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Neo4j URI</label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={settings.neo4jUri}
            onChange={(e) => handleSettingChange('neo4jUri', e.target.value)}
            className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder="bolt://localhost:7687"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => testConnection('Neo4j')}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
          >
            Test
          </motion.button>
        </div>
      </div>

      {/* ChromaDB Connection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">ChromaDB Host</label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={settings.chromaHost}
            onChange={(e) => handleSettingChange('chromaHost', e.target.value)}
            className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder="localhost:8000"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => testConnection('ChromaDB')}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
          >
            Test
          </motion.button>
        </div>
      </div>
    </div>
  )

  const renderApiSettings = () => (
    <div className="space-y-6">
      {/* OpenAI API Key */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">OpenAI API Key</label>
        <input
          type="password"
          value={settings.openaiApiKey}
          onChange={(e) => handleSettingChange('openaiApiKey', e.target.value)}
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          placeholder="sk-..."
        />
        <p className="text-xs text-gray-400 mt-1">Required for LLM-powered features</p>
      </div>

      {/* API Rate Limits */}
      <div className="bg-gray-700/30 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3">API Rate Limits</h4>
        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex justify-between">
            <span>OpenAI Requests/min:</span>
            <span>60</span>
          </div>
          <div className="flex justify-between">
            <span>Neo4j Queries/min:</span>
            <span>1000</span>
          </div>
          <div className="flex justify-between">
            <span>ChromaDB Requests/min:</span>
            <span>500</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      {/* Enable Notifications */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-300">Enable Notifications</label>
          <p className="text-xs text-gray-400">Show system notifications and alerts</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSettingChange('notifications', !settings.notifications)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full ${
            settings.notifications ? 'bg-blue-600' : 'bg-gray-600'
          }`}
        >
          <motion.span
            animate={{ x: settings.notifications ? 20 : 4 }}
            className="inline-block h-4 w-4 transform rounded-full bg-white"
          />
        </motion.button>
      </div>

      {/* Notification Types */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Notification Types</label>
        <div className="space-y-2">
          {['Success', 'Error', 'Warning', 'Info'].map((type) => (
            <div key={type} className="flex items-center space-x-3">
              <input
                type="checkbox"
                id={type}
                defaultChecked
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor={type} className="text-sm text-gray-300">{type} notifications</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Settings className="w-6 h-6 mr-2 text-gray-400" />
            Settings
          </h2>
          <p className="text-gray-400 mt-1">Configure your preferences and connections</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={saveSettings}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </motion.button>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </motion.button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'general' && renderGeneralSettings()}
              {activeTab === 'connections' && renderConnectionSettings()}
              {activeTab === 'api' && renderApiSettings()}
              {activeTab === 'notifications' && renderNotificationSettings()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default SettingsPanel
