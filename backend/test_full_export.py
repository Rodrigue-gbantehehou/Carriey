import json
import asyncio
import sys
from pathlib import Path
from services.rendering_service import render_html_by_name
from generate_pdf_from_html import html_to_pdf

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

BASE_DIR = Path(__file__).parent.resolve()

def test_full_export():
    template_name = "moderne"
    data = {
        "profile": {
            "name": "Test User",
            "position": "Software Engineer",
            "email": "test@example.com",
            "photo": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"
        },
        "experience": [
            {"company": "Google", "role": "Dev", "start": "2020", "end": "2023", "bullets": ["Task 1", "Task 2"]}
        ]
    }
    config = {
        "colorPrimary": "#1a365d",
        "sections": [
            {"type": "contact", "enabled": True},
            {"type": "photo", "enabled": True},
            {"type": "experience", "enabled": True, "column": "right"}
        ]
    }
    
    try:
        print("Rendering HTML...")
        html = render_html_by_name(template_name, data, config_override=config)
        
        tmp_html = BASE_DIR / "_test_export.html"
        tmp_html.write_text(html, encoding="utf-8")
        print(f"HTML written to {tmp_html}")
        
        out_pdf = BASE_DIR / "test_export.pdf"
        print("Generating PDF...")
        asyncio.run(html_to_pdf(tmp_html, out_pdf))
        print(f"PDF successfully generated at {out_pdf}")
        
    except Exception as e:
        import traceback
        print(f"Error: {e}")
        print(traceback.format_exc())

if __name__ == "__main__":
    test_full_export()
