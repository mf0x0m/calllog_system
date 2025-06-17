# CLAUDE.md
必ず日本語で回答してください。
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Docker Development (推奨)
- `make dev` または `docker-compose up` - 開発環境を起動
- `make logs` - ログを表示
- `make down` - 開発環境を停止
- `make clean` - コンテナとボリュームを削除

### 本番環境
- `make prod` または `docker-compose -f docker-compose.prod.yml up` - 本番環境を起動

### ローカル開発
- Frontend: `cd frontend && npm run dev` (port 5173)
- Backend: `cd backend && uvicorn main:app --reload` (port 8000)
- Frontend lint: `cd frontend && npm run lint`

### 環境設定
- Backend環境変数: `backend/.env` (`.env.example`を参考)
- フロントエンドAPI URL: `VITE_API_URL` 環境変数で設定

## Architecture Overview

This is a call log/training management system with a React frontend and FastAPI backend.

### Backend Structure (リファクタリング済み)
- **FastAPI** web framework with modular router architecture
- **Playwright** for web scraping WebInsource training management system
- **統一されたエラーハンドリング**: `utils/error_handler.py`でデコレーター使用
- **設定管理**: `config/settings.py`で環境変数対応
- **ログ管理**: `utils/logging_config.py`で統一設定
- **Core Services**:
  - `auth_service.py` - AuthServiceクラスで認証処理
  - `browser_manager.py` - Playwrightブラウザー管理（コンテキストマネージャー）
  - `training_detail_service.py` - 研修詳細取得
  - `trainee_detail_service.py` - 受講者情報取得
  - `staff_map.py` - スタッフマッピング
- **Routers**: `/api`プレフィックス、統一エラーハンドリング適用
- **ヘルスチェック**: `/health`エンドポイント

### Frontend Structure (リファクタリング済み)
- **React 19** with TypeScript and React Router
- **セキュリティ強化**: パスワード保存廃止、トークンベース認証
- **エラーバウンダリー**: `ErrorBoundary`コンポーネント
- **カスタムフック**: `useApi`でAPI呼び出し統一
- **型安全性**: `types/api.ts`で全API型定義
- **認証コンテキスト**: 改善された`LoginContext.tsx`
- **Layout**: Fixed sidebar navigation with main content area
- **Key Components**:
  - `ErrorBoundary.tsx` - エラー境界コンポーネント
  - `TrainingDetailModal.tsx` - 研修詳細モーダル
  - `TraineeDetailModal.tsx` - 受講者情報モーダル
  - `Sidebar.tsx` - ナビゲーションサイドバー

### Docker Configuration
- **開発環境**: `docker-compose.yml` - ホットリロード対応
- **本番環境**: `docker-compose.prod.yml` - マルチステージビルド、Nginx使用
- **セキュリティ**: 非rootユーザー実行、最小限の権限
- **ヘルスチェック**: 自動回復機能
- **Makefile**: 開発・本番環境の簡単切り替え

### Key Integration Points
- Frontend calls backend APIs (`/api/*`) for authentication and data retrieval
- Backend uses Playwright to scrape WebInsource system (secure.insource.co.jp)
- Staff mapping data stored in `backend/data/staffMap.json`
- CORS configured for cross-origin requests between frontend/backend
- トークンベース認証でセキュリティ強化

### WebInsource Integration
The system integrates with WebInsource training management platform:
- Company code: "00000010"
- Base URL: https://secure.insource.co.jp/webinsource
- Endpoints: `/top`, `/kensyu/index`, `/kensyu/manage`, `/jukousya/index`

### Call Log System Features
- **オペレーター別ファイル保存**: 同時書き込み競合を回避
- **オンデマンドマージ**: `/calllog-history`アクセス時・更新ボタン押下時のみマージ実行
- **受電履歴管理**: リアルタイムフィルタリング、統計表示機能
- **別ウィンドウ入力**: 研修情報自動補完、オペレーター名自動設定

### Security Improvements (リファクタリング後)
- パスワードの平文保存を廃止
- トークンベース認証の実装
- 環境変数による設定管理
- Dockerセキュリティ強化（非rootユーザー）
- 統一されたエラーハンドリング
- CORS設定の環境別管理