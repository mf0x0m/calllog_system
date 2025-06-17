# routers/training_search.py

import logging
from datetime import datetime
from pathlib import Path
import csv
from fastapi import APIRouter
from utils.error_handler import handle_api_errors

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/training-search",
    tags=["Training Search"]
)

@router.get(
    "/csv",
    summary="研修CSV取得",
    description="当日マージされたWEBinsourceの研修CSVを取得します。コードが短く、再利用もしないためservice分割なし"
)
@handle_api_errors
async def get_training_csv():
    today_str = datetime.now().strftime("%y%m%d")
    file_path = Path(__file__).resolve().parent.parent / "downloads" / f"{today_str}_webinsource_merged.csv"

    if not file_path.exists():
        logger.warning(f"当日のCSVファイルが存在しません: {file_path}")
        return []  # 空配列を返す

    try:
        with open(file_path, encoding="cp932") as f:
            reader = csv.DictReader(f)
            data = list(reader)
            
            # 受電履歴列を追加（フロントエンドで使用）
            for row in data:
                row["受電履歴"] = ""  # 空文字列、フロントエンドでボタンとして表示
            
            logger.info(f"CSV data loaded: {len(data)} records from {file_path.name}")
            return data
    except Exception as e:
        logger.error(f"CSV読み込みエラー: {e}")
        return []
