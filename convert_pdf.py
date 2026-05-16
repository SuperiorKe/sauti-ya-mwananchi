from pypdf import PdfReader

def convert_pdf_to_txt(pdf_path, txt_path):
    reader = PdfReader(pdf_path)
    with open(txt_path, "w", encoding="utf-8") as f:
        for page in reader.pages:
            f.write(page.extract_text() + "\n")

if __name__ == "__main__":
    convert_pdf_to_txt("Constitution of Kenya.pdf", "constitution.txt")
