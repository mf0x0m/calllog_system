import { useNavigate, Link, useLocation } from "react-router-dom"
import { useLogin } from "../context/LoginContext"

export default function Topbar() {
  const { user, logout } = useLogin()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const links = [
    { to: "/home", label: "ホーム", bgColor: "bg-pink-400", borderColor: "border-pink-500", textColor: "text-white" },
    { to: "/trainingsearch", label: "研修検索", bgColor: "bg-yellow-400", borderColor: "border-yellow-500", textColor: "text-gray-800" },
    { to: "/calllog-history", label: "📞 受電履歴", bgColor: "bg-green-400", borderColor: "border-green-500", textColor: "text-white" },
  ]

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex items-stretch justify-between px-4 h-8">
        {/* ナビゲーションリンク - 左寄せ */}
        <div className="flex items-stretch">
          {links.map((link) => {
            const isActive = location.pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`
                  flex items-center px-4 font-medium text-sm transition-colors duration-200 border-b-2 
                  ${isActive 
                    ? `${link.bgColor} ${link.borderColor} ${link.textColor} font-semibold` 
                    : `border-transparent text-gray-700 hover:border-gray-300 hover:bg-gray-50`
                  }
                `}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* ユーザー情報・ログアウト */}
        <div className="relative group flex items-center font-medium text-xs text-gray-600 px-3 bg-gray-50">
          <span>🔑 {user?.fullName}</span>
          <button
            onClick={handleLogout}
            className="ml-3 font-medium text-gray-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            🔒 Log out
          </button>
        </div>
      </div>
    </div>
  )
}
