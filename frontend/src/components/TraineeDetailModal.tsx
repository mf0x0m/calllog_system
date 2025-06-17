import { Dialog } from "@headlessui/react"
import { useEffect, useState } from "react"
import { ENDPOINTS } from "@/api/endpoints"

interface Props {
  open: boolean
  onClose: () => void
  applicationId: string
  loginId: string
  password: string
}

interface TraineeDetail {
  [key: string]: string
}

export default function TraineeDetailModal({ open, onClose, applicationId, loginId, password }: Props) {
  const [data, setData] = useState<TraineeDetail[] | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchDetail = async () => {
      if (!applicationId || !loginId || !password) return

      setLoading(true)
      try {
        const res = await fetch(ENDPOINTS.traineeSearch.detail(applicationId), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ login_id: loginId, password }),
        })

        const json = await res.json()
        setData(json)
      } catch (e) {
        console.error("受講者詳細取得失敗", e)
      } finally {
        setLoading(false)
      }
    }

    if (open) {
      fetchDetail()
    }
  }, [open, applicationId, loginId, password])

  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 p-4 bg-black/30 overflow-auto">
      <Dialog.Panel className="bg-white p-6 rounded shadow max-w-xl mx-auto mt-20">
        <Dialog.Title className="text-lg font-bold mb-4">👤 受講者詳細</Dialog.Title>

        {loading ? (
          <p className="text-sm text-gray-500">読み込み中...</p>
        ) : data && data.length > 0 ? (
          <table className="w-full text-sm border border-gray-300">
            <tbody>
              {data.map((record, i) => (
                <>
                  <tr key={`header-${i}`}>
                    <td colSpan={2} className="bg-gray-200 font-semibold px-2 py-1 border">【{i + 1}人目】</td>
                  </tr>
                  {Object.entries(record).map(([key, value]) => (
                    <tr key={`${i}-${key}`} className="odd:bg-white even:bg-gray-50">
                      <th className="px-2 py-1 border text-left w-1/3 bg-gray-100 whitespace-nowrap">{key}</th>
                      <td className="px-2 py-1 border">
                        {key === "受講票リンク" || key === "受講証明書リンク" ? (
                          <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {key === "受講票リンク" ? "📄 受講票を表示" : "🎓 受講証明書を表示"}
                          </a>
                        ) : (
                          value || "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-500">データがありません。</p>
        )}

        <div className="text-right mt-4">
          <button className="px-4 py-2 bg-gray-700 text-white rounded" onClick={onClose}>閉じる</button>
        </div>
      </Dialog.Panel>
    </Dialog>
  )
}
