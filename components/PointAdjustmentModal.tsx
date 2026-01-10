import React, { useState, useEffect, useRef } from 'react';
import { X, Check, MessageSquare } from 'lucide-react';
import { Student } from '../types';

interface PointAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  student: Student | null;
  amount: number;
}

export const PointAdjustmentModal: React.FC<PointAdjustmentModalProps> = ({
  isOpen, onClose, onConfirm, student, amount
}) => {
  const [reason, setReason] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && student) {
      setReason('');
      // Focus after a small delay to allow animation
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, student]);

  if (!isOpen || !student) return null;

  const isPositive = amount > 0;
  const suggestions = isPositive 
    ? ['Phát biểu xây dựng bài', 'Làm bài tập đầy đủ', 'Có tiến bộ', 'Giúp đỡ bạn bè', 'Hoàn thành nhiệm vụ']
    : ['Mất trật tự', 'Không làm bài tập', 'Đi học muộn', 'Nói chuyện riêng', 'Thiếu dụng cụ học tập'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(reason || (isPositive ? 'Thưởng điểm' : 'Trừ điểm'));
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
        
        <div className={`p-6 border-b flex items-center justify-between ${isPositive ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
          <h2 className={`text-xl font-bold font-display ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
            {isPositive ? `Cộng ${amount} điểm` : `Trừ ${Math.abs(amount)} điểm`}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors text-gray-500">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-gray-600 mb-2 font-medium">
              Nhập lý do cho <span className="font-bold text-gray-800">{student.name}</span>:
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestions.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setReason(s)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    reason === s 
                      ? (isPositive ? 'bg-green-100 border-green-300 text-green-800 font-bold' : 'bg-red-100 border-red-300 text-red-800 font-bold')
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                ref={inputRef}
                type="text" 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-opacity-50 outline-none transition-all font-medium text-gray-800 focus:border-transparent ${
                    isPositive 
                    ? 'border-gray-300 focus:ring-green-500' 
                    : 'border-gray-300 focus:ring-red-500'
                }`}
                placeholder="Hoặc nhập lý do khác..."
              />
            </div>
          </div>

          <button 
            type="submit"
            className={`w-full font-bold py-3 rounded-xl text-white shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-95 ${
                isPositive 
                ? 'bg-green-500 hover:bg-green-600 shadow-green-500/30' 
                : 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
            }`}
          >
            <Check size={20} /> Xác nhận
          </button>
        </form>
      </div>
    </div>
  );
};