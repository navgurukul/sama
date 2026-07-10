import smtplib
import os
import sys

# Manually load environment variables from backend/.env
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
if not os.path.exists(env_path):
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend", ".env")

if os.path.exists(env_path):
    print(f"Loading environment from: {env_path}")
    with open(env_path, "r") as f:
        for line in f:
            line_str = line.strip()
            if "=" in line_str and not line_str.startswith("#"):
                parts = line_str.split("=", 1)
                os.environ[parts[0].strip()] = parts[1].strip()
else:
    print("Warning: .env file not found!")

def test_smtp():
    smtp_host = os.environ.get("SMTP_HOST", "smtp-relay.brevo.com")
    try:
        smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    except:
        smtp_port = 587
        
    smtp_user = os.environ.get("SMTP_USER")
    smtp_pass = os.environ.get("SMTP_PASSWORD")
    smtp_sender = os.environ.get("SMTP_SENDER", "ganesh@thesama.in")
    
    print(f"SMTP Host: {smtp_host}:{smtp_port}")
    print(f"SMTP User: {smtp_user}")
    print(f"SMTP Password Length: {len(smtp_pass) if smtp_pass else 0}")
    print(f"SMTP Sender: {smtp_sender}")
    
    if not smtp_user or not smtp_pass:
        print("Error: SMTP_USER or SMTP_PASSWORD not set in environment.")
        return

    try:
        print("Connecting to SMTP server...")
        with smtplib.SMTP(smtp_host, smtp_port, timeout=15.0) as server:
            print("Sending STARTTLS...")
            server.starttls()
            print("Attempting Login...")
            server.login(smtp_user, smtp_pass)
            print("Success! SMTP Login Succeeded.")
    except Exception as e:
        print(f"SMTP Login Failed: {e}")

if __name__ == "__main__":
    test_smtp()
