# Debug: White Page on File Upload Click

## 🔍 **Issue Analysis**

When clicking the file upload button, you see a white page. This is typically caused by:

1. **JavaScript Error** - Component crashes during render
2. **Missing Dependencies** - Undefined variables or functions
3. **Import Issues** - Missing or incorrect imports

## 🔧 **Fixes Applied**

### **Fix 1: Added Missing State Variable**
```javascript
// Added missing uploading state
const [uploading, setUploading] = useState(false);
```

The component was using `uploading` variable but it wasn't defined, which would cause a crash.

## 🧪 **Testing Steps**

### **Step 1: Check Browser Console**
1. Open browser developer tools (F12)
2. Go to Console tab
3. Click the upload button
4. Look for any red error messages

**Common errors to look for:**
- `ReferenceError: uploading is not defined`
- `Cannot read property of undefined`
- Import/export errors

### **Step 2: Test Simple Component**
If still getting white page, temporarily replace DocumentUpload with a simple test:

```javascript
// In App.jsx, temporarily replace:
case 'upload':
  return <DocumentUpload onClose={() => setActiveModule(null)} />;

// With:
case 'upload':
  return (
    <div className="p-8">
      <h2 className="text-white">Upload Test</h2>
      <button onClick={() => setActiveModule(null)}>Close</button>
    </div>
  );
```

If this works, the issue is in DocumentUpload component.

### **Step 3: Check Network Tab**
1. Open Network tab in developer tools
2. Click upload button
3. Look for any failed API requests (red entries)

## 🚨 **Most Likely Causes**

### **1. Missing Gemini API Key**
If the component tries to check backend status and fails:
```bash
# Check .env file has:
GEMINI_API_KEY=your_actual_key_here
```

### **2. Backend Not Running**
```bash
# Start backend first:
python quick_start.py
```

### **3. Import Path Issues**
Check if these files exist:
- `../services/api.js` (for uploadDocument, uploadFile functions)
- `../context/DataContext.jsx` (for useData hook)

## 🔧 **Quick Fix Test**

Try this minimal version of DocumentUpload to test:

```javascript
// Minimal test version
import React from 'react';

const DocumentUpload = ({ onClose }) => {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Upload Documents</h2>
        <button onClick={onClose} className="text-white">Close</button>
      </div>
      <p className="text-white">Upload component loaded successfully!</p>
    </div>
  );
};

export default DocumentUpload;
```

If this works, gradually add back the original functionality to find what's causing the crash.

## 📊 **Expected Result**

After fixing, you should see:
1. **Upload modal opens** with tabs (Text Input / File Upload)
2. **No white page** - proper UI renders
3. **No console errors** - clean JavaScript execution
4. **Backend status** shows connected/disconnected

The upload functionality should work normally once the component renders properly.
