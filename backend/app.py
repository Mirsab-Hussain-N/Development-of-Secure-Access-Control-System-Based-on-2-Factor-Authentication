import smtplib
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import base64
import cv2
import numpy as np
from deepface import DeepFace

app = Flask(__name__)
CORS(app)

# Database connection
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="NabiMoon_1@54",
        database="facial_recognition_db"
    )

# Signup route
@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    name = data["name"]
    email = data["email"]
    password = data["password"]
    image_data = data["image"]

    image_bytes = base64.b64decode(image_data.split(",")[1])

    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute(
        "INSERT INTO users (name, email, password, image) VALUES (%s, %s, %s, %s)",
        (name, email, password, image_bytes)
    )
    connection.commit()
    cursor.close()
    connection.close()
    return jsonify({"message": "Signup successful!"})


# Login route
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data["email"]
    password = data["password"]
    captured_image_data = data["image"]

    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT password, image FROM users WHERE email=%s", (email,))
    result = cursor.fetchone()
    cursor.close()
    connection.close()

    if not result:
        return jsonify({"error": "User not found"}), 400

    db_password, stored_image_bytes = result

    if password != db_password:
        return jsonify({"error": "Incorrect password"}), 401

    # Decode both images
    stored_image = cv2.imdecode(np.frombuffer(stored_image_bytes, np.uint8), cv2.IMREAD_COLOR)
    captured_bytes = base64.b64decode(captured_image_data.split(",")[1])
    captured_image = cv2.imdecode(np.frombuffer(captured_bytes, np.uint8), cv2.IMREAD_COLOR)

    try:
        # DeepFace verify
        result = DeepFace.verify(stored_image, captured_image, enforce_detection=False)
        if result["verified"]:
            return jsonify({"message": "Login successful, face verified!"})
        else:
            return jsonify({"error": "Face does not match"}), 403
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Store OTPs temporarily in memory
otp_storage = {}

# Route 1: Send OTP
@app.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email = data.get("email")

    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT email FROM users WHERE email = %s", (email,))
    result = cursor.fetchone()
    cursor.close()
    connection.close()

    if not result:
        return jsonify({"error": "Email not found"}), 404

    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    otp_storage[email] = otp

    # Send OTP via Gmail SMTP
    sender_email = "nabimoon7864@gmail.com"
    sender_password = "zioj vroz tcnl zlqq"

    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = email
    msg["Subject"] = "Your OTP for Password Reset"

    body = f"Your OTP for resetting your password is: {otp}\n\nThis OTP will expire in 5 minutes."
    msg.attach(MIMEText(body, "plain"))

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        return jsonify({"message": "OTP sent successfully!"})
    except Exception as e:
        return jsonify({"error": f"Failed to send email: {str(e)}"}), 500


# Route 2: Reset Password
@app.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()
    email = data.get("email")
    otp = data.get("otp")
    new_password = data.get("new_password")

    if email not in otp_storage or otp_storage[email] != otp:
        return jsonify({"error": "Invalid or expired OTP"}), 400

    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("UPDATE users SET password = %s WHERE email = %s", (new_password, email))
    connection.commit()
    cursor.close()
    connection.close()

    del otp_storage[email]  # Remove OTP after use
    return jsonify({"message": "Password reset successful!"})


if __name__ == "__main__":
    app.run(debug=True)
