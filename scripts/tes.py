import sqlite3

conn = sqlite3.connect('job_data.db')
cursor = conn.cursor()

cursor.execute("SELECT COUNT(*) FROM jobs")
print("Jumlah data di tabel jobs:", cursor.fetchone()[0])

conn.close()
