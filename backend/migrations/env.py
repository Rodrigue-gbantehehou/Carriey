import os
import sys
from logging.config import fileConfig
from pathlib import Path

from sqlalchemy import engine_from_config, pool
from alembic import context

# ── Ajouter le dossier backend/ au path pour les imports ─────────────────────
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

# ── Charger .env ──────────────────────────────────────────────────────────────
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

# ── Importer Base ET tous les modèles (nécessaire pour autogenerate) ──────────
from app.db.session import Base
import app.models.user              # noqa: F401
import app.models.profile           # noqa: F401
import app.models.persona           # noqa: F401
import app.models.payment           # noqa: F401
import app.models.resume            # noqa: F401
import app.models.template          # noqa: F401
import app.models.audit             # noqa: F401
import app.models.public_page       # noqa: F401
import app.models.candidature       # noqa: F401
import app.models.subscription_plan # noqa: F401


# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ── Target metadata pour autogenerate ─────────────────────────────────────────
target_metadata = Base.metadata

# ── Lire DATABASE_URL depuis l'environnement (override alembic.ini) ───────────
def get_url() -> str:
    url = os.environ.get("DATABASE_URL", "sqlite:///./cvtor.db")
    # Normaliser mysql:// → mysql+pymysql://
    if url.startswith("mysql://"):
        url = url.replace("mysql://", "mysql+pymysql://", 1)
    return url


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    from sqlalchemy import create_engine
    connectable = create_engine(get_url(), poolclass=pool.NullPool)

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
