import os
from sqlalchemy import create_engine, text

DATABASE_URL = "mysql+pymysql://root:@localhost:3306/carriey"
engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE master_profiles ADD COLUMN first_name VARCHAR(100) DEFAULT NULL"))
        conn.execute(text("ALTER TABLE master_profiles ADD COLUMN last_name VARCHAR(100) DEFAULT NULL"))
        conn.commit()
    print("Columns first_name and last_name added successfully!")
except Exception as e:
    print(f"Error adding columns: {e}")
except Exception as e:
    print(f"Error adding columns: {e}")
