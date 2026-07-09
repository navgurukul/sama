import asyncio
import sys
import os
import imaplib

# Add app folder to path
sys.path.append(os.path.join(os.path.dirname(__file__), "app"))

from app.main import check_and_parse_inbound_emails

async def main():
    print("Connecting to check inbox status...")
    imap_user = os.environ.get("NGO_REQUEST_EMAIL")
    imap_pass = os.environ.get("NGO_REQUEST_EMAIL_PASSWORD")
    
    if not imap_user or not imap_pass:
        print("Error: NGO_REQUEST_EMAIL or NGO_REQUEST_EMAIL_PASSWORD not configured!")
        return
        
    try:
        mail = imaplib.IMAP4_SSL("imap.gmail.com", 993)
        mail.login(imap_user, imap_pass)
        mail.select("inbox")
        status, messages = mail.search(None, "UNSEEN")
        if status == "OK" and messages[0]:
            count = len(messages[0].split())
            print(f"Success! Found {count} UNREAD email(s) in inbox.")
        else:
            print("Found 0 UNREAD emails in inbox.")
        mail.logout()
    except Exception as e:
        print(f"Error checking inbox: {e}")
        
    print("\nRunning full parse flow now...")
    try:
        await check_and_parse_inbound_emails()
        print("Execution finished successfully!")
    except Exception as e:
        print(f"Error occurred: {e}")

if __name__ == "__main__":
    asyncio.run(main())
