.PHONY: help build up down logs clean dev prod

help: ## このヘルプメッセージを表示
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: ## 開発環境のDockerイメージを段階的にビルド（推奨）
	@echo "Building frontend first..."
	docker-compose build frontend
	@echo "Building backend..."
	docker-compose build backend
	@echo "Build completed!"

build-parallel: ## 並行ビルド（リスクあり）
	docker-compose build

build-frontend: ## フロントエンドのみビルド
	docker-compose build frontend

build-backend: ## バックエンドのみビルド
	docker-compose build backend

up: ## 開発環境を起動
	docker-compose up -d

down: ## 開発環境を停止
	docker-compose down

logs: ## ログを表示
	docker-compose logs -f

clean: ## 停止してボリュームも削除
	docker-compose down -v

dev: build up ## 開発環境をビルドして起動

prod-build: ## 本番環境のDockerイメージをビルド
	docker-compose -f docker-compose.prod.yml build

prod-up: ## 本番環境を起動
	docker-compose -f docker-compose.prod.yml up -d

prod-down: ## 本番環境を停止
	docker-compose -f docker-compose.prod.yml down

prod: prod-build prod-up ## 本番環境をビルドして起動