# pdf_utils.py
import fitz  # PyMuPDF

def extract_text_from_pdf(pdf_path):
    text = ""
    with fitz.open(pdf_path) as doc:
        for page in doc:
            text += page.get_text()
    return text

# We don't need the select_pdf_file function for the web interface, so you can remove it or keep it for future use