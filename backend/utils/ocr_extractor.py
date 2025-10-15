import pytesseract
from pdf2image import convert_from_path
from PIL import Image, ImageEnhance, ImageFilter
import os
import logging

# Configure Tesseract path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def enhance_image_for_ocr(image):
    """Enhance image quality for better OCR results"""
    # Convert to grayscale
    if image.mode != 'L':
        image = image.convert('L')
    
    # Enhance contrast
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(2.0)
    
    # Enhance sharpness
    enhancer = ImageEnhance.Sharpness(image)
    image = enhancer.enhance(2.0)
    
    # Apply slight blur to reduce noise
    image = image.filter(ImageFilter.MedianFilter())
    
    return image

def extract_text_from_image(image_path):
    """Extract text from image files with enhanced preprocessing"""
    try:
        img = Image.open(image_path)
        
        # Enhance image for better OCR
        enhanced_img = enhance_image_for_ocr(img)
        
        # OCR configuration for better accuracy
        custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?;: '
        
        text = pytesseract.image_to_string(enhanced_img, config=custom_config)
        
        # Clean up text
        cleaned_text = ' '.join(text.split())
        
        return {
            'success': True,
            'text': cleaned_text.strip(),
            'char_count': len(cleaned_text),
            'source': 'image_ocr'
        }
    except Exception as e:
        logging.error(f"OCR Image Error: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'text': '',
            'char_count': 0
        }

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF files with page-by-page processing"""
    try:
        # Convert PDF to images
        pages = convert_from_path(pdf_path, dpi=300)  # Higher DPI for better quality
        
        all_text = ""
        page_texts = []
        
        for i, page in enumerate(pages):
            # Enhance each page
            enhanced_page = enhance_image_for_ocr(page)
            
            # OCR configuration
            custom_config = r'--oem 3 --psm 6'
            
            page_text = pytesseract.image_to_string(enhanced_page, config=custom_config)
            cleaned_page_text = ' '.join(page_text.split())
            
            if cleaned_page_text.strip():
                page_texts.append({
                    'page': i + 1,
                    'text': cleaned_page_text.strip(),
                    'char_count': len(cleaned_page_text)
                })
                all_text += f" {cleaned_page_text.strip()}"
        
        return {
            'success': True,
            'text': all_text.strip(),
            'char_count': len(all_text),
            'pages': page_texts,
            'total_pages': len(pages),
            'source': 'pdf_ocr'
        }
        
    except Exception as e:
        logging.error(f"OCR PDF Error: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'text': '',
            'char_count': 0,
            'pages': [],
            'total_pages': 0
        }

def save_extracted_text(text, filename, output_dir="extracted_texts"):
    """Save extracted text to local file"""
    try:
        os.makedirs(output_dir, exist_ok=True)
        
        # Create filename without extension + .txt
        base_name = os.path.splitext(filename)[0]
        output_path = os.path.join(output_dir, f"{base_name}_extracted.txt")
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(text)
        
        return {
            'success': True,
            'file_path': output_path,
            'saved_at': output_path
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }
