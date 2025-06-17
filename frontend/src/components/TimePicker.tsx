import { useState, useEffect } from 'react';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  label: string;
  required?: boolean;
  disabled?: boolean;
}

export default function TimePicker({ value, onChange, label, required = false, disabled = false }: TimePickerProps) {
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');

  // value プロパティから時間と分を分離
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      setHour(h || '');
      setMinute(m || '');
    }
  }, [value]);

  // 時間または分が変更されたときに親コンポーネントに通知
  useEffect(() => {
    if (hour && minute) {
      onChange(`${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`);
    } else if (!hour && !minute) {
      onChange('');
    }
  }, [hour, minute, onChange]);

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        🕐 {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center space-x-2">
        <select
          value={hour}
          onChange={(e) => setHour(e.target.value)}
          disabled={disabled}
          className="w-16 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
          required={required}
        >
          <option value="">--</option>
          {hours.map(h => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
        <span className="text-gray-500 font-semibold">:</span>
        <select
          value={minute}
          onChange={(e) => setMinute(e.target.value)}
          disabled={disabled}
          className="w-16 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
          required={required}
        >
          <option value="">--</option>
          {minutes.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <span className="text-xs text-gray-400 ml-2">時:分</span>
      </div>
    </div>
  );
}