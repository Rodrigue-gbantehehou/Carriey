import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
import os
from typing import List, Optional

from jinja2 import Environment, FileSystemLoader, select_autoescape
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent.resolve()
MAIL_TEMPLATES_DIR = BASE_DIR / "mail_templates"

class MailerService:
    def __init__(self):
        self.smtp_server = os.getenv("MAIL_HOST", "mira.o2switch.net")
        self.smtp_port = int(os.getenv("MAIL_PORT", "465"))
        self.smtp_user = os.getenv("MAIL_USERNAME", "")
        self.smtp_password = os.getenv("MAIL_PASSWORD", "")
        self.sender_email = os.getenv("MAIL_FROM_ADDRESS", "")
        self.sender_name = os.getenv("MAIL_FROM_NAME", "CVTor")
        
        # dedicated Jinja environment for emails
        self.template_env = Environment(
            loader=FileSystemLoader(str(MAIL_TEMPLATES_DIR)),
            autoescape=select_autoescape(['html', 'xml'])
        )

    def _render_template(self, template_name: str, context: dict) -> str:
        """Renders a mail template with Jinja2"""
        template = self.template_env.get_template(template_name)
        return template.render(**context)

    def send_welcome_and_cv(self, recipient_email: str, full_name: str, pdf_path: Optional[str] = None, setup_link: Optional[str] = None):
        """Envoie l'email de bienvenue avec les identifiants et le CV"""
        if not self.smtp_user or not self.smtp_password:
            print("[Mailer] No credentials provided, skipping email.")
            return

        msg = MIMEMultipart()
        msg["From"] = f"{self.sender_name} <{self.sender_email}>"
        msg["To"] = recipient_email
        msg["Subject"] = "Votre CV est prêt - Bienvenue sur CVTor"

        # Context for templates
        context = {
            "full_name": full_name,
            "recipient_email": recipient_email,
            "setup_link": setup_link,
            "has_pdf": bool(pdf_path),
            "login_url": f"{os.getenv('FRONTEND_URL', 'http://localhost:5000')}/login"
        }

        # Render versions
        try:
            text_body = self._render_template("welcome_cv.txt", context)
            html_body = self._render_template("welcome_cv.html", context)
            
            # Create alternative part
            alt_part = MIMEMultipart("alternative")
            alt_part.attach(MIMEText(text_body, "plain"))
            alt_part.attach(MIMEText(html_body, "html"))
            msg.attach(alt_part)
        except Exception as e:
            print(f"[Mailer] Template rendering failed: {str(e)}")
            return False

        if pdf_path and os.path.exists(pdf_path):
            with open(pdf_path, "rb") as f:
                part = MIMEApplication(f.read(), Name=os.path.basename(pdf_path))
            part['Content-Disposition'] = f'attachment; filename="{os.path.basename(pdf_path)}"'
            msg.attach(part)

        try:
            context_ssl = ssl.create_default_context()
            with smtplib.SMTP_SSL(self.smtp_server, self.smtp_port, context=context_ssl) as server:
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            print(f"[Mailer] Email sent to {recipient_email}")
            return True
        except Exception as e:
            print(f"[Mailer] Failed to send email: {str(e)}")
            return False

mailer_service = MailerService()
