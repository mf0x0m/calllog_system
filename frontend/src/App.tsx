import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
}
from "react-router-dom"
import type { JSX } from "react"
import LoginPage from "./routes/LoginPage"
import { LoginProvider, useLogin } from "./context/LoginContext"
import { ErrorBoundary } from "./components/ErrorBoundary"

import Topbar from "./components/Topbar"
import Home from "./routes/Home"
import TrainingSearch from "./routes/TrainingSearch"
import CallLogFormPage from "./routes/CallLogFormPage"
import CallLogHistory from "./routes/CallLogHistory"

// 💡 トップバー付きレイアウト
function LayoutWithTopbar({ children }: { children: React.ReactNode }) {
  const { user } = useLogin()
  const location = useLocation()
  const isLoginPage = location.pathname === "/"

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* 上部に固定されたトップバー（ログイン済＆ログインページでないとき） */}
      {user && !isLoginPage && (
        <div className="flex-shrink-0">
          <Topbar />
        </div>
      )}

      {/* メイン画面はトップバーの下に配置、スクロール可能 */}
      <div className="flex-1 overflow-auto">
        <div className={user && !isLoginPage ? "p-4" : ""}>
          {children}
        </div>
      </div>
    </div>
  )
}

// 🔐 認証が必要なページ
function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useLogin()
  return user ? children : <Navigate to="/" replace />
}

// 📦 全ルーティング
function AppRoutes() {
  const { user } = useLogin()

  return (
    <LayoutWithTopbar>
      <Routes>
        {/* ルートアクセス時：ログイン済なら /home にリダイレクト */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/home" replace />
            ) : (
              <LoginPage />
            )
          }
        />

        {/* 各ページに認証を要求 */}
        <Route
          path="/home"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="/trainingsearch"
          element={
            <RequireAuth>
              <TrainingSearch />
            </RequireAuth>
          }
        />
        <Route
          path="/calllog-history"
          element={
            <RequireAuth>
              <CallLogHistory />
            </RequireAuth>
          }
        />
        
        {/* 受電履歴入力フォーム（別ウィンドウ用、認証不要） */}
        <Route
          path="/calllog-form"
          element={<CallLogFormPage />}
        />
      </Routes>
    </LayoutWithTopbar>
  )
}

// 🔧 アプリ全体
export default function App() {
  return (
    <ErrorBoundary>
      <LoginProvider>
        <Router>
          <AppRoutes />
        </Router>
      </LoginProvider>
    </ErrorBoundary>
  )
}
