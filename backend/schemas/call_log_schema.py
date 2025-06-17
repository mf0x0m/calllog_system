from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional

class CallLogRequest(BaseModel):
    # 時刻系フィールド
    開始時間: str  # 時計形式の時刻入力
    完了時間: str  # 時計形式の時刻入力
    
    # 担当（オペレーター名、表示不要）
    オペレーター名: str
    
    # 選択系フィールド
    回線種別: str  # 直通/フリーダイアル/九州
    問合せ種別: str  # 一般/案件
    所在地: str  # 北海道/青森県/岩手県/宮城県/秋田県/山形県/福島県/茨城県/栃木県/群馬県/埼玉県/千葉県/東京都/神奈川県/新潟県/富山県/石川県/福井県/山梨県/長野県/岐阜県/静岡県/愛知県/三重県/滋賀県/京都府/大阪府/兵庫県/奈良県/和歌山県/鳥取県/島根県/岡山県/広島県/山口県/徳島県/香川県/愛媛県/高知県/福岡県/佐賀県/長崎県/熊本県/大分県/宮崎県/鹿児島県/沖縄県
    関連項目: str  # 公開講座/eラーニング/講師派遣/動画百貨店/アセスメント/IT研修/その他
    
    # 研修情報
    研修名: str
    研修日: str  # 日付形式（研修の開催日）
    Web連携ID: str  # 6桁の数字、バリデーション必要
    
    # 受講者情報
    受講者名: str
    電話番号: str  # 電話番号形式のバリデーション
    メールアドレス: str  # メール形式のバリデーション
    
    # 問合せ情報
    問合せ内容: str
    対応内容: str
    二次対応時間: Optional[str] = None  # 時計形式、任意
    
    # 完了状況
    完了状況: str  # 完了/保留/エスカレーション
    
    # システム生成
    受電日時: str

    @validator('Web連携ID')
    def validate_web_id(cls, v):
        if not v.isdigit() or len(v) != 6:
            raise ValueError('Web連携IDは6桁の数字である必要があります')
        return v

    @validator('電話番号')
    def validate_phone(cls, v):
        # 電話番号の基本的なバリデーション（数字、ハイフン、括弧を許可）
        import re
        if not re.match(r'^[\d\-\(\)\+\s]+$', v):
            raise ValueError('有効な電話番号を入力してください')
        return v

    @validator('メールアドレス')
    def validate_email(cls, v):
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, v):
            raise ValueError('有効なメールアドレスを入力してください')
        return v

class CallLogResponse(BaseModel):
    success: bool
    message: str = ""