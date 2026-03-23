from xhtml2pdf import pisa
from io import BytesIO
from pathlib import Path

def test_pdf():
    html = "<html><body><h1>Test PDF</h1><p>Ceci est un test.</p></body></html>"
    output_path = Path("test_output.pdf")
    try:
        with open(output_path, "wb") as f:
            result = pisa.CreatePDF(BytesIO(html.encode("utf-8")), dest=f)
        if not result.err:
            print("PDF généré avec succès !")
        else:
            print(f"Erreur pisa: {result.err}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_pdf()
