import logging
from schemas.auth_schema import LoginRequest, LoginResponse
from service.browser_manager import BrowserManager

logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self, browser_manager: BrowserManager):
        self.browser_manager = browser_manager

    async def handle_login(self, data: LoginRequest, staff_map: dict) -> LoginResponse:
        login_id = data.id
        password = data.password

        if login_id not in staff_map:
            logger.warning(f"未登録IDでログイン試行: {login_id}")
            raise ValueError("未登録のIDです")

        logger.info(f"ログイン試行: {login_id}")
        
        try:
            async with self.browser_manager.get_authenticated_page(login_id, password) as page:
                full_name = staff_map[login_id]
                logger.info(f"ログイン成功: {login_id} / {full_name}")
                return LoginResponse(success=True, fullName=full_name)
        except ValueError as e:
            logger.warning(f"認証エラー: {login_id} - {e}")
            raise e
        except Exception as e:
            logger.error(f"ログイン処理エラー: {login_id} - {e}")
            raise ValueError("ログイン処理中にエラーが発生しました")

auth_service = AuthService(BrowserManager())
