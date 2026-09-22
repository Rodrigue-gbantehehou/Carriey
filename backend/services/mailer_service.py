import smtplib
import ssl
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from typing import Optional
from pathlib import Path
from datetime import datetime

from jinja2 import Environment, FileSystemLoader, select_autoescape

BASE_DIR = Path(__file__).parent.parent.resolve()
MAIL_TEMPLATES_DIR = BASE_DIR / "mail_templates"


class MailerService:
    def __init__(self):
        self.smtp_server = os.getenv("MAIL_HOST", "nomiks.net")
        self.smtp_port = int(os.getenv("MAIL_PORT", "465"))
        self.smtp_user = os.getenv("MAIL_USERNAME", "")
        self.smtp_password = os.getenv("MAIL_PASSWORD", "")
        self.sender_email = os.getenv("MAIL_FROM_ADDRESS", "cvtor@nomiks.net")
        self.sender_name = os.getenv("MAIL_FROM_NAME", "CVtor")

        self.template_env = Environment(
            loader=FileSystemLoader(str(MAIL_TEMPLATES_DIR)),
            autoescape=select_autoescape(['html', 'xml'])
        )

    def _is_configured(self) -> bool:
        return bool(self.smtp_user and self.smtp_password)

    def _render_template(self, template_name: str, context: dict) -> str:
        try:
            template = self.template_env.get_template(template_name)
            return template.render(**context)
        except Exception as e:
            print(f"[Mailer] Template rendering failed for {template_name}: {e}")
            return ""

    def _send(self, msg: MIMEMultipart, recipient: str) -> bool:
        if not self._is_configured():
            print("[Mailer] No credentials configured, skipping email.")
            return False
        try:
            context_ssl = ssl.create_default_context()
            with smtplib.SMTP_SSL(self.smtp_server, self.smtp_port, context=context_ssl) as server:
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            print(f"[Mailer] Email sent to {recipient}")
            return True
        except Exception as e:
            print(f"[Mailer] Failed to send email to {recipient}: {e}")
            return False

    def _build_msg(
        self,
        to: str,
        subject: str,
        html_body: str,
        text_body: str = "",
        attachments: list = None
    ) -> MIMEMultipart:
        msg = MIMEMultipart()
        msg["From"] = f"{self.sender_name} <{self.sender_email}>"
        msg["To"] = to
        msg["Subject"] = subject

        alt = MIMEMultipart("alternative")
        if text_body:
            alt.attach(MIMEText(text_body, "plain", "utf-8"))
        alt.attach(MIMEText(html_body, "html", "utf-8"))
        msg.attach(alt)

        for path in (attachments or []):
            if path and os.path.exists(path):
                with open(path, "rb") as f:
                    part = MIMEApplication(f.read(), Name=os.path.basename(path))
                part["Content-Disposition"] = f'attachment; filename="{os.path.basename(path)}"'
                msg.attach(part)

        return msg

    # --- Email 1: Bienvenue + CV (guest export) ---
    def send_welcome_and_cv(
        self,
        recipient_email: str,
        full_name: str,
        pdf_path: Optional[str] = None,
        setup_link: Optional[str] = None
    ) -> bool:
        ctx = {
            "full_name": full_name or "Client",
            "recipient_email": recipient_email,
            "setup_link": setup_link,
            "has_pdf": bool(pdf_path),
            "login_url": f"{os.getenv('FRONTEND_URL', 'http://localhost:5000')}/login"
        }
        html = self._render_template("welcome_cv.html", ctx)
        text = self._render_template("welcome_cv.txt", ctx)
        if not html:
            return False
        msg = self._build_msg(
            to=recipient_email,
            subject="Votre CV est pret - Bienvenue sur CVtor",
            html_body=html,
            text_body=text,
            attachments=[pdf_path] if pdf_path else []
        )
        return self._send(msg, recipient_email)

    # --- Email 2: Bienvenue inscription ---
    def send_welcome_register(self, recipient_email: str, full_name: str) -> bool:
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5000")
        html = f"""<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<style>body{{font-family:Arial,sans-serif;color:#1c1c1c;margin:0}}
.w{{max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden}}
.h{{background:linear-gradient(135deg,#00C896,#00A87A);padding:40px;text-align:center;color:#fff}}
.h h1{{margin:0;font-size:24px;font-weight:900}}.b{{padding:32px}}
.btn{{display:block;text-align:center;background:#00C896;color:#fff;text-decoration:none;padding:16px;border-radius:12px;font-weight:800;margin:24px 0}}
.f{{padding:20px;background:#f9fafb;text-align:center;color:#9ca3af;font-size:12px}}</style></head>
<body><div class="w">
<div class="h"><div style="font-size:40px;margin-bottom:8px">&#128075;</div>
<h1>Bienvenue sur CVtor, {full_name or 'ami'} !</h1></div>
<div class="b">
<p>Votre compte a ete cree avec succes. Vous pouvez maintenant creer des CV professionnels en quelques minutes.</p>
<a href="{frontend_url}/dashboard" class="btn">Acceder a mon tableau de bord</a>
<p style="color:#6b7280;font-size:13px">Des questions ? Repondez a cet email, on est la pour vous.</p>
</div><div class="f"><p>CVtor - Createur de CV professionnel</p></div>
</div></body></html>"""
        msg = self._build_msg(
            to=recipient_email,
            subject="Bienvenue sur CVtor !",
            html_body=html,
            text_body=f"Bonjour {full_name},\n\nBienvenue sur CVtor ! Votre compte est actif.\n\nConnectez-vous : {frontend_url}/login"
        )
        return self._send(msg, recipient_email)

    # --- Email 3: Confirmation de paiement ---
    def send_payment_confirmation(
        self,
        recipient_email: str,
        full_name: str,
        template_name: str,
        amount: float,
        currency: str = "XOF"
    ) -> bool:
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5000")
        date_str = datetime.now().strftime("%d/%m/%Y a %H:%M")
        html = f"""<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<style>body{{font-family:Arial,sans-serif;color:#1c1c1c;margin:0}}
.w{{max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden}}
.h{{background:linear-gradient(135deg,#00C896,#00A87A);padding:40px;text-align:center;color:#fff}}
.h h1{{margin:0;font-size:24px;font-weight:900}}.b{{padding:32px}}
.det{{background:#f9fafb;border-radius:12px;padding:20px;margin:20px 0}}
.row{{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7eb}}
.row:last-child{{border-bottom:none}}.lbl{{color:#6b7280;font-size:13px}}.val{{font-weight:700;font-size:13px}}
.btn{{display:block;text-align:center;background:#00C896;color:#fff;text-decoration:none;padding:16px;border-radius:12px;font-weight:800;margin:24px 0}}
.badge{{display:inline-block;background:#d1fae5;color:#065f46;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;margin-bottom:16px}}
.f{{padding:20px;background:#f9fafb;text-align:center;color:#9ca3af;font-size:12px}}</style></head>
<body><div class="w">
<div class="h"><div style="font-size:40px;margin-bottom:8px">&#10003;</div><h1>Paiement Confirme !</h1></div>
<div class="b">
<p style="font-size:18px;font-weight:700">Bonjour {full_name or 'Client'},</p>
<span class="badge">Acces Active</span>
<p>Votre paiement a ete recu. Vous avez acces au modele <strong>{template_name}</strong>.</p>
<div class="det">
<div class="row"><span class="lbl">Modele achete</span><span class="val">{template_name}</span></div>
<div class="row"><span class="lbl">Montant</span><span class="val">{int(amount):,} {currency}</span></div>
<div class="row"><span class="lbl">Statut</span><span class="val" style="color:#00C896">Confirme</span></div>
<div class="row"><span class="lbl">Date</span><span class="val">{date_str}</span></div>
</div>
<a href="{frontend_url}/dashboard" class="btn">Acceder a mon tableau de bord</a>
<p style="color:#6b7280;font-size:13px">Telechargez votre CV en PDF ou DOCX depuis le tableau de bord.</p>
</div><div class="f"><p>CVtor - Createur de CV professionnel</p></div>
</div></body></html>"""
        msg = self._build_msg(
            to=recipient_email,
            subject=f"Paiement confirme - Acces a {template_name} active",
            html_body=html,
            text_body=f"Bonjour {full_name},\n\nVotre paiement de {int(amount)} {currency} pour '{template_name}' est confirme.\n\nDashboard: {frontend_url}/dashboard"
        )
        return self._send(msg, recipient_email)

    # --- Email 4: Reset mot de passe ---
    def send_password_reset(self, recipient_email: str, full_name: str, reset_link: str) -> bool:
        html = f"""<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<style>body{{font-family:Arial,sans-serif;color:#1c1c1c;margin:0}}
.w{{max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden}}
.h{{background:#1c1c1c;padding:40px;text-align:center;color:#fff}}
.h h1{{margin:0;font-size:24px;font-weight:900}}.b{{padding:32px}}
.btn{{display:block;text-align:center;background:#00C896;color:#fff;text-decoration:none;padding:16px;border-radius:12px;font-weight:800;margin:24px 0}}
.warn{{background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:12px;color:#92400e;font-size:13px;margin-top:16px}}
.f{{padding:20px;background:#f9fafb;text-align:center;color:#9ca3af;font-size:12px}}</style></head>
<body><div class="w">
<div class="h"><div style="font-size:40px;margin-bottom:8px">&#128274;</div><h1>Reinitialisation du mot de passe</h1></div>
<div class="b">
<p>Bonjour {full_name or ''},</p>
<p>Vous avez demande la reinitialisation de votre mot de passe CVtor.</p>
<a href="{reset_link}" class="btn">Reinitialiser mon mot de passe</a>
<div class="warn">Ce lien est valable <strong>1 heure</strong>. Si vous n'avez pas fait cette demande, ignorez cet email.</div>
<p style="color:#6b7280;font-size:12px;margin-top:16px">Lien direct : {reset_link}</p>
</div><div class="f"><p>CVtor - Createur de CV professionnel</p></div>
</div></body></html>"""
        msg = self._build_msg(
            to=recipient_email,
            subject="Reinitialisation de votre mot de passe CVtor",
            html_body=html,
            text_body=f"Bonjour {full_name},\n\nLien de reinitialisation (valable 1h) :\n{reset_link}\n\nSi vous n'avez pas fait cette demande, ignorez cet email."
        )
        return self._send(msg, recipient_email)


mailer_service = MailerService()
