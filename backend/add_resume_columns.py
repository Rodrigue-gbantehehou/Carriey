import os
from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost:3306/cvtor")
engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as conn:
        # Met à jour les valeurs existantes de 'cv' vers 'CV' (le nom de l'Enum en Python)
        conn.execute(text("UPDATE resumes SET doc_type = 'CV' WHERE doc_type = 'cv'"))
        
        # Change la valeur par défaut de la colonne
        conn.execute(text("ALTER TABLE resumes ALTER COLUMN doc_type SET DEFAULT 'CV'"))
        
        conn.commit()
    print("La colonne doc_type a été corrigée avec succès ! (Valeurs mises à jour vers 'CV')")
except Exception as e:
    print(f"Error during migration: {e}")
