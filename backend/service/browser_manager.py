from contextlib import asynccontextmanager
from playwright.async_api import async_playwright, Browser, Page, TimeoutError
from config.settings import settings
import logging

logger = logging.getLogger(__name__)

class BrowserManager:
    @asynccontextmanager
    async def get_authenticated_page(self, login_id: str, password: str):
        playwright = None
        browser = None
        try:
            playwright = await async_playwright().start()
            browser = await playwright.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()
            
            success = await self._login_to_webinsource(page, login_id, password)
            if not success:
                raise ValueError("WebInsourceへのログインに失敗しました")
            
            yield page
            
        except Exception as e:
            logger.error(f"Browser error: {e}")
            raise
        finally:
            if browser:
                await browser.close()
            if playwright:
                await playwright.stop()
    
    async def _login_to_webinsource(self, page: Page, login_id: str, password: str) -> bool:
        try:
            await page.goto(settings.WEBINSOURCE_TOP_URL)
            await page.fill("#company_cd", settings.COMPANY_CODE)
            await page.fill("#login_id", login_id)
            await page.fill("#password", password)
            await page.click("#btnLogin")
            await page.wait_for_url("**/information/index", timeout=5000)
            logger.info(f"Login successful: {login_id}")
            return True
        except TimeoutError:
            logger.warning(f"[Timeout] ログイン後のリダイレクトに失敗: {login_id}")
            return False
        except Exception as e:
            logger.error(f"[Login Error] ログイン中にエラー発生: {e}")
            return False