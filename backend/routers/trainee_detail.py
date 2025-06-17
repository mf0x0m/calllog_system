# routers/trainee_detail.py

import logging
from fastapi import APIRouter, Depends
from utils.error_handler import handle_api_errors
from schemas.trainee_detail_schema import TraineeDetailRequest, TraineeDetailResponse
from service.trainee_detail_service import scrape_trainee_detail_handler

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/trainee",
    tags=["trainee"]
)

@router.post(
    "/detail/{application_id}",
    response_model=list[TraineeDetailResponse],
    summary="受講者情報取得",
    description="研修IDに基づいて、受講者一覧情報を取得する"
)
@handle_api_errors
async def get_trainee_detail(
    application_id: str,
    request: TraineeDetailRequest
):
    return await scrape_trainee_detail_handler(application_id, request.login_id, request.password)
