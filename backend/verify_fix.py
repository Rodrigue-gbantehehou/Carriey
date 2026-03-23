import json
import asyncio
import sys
import subprocess
from pathlib import Path
from services.rendering_service import render_html_by_name

BASE_DIR = Path(__file__).parent.resolve()

def test_subprocess_export():
    template_name = "moderne"
    data = {
        "profile": {
            "name": "Test Subprocess",
            "position": "Engineer",
            "email": "test@example.com"
        },
        "experience": []
    }
    config = {"sections": []}
    
    try:
        print("Rendering HTML...")
        html = render_html_by_name(template_name, data, config_override=config)
        
        tmp_html = BASE_DIR / "_test_sub.html"
        tmp_html.write_text(html, encoding="utf-8")
        
        out_pdf = BASE_DIR / "test_sub.pdf"
        print(f"Generating PDF via subprocess for {tmp_html}...")
        
        cmd = [sys.executable, str(BASE_DIR / "generate_pdf_from_html.py"), "--html", str(tmp_html), "--out", str(out_pdf)]
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"SUCCESS: PDF created at {out_pdf}")
            print(f"Output: {result.stdout}")
        else:
            print(f"FAILURE: {result.stderr}")
            print(f"Output: {result.stdout}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_subprocess_export()
