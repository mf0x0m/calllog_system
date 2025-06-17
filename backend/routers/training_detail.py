# /routes/training_detail.py

import logging
from fastapi import APIRouter
from utils.error_handler import handle_api_errors
from schemas.training_detail_schema import DetailRequest, DetailResponse
from service.training_detail_service import scrape_detail_page

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/training-detail",
    tags=["Training Detail"]
)

@router.post(
    "/{web_id}",
    response_model=DetailResponse,
    summary="研修詳細情報の取得",
    description="Web連携IDを元に、研修の基本情報と受講者一覧を取得します"
)
@handle_api_errors
async def get_training_detail(web_id: str, data: DetailRequest):
    logger.info(f"詳細情報取得リクエスト: web_id={web_id}, login_id={data.login_id}")
    result = await scrape_detail_page(web_id, data.login_id, data.password)
    logger.info(f"詳細情報取得成功: web_id={web_id}")
    return result
