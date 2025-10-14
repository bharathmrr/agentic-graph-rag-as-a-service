import pytesseract
from pdf2image import convert_from_path
from PIL import Image

def extract_text_from_image(image_path):
    try:
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img)
        return text.strip()
    except Exception as e:
        return f"Error: {str(e)}"

def extract_text_from_pdf(pdf_path):
    try:
        pages = convert_from_path(pdf_path)
        all_text = ""
        for i, page in enumerate(pages):
            text = pytesseract.image_to_string(page)
            all_text += f"\nPage {i+1}:\n{text.strip()}"
        return all_text.strip()
    except Exception as e:
        return f"Error: {str(e)}"
