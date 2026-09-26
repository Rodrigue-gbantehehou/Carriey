import pymysql

try:
    conn = pymysql.connect(
        host="localhost",
        user="root",
        password="",
        port=3306,
        database="carriey"
    )
    with conn.cursor() as cursor:
        try:
            cursor.execute("ALTER TABLE public_pages ADD COLUMN custom_bio TEXT DEFAULT NULL")
            print("Added custom_bio")
        except Exception as e:
            print(f"Failed custom_bio: {e}")
        try:
            cursor.execute("ALTER TABLE public_pages ADD COLUMN seo_description VARCHAR(500) DEFAULT NULL")
            print("Added seo_description")
        except Exception as e:
            print(f"Failed seo_description: {e}")
    conn.commit()
    conn.close()
    print("Migration finished!")
except Exception as e:
    print(f"Error: {e}")
