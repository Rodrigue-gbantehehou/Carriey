import httpx
import asyncio

async def fetch():
    async with httpx.AsyncClient(timeout=120) as c:
        r = await c.post(
            'https://carriey-1.onrender.com/generate-pdf',
            json={
                'url': 'https://carriey.nomiks.net/print?id=51e5f643-a273-4ddd-8522-3eff4dab6b65',
                'wait_for': '__CV_PRINT_READY__'
            }
        )
        with open('test_pdf_output.pdf', 'wb') as f:
            f.write(r.content)
        print("Status code:", r.status_code, "Size:", len(r.content))

if __name__ == '__main__':
    asyncio.run(fetch())
