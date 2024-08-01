# pdf_utils.py
import fitz  # PyMuPDF

def extract_text_from_pdf(pdf_path):
    text = ""
    with fitz.open(pdf_path) as doc:
        for page_num in range(min(2, len(doc))):
            page = doc.load_page(page_num)
            text += page.get_text()
    return text
