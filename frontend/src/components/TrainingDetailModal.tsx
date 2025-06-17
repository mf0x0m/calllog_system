import { Dialog } from "@headlessui/react"
import { useState } from "react"
import TraineeDetailModal from "@/components/TraineeDetailModal"
import { useLogin } from "@/context/LoginContext"

interface DetailContent {
  基本情報?: Record<string, string>
  受講者一覧?: Record<string, unknown>[]
}

interface Props {
  open: boolean
  onClose: () => void
  content: DetailContent
}

export default function TrainingDetailModal({ open, onClose, content }: Props) {
  const [selectedTraineeId, setSelectedTraineeId] = useState<string | null>(null)
  const { user } = useLogin()

  const allKeys = Array.from(
    new Set(content.受講者一覧?.flatMap((r) => Object.keys(r)) || [])
  )

  const handleRowClick = (trainee: Record<string, unknown>) => {
    const id = trainee["申込No"]
    if (typeof id === "string") {
      setSelectedTraineeId(id)
    }
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 p-4 bg-black/30 overflow-auto">
        <Dialog.Panel className="bg-white p-6 rounded shadow max-w-5xl mx-auto mt-20">
          <Dialog.Title className="text-lg font-bold mb-4">📄 研修詳細</Dialog.Title>

          {content.基本情報 && (
            <div className="mb-6">
              <h2 className="text-md font-semibold mb-2">基本情報</h2>
              <table className="w-full text-sm border border-gray-300">
                <tbody>
                  {Object.entries(content.基本情報).map(([key, value]) => (
                    <tr key={key} className="odd:bg-white even:bg-gray-50">
                      <th className="px-2 py-1 border font-medium text-left w-1/4 bg-gray-100 whitespace-nowrap">{key}</th>
                      <td className="px-2 py-1 border">{value || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {Array.isArray(content.受講者一覧) && content.受講者一覧.length > 0 ? (
            <div className="overflow-auto max-h-[50vh]">
              <h2 className="text-md font-semibold mb-2">受講者一覧</h2>
              <table className="min-w-full text-sm border border-gray-300">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    {allKeys.map((key) => (
                      <th key={key} className="px-2 py-1 border text-left whitespace-nowrap">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {content.受講者一覧.map((row, i) => (
                    <tr
                      key={i}
                      className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 cursor-pointer"
                      onDoubleClick={() => handleRowClick(row)}
                    >
                      {allKeys.map((key, j) => {
                        const value = row[key]
                        return (
                          <td key={j} className="px-2 py-1 border whitespace-nowrap">
                            {key === "申込方法" && typeof value === "string" && value.endsWith(".gif") ? (
                              <img
                                src={`https://secure.insource.co.jp/webinsource/img/${value}`}
                                alt={value}
                                className="h-4 inline-block"
                              />
                            ) : (
                              typeof value === "string" && value.trim() ? value : "—"
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">受講者情報がありません。</p>
          )}

          <div className="text-right mt-4">
            <button
              className="px-4 py-2 bg-gray-700 text-white rounded"
              onClick={onClose}
            >
              閉じる
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>

      {selectedTraineeId && user && (
        <TraineeDetailModal
          open={true}
          onClose={() => setSelectedTraineeId(null)}
          applicationId={selectedTraineeId}
          loginId={user.id}
          password={user.password!}
        />
      )}
    </>
  )
}
