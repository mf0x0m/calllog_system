from pydantic import BaseModel

class DetailRequest(BaseModel):
    login_id: str
    password: str

class Attendee(BaseModel):
    申込No: str
    申込方法: str
    取引ID: str
    決済種別: str
    受講状況: str
    お客様名: str
    部署名: str
    役職: str
    氏名: str
    受講票最終発行日: str
    ご質問とご要望: str
    申込日時: str
    カナ: str

class DetailResponse(BaseModel):
    基本情報: dict
    受講者一覧: list[Attendee]
