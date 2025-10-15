"""
OCR Test Endpoint
Simple FastAPI endpoint to test OCR functionality
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="OCR Test API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_text_from_file(file_path: str, file_type: str) -> str:
    """
    Extract text from different file types
    """
    try:
        if file_type == "text/plain":
            # Read text file directly
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        
        elif file_type == "application/pdf":
            # Try to extract text from PDF
            try:
                import PyPDF2
                with open(file_path, 'rb') as f:
                    reader = PyPDF2.PdfReader(f)
                    text = ""
                    for page in reader.pages:
                        text += page.extract_text() + "\n"
                    return text.strip()
            except ImportError:
                return "PDF processing requires PyPDF2. Install with: pip install PyPDF2"
            except Exception as e:
                return f"PDF extraction failed: {str(e)}"
        
        elif file_type.startswith("image/"):
            # Try OCR on images
            try:
                import pytesseract
                from PIL import Image
                
                # Open and process image
                image = Image.open(file_path)
                text = pytesseract.image_to_string(image)
                return text.strip()
            except ImportError:
                return "Image OCR requires pytesseract and PIL. Install with: pip install pytesseract pillow"
            except Exception as e:
                return f"Image OCR failed: {str(e)}"
        
        else:
            return f"Unsupported file type: {file_type}"
            
    except Exception as e:
        logger.error(f"Text extraction error: {str(e)}")
        return f"Text extraction failed: {str(e)}"

@app.post("/api/test-ocr")
async def test_ocr(file: UploadFile = File(...)):
    """
    Test OCR functionality with uploaded file
    """
    try:
        logger.info(f"Processing file: {file.filename}, type: {file.content_type}")
        
        # Validate file type
        allowed_types = [
            "text/plain",
            "application/pdf", 
            "image/jpeg",
            "image/png",
            "image/jpg"
        ]
        
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type: {file.content_type}"
            )
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as tmp_file:
            # Write uploaded content to temp file
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        try:
            # Extract text
            extracted_text = extract_text_from_file(tmp_file_path, file.content_type)
            
            # Clean up
            os.unlink(tmp_file_path)
            
            return {
                "success": True,
                "filename": file.filename,
                "file_type": file.content_type,
                "file_size": len(content),
                "extracted_text": extracted_text,
                "text_length": len(extracted_text),
                "message": "OCR processing completed successfully"
            }
            
        except Exception as e:
            # Clean up on error
            if os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)
            raise e
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OCR test error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")

@app.get("/api/ocr-status")
async def ocr_status():
    """
    Check OCR capabilities and dependencies
    """
    status = {
        "ocr_available": True,
        "supported_formats": ["text/plain"],
        "dependencies": {},
        "message": "Basic text processing available"
    }
    
    # Check PyPDF2 for PDF support
    try:
        import PyPDF2
        status["supported_formats"].append("application/pdf")
        status["dependencies"]["PyPDF2"] = "Available"
    except ImportError:
        status["dependencies"]["PyPDF2"] = "Not installed - pip install PyPDF2"
    
    # Check pytesseract for image OCR
    try:
        import pytesseract
        from PIL import Image
        status["supported_formats"].extend(["image/jpeg", "image/png"])
        status["dependencies"]["pytesseract"] = "Available"
        status["dependencies"]["PIL"] = "Available"
    except ImportError:
        status["dependencies"]["pytesseract"] = "Not installed - pip install pytesseract pillow"
    
    return status

@app.get("/")
async def root():
    """
    Root endpoint
    """
    return {
        "message": "OCR Test API is running",
        "version": "1.0.0",
        "endpoints": [
            "/api/test-ocr - POST - Upload file for OCR testing",
            "/api/ocr-status - GET - Check OCR capabilities"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
