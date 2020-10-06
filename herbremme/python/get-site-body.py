import asyncio
from pyppeteer import launch
import sys

async def main():
  browser = await launch()
  page = await browser.newPage()
  await page.goto(sys.argv[1].replace(' ', "%20"))
  bod = await page.evaluate('document.body.outerHTML', force_expr=True)
  print(bod.encode(sys.stdout.encoding, errors='replace').decode("utf-8"))
  sys.stdout.flush()

df = asyncio.get_event_loop().run_until_complete(main())
df
