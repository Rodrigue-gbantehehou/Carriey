from database import engine, Base
from models import *
from sqlalchemy import text

def reset_db():
    print("Resetting database...")
    # Disable foreign key checks for MySQL to avoid order issues during drop
    with engine.connect() as connection:
        connection.execute(text("SET FOREIGN_KEY_CHECKS = 0"))
        print("Foreign key checks disabled.")

    Base.metadata.drop_all(bind=engine)
    print("All tables dropped.")
    
    Base.metadata.create_all(bind=engine)
    print("All tables recreated successfully.")

    with engine.connect() as connection:
        connection.execute(text("SET FOREIGN_KEY_CHECKS = 1"))
        print("Foreign key checks enabled.")

if __name__ == "__main__":
    confirm = input("This will DELETE ALL DATA. Type 'yes' to proceed: ")
    if confirm == "yes":
        reset_db()
    else:
        print("Operation cancelled.")
