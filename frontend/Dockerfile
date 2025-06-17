# frontend/Dockerfile
FROM node:18-alpine

# rootユーザーを明示的に設定
USER root
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# ファイルの所有権をrootに設定
RUN chown -R root:root /app

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
