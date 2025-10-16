# 🚀 Quick Start Guide - Three-Step Workflow

## What You Get

A beautiful, three-step process to transform your documents into intelligent knowledge graphs:

1. **📄 Upload Documents** → Extract text with AI
2. **🧠 Generate Ontology** → Extract entities and relationships with NLP
3. **🔍 Resolve Entities** → Detect and merge duplicates with fuzzy matching

---

## Prerequisites

- Backend server running on `http://localhost:8000`
- Frontend running on `http://localhost:5173`

---

## Step-by-Step Usage

### Step 1: Upload Your Document 📄

1. **Navigate to Dashboard**
   - Click **"Upload Documents"** card

2. **Upload File**
   - Drag & drop a file (PDF, DOCX, TXT, MD)
   - OR click **"Choose Files to Upload"**

3. **Watch Processing**
   - Progress bar shows upload: 0% → 100%
   - Real-time logs stream processing steps
   - Text extraction happens automatically

4. **View Results**
   - ✅ **"Document Processing Complete!"** appears
   - See text preview (first 500 characters)
   - View statistics: Characters, Words, Pages

5. **Continue**
   - Click **"Ready - Continue to Ontology Generation"**
   - Beautiful summary screen appears
   - Click **"Continue to Ontology Generation"**

---

### Step 2: Generate Ontology 🧠

1. **Arrive at Ontology Generator**
   - Document auto-selected from Step 1
   - OR select from list if multiple uploads

2. **Generate**
   - Click **"Generate Ontology"** button
   - Watch progress:
     - Initializing... (10%)
     - Analyzing document structure... (30%)
     - Extracting entities... (60%)
     - Building relationships... (80%)
     - Finalizing... (100%)

3. **View Results**
   - **Entity Types Count** (e.g., 4 types)
   - **Total Entities** (e.g., 156 entities)
   - **Relationships Count** (e.g., 89 relationships)
   - Entity cards showing:
     - PERSON (45 items)
     - ORGANIZATION (32 items)
     - LOCATION (28 items)
     - CONCEPT (51 items)
   - Relationship examples:
     - Bharath → Created → Project
     - TechCorp → Located_in → San Francisco

4. **Continue**
   - Beautiful summary appears automatically
   - Click **"Continue to Entity Resolution"**

---

### Step 3: Resolve Entities 🔍

1. **Arrive at Entity Resolution**
   - Source ontology data displayed
   - Statistics shown from Step 2

2. **Resolve**
   - Click **"Resolve Entities"** button
   - Watch progress:
     - Initializing entity resolution... (10%)
     - Analyzing entity similarities... (30%)
     - Detecting potential duplicates... (60%)
     - Calculating confidence scores... (80%)
     - Finalizing results... (100%)

3. **View Results**

   **If Duplicates Found:**
   - **Duplicate Groups** count
   - **High Confidence** matches
   - **Entities Processed** total
   - Each duplicate group shows:
     - 🎯 Confidence badge (High/Medium/Low)
     - Match percentage (e.g., 92.5%)
     - Similar entities list
     - Individual similarity scores

   **If No Duplicates:**
   - ✅ **"All Entities are Unique!"**
   - **Data Quality: Excellent** badge
   - Animated success indicator

4. **Complete**
   - Beautiful summary appears
   - All 3 steps shown as ✅ complete
   - Click **"Explore Knowledge Graph"**

---

## Visual Progress Tracker

Throughout the workflow, you'll see:

```
● ──────── ○ ──────── ○    Step 1: Upload (current)
✅ ──────── ● ──────── ○    Step 2: Ontology (current)
✅ ──────── ✅ ──────── ●    Step 3: Resolution (current)
✅ ──────── ✅ ──────── ✅   All Complete!
```

---

## Features Highlights

### 🎨 Beautiful UI
- Gradient backgrounds
- Smooth animations
- Color-coded progress
- Intuitive icons

### ⚡ Real-time Updates
- Live upload progress
- Streaming processing logs
- Instant result display
- Progress percentages

### 📊 Rich Information
- Text extraction preview
- Entity statistics
- Relationship visualization
- Confidence scores
- Quality metrics

### 🔄 Seamless Flow
- Auto-navigation between steps
- Data persistence
- Clear call-to-actions
- Back/forward support

---

## Common Workflows

### Quick Test Run
```
1. Upload "sample.pdf"
2. Click Ready → Continue
3. Click Generate Ontology
4. Click Continue
5. Click Resolve Entities
6. Click Explore Graph
```
**Time:** ~2-3 minutes

### Production Use
```
1. Upload company document
2. Review extracted text
3. Generate ontology
4. Review entities/relationships
5. Resolve duplicates
6. Export/explore graph
```
**Time:** ~5-10 minutes

---

## Tips & Tricks

### 📁 File Upload
- **Best formats:** PDF, DOCX, TXT
- **Max size:** 10MB per file
- **Tip:** Use well-structured documents for best results

### 🧠 Ontology Generation
- **Review entities** before proceeding
- **Check relationships** for accuracy
- **Export data** to save results

### 🔍 Entity Resolution
- **High confidence** (80%+) = Very likely duplicate
- **Medium confidence** (60-80%) = Possible duplicate
- **Low confidence** (<60%) = Review manually

---

## Keyboard Shortcuts

- **Ctrl/Cmd + Click** on file area = Open file browser
- **Enter** on any "Continue" button = Proceed
- **Esc** = Close modal (if applicable)

---

## Troubleshooting Quick Fixes

### Upload Not Working?
```bash
# Check backend is running
curl http://localhost:8000/health
```

### Processing Stuck?
- Check browser console (F12)
- Verify SSE connection
- Refresh page and retry

### No Entities Found?
- Ensure document has readable text
- Try a different file
- Check NLP service status

### Too Many Duplicates?
- Review confidence scores
- Export data for manual review
- Adjust matching threshold (in settings)

---

## Example Output

### Sample Document
```
"John Smith works at TechCorp in San Francisco.
He specializes in Machine Learning and AI Research."
```

### After Step 2 (Ontology)
```
Entities:
- PERSON: John Smith
- ORGANIZATION: TechCorp
- LOCATION: San Francisco
- CONCEPT: Machine Learning, AI Research

Relationships:
- John Smith → works_at → TechCorp
- TechCorp → located_in → San Francisco
- John Smith → specializes_in → Machine Learning
```

### After Step 3 (Resolution)
```
✅ All Entities are Unique!
Data Quality: Excellent

No duplicates detected.
```

---

## Next Actions

After completing all 3 steps:

1. **Explore Knowledge Graph** - Interactive visualization
2. **Export Data** - Download as JSON
3. **Query System** - Ask questions about your data
4. **Build Embeddings** - Create semantic search
5. **Chat with Data** - AI-powered Q&A

---

## Support

- 📖 Full documentation: `WORKFLOW_GUIDE.md`
- 🔧 Implementation details: `IMPLEMENTATION_SUMMARY.md`
- 💬 Issues? Check console logs first
- 🐛 Report bugs with screenshots

---

## Success!

You're all set! Start by uploading your first document and watch the magic happen. 🎉

**Enjoy building intelligent knowledge graphs!** 🚀
