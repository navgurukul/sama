import asyncio
import sys
import os

# Add app folder to path
sys.path.append(os.path.join(os.path.dirname(__file__), "app"))

from app.main import check_and_parse_inbound_emails

async def main():
    print("Manually triggering check_and_parse_inbound_emails...")
    try:
        await check_and_parse_inbound_emails()
        print("Execution finished successfully!")
    except Exception as e:
        print(f"Error occurred: {e}")

if __name__ == "__main__":
    asyncio.run(main())
