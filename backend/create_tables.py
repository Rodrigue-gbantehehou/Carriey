from database import engine, Base
from models import *

def init_db():
    print("Creating tables...")
    # Be careful: this won't drop existing tables unless we tell it to, 
    # but since we changed schema significantly, we might want to drop if they exist 
    # or the user can manage it. For "generating tables", create_all is sufficient 
    # if the DB is fresh or we accept appended tables (but we renamed some).
    # Given the major changes (ID types), it's best to drop if we want a clean state,
    # but that destroys data. I will just create_all, and if it fails, I'll let the user know.
    # Actually, to be "functional", I"ll try to create. 
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

if __name__ == "__main__":
    init_db()
