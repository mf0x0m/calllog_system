import json
import logging
from functools import lru_cache
from fastapi import Depends, HTTPException
from config.settings import settings

logger = logging.getLogger(__name__)

@lru_cache()
def get_staff_map() -> dict:
    try:
        with open(settings.STAFFMAP_PATH, encoding="utf-8") as f:
            data = json.load(f)
            logger.info(f"スタッフマップを読み込みました: {settings.STAFFMAP_PATH}")
            return data
    except FileNotFoundError:
        logger.error(f"スタッフマップファイルが見つかりません: {settings.STAFFMAP_PATH}")
        raise HTTPException(status_code=500, detail="スタッフマップファイルが存在しません")
    except json.JSONDecodeError:
        logger.error(f"スタッフマップファイルのJSON解析に失敗しました: {settings.STAFFMAP_PATH}")
        raise HTTPException(status_code=500, detail="スタッフマップの形式が不正です")
    except Exception as e:
        logger.exception(f"スタッフマップの読み込み中に予期しないエラーが発生しました: {e}")
        raise HTTPException(status_code=500, detail="スタッフマップの読み込みに失敗しました")