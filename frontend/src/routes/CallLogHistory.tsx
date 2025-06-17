import { useEffect, useState } from "react";
import { ENDPOINTS } from "@/api/endpoints";

interface CallLogRecord {
  受電日時: string;
  開始時間: string;
  完了時間: string;
  オペレーター名: string;
  回線種別: string;
  問合せ種別: string;
  所在地: string;
  関連項目: string;
  研修名: string;
  研修日: string;
  Web連携ID: string;
  受講者名: string;
  電話番号: string;
  メールアドレス: string;
  問合せ内容: string;
  対応内容: string;
  二次対応時間?: string;
  完了状況: string;
}

export default function CallLogHistory() {
  const [data, setData] = useState<CallLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const columnOrder = [
    "受電日時",
    "開始時間",
    "完了時間", 
    "オペレーター名",
    "回線種別",
    "問合せ種別",
    "所在地",
    "関連項目",
    "研修名",
    "研修日",
    "Web連携ID",
    "受講者名",
    "電話番号",
    "メールアドレス",
    "問合せ内容",
    "対応内容",
    "二次対応時間",
    "完了状況"
  ];

  const fixedWidths: Record<string, string> = {
    受電日時: "w-[140px]",
    開始時間: "w-[80px]",
    完了時間: "w-[80px]",
    オペレーター名: "w-[100px]",
    回線種別: "w-[100px]",
    問合せ種別: "w-[80px]",
    所在地: "w-[100px]",
    関連項目: "w-[120px]",
    研修名: "w-[180px]",
    研修日: "w-[90px]",
    Web連携ID: "w-[90px]",
    受講者名: "w-[100px]",
    電話番号: "w-[120px]",
    メールアドレス: "w-[150px]",
    問合せ内容: "w-[200px]",
    対応内容: "w-[200px]",
    二次対応時間: "w-[100px]",
    完了状況: "w-[100px]",
  };

  const fetchCallLogs = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(ENDPOINTS.callLog.list);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
      console.error('Call log fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCallLogs();
    // 自動更新は削除 - 手動更新またはページアクセス時のみマージ
  }, []);

  // フィルタリング処理
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize("NFKC")
      .replace(/[\u3041-\u3096]/g, (s) =>
        String.fromCharCode(s.charCodeAt(0) + 0x60)
      );

  const filteredData = data.filter((row) =>
    Object.entries(filters).every(([key, value]) =>
      normalize(row[key as keyof CallLogRecord] || "").includes(normalize(value))
    )
  );

  return (
    <div className="p-4 space-y-4">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📞 受電履歴</h1>
          <p className="text-sm text-gray-500 mt-1">
            コールセンターの受電履歴一覧（アクセス時・更新時にリアルタイムマージ）
          </p>
        </div>
        <div className="text-right">
          <button
            onClick={fetchCallLogs}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 mr-3"
          >
            🔄 更新
          </button>
          {lastUpdated && (
            <div className="text-xs text-gray-500">
              最終更新: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* 統計情報 */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{data.length}</div>
            <div className="text-sm text-gray-600">総受電件数</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {new Set(data.map(r => r.オペレーター名)).size}
            </div>
            <div className="text-sm text-gray-600">対応オペレーター数</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {filteredData.length}
            </div>
            <div className="text-sm text-gray-600">表示件数</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {data.filter(r => r.受電日時.startsWith(new Date().toISOString().split('T')[0])).length}
            </div>
            <div className="text-sm text-gray-600">本日の受電件数</div>
          </div>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
          ❌ {error}
        </div>
      )}

      {/* ローディング */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">データを取得中...</span>
        </div>
      )}

      {/* テーブル */}
      {!loading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-auto max-h-[70vh]">
            <table className="w-full table-fixed text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  {columnOrder.map((key, idx) => (
                    <th
                      key={idx}
                      className={`px-2 py-3 text-left border font-semibold text-gray-700 ${
                        fixedWidths[key] || "min-w-[150px]"
                      }`}
                    >
                      <div className="flex flex-col space-y-1">
                        <span>{key}</span>
                        <input
                          type="text"
                          placeholder="検索..."
                          className="text-xs border rounded px-2 py-1 bg-white"
                          value={filters[key] || ""}
                          onChange={(e) =>
                            setFilters((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, i) => (
                  <tr
                    key={i}
                    className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition-colors"
                  >
                    {columnOrder.map((key, j) => (
                      <td
                        key={j}
                        className={`px-2 py-2 border border-gray-200 ${fixedWidths[key] || "break-words"}`}
                        title={row[key as keyof CallLogRecord]}
                      >
                        <div className="truncate">
                          {key === "受電日時" ? (
                            <span className="font-mono text-xs">
                              {row[key as keyof CallLogRecord]}
                            </span>
                          ) : key === "開始時間" || key === "完了時間" || key === "二次対応時間" ? (
                            <span className="font-mono text-xs bg-blue-50 px-1 py-0.5 rounded">
                              {row[key as keyof CallLogRecord] || '-'}
                            </span>
                          ) : key === "完了状況" ? (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              row[key as keyof CallLogRecord] === '完了' ? 'bg-green-100 text-green-800' :
                              row[key as keyof CallLogRecord] === '保留' ? 'bg-yellow-100 text-yellow-800' :
                              row[key as keyof CallLogRecord] === 'エスカレーション' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {row[key as keyof CallLogRecord]}
                            </span>
                          ) : key === "回線種別" ? (
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              row[key as keyof CallLogRecord] === '直通' ? 'bg-blue-100 text-blue-800' :
                              row[key as keyof CallLogRecord] === 'フリーダイアル' ? 'bg-green-100 text-green-800' :
                              row[key as keyof CallLogRecord] === '九州' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {row[key as keyof CallLogRecord]}
                            </span>
                          ) : key === "問合せ種別" ? (
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              row[key as keyof CallLogRecord] === '一般' ? 'bg-gray-100 text-gray-800' :
                              row[key as keyof CallLogRecord] === '案件' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {row[key as keyof CallLogRecord]}
                            </span>
                          ) : key === "電話番号" ? (
                            <span className="font-mono text-xs">
                              {row[key as keyof CallLogRecord]}
                            </span>
                          ) : key === "メールアドレス" ? (
                            <span className="text-xs text-blue-600 underline">
                              {row[key as keyof CallLogRecord]}
                            </span>
                          ) : key === "問合せ内容" || key === "対応内容" ? (
                            <div className="text-xs leading-relaxed max-h-20 overflow-y-auto">
                              {row[key as keyof CallLogRecord]}
                            </div>
                          ) : (
                            row[key as keyof CallLogRecord]
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredData.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              📭 表示するデータがありません
            </div>
          )}
        </div>
      )}
    </div>
  );
}