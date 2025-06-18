import { useEffect, useState } from "react"
import TrainingDetailModal from "@/components/TrainingDetailModal"
import { useLogin } from "@/context/LoginContext"
import { ENDPOINTS } from "@/api/endpoints"

interface TrainingRecord {
  [key: string]: string
}

interface DetailContent {
  基本情報?: Record<string, string>
  受講者一覧?: Record<string, unknown>[]
}

export default function TrainingSearch() {
  const [data, setData] = useState<TrainingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState("")
  const [freewordFilter, setFreewordFilter] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState<DetailContent | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const { user } = useLogin()

  const columnOrder = [
    "受電履歴",
    "Web連携ID",
    "開催日",
    "時間",
    "研修名",
    "会場名",
    "ROOM",
    "講師",
    "ふりがな",
    "ZoomID",
    "ZoomPW"
  ]

  const fixedWidths: Record<string, string> = {
    受電履歴: "w-[80px]",
    Web連携ID: "w-[90px]",
    開催日: "w-[85px]",
    時間: "w-[105px]",
    会場名: "w-[115px]",
    ROOM: "w-[60px]",
    講師: "w-[95px]",
    ふりがな: "w-[120px]",
    ZoomID: "w-[115px]",
    ZoomPW: "w-[100px]",
  }

  useEffect(() => {
    const fetchCSV = async () => {
      try {
        const response = await fetch(ENDPOINTS.trainingSearch.csv)
        const json = await response.json()
        
        // 配列でない場合は空配列をセット
        if (Array.isArray(json)) {
          setData(json)
        } else {
          console.error("API response is not an array:", json)
          setData([])
        }
      } catch (err) {
        console.error("取得失敗:", err)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchCSV()
  }, [])

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize("NFKC")
      .replace(/[\u3041-\u3096]/g, (s) =>
        String.fromCharCode(s.charCodeAt(0) + 0x60)
      )

  const filteredData = Array.isArray(data) ? data.filter((row) => {
    // 日付フィルター (YYYY-MM-DD形式で完全一致または部分一致)
    const dateMatch = !dateFilter || 
      (row["開催日"] || "").replace(/\//g, '-').includes(dateFilter) ||
      (row["開催日"] || "").includes(dateFilter.replace(/-/g, '/'))
    
    // フリーワードフィルター（全列対象）
    const freewordMatch = !freewordFilter || 
      Object.values(row).some(value => 
        normalize(value || "").includes(normalize(freewordFilter))
      )
    
    return dateMatch && freewordMatch
  }) : []

  const handleDoubleClick = async (record: TrainingRecord) => {
    if (loadingDetail) return

    const webId = record["Web連携ID"]
    if (!webId || !user) return

    setLoadingDetail(true)
    setElapsed(0)
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000)

    try {
      const res = await fetch(ENDPOINTS.trainingSearch.detail(webId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login_id: user.id,
          password: user.password!,
        }),
      })
      const detail = await res.json()
      setModalContent(detail)
      setModalOpen(true)
    } catch (e) {
      console.error("詳細取得失敗", e)
    } finally {
      clearInterval(timer)
      setLoadingDetail(false)
    }
  }

  const handleCallLogClick = (record: TrainingRecord) => {
    const params = new URLSearchParams({
      研修名: record['研修名'] || '',
      開催日: record['開催日'] || '',
      Web連携ID: record['Web連携ID'] || '',
      オペレーター名: user?.fullName || ''
    });
    
    const url = `/calllog-form?${params.toString()}`;
    window.open(url, '_blank', 'width=800,height=700,scrollbars=yes,resizable=yes');
  }


  return (
    <div className="relative">
      {loadingDetail && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-sm font-semibold mb-1">詳細を取得中...</p>
            <p className="text-xs text-gray-500">{elapsed} 秒経過</p>
          </div>
        </div>
      )}

      {/* 検索フィルター */}
      <div className="bg-gray-50 p-3 border-b flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <input
            type="date"
            className="px-3 py-1 text-sm border rounded-md w-36"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            title="開催日で絞り込み"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter("")}
              className="text-gray-400 hover:text-gray-600 text-sm"
              title="日付フィルターをクリア"
            >
              ✕
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="px-3 py-1 text-sm border rounded-md w-60"
            placeholder="🔍 研修名、講師名、会場名などで検索..."
            value={freewordFilter}
            onChange={(e) => setFreewordFilter(e.target.value)}
          />
          {freewordFilter && (
            <button
              onClick={() => setFreewordFilter("")}
              className="text-gray-400 hover:text-gray-600 text-sm"
              title="検索をクリア"
            >
              ✕
            </button>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {filteredData.length} 件表示
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full table-fixed text-sm">
          <thead className="bg-gray-100">
            <tr>
              {columnOrder.map((key, idx) => (
                <th
                  key={idx}
                  className={`px-2 py-2 border whitespace-nowrap font-medium text-gray-700 ${fixedWidths[key] || ""}`}
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, i) => (
              <tr
                key={i}
                className={`cursor-pointer ${
                  loadingDetail ? "pointer-events-none opacity-50" : ""
                } odd:bg-white even:bg-gray-50 hover:bg-blue-100`}
                onDoubleClick={() => handleDoubleClick(row)}
              >
                {columnOrder.map((key, j) => (
                  <td
                    key={j}
                    className={`px-2 py-1 border ${fixedWidths[key] || "break-words"}`}
                  >
                    {key === "受電履歴" ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCallLogClick(row)
                        }}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 disabled:opacity-50"
                        disabled={loadingDetail}
                      >
                        📞入力
                      </button>
                    ) : (
                      row[key]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && modalContent && (
        <TrainingDetailModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          content={modalContent}
        />
      )}
    </div>
  )
}
