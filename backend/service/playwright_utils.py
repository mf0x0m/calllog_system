# service/playwright_utils.py

from playwright.async_api import async_playwright, Page, TimeoutError
from config.settings import settings
import logging

logger = logging.getLogger(__name__)

async def launch_browser():
    p = await async_playwright().start()
    browser = await p.chromium.launch(headless=True)
    context = await browser.new_context()
    page = await context.new_page()
    return p, browser, context, page

async def login_to_webinsource(page: Page, login_id: str, password: str) -> bool:
    try:
        await page.goto(settings.WEBINSOURCE_TOP_URL)
        await page.fill("#company_cd", settings.COMPANY_CODE)
        await page.fill("#login_id", login_id)
        await page.fill("#password", password)
        await page.click("#btnLogin")
        await page.wait_for_url("**/information/index", timeout=5000)
        return True
    except TimeoutError:
        logger.warning(f"[Timeout] ログイン後のリダイレクトに失敗: {login_id}")
        return False
    except Exception as e:
        logger.error(f"[Login Error] ログイン中にエラー発生: {e}")
        return False

async def try_login(login_id: str, password: str) -> bool:
    p, browser, context, page = await launch_browser()
    try:
        return await login_to_webinsource(page, login_id, password)
    finally:
        await browser.close()
        await p.stop()
