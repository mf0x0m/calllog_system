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
    { to: "/home", label: "ホーム", color: "bg-pink-200", hoverColor: "hover:bg-pink-300" },
    { to: "/trainingsearch", label: "研修検索", color: "bg-yellow-200", hoverColor: "hover:bg-yellow-300" },
    { to: "/calllog-history", label: "📞 受電履歴", color: "bg-green-200", hoverColor: "hover:bg-green-300" },
  ]

  return (
    <div className="bg-gray-100 border-b border-gray-300 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        {/* ロゴ・タイトル */}
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-800">📞 CallLog System</h1>
        </div>

        {/* ナビゲーションリンク */}
        <div className="flex items-center space-x-2">
          {links.map((link) => {
            const isActive = location.pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`
                  px-4 py-2 rounded-md font-semibold text-sm text-gray-700 transition-all duration-200
                  ${isActive 
                    ? `${link.color} shadow-md transform scale-105` 
                    : `bg-white ${link.hoverColor} hover:shadow-md hover:transform hover:scale-105`
                  }
                `}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* ユーザー情報・ログアウト */}
        <div className="relative group font-bold text-xs text-gray-600 px-4 py-3 bg-white rounded shadow-sm">
          <span className="block">🔑 {user?.fullName} さん</span>
          <button
            onClick={handleLogout}
            className="absolute right-2 top-3 font-bold text-gray-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            🔒 Log out
          </button>
        </div>
      </div>
    </div>
  )
}
