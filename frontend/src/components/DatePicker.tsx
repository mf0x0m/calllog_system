interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label: string;
  required?: boolean;
  icon?: string;
}

export default function DatePicker({ 
  value, 
  onChange, 
  label, 
  required = false,
  icon = "📅"
}: DatePickerProps) {
  
  // 今日の日付をYYYY-MM-DD形式で取得
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {icon} {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        required={required}
        max={today}  // 未来の日付は選択不可
      />
      <div className="text-xs text-gray-500 mt-1">
        研修の開催日を選択してください
      </div>
    </div>
  );
}