from pydantic_settings import BaseSettings
from pathlib import Path
from typing import List

class Settings(BaseSettings):
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]
    CORS_CREDENTIALS: bool = True
    
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    STAFFMAP_PATH: Path = BASE_DIR / "data" / "staffMap.json"
    
    WEBINSOURCE_BASE_URL: str = "https://secure.insource.co.jp/webinsource"
    COMPANY_CODE: str = "00000010"
    
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    @property
    def WEBINSOURCE_TOP_URL(self) -> str:
        return f"{self.WEBINSOURCE_BASE_URL}/top"
    
    @property
    def WEBINSOURCE_KENSHU_URL(self) -> str:
        return f"{self.WEBINSOURCE_BASE_URL}/kensyu/index"
    
    @property
    def WEBINSOURCE_MANAGE_URL(self) -> str:
        return f"{self.WEBINSOURCE_BASE_URL}/kensyu/manage"
    
    @property
    def WEBINSOURCE_TRAINEE_URL(self) -> str:
        return f"{self.WEBINSOURCE_BASE_URL}/jukousya/index"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
