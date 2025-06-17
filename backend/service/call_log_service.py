import csv
import os
import glob
import fcntl
from pathlib import Path
from datetime import datetime
import logging
import asyncio
import threading
from schemas.call_log_schema import CallLogRequest, CallLogResponse
from config.settings import settings

logger = logging.getLogger(__name__)

class CallLogService:
    def __init__(self):
        self.data_dir = settings.BASE_DIR / "data" / "call_logs"
        self.merged_file_path = self.data_dir / "merged_call_logs.csv"
        self._ensure_directories_exist()
        # マージ処理の排他制御用ロック
        self._merge_lock = threading.Lock()
        # ファイル書き込み用ロック（オペレーター別）
        self._write_locks = {}
    
    def _ensure_directories_exist(self):
        """ディレクトリが存在しない場合は作成"""
        self.data_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Call log directory ensured: {self.data_dir}")
    
    def _get_operator_file_path(self, operator_name: str) -> Path:
        """オペレーター別ファイルパスを取得"""
        # ファイル名に使えない文字を置換
        safe_name = "".join(c for c in operator_name if c.isalnum() or c in (' ', '-', '_')).rstrip()
        safe_name = safe_name.replace(' ', '_')
        return self.data_dir / f"operator_{safe_name}.csv"
    
    def _get_write_lock(self, operator_name: str) -> threading.Lock:
        """オペレーター別書き込みロックを取得"""
        if operator_name not in self._write_locks:
            self._write_locks[operator_name] = threading.Lock()
        return self._write_locks[operator_name]
    
    def _ensure_operator_file_exists(self, file_path: Path):
        """オペレーター別CSVファイルが存在しない場合は作成"""
        if not file_path.exists():
            headers = [
                '受電日時', '開始時間', '完了時間', 'オペレーター名', 
                '回線種別', '問合せ種別', '所在地', '関連項目',
                '研修名', '研修日', 'Web連携ID', 
                '受講者名', '電話番号', 'メールアドレス',
                '問合せ内容', '対応内容', '二次対応時間', '完了状況'
            ]
            
            with open(file_path, 'w', newline='', encoding='cp932') as f:
                writer = csv.writer(f)
                writer.writerow(headers)
            
            logger.info(f"Operator call log file created: {file_path}")
    
    async def _merge_all_files(self):
        """全オペレーターファイルをマージ（排他制御付き）"""
        # マージ処理の排他制御
        if not self._merge_lock.acquire(blocking=False):
            logger.info("Merge already in progress, skipping duplicate merge request")
            return
        
        try:
            logger.info("Starting file merge with exclusive lock")
            all_rows = []
            headers = [
                '受電日時', '開始時間', '完了時間', 'オペレーター名', 
                '回線種別', '問合せ種別', '所在地', '関連項目',
                '研修名', '研修日', 'Web連携ID', 
                '受講者名', '電話番号', 'メールアドレス',
                '問合せ内容', '対応内容', '二次対応時間', '完了状況'
            ]
            
            # 全オペレーターファイルを読み込み（ファイルロック付き）
            operator_files = glob.glob(str(self.data_dir / "operator_*.csv"))
            
            for file_path in operator_files:
                try:
                    with open(file_path, 'r', encoding='cp932') as f:
                        # ファイルロックで読み込み保護
                        try:
                            fcntl.flock(f.fileno(), fcntl.LOCK_SH | fcntl.LOCK_NB)  # 共有ロック（非ブロッキング）
                            reader = csv.reader(f)
                            rows = list(reader)
                            if len(rows) > 1:  # ヘッダー以外の行がある場合
                                all_rows.extend(rows[1:])  # ヘッダーを除いて追加
                        except (OSError, IOError) as lock_error:
                            logger.warning(f"File {file_path} is locked, skipping: {lock_error}")
                            continue
                        finally:
                            try:
                                fcntl.flock(f.fileno(), fcntl.LOCK_UN)  # ロック解除
                            except:
                                pass
                                
                except Exception as e:
                    logger.warning(f"Failed to read operator file {file_path}: {e}")
            
            # 受電日時でソート
            all_rows.sort(key=lambda x: x[0] if x else '')
            
            # マージファイルに書き出し（ファイルロック付き）
            temp_file = self.merged_file_path.with_suffix('.tmp')
            try:
                with open(temp_file, 'w', newline='', encoding='cp932') as f:
                    fcntl.flock(f.fileno(), fcntl.LOCK_EX)  # 排他ロック
                    writer = csv.writer(f)
                    writer.writerow(headers)
                    writer.writerows(all_rows)
                
                # 原子操作でファイル置換
                temp_file.replace(self.merged_file_path)
                logger.info(f"On-demand merge completed: {len(all_rows)} records from {len(operator_files)} operator files")
                
            except Exception as e:
                # エラー時は一時ファイルを削除
                if temp_file.exists():
                    temp_file.unlink()
                raise e
            
        except Exception as e:
            logger.error(f"Failed to merge files: {e}")
        finally:
            self._merge_lock.release()
            logger.debug("Merge lock released")
    
    async def save_call_log(self, call_log: CallLogRequest) -> CallLogResponse:
        """受電履歴をオペレーター別CSVに保存（排他制御付き）"""
        operator_name = call_log.オペレーター名
        write_lock = self._get_write_lock(operator_name)
        
        try:
            # 受電日時をフォーマット
            try:
                dt = datetime.fromisoformat(call_log.受電日時.replace('Z', '+00:00'))
                formatted_datetime = dt.strftime('%Y-%m-%d %H:%M:%S')
            except:
                formatted_datetime = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            # オペレーター別書き込みロック取得
            with write_lock:
                operator_file_path = self._get_operator_file_path(operator_name)
                self._ensure_operator_file_exists(operator_file_path)
                
                # オペレーター別CSVに追記（ファイルロック付き）
                with open(operator_file_path, 'a', newline='', encoding='cp932') as f:
                    fcntl.flock(f.fileno(), fcntl.LOCK_EX)  # 排他ロック
                    try:
                        writer = csv.writer(f)
                        writer.writerow([
                            formatted_datetime,
                            call_log.開始時間,
                            call_log.完了時間,
                            call_log.オペレーター名,
                            call_log.回線種別,
                            call_log.問合せ種別,
                            call_log.所在地,
                            call_log.関連項目,
                            call_log.研修名,
                            call_log.研修日,
                            call_log.Web連携ID,
                            call_log.受講者名,
                            call_log.電話番号,
                            call_log.メールアドレス,
                            call_log.問合せ内容,
                            call_log.対応内容,
                            call_log.二次対応時間 or '',
                            call_log.完了状況
                        ])
                        f.flush()  # バッファをフラッシュ
                        os.fsync(f.fileno())  # OSレベルで確実に書き込み
                    finally:
                        fcntl.flock(f.fileno(), fcntl.LOCK_UN)  # ロック解除
            
            logger.info(f"Call log saved: {call_log.オペレーター名} - {call_log.Web連携ID} - {call_log.受講者名}")
            
            return CallLogResponse(
                success=True,
                message="受電履歴を保存しました"
            )
            
        except Exception as e:
            logger.error(f"Failed to save call log: {e}")
            return CallLogResponse(
                success=False,
                message=f"保存に失敗しました: {str(e)}"
            )
    
    async def get_merged_call_logs(self) -> list:
        """オンデマンドでマージしてから受電履歴を取得"""
        try:
            # リクエスト時にマージを実行
            await self._merge_all_files()
            
            if not self.merged_file_path.exists():
                logger.warning("Merged file does not exist after merge attempt")
                return []
            
            with open(self.merged_file_path, 'r', encoding='cp932') as f:
                reader = csv.DictReader(f)
                return list(reader)
                
        except Exception as e:
            logger.error(f"Failed to read merged call logs: {e}")
            return []

call_log_service = CallLogService()