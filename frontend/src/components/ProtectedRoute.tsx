import { Navigate } from "react-router-dom"
import { useLogin } from "../context/LoginContext"
import type { JSX } from "react"

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useLogin()

  if (!user) {
    return <Navigate to="/" replace />
  }

  return children
}
