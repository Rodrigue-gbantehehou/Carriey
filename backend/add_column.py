import os
from sqlalchemy import create_engine, text
from config import settings

DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost:3306/cvtor")
engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE templates ADD COLUMN template_type VARCHAR(50) DEFAULT 'cv'"))
        conn.commit()
    print("Column added successfully!")
except Exception as e:
    print(f"Error adding column: {e}")
