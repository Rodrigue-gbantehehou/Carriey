import sqlite3
import os

# Connect to the SQLite database
db_path = os.path.join(os.path.dirname(__file__), 'cvtor.db')
print(f"Connecting to database at {db_path}")

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Add custom_bio column
    try:
        cursor.execute("ALTER TABLE public_pages ADD COLUMN custom_bio TEXT")
        print("Successfully added custom_bio column to public_pages table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("custom_bio column already exists.")
        else:
            print(f"Error adding custom_bio column: {e}")

    # Add seo_description column
    try:
        cursor.execute("ALTER TABLE public_pages ADD COLUMN seo_description VARCHAR(500)")
        print("Successfully added seo_description column to public_pages table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("seo_description column already exists.")
        else:
            print(f"Error adding seo_description column: {e}")

    conn.commit()
    print("Database schema update completed successfully.")

except Exception as e:
    print(f"An error occurred: {e}")
finally:
    conn = locals().get('conn')
    if conn is not None:
        conn.close()
