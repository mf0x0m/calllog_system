from fastapi import HTTPException, status
from functools import wraps
import logging

logger = logging.getLogger(__name__)

def handle_api_errors(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except ValueError as ve:
            logger.warning(f"Validation error in {func.__name__}: {ve}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=str(ve)
            )
        except TimeoutError as te:
            logger.warning(f"Timeout error in {func.__name__}: {te}")
            raise HTTPException(
                status_code=status.HTTP_408_REQUEST_TIMEOUT,
                detail="処理がタイムアウトしました"
            )
        except ConnectionError as ce:
            logger.error(f"Connection error in {func.__name__}: {ce}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="外部サービスとの接続に失敗しました"
            )
        except Exception as e:
            logger.exception(f"Internal error in {func.__name__}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="内部サーバーエラー"
            )
    return wrapper