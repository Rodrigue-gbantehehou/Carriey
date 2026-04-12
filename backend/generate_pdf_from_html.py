#!/usr/bin/env python3
"""
Convertit un fichier HTML en PDF via Playwright Async API
"""
import argparse
from pathlib import Path
import os
import sys
import asyncio

# --- WINDOWS ASYNCIO FIX ---
# Playwright needs subprocess support, which requires ProactorEventLoop on Windows.
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

try:
    from playwright.async_api import async_playwright
except ImportError:
    print("[PDF Generator] Error: playwright not installed. Run 'pip install playwright'")
    sys.exit(1)


async def html_to_pdf(html_path: Path, out_pdf: Path) -> Path:
    """Convertit un fichier HTML en PDF en utilisant Playwright Async"""
    print(f"[PDF Generator] Converting HTML to PDF using Playwright Async")
    print(f"[PDF Generator] Input: {html_path}")
    print(f"[PDF Generator] Output: {out_pdf}")
    
    if not html_path.exists():
        raise FileNotFoundError(f"HTML introuvable: {html_path}")

    try:
        async with async_playwright() as p:
            # Lancement de Chromium avec optimisation pour Docker
            launch_args = ["--disable-dev-shm-usage", "--no-sandbox", "--disable-setuid-sandbox"]
            try:
                browser = await p.chromium.launch(headless=True, args=launch_args)
            except Exception as e:
                print(f"[PDF Generator] Chromium not found, trying to install: {e}")
                import subprocess
                subprocess.run([sys.executable, "-m", "playwright", "install", "chromium"], check=True)
                browser = await p.chromium.launch(headless=True, args=launch_args)
                
            page = await browser.new_page()
            
            # Charger le fichier HTML local
            abs_path = html_path.absolute()
            print(f"[PDF Generator] Loading page: file://{abs_path}")
            
            # Utiliser 'load' au lieu de 'networkidle' pour éviter de bloquer sur des ressources externes lentes
            # Ajouter un timeout de 30 secondes
            try:
                await page.goto(f"file://{abs_path}", wait_until="load", timeout=30000)
            except Exception as e:
                print(f"[PDF Generator] Warning: page.goto timed out or failed: {e}. Attempting PDF anyway.")
            
            # Générer le PDF
            print(f"[PDF Generator] Printing PDF...")
            await page.pdf(
                path=str(out_pdf),
                format="A4",
                print_background=True,
                margin={
                    "top": "0px",
                    "right": "0px",
                    "bottom": "0px",
                    "left": "0px"
                }
            )
            
            await browser.close()
            
        if not out_pdf.exists():
            raise RuntimeError("Le fichier PDF n'a pas été créé")
            
        print(f"[PDF Generator] PDF created successfully: {out_pdf}")
        return out_pdf
        
    except Exception as e:
        print(f"[PDF Generator] Error during Playwright PDF generation: {e}")
        import traceback
        traceback.print_exc()
        raise RuntimeError(f"Erreur lors de la génération du PDF: {str(e)}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--html", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    html = Path(args.html)
    out = Path(args.out)
    
    try:
        # Run async function in sync main
        pdf_path = asyncio.run(html_to_pdf(html, out))
        print(f"PDF généré: {pdf_path}")
    except Exception as e:
        print(f"Erreur: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
