
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
        cursor.execute("ALTER TABLE master_profiles ADD COLUMN first_name VARCHAR(100) DEFAULT NULL")
        cursor.execute("ALTER TABLE master_profiles ADD COLUMN last_name VARCHAR(100) DEFAULT NULL")
    conn.commit()
    conn.close()
    print("Columns added successfully via pymysql!")
except Exception as e:
    print(f"Error: {e}")
