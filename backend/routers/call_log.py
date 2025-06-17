from fastapi import APIRouter
import logging
from schemas.call_log_schema import CallLogRequest, CallLogResponse
from service.call_log_service import call_log_service
from utils.error_handler import handle_api_errors

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/call-log",
    tags=["call-log"]
)

@router.post(
    "/save",
    response_model=CallLogResponse,
    summary="受電履歴保存",
    description="コールセンターの受電履歴をオペレーター別CSVファイルに保存します"
)
@handle_api_errors
async def save_call_log(call_log: CallLogRequest):
    logger.info(f"受電履歴保存リクエスト: {call_log.オペレーター名} - {call_log.Web連携ID} - {call_log.受講者名}")
    result = await call_log_service.save_call_log(call_log)
    logger.info(f"受電履歴保存結果: {result.success}")
    return result

@router.get(
    "/list",
    summary="受電履歴取得",
    description="マージされた受電履歴一覧を取得します"
)
@handle_api_errors
async def get_call_logs():
    logger.info("受電履歴取得リクエスト")
    result = await call_log_service.get_merged_call_logs()
    logger.info(f"受電履歴取得結果: {len(result)}件")
    return result