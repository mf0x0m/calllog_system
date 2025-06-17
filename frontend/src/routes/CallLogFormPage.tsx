import { useState, useEffect } from "react";
import { ENDPOINTS } from "@/api/endpoints";
import type { CallLogRequest } from "@/types/api";
import TimePicker from "@/components/TimePicker";
import DropdownSelect, { dropdownOptions } from "@/components/DropdownSelect";
import DatePicker from "@/components/DatePicker";
import ValidatedInput from "@/components/ValidatedInput";

export default function CallLogFormPage() {
  const [formData, setFormData] = useState<CallLogRequest>({
    開始時間: '',
    完了時間: '',
    オペレーター名: '',
    回線種別: '',
    問合せ種別: '',
    所在地: '',
    関連項目: '',
    研修名: '',
    研修日: '',
    Web連携ID: '',
    受講者名: '',
    電話番号: '',
    メールアドレス: '',
    問合せ内容: '',
    対応内容: '',
    二次対応時間: '',
    完了状況: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // URLパラメータから初期値を設定
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentTime = new Date().toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
    
    setFormData(prev => ({
      ...prev,
      開始時間: currentTime, // 現在時刻を開始時間に設定
      研修名: params.get('研修名') || '',
      研修日: params.get('開催日') || '',
      Web連携ID: params.get('Web連携ID') || '',
      オペレーター名: params.get('オペレーター名') || '',
    }));

    // 最初の空フィールドにフォーカス
    setTimeout(() => {
      const firstEmptyField = document.querySelector('select:not([disabled]), input:not([disabled])') as HTMLElement;
      if (firstEmptyField) {
        firstEmptyField.focus();
      }
    }, 100);
  }, []);

  const handleFieldChange = (field: keyof CallLogRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(ENDPOINTS.callLog.save, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          受電日時: new Date().toISOString(),
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setMessage('受電履歴を保存しました');
        setTimeout(() => {
          window.close();
        }, 2000);
      } else {
        setMessage(result.message || '保存に失敗しました');
      }
    } catch (error) {
      setMessage('ネットワークエラーが発生しました');
      console.error('Call log save error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">📞 受電履歴入力フォーム</h1>
          <button
            onClick={() => window.close()}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 時刻情報セクション */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h2 className="font-semibold text-blue-800 mb-4 flex items-center">
              🕐 時刻情報
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TimePicker
                value={formData.開始時間}
                onChange={(value) => handleFieldChange('開始時間', value)}
                label="開始時間"
                required
              />
              <TimePicker
                value={formData.完了時間}
                onChange={(value) => handleFieldChange('完了時間', value)}
                label="完了時間"
                required
              />
              <TimePicker
                value={formData.二次対応時間 || ''}
                onChange={(value) => handleFieldChange('二次対応時間', value)}
                label="二次対応時間"
              />
            </div>
          </div>

          {/* 基本情報セクション */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center">
              📋 基本情報
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DropdownSelect
                value={formData.回線種別}
                onChange={(value) => handleFieldChange('回線種別', value)}
                options={dropdownOptions.回線種別}
                label="回線種別"
                icon="📞"
                required
              />
              <DropdownSelect
                value={formData.問合せ種別}
                onChange={(value) => handleFieldChange('問合せ種別', value)}
                options={dropdownOptions.問合せ種別}
                label="問合せ種別"
                icon="❓"
                required
              />
              <DropdownSelect
                value={formData.所在地}
                onChange={(value) => handleFieldChange('所在地', value)}
                options={dropdownOptions.所在地}
                label="所在地"
                icon="🗾"
                required
              />
              <DropdownSelect
                value={formData.関連項目}
                onChange={(value) => handleFieldChange('関連項目', value)}
                options={dropdownOptions.関連項目}
                label="関連項目"
                icon="📚"
                required
              />
            </div>
          </div>

          {/* 研修情報セクション */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h2 className="font-semibold text-green-800 mb-4 flex items-center">
              📚 研修情報（自動補完）
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📖 研修名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.研修名}
                  onChange={(e) => handleFieldChange('研修名', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md bg-green-25 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <DatePicker
                value={formData.研修日}
                onChange={(value) => handleFieldChange('研修日', value)}
                label="研修日"
                required
              />
              <ValidatedInput
                value={formData.Web連携ID}
                onChange={(value) => handleFieldChange('Web連携ID', value)}
                label="Web連携ID"
                type="web-id"
                icon="🔗"
                required
                placeholder="123456"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  👤 担当オペレーター
                </label>
                <input
                  type="text"
                  value={formData.オペレーター名}
                  disabled
                  className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
                <div className="text-xs text-gray-500 mt-1">
                  ※自動設定（変更不可）
                </div>
              </div>
            </div>
          </div>

          {/* 受講者情報セクション */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h2 className="font-semibold text-yellow-800 mb-4 flex items-center">
              👤 受講者情報
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  👤 受講者名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.受講者名}
                  onChange={(e) => handleFieldChange('受講者名', e.target.value)}
                  placeholder="お電話いただいた受講者の氏名"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  required
                />
              </div>
              <ValidatedInput
                value={formData.電話番号}
                onChange={(value) => handleFieldChange('電話番号', value)}
                label="電話番号"
                type="phone"
                icon="📱"
                required
                placeholder="03-1234-5678"
              />
              <ValidatedInput
                value={formData.メールアドレス}
                onChange={(value) => handleFieldChange('メールアドレス', value)}
                label="メールアドレス"
                type="email"
                icon="📧"
                required
                placeholder="example@company.com"
              />
            </div>
          </div>

          {/* 問合せ内容セクション */}
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h2 className="font-semibold text-purple-800 mb-4 flex items-center">
              💬 問合せ・対応内容
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ❓ 問合せ内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.問合せ内容}
                  onChange={(e) => handleFieldChange('問合せ内容', e.target.value)}
                  placeholder="受講者からの問合せ内容を詳しく記載してください"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 h-24 resize-y"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💬 対応内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.対応内容}
                  onChange={(e) => handleFieldChange('対応内容', e.target.value)}
                  placeholder="オペレーターが行った対応内容を記載してください"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 h-24 resize-y"
                  required
                />
              </div>
              <DropdownSelect
                value={formData.完了状況}
                onChange={(value) => handleFieldChange('完了状況', value)}
                options={dropdownOptions.完了状況}
                label="完了状況"
                icon="✅"
                required
              />
            </div>
          </div>

          {/* メッセージ表示 */}
          {message && (
            <div className={`p-4 rounded-md ${
              message.includes('保存しました') 
                ? 'bg-green-100 text-green-700 border border-green-300' 
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}>
              <div className="flex items-center">
                <span className="mr-2">
                  {message.includes('保存しました') ? '✅' : '❌'}
                </span>
                {message}
              </div>
            </div>
          )}

          {/* ボタン */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  保存中...
                </span>
              ) : (
                '💾 保存'
              )}
            </button>
            <button
              type="button"
              onClick={() => window.close()}
              disabled={loading}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md font-semibold hover:bg-gray-400 disabled:opacity-50 transition-colors"
            >
              キャンセル
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center pt-4">
            ⚠️ このウィンドウを閉じると入力内容は失われます
          </div>
        </form>
      </div>
    </div>
  );
}