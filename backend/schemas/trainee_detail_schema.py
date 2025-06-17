# schemas/trainee_detail_schema.py

from pydantic import BaseModel, Field
from typing import Optional

class TraineeDetailRequest(BaseModel):
    login_id: str
    password: str

class TraineeDetailResponse(BaseModel):
    customer: str = Field(..., alias="お客様名")
    application: str = Field(..., alias="申込情報")
    status: str = Field(..., alias="受講状況")
    trainee: str = Field(..., alias="受講者情報")
    product: str = Field(..., alias="商品情報")
    entry_link: Optional[str] = Field(None, alias="受講票リンク")
    cert_link: Optional[str] = Field(None, alias="受講証明書リンク")
    payment: str = Field(..., alias="支払情報")
    # control: str = Field(..., alias="編集・詳細・キャンセル")
    condition: str = Field(..., alias="研修状況")

    class Config:
        validate_by_name = True
        populate_by_name = True
