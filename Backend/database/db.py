import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="smart_municipal_council",
    user="postgres",
    password="your_real_password",
    port="5432"
)

cursor = conn.cursor()