# /service/trainee_detail_service.py

import logging
from playwright.async_api import async_playwright
from schemas.trainee_detail_schema import TraineeDetailResponse
from config.settings import settings
from service.playwright_utils import login_to_webinsource

logger = logging.getLogger(__name__)

async def scrape_trainee_detail_handler(application_id: str, login_id: str, password: str) -> list[TraineeDetailResponse]:
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        try:
            await login_to_webinsource(page, login_id, password)
            return await _scrape_trainee_detail(page, application_id)
        finally:
            await browser.close()

async def _scrape_trainee_detail(page, application_id: str) -> list[TraineeDetailResponse]:
    await page.goto(settings.WEBINSOURCE_TRAINEE_URL)
    await page.fill("#TrainingIDText", application_id)
    await page.click("#btnSearch")
    await page.wait_for_selector("table.table-bordered", timeout=10000)

    table = await page.query_selector("table.table-bordered")
    if not table:
        raise Exception("受講者テーブルが見つかりません")

    rows = await table.query_selector_all("tbody > tr")
    result = []

    def strip_annotation(text: str) -> str:
        return text.replace("※1", "").replace("※2", "").replace("済", "").strip()

    i = 0
    while i < len(rows):
        r1 = rows[i]
        r2 = rows[i + 1] if i + 1 < len(rows) else None
        cells_r1 = await r1.query_selector_all("td")
        cells_r2 = await r2.query_selector_all("td") if r2 else []

        async def get_text(cells, idx):
            if idx < len(cells):
                return (await cells[idx].inner_text()).strip()
            return ""

        entry_link, cert_link, product_text = "", "", ""
        if len(cells_r1) >= 6:
            prod_cell = cells_r1[5]
            links = await prod_cell.query_selector_all("a")
            for a in links:
                href = await a.get_attribute("href")
                text = strip_annotation(await a.inner_text())
                if "受講票発行" in text:
                    entry_link = f"https://secure.insource.co.jp{href}"
                elif "受講証明書" in text:
                    cert_link = f"https://secure.insource.co.jp{href}"
            product_text = strip_annotation(await prod_cell.inner_text())

        result.append(TraineeDetailResponse(
            customer=await get_text(cells_r1, 1),
            application=await get_text(cells_r1, 2),
            status=await get_text(cells_r1, 3),
            trainee=await get_text(cells_r1, 4),
            product=product_text,
            entry_link=entry_link or None,
            cert_link=cert_link or None,
            payment=await get_text(cells_r1, 6),
            # control=await get_text(cells_r1, 7),
            condition=await get_text(cells_r2, 0) if cells_r2 else ""
        ))
        i += 2

    return result
