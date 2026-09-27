import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("No DATABASE_URL found.")
    exit(1)

# Format: mysql+pymysql://user:password@host:port/dbname
try:
    auth_part = db_url.split("://")[1].split("@")[0]
    host_part = db_url.split("@")[1].split("/")[0]
    db_name = db_url.split("/")[-1]
    
    user = auth_part.split(":")[0]
    password = auth_part.split(":")[1]
    
    host = host_part.split(":")[0]
    port = int(host_part.split(":")[1]) if ":" in host_part else 3306

    connection = pymysql.connect(
        host=host,
        user=user,
        password=password,
        database=db_name,
        port=port
    )
    
    with connection.cursor() as cursor:
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN premium_until DATETIME NULL;")
            print("Successfully added premium_until column to users table.")
        except Exception as e:
            print(f"Error adding premium_until: {e}")
            
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN subscription_status VARCHAR(50) DEFAULT 'free';")
            print("Successfully added subscription_status column to users table.")
        except Exception as e:
            print(f"Error adding subscription_status: {e}")

    connection.commit()
    connection.close()
    
    print("Done!")
except Exception as e:
    print(f"Failed to parse or connect: {e}")
