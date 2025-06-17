import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
import type { LoginRequest, LoginResponse } from "../types/api"
import { ENDPOINTS } from "../api/endpoints"

interface UserInfo {
  id: string
  fullName: string
  name: string
  password: string // セッション中のみ保持、ページリロードで失われる
}

interface AuthState {
  user: UserInfo | null
  isAuthenticated: boolean
  sessionToken?: string
}

interface AuthContextType {
  auth: AuthState
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  user: UserInfo | null
}

const LoginContext = createContext<AuthContextType>({
  auth: { user: null, isAuthenticated: false },
  login: async () => {},
  logout: () => {},
  user: null,
})

export function LoginProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  })

  useEffect(() => {
    // ページリロード時は必ずログアウト状態にする
    // セキュリティ向上とコードの簡素化のため
    localStorage.removeItem('sessionToken')
    localStorage.removeItem('userData')
    setAuth({ user: null, isAuthenticated: false })
  }, [])

  const login = async (credentials: LoginRequest) => {
    const response = await fetch(ENDPOINTS.auth.login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
    
    if (!response.ok) {
      let errorMessage = 'ログインに失敗しました'
      try {
        const errorData = await response.json()
        errorMessage = errorData.detail || errorData.error || errorMessage
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`
      }
      throw new Error(errorMessage)
    }

    const data: LoginResponse = await response.json()
    
    if (data.success && data.fullName) {
      const user: UserInfo = { 
        id: credentials.id, 
        fullName: data.fullName, 
        name: data.fullName.split(' ')[0],
        password: credentials.password // セッション中のみメモリに保持
      }
      
      const newAuth = { 
        user, 
        isAuthenticated: true, 
        sessionToken: data.token || 'temp-token'
      }
      
      setAuth(newAuth)
      // localStorage保存は不要（ページリロード時は必ずログアウト）
    }
  }

  const logout = () => {
    setAuth({ user: null, isAuthenticated: false })
    // localStorage保存していないので削除処理も不要
  }

  return (
    <LoginContext.Provider value={{ 
      auth, 
      login, 
      logout, 
      user: auth.user 
    }}>
      {children}
    </LoginContext.Provider>
  )
}

export function useLogin() {
  return useContext(LoginContext)
}
