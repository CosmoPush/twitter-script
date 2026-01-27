import asyncio
from dotenv import load_dotenv
import os
from twikit import Client

load_dotenv()

async def main():
    client = Client(language="en-US")
    await client.login(
        auth_info_1=os.getenv("USERNAME"),
        auth_info_2=os.getenv("EMAIL"),
        password=os.getenv("PASSWORD"),
    )
    
    client.save_cookies("cookies.json")

asyncio.run(main())
