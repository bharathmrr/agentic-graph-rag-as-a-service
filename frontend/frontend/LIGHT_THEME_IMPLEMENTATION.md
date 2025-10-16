# 🎨 Light Theme Implementation Guide

## Overview
This guide provides complete instructions to transform your dark-themed Agentic Graph RAG application into a modern, professional light-themed interface.

## ✅ Step-by-Step Implementation

### Step 1: Apply Light Theme CSS

1. **Import the light theme** in `src/main.jsx` or `src/index.jsx`:
```javascript
import './light-theme.css'
```

2. **Add light-theme class** to body in `App.jsx`:
```javascript
useEffect(() => {
  document.body.classList.add('light-theme')
}, [])
```

### Step 2: Create Reusable Components

#### A. Status Indicator Component
Create `src/components/StatusIndicator.jsx`:

```javascript
import React from 'react'

const StatusIndicator = ({ isOnline }) => {
  return (
    <div className="status-indicator">
      <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
      <span>{isOnline ? 'Connected' : 'Disconnected'}</span>
    </div>
  )
}

export default StatusIndicator
```

#### B. Alert Card Component
Create `src/components/AlertCard.jsx`:

```javascript
import React from 'react'
import { AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react'

const AlertCard = ({ type = 'info', title, message, children, actionButton }) => {
  const icons = {
    info: Info,
    warning: AlertTriangle,
    error: AlertCircle,
    success: CheckCircle
  }
  
  const Icon = icons[type]
  
  return (
    <div className={`alert-card ${type}`}>
      <div className="alert-card-icon">
        <Icon size={24} />
      </div>
      <div className="alert-card-content">
        <h3>{title}</h3>
        {message && <p>{message}</p>}
        {children}
        {actionButton && <div className="mt-3">{actionButton}</div>}
      </div>
    </div>
  )
}

export default AlertCard
```

#### C. Loading Spinner Component
Create `src/components/LoadingSpinner.jsx`:

```javascript
import React from 'react'

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p className="loading-text">{message}</p>
    </div>
  )
}

export default LoadingSpinner
```

#### D. Themed Button Component
Create `src/components/ThemedButton.jsx`:

```javascript
import React from 'react'

const ThemedButton = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  disabled = false,
  icon: Icon,
  ...props 
}) => {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  )
}

export default ThemedButton
```

### Step 3: Update Header Component

Update `src/components/Header.jsx`:

```javascript
import React from 'react'
import StatusIndicator from './StatusIndicator'

const Header = ({ backendStatus }) => {
  return (
    <header className="header">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Agentic Graph RAG</h1>
        <StatusIndicator isOnline={backendStatus === 'online'} />
      </div>
    </header>
  )
}

export default Header
```

### Step 4: Update Sidebar Component

Update `src/components/Sidebar.jsx` to use light theme classes:

```javascript
// Add className="sidebar-item" to each nav item
// Add className="active" to the active item

const Sidebar = ({ activeModule, setActiveModule, modules }) => {
  return (
    <div className="sidebar">
      {modules.map(module => (
        <div
          key={module.id}
          className={`sidebar-item ${activeModule === module.id ? 'active' : ''}`}
          onClick={() => setActiveModule(module.id)}
        >
          <module.icon />
          <span>{module.name}</span>
        </div>
      ))}
    </div>
  )
}
```

### Step 5: Redesign Document Upload

Update `src/components/EnhancedDocumentUpload.jsx`:

```javascript
import { CloudUpload } from 'lucide-react'

// In your render:
<div className="upload-zone" onDragOver={handleDragOver} onDrop={handleDrop}>
  <CloudUpload className="upload-icon" />
  <p className="upload-text">Drag & Drop Your Documents</p>
  <p className="upload-hint">or click to browse files</p>
  <p className="upload-hint mt-2">PDF • DOCX • TXT • MD</p>
</div>
```

### Step 6: Update Entity Resolution

Update `src/components/EnhancedEntityResolution.jsx`:

```javascript
import AlertCard from './AlertCard'
import ThemedButton from './ThemedButton'
import { ArrowRight } from 'lucide-react'

// Replace "No Data Available" section:
{!hasData && (
  <AlertCard
    type="warning"
    title="No Data Available"
    message="Entity resolution requires ontology data to be generated first."
    actionButton={
      <ThemedButton
        variant="primary"
        icon={ArrowRight}
        onClick={() => navigate('/dashboard')}
      >
        Go to Dashboard
      </ThemedButton>
    }
  >
    <ul>
      <li>Upload a document</li>
      <li>Generate ontology from the document</li>
      <li>Return here to resolve entities</li>
    </ul>
  </AlertCard>
)}
```

### Step 7: Update Embedding Generator

Similar to Entity Resolution:

```javascript
import AlertCard from './AlertCard'
import LoadingSpinner from './LoadingSpinner'

// For loading state:
{isLoading && <LoadingSpinner message="Generating embeddings..." />}

// For no data state:
{!hasData && (
  <AlertCard
    type="info"
    title="Awaiting Data"
    message="Please complete the previous steps to generate embeddings."
  >
    <ul>
      <li>Upload a document</li>
      <li>Generate ontology</li>
      <li>Resolve entities</li>
    </ul>
  </AlertCard>
)}
```

### Step 8: Update Knowledge Graph

```javascript
// Add stat cards:
<div className="stats-grid">
  <div className="stat-card">
    <div className="stat-icon">
      <Network size={24} />
    </div>
    <div className="stat-content">
      <div className="stat-label">Total Nodes</div>
      <div className="stat-value">{stats.nodes}</div>
    </div>
  </div>
  
  <div className="stat-card">
    <div className="stat-icon">
      <Link size={24} />
    </div>
    <div className="stat-content">
      <div className="stat-label">Total Edges</div>
      <div className="stat-value">{stats.edges}</div>
    </div>
  </div>
</div>
```

### Step 9: Update Agentic Retrieval

```javascript
// Strategy selector:
<div className="card mb-4">
  <div className="card-header">
    <h3 className="card-title">Retrieval Strategy</h3>
  </div>
  <div className="card-body">
    <div style={{ display: 'flex', gap: '1rem' }}>
      {strategies.map(strategy => (
        <ThemedButton
          key={strategy}
          variant={selected === strategy ? 'primary' : 'secondary'}
          onClick={() => setSelected(strategy)}
        >
          {strategy}
        </ThemedButton>
      ))}
    </div>
  </div>
</div>

// Search input:
<div className="form-group">
  <label className="form-label">Enter your query</label>
  <input
    type="text"
    className="form-input"
    placeholder="Search..."
  />
  <ThemedButton
    variant="primary"
    icon={Search}
    onClick={handleSearch}
    className="mt-3"
  >
    Search
  </ThemedButton>
</div>
```

## 🎨 CSS Class Reference

### Layout
- `.card` - Main card container
- `.card-header` - Card header with title
- `.card-body` - Card content area

### Buttons
- `.btn` - Base button
- `.btn-primary` - Primary action button (blue)
- `.btn-secondary` - Secondary button (gray)
- `.btn-success` - Success button (green)
- `.btn-danger` - Danger button (red)

### Alerts
- `.alert-card.info` - Info alert (blue)
- `.alert-card.warning` - Warning alert (yellow)
- `.alert-card.error` - Error alert (red)
- `.alert-card.success` - Success alert (green)

### Forms
- `.form-group` - Form field container
- `.form-label` - Field label
- `.form-input` - Text input
- `.form-textarea` - Textarea
- `.form-select` - Select dropdown

### Upload
- `.upload-zone` - Drag & drop area
- `.upload-icon` - Upload icon
- `.upload-text` - Main text
- `.upload-hint` - Hint text

### Stats
- `.stats-grid` - Grid container
- `.stat-card` - Individual stat card
- `.stat-icon` - Icon container
- `.stat-label` - Label text
- `.stat-value` - Value number

## 🔧 Customization

### Change Primary Color
In `light-theme.css`:
```css
:root {
  --primary-color: #007BFF; /* Change this */
  --primary-hover: #0056b3; /* And this */
  --primary-light: #E3F2FD; /* And this */
}
```

### Adjust Spacing
```css
:root {
  --spacing-md: 1rem; /* Increase/decrease as needed */
}
```

### Modify Shadows
```css
:root {
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1); /* Adjust opacity */
}
```

## 📋 Checklist

- [ ] Import `light-theme.css`
- [ ] Add `light-theme` class to body
- [ ] Create `StatusIndicator` component
- [ ] Create `AlertCard` component
- [ ] Create `LoadingSpinner` component
- [ ] Create `ThemedButton` component
- [ ] Update Header with status indicator
- [ ] Update Sidebar with light theme styles
- [ ] Redesign Document Upload with cloud icon
- [ ] Update Entity Resolution with AlertCard
- [ ] Update Embedding Generator with AlertCard
- [ ] Update Knowledge Graph with stat cards
- [ ] Update Agentic Retrieval with modern inputs
- [ ] Test all pages for visual consistency
- [ ] Remove/disable dark theme CSS

## 🚀 Testing

### Visual Tests
1. **Header**: Should have white background, colored status dot
2. **Sidebar**: Light background, blue highlight on active item
3. **Cards**: White background with subtle shadows
4. **Buttons**: Blue primary, gray secondary with hover effects
5. **Alerts**: Colored backgrounds with icons
6. **Forms**: Clean inputs with blue focus rings
7. **Upload**: Dashed border that turns blue on hover

### Functional Tests
1. **Status indicator**: Changes color based on connection
2. **Buttons**: Hover states work correctly
3. **Forms**: Focus states visible
4. **Alerts**: Display properly with icons
5. **Loading**: Spinner animates smoothly

## 📝 Notes

- **Font**: Uses Inter font (include from Google Fonts if needed)
- **Icons**: Uses Lucide React icons
- **Responsive**: Mobile-friendly grid and spacing
- **Accessibility**: Proper contrast ratios for WCAG compliance

## 🎉 Result

After implementation, you'll have:
- ✅ Professional light theme
- ✅ Modern, clean interface
- ✅ Better readability
- ✅ Consistent design system
- ✅ Reusable components
- ✅ Enhanced UX with proper alerts and status indicators

The application will look professional, modern, and user-friendly!
