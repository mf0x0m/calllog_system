import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': [
          // Noto Sans JPを最優先にしたフォントスタック
          '"Noto Sans JP"',           // Google Fonts - 美しい日本語フォント
          '"Yu Gothic UI"',           // Windows 10/11の游ゴシック UI
          '"Yu Gothic"',              // Windows 8.1以降の游ゴシック
          '"游ゴシック"',              // 日本語名での游ゴシック
          '"Hiragino Kaku Gothic ProN"', // macOS標準
          '"Hiragino Sans"',          // macOS新標準
          'Meiryo',                   // Windows Vista以降のメイリオ
          '"Segoe UI"',               // Windows UI標準（英数字用）
          'system-ui',                // システムデフォルト
          'sans-serif'                // 最終フォールバック
        ],
        'mono': [
          // コード表示用の等幅フォント
          '"Cascadia Code"',          // Windows Terminal標準
          '"Consolas"',               // Visual Studio標準
          '"SF Mono"',                // macOS標準（互換性）
          'Monaco',                   // 古いmacOS
          '"Liberation Mono"',        // Linux標準
          '"Courier New"',            // クロスプラットフォーム
          'monospace'                 // フォールバック
        ]
      }
    },
  },
  plugins: [],
}
export default config
