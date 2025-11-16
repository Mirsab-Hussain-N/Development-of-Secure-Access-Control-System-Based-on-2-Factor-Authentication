import mysql.connector

def get_db_connection():
    connection = mysql.connector.connect(
        host="localhost",
        user="root",          # your MySQL username
        password="NabiMoon_1@54",  # your MySQL password
        database="facial_recognition_db"
    )
    return connection
