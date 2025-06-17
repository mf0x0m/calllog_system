interface DropdownSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  label: string;
  icon?: string;
  required?: boolean;
  placeholder?: string;
}

export default function DropdownSelect({ 
  value, 
  onChange, 
  options, 
  label, 
  icon = "📋", 
  required = false,
  placeholder = "選択してください"
}: DropdownSelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {icon} {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        required={required}
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

// プリセットされた選択肢データ
export const dropdownOptions = {
  回線種別: ["直通", "フリーダイアル", "九州"],
  問合せ種別: ["一般", "案件"],
  所在地: [
    "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
    "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
    "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
    "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
    "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
    "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
    "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
  ],
  関連項目: [
    "公開講座", "eラーニング", "講師派遣", "動画百貨店", 
    "アセスメント", "IT研修", "その他"
  ],
  完了状況: ["完了", "保留", "エスカレーション"]
};