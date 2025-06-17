import logging
from playwright.async_api import async_playwright
from config.settings import settings
from service.playwright_utils import login_to_webinsource
from schemas.training_detail_schema import DetailResponse, Attendee

logger = logging.getLogger(__name__)

async def scrape_detail_page(web_id: str, login_id: str, password: str) -> dict:
    url = f"{settings.WEBINSOURCE_MANAGE_URL}/{web_id}"

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()

            success = await login_to_webinsource(page, login_id, password)
            if not success:
                raise ValueError("ログイン失敗")

            await page.goto(url, wait_until="load", timeout=30000)
            logger.info(f"詳細ページアクセス成功: {web_id}")

            # 基本情報の取得
            detail_data = {}
            rows = await page.query_selector_all("table.table-bordered:nth-of-type(1) tr")
            for row in rows:
                th = await row.query_selector("th")
                td = await row.query_selector("td")
                if th and td:
                    key = (await th.inner_text()).strip()
                    value = (await td.inner_text()).strip()
                    detail_data[key] = value

            # 受講者一覧の取得
            attendee_data = []
            table = await page.query_selector("table#plan")
            if table:
                trs = await table.query_selector_all("tbody tr")
                for i in range(0, len(trs), 2):
                    row1, row2 = trs[i], trs[i + 1] if i + 1 < len(trs) else None
                    tds1 = await row1.query_selector_all("td")
                    tds2 = await row2.query_selector_all("td") if row2 else []
                    attendee = {}

                    async def text(el): return (await el.inner_text()).strip() if el else ""

                    if len(tds1) >= 12:
                        attendee["申込No"] = await text(tds1[1])
                        img = await tds1[2].query_selector("img")
                        src = await img.get_attribute("src") if img else ""
                        attendee["申込方法"] = src.split("/")[-1] if src else ""
                        attendee["取引ID"] = await text(tds1[3])
                        attendee["決済種別"] = await text(tds1[4])
                        attendee["受講状況"] = await text(tds1[5])
                        attendee["お客様名"] = await text(tds1[6])
                        attendee["部署名"] = await text(tds1[7])
                        attendee["役職"] = await text(tds1[8])
                        attendee["氏名"] = await text(tds1[9])
                        attendee["受講票最終発行日"] = await text(tds1[10])
                        attendee["ご質問とご要望"] = await text(tds1[11])

                    if len(tds2) >= 1:
                        attendee["申込日時"] = await text(tds2[0])
                    if len(tds2) >= 3:
                        attendee["カナ"] = await text(tds2[-1])

                    attendee_data.append(attendee)

            return DetailResponse(
                基本情報=detail_data,
                受講者一覧=[Attendee(**a) for a in attendee_data]
            )

    except Exception as e:
        logger.error(f"詳細ページ取得エラー: {e}")
        raise
