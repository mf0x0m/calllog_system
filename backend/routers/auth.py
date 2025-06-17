from fastapi import APIRouter, Depends
import logging
from schemas.auth_schema import LoginRequest, LoginResponse
from service.auth_service import auth_service
from service.staff_map import get_staff_map
from utils.error_handler import handle_api_errors

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

@router.post(
    "/login",
    response_model=LoginResponse,
    summary="ログイン認証",
    description="ユーザーIDとパスワードを用いてログインを試行します。"
)
@handle_api_errors
async def login(
    data: LoginRequest,
    staff_map: dict = Depends(get_staff_map)
):
    return await auth_service.handle_login(data, staff_map)
