#!/usr/bin/env python3
"""
Convertit un fichier HTML en PDF via Playwright Async API
"""
import argparse
from pathlib import Path
import os
import sys
import asyncio
from typing import Optional

# --- WINDOWS ASYNCIO FIX ---
# Playwright needs subprocess support, which requires ProactorEventLoop on Windows.
if sys.platform == 'win32':
    try:
        _set_policy = getattr(asyncio, "set_event_loop_policy", None)
        _policy_cls = getattr(asyncio, "WindowsProactorEventLoopPolicy", None)
        if _set_policy and _policy_cls:
            _set_policy(_policy_cls())
    except Exception:
        pass

try:
    from playwright.async_api import async_playwright
except ImportError:
    print("[PDF Generator] Error: playwright not installed. Run 'pip install playwright'")
    sys.exit(1)


async def html_to_pdf(source: str, out_pdf: Path, is_url: bool = False) -> Path:
    """Convertit un fichier HTML ou une URL en PDF en utilisant Playwright Async avec synchronisation des polices"""
    print(f"[PDF Generator] Converting {'URL' if is_url else 'HTML file'} to PDF using Playwright Async")
    print(f"[PDF Generator] Source: {source}")
    print(f"[PDF Generator] Output: {out_pdf}")
    
    if not is_url:
        html_path = Path(source)
        if not html_path.exists():
            raise FileNotFoundError(f"HTML introuvable: {html_path}")
        target_url = f"file://{html_path.absolute()}"
    else:
        target_url = source

    try:
        async with async_playwright() as p:
            # Lancement de Chromium avec optimisation pour Docker et environnements headless
            launch_args = [
                "--disable-dev-shm-usage", 
                "--no-sandbox", 
                "--disable-setuid-sandbox",
                "--disable-gpu"
            ]
            try:
                browser = await p.chromium.launch(headless=True, args=launch_args)
            except Exception as e:
                print(f"[PDF Generator] Chromium not found, trying to install: {e}")
                import subprocess
                subprocess.run([sys.executable, "-m", "playwright", "install", "chromium"], check=True)
                browser = await p.chromium.launch(headless=True, args=launch_args)
                
            page = await browser.new_page()
            
            # Émuler le média d'impression pour appliquer @media print
            await page.emulate_media(media="print")
            
            print(f"[PDF Generator] Loading page: {target_url}")
            
            # Charger la page avec timeout de 30 secondes
            try:
                await page.goto(target_url, wait_until="load", timeout=30000)
            except Exception as e:
                print(f"[PDF Generator] Warning: page.goto timed out or failed: {e}. Attempting PDF anyway.")
            
            # Attendre que le composant React signale être prêt si c'est une URL
            if is_url:
                try:
                    await page.wait_for_function("() => window.__CV_PRINT_READY__ === true", timeout=12000)
                except Exception as ready_err:
                    print(f"[PDF Generator] Notice: __CV_PRINT_READY__ wait skipped: {ready_err}")

            # Attendre le chargement complet des polices Web (Google Fonts) pour un rendu parfait
            try:
                await page.evaluate("() => document.fonts ? document.fonts.ready : Promise.resolve()")
            except Exception as font_err:
                print(f"[PDF Generator] Notice: Font wait skipped: {font_err}")

            # Attendre 300ms supplémentaires pour laisser les styles et SVG se peindre
            await asyncio.sleep(0.3)
            
            # Générer le PDF au format A4 exact sans marge artificielle du navigateur
            print(f"[PDF Generator] Printing PDF...")
            await page.pdf(
                path=str(out_pdf),
                format="A4",
                print_background=True,
                prefer_css_page_size=True,
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


async def take_screenshot(source: str, out_img: Path, is_url: bool = False, selector: Optional[str] = None) -> Path:
    """Capture une capture d'écran PNG haute fidélité pour les miniatures de templates"""
    if not is_url:
        html_path = Path(source)
        if not html_path.exists():
            raise FileNotFoundError(f"HTML introuvable: {html_path}")
        target_url = f"file://{html_path.absolute()}"
    else:
        target_url = source

    out_img.parent.mkdir(parents=True, exist_ok=True)

    try:
        async with async_playwright() as p:
            launch_args = [
                "--disable-dev-shm-usage", 
                "--no-sandbox", 
                "--disable-setuid-sandbox",
                "--disable-gpu"
            ]
            try:
                browser = await p.chromium.launch(headless=True, args=launch_args)
            except Exception:
                import subprocess
                subprocess.run([sys.executable, "-m", "playwright", "install", "chromium"], check=True)
                browser = await p.chromium.launch(headless=True, args=launch_args)

            page = await browser.new_page(viewport={"width": 794, "height": 1123})
            
            try:
                await page.goto(target_url, wait_until="load", timeout=20000)
            except Exception as e:
                print(f"[Screenshot] Warning: page.goto timed out: {e}")

            if is_url:
                try:
                    await page.wait_for_function("() => window.__CV_PRINT_READY__ === true", timeout=8000)
                except Exception:
                    pass

            try:
                await page.evaluate("() => document.fonts ? document.fonts.ready : Promise.resolve()")
            except Exception:
                pass

            await asyncio.sleep(0.4)

            target_el = None
            if selector:
                target_el = await page.query_selector(selector)
            if not target_el:
                target_el = await page.query_selector(".cv-rendering-root") or await page.query_selector(".cv-container")

            if target_el:
                await target_el.screenshot(path=str(out_img))
            else:
                await page.screenshot(path=str(out_img), clip={"x": 0, "y": 0, "width": 794, "height": 1123})

            await browser.close()

        return out_img
    except Exception as e:
        print(f"[Screenshot] Error during template screenshot: {e}")
        raise RuntimeError(f"Erreur lors de la capture d'écran: {str(e)}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--html", required=False, help="Chemin du fichier HTML local")
    ap.add_argument("--url", required=False, help="URL HTTP/HTTPS de la page à imprimer")
    ap.add_argument("--out", required=True, help="Chemin de sortie du fichier (PDF ou PNG)")
    ap.add_argument("--screenshot", action="store_true", help="Génère une image PNG plutôt qu'un PDF")
    args = ap.parse_args()

    if not args.html and not args.url:
        print("Erreur: Vous devez spécifier soit --html soit --url")
        sys.exit(1)

    source = args.url if args.url else args.html
    is_url = bool(args.url)
    out = Path(args.out)
    
    try:
        if args.screenshot:
            img_path = asyncio.run(take_screenshot(source, out, is_url=is_url))
            print(f"Capture générée: {img_path}")
        else:
            pdf_path = asyncio.run(html_to_pdf(source, out, is_url=is_url))
            print(f"PDF généré: {pdf_path}")
    except Exception as e:
        print(f"Erreur: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
