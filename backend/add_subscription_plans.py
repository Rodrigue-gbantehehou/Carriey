import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def add_subscription_plans_table():
    db_url = os.getenv("DATABASE_URL")
    if not db_url or not db_url.startswith("mysql+pymysql://"):
        print("DATABASE_URL invalide ou non mysql+pymysql")
        return
        
    try:
        # mysql+pymysql://user:password@host:port/dbname
        parts = db_url.replace("mysql+pymysql://", "").split("/")
        auth_host = parts[0].split("@")
        user_pass = auth_host[0].split(":")
        user = user_pass[0]
        password = user_pass[1] if len(user_pass) > 1 else ""
        host_port = auth_host[1].split(":")
        host = host_port[0]
        port = int(host_port[1]) if len(host_port) > 1 else 3306
        db_name = parts[1].split("?")[0]
        
        print(f"Connexion à la base de données {db_name} sur {host}:{port}...")
        
        connection = pymysql.connect(
            host=host,
            user=user,
            password=password,
            database=db_name,
            port=port
        )
        
        with connection.cursor() as cursor:
            # Create the subscription_plans table
            create_table_sql = """
            CREATE TABLE IF NOT EXISTS subscription_plans (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                code VARCHAR(50) NOT NULL UNIQUE,
                price DECIMAL(10,2) NOT NULL,
                currency VARCHAR(10) DEFAULT 'XOF',
                duration_days INT DEFAULT 0,
                features JSON,
                is_active BOOLEAN DEFAULT TRUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
            """
            print("Création de la table subscription_plans...")
            cursor.execute(create_table_sql)
            
            # Insert default plans if they don't exist
            check_sql = "SELECT COUNT(*) FROM subscription_plans"
            cursor.execute(check_sql)
            if cursor.fetchone()[0] == 0:
                print("Insertion des plans par défaut...")
                insert_sql = """
                INSERT INTO subscription_plans (id, name, code, price, currency, duration_days, features)
                VALUES 
                (UUID(), 'carriey Gratuit', 'free', 0, 'F CFA', 0, '{"description": "Le nécessaire pour commencer votre recherche.", "items": [{"text": "1 Modèle Classique", "included": true}, {"text": "Téléchargements illimités", "included": true}, {"text": "Aperçu haute définition", "included": true}, {"text": "Accès aux modèles premium", "included": false}, {"text": "Assistant IA (Lettre & CV)", "included": false}], "cta": "Commencer gratuitement", "popular": false}'),
                
                (UUID(), 'Pass carriey PRO', 'pro_14', 1500, 'F CFA', 14, '{"description": "La puissance totale pour une recherche ciblée.", "items": [{"text": "Tous les modèles Premium", "included": true}, {"text": "Téléchargements illimités", "included": true}, {"text": "Assistant IA illimité (Lettre & CV)", "included": true}, {"text": "Export PDF Haute Définition", "included": true}, {"text": "Profil Web en ligne", "included": true}], "cta": "Débloquer carriey PRO", "popular": true}'),
                
                (UUID(), 'Achat Unique', 'single', 2000, 'F CFA', 0, '{"description": "Débloquez un modèle Premium pour toujours.", "items": [{"text": "Le modèle Premium choisi", "included": true}, {"text": "Accès permanent à vie", "included": true}, {"text": "Export PDF Haute Définition", "included": true}, {"text": "Assistant IA illimité", "included": true}, {"text": "Tous les modèles Premium", "included": false}], "cta": "Voir les modèles", "popular": false}');
                """
                cursor.execute(insert_sql)
            
            connection.commit()
            print("Migration terminée avec succès !")
            
    except Exception as e:
        print(f"Erreur lors de la migration: {e}")
    finally:
        if 'connection' in locals() and connection:
            connection.close()

if __name__ == "__main__":
    add_subscription_plans_table()
