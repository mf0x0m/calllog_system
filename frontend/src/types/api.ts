export interface LoginRequest {
  id: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  fullName?: string;
  token?: string;
  error?: string;
}

export interface TrainingRecord {
  'Web連携ID': string;
  '開催日': string;
  '時間': string;
  '研修名': string;
  '会場名': string;
  'ROOM': string;
  '講師': string;
  'ふりがな': string;
  'ZoomID': string;
  'ZoomPW': string;
}

export interface TrainingDetailRequest {
  login_id: string;
  password: string;
}

export interface TrainingDetailResponse {
  基本情報: Record<string, string>;
  受講者一覧: Attendee[];
}

export interface Attendee {
  申込No: string;
  申込方法: string;
  取引ID: string;
  決済種別: string;
  受講状況: string;
  お客様名: string;
  部署名: string;
  役職: string;
  氏名: string;
  受講票最終発行日: string;
  'ご質問とご要望': string;
  申込日時: string;
  カナ: string;
}

export interface TraineeDetailRequest {
  login_id: string;
  password: string;
}

export interface TraineeDetailResponse {
  申込No: string;
  申込方法: string;
  取引ID: string;
  決済種別: string;
  受講状況: string;
  お客様名: string;
  部署名: string;
  役職: string;
  氏名: string;
  受講票最終発行日: string;
  'ご質問とご要望': string;
  申込日時: string;
  カナ: string;
}

export interface CallLogRequest {
  // 時刻系フィールド
  開始時間: string;
  完了時間: string;
  
  // 担当（オペレーター名）
  オペレーター名: string;
  
  // 選択系フィールド
  回線種別: string;
  問合せ種別: string;
  所在地: string;
  関連項目: string;
  
  // 研修情報
  研修名: string;
  研修日: string;
  Web連携ID: string;
  
  // 受講者情報
  受講者名: string;
  電話番号: string;
  メールアドレス: string;
  
  // 問合せ情報
  問合せ内容: string;
  対応内容: string;
  二次対応時間?: string;
  
  // 完了状況
  完了状況: string;
}

export interface CallLogResponse {
  success: boolean;
  message?: string;
}

export interface CallLogRecord {
  受電日時: string;
  開始時間: string;
  完了時間: string;
  オペレーター名: string;
  回線種別: string;
  問合せ種別: string;
  所在地: string;
  関連項目: string;
  研修名: string;
  研修日: string;
  Web連携ID: string;
  受講者名: string;
  電話番号: string;
  メールアドレス: string;
  問合せ内容: string;
  対応内容: string;
  二次対応時間?: string;
  完了状況: string;
}