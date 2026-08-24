import os

env_path = os.path.join("backend", ".env")

smtp_config = """
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=b163c1001@smtp-brevo.com
SMTP_PASSWORD=xsmtpsib-c588f5c3d641af1fb518c3f361af8a86c44a04ab49e82a364d857c4942a3cc4d-6kAZdAviZtP7KoDn
SMTP_SENDER=ganeshppawar864@gmail.com
NGO_REQUEST_EMAIL=ganeshppawar864@gmail.com
"""

if os.path.exists(env_path):
    with open(env_path, "r") as f:
        content = f.read()
    
    if "SMTP_HOST" not in content:
        with open(env_path, "a") as f:
            f.write("\n" + smtp_config.strip() + "\n")
        print("SMTP configurations added successfully!")
    else:
        print("SMTP configurations already exist in .env!")
else:
    print(f"Error: {env_path} not found.")
