export default function Settings() {
  const downloadButtons = [
    { id: 1, label: "印刷依頼.xlsx" },
    { id: 2, label: "印刷依頼（前日）.xlsx" },
    { id: 3, label: "設営リスト.xlsx" },
    { id: 4, label: "アンケートリスト.xlsx" },
    { id: 5, label: "名簿.zip" },
    { id: 6, label: "名簿リスト.xlsx" },
    { id: 7, label: "受付表.xlsx" },
    { id: 8, label: "カンバン.xlsx" },
    { id: 9, label: "研修管理報告書.xlsx" },
    { id: 10, label: "工事中" },
    { id: 11, label: "準備中" },
    { id: 12, label: "改装中" },
    ]

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">🏠 ホーム</h1>
      <p className="mb-6">ここはホーム画面のダミーです。</p>

      <div className="grid grid-cols-3 gap-4">
        {downloadButtons.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => handleDownload(id)}
            className="bg-blue-200 hover:bg-blue-300 text-gray-600 font-bold py-2 px-4 rounded shadow"
          >
            📥 {label}
          </button>
        ))}
      </div>
    </div>
  )
}

function handleDownload(id: number) {
  window.location.href = `http://localhost:8000/api/download/${id}`
}
