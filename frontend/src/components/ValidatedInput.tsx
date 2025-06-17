import { useState } from 'react';

interface ValidatedInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  type: 'phone' | 'email' | 'web-id' | 'text';
  required?: boolean;
  placeholder?: string;
  icon?: string;
}

export default function ValidatedInput({ 
  value, 
  onChange, 
  label, 
  type, 
  required = false, 
  placeholder = '', 
  icon = "📝"
}: ValidatedInputProps) {
  const [error, setError] = useState('');

  const validateInput = (inputValue: string) => {
    setError('');
    
    if (required && !inputValue.trim()) {
      setError('この項目は必須です');
      return false;
    }
    
    switch (type) {
      case 'web-id':
        if (inputValue && (!/^\d{6}$/.test(inputValue))) {
          setError('6桁の数字を入力してください');
          return false;
        }
        break;
      case 'phone':
        if (inputValue && !/^[\d\-\(\)\+\s]+$/.test(inputValue)) {
          setError('有効な電話番号を入力してください');
          return false;
        }
        break;
      case 'email':
        if (inputValue && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(inputValue)) {
          setError('有効なメールアドレスを入力してください');
          return false;
        }
        break;
    }
    
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    validateInput(newValue);
  };

  const getInputType = () => {
    switch (type) {
      case 'email': return 'email';
      case 'phone': return 'tel';
      case 'web-id': return 'text';
      default: return 'text';
    }
  };

  const getMaxLength = () => {
    return type === 'web-id' ? 6 : undefined;
  };

  const getPattern = () => {
    switch (type) {
      case 'web-id': return '[0-9]{6}';
      case 'phone': return '[0-9\-\(\)\+\s]+';
      default: return undefined;
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {icon} {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={getInputType()}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={getMaxLength()}
        pattern={getPattern()}
        className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300'
        }`}
        required={required}
      />
      {error && (
        <div className="text-red-500 text-xs mt-1 flex items-center">
          <span className="mr-1">⚠️</span>
          {error}
        </div>
      )}
      {type === 'web-id' && (
        <div className="text-xs text-gray-500 mt-1">
          6桁の数字を入力してください（例：123456）
        </div>
      )}
      {type === 'phone' && (
        <div className="text-xs text-gray-500 mt-1">
          電話番号を入力してください（例：03-1234-5678）
        </div>
      )}
      {type === 'email' && (
        <div className="text-xs text-gray-500 mt-1">
          メールアドレスを入力してください（例：example@company.com）
        </div>
      )}
    </div>
  );
}