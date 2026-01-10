import React, { useState } from 'react';
import { Student, Reward, LEVELS, DEFAULT_REWARDS } from '../types';
import { X, History, Gift, BarChart2, Calendar, School, Trash2 } from 'lucide-react';
import { getAvatarUrl } from '../utils';

interface StudentDetailModalProps {
  student: Student | null;
  onClose: () => void;
  onRedeem: (studentId: string, reward: Reward) => void;
  onDelete: (studentId: string) => void;
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ student, onClose, onRedeem, onDelete }) => {
  const [activeTab, setActiveTab] = useState<'history' | 'redeem' | 'stats'>('history');

  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col animate-[fadeIn_0.2s_ease-out]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
            <div className="flex items-center gap-4">
                <img 
                    src={getAvatarUrl(student.name, student.avatar)} 
                    alt={student.name}
                    className="w-16 h-16 rounded-full border-2 border-white shadow-md"
                />
                <div>
                    <h2 className="text-2xl font-display font-bold text-gray-800 flex items-center gap-2">
                        {student.name}
                        <span className="text-2xl" title={LEVELS[student.level].name}>{LEVELS[student.level].icon}</span>
                    </h2>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                        {student.dob && (
                            <span className="flex items-center gap-1"><Calendar size={14} /> {student.dob}</span>
                        )}
                        {student.className && (
                            <span className="flex items-center gap-1"><School size={14} /> {student.className}</span>
                        )}
                    </div>
                    <p className="text-gray-500 font-medium mt-1">
                        Điểm hiện tại: <span className="text-primary font-bold text-lg">{student.totalPoints}</span>
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => onDelete(student.id)} 
                    className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-full transition-colors flex items-center gap-1"
                    title="Xóa học sinh này"
                >
                    <Trash2 size={20} />
                </button>
                <div className="h-6 w-px bg-gray-300 mx-1"></div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
            <button 
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-4 py-4 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
                <History size={16} /> Lịch sử điểm
            </button>
            <button 
                onClick={() => setActiveTab('redeem')}
                className={`flex items-center gap-2 px-4 py-4 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'redeem' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
                <Gift size={16} /> Đổi quà
            </button>
            <button 
                onClick={() => setActiveTab('stats')}
                className={`flex items-center gap-2 px-4 py-4 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'stats' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
                <BarChart2 size={16} /> Thống kê
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
            {activeTab === 'history' && (
                <div className="space-y-3">
                    {student.pointHistory.length === 0 ? (
                        <p className="text-center text-gray-400 py-10">Chưa có lịch sử điểm nào.</p>
                    ) : (
                        [...student.pointHistory].reverse().map((h) => (
                            <div key={h.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-800">{h.reason || 'Thay đổi điểm'}</p>
                                    <p className="text-xs text-gray-400">{new Date(h.date).toLocaleString('vi-VN')}</p>
                                </div>
                                <div className={`font-bold text-lg ${h.change > 0 ? 'text-primary' : 'text-danger'}`}>
                                    {h.change > 0 ? '+' : ''}{h.change}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'redeem' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {DEFAULT_REWARDS.map(reward => {
                        const canAfford = student.totalPoints >= reward.cost;
                        return (
                            <div key={reward.id} className={`bg-white p-4 rounded-xl border-2 transition-all ${canAfford ? 'border-gray-100 hover:border-primary/50' : 'border-gray-50 opacity-60'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-3xl">{reward.icon}</span>
                                    <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs font-bold">{reward.cost} điểm</span>
                                </div>
                                <h4 className="font-bold text-gray-800">{reward.name}</h4>
                                <p className="text-xs text-gray-500 mb-4">{reward.description}</p>
                                <button
                                    onClick={() => onRedeem(student.id, reward)}
                                    disabled={!canAfford}
                                    className={`w-full py-2 rounded-lg text-sm font-bold transition-all ${canAfford ? 'bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-dark' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                >
                                    Đổi
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {activeTab === 'stats' && (
                <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                        <span className="text-4xl mb-2">📈</span>
                        <p className="text-gray-500 text-sm">Tổng điểm cộng</p>
                        <p className="text-2xl font-bold text-primary">
                            +{student.pointHistory.filter(h => h.change > 0).reduce((acc, curr) => acc + curr.change, 0)}
                        </p>
                     </div>
                     <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                        <span className="text-4xl mb-2">📉</span>
                        <p className="text-gray-500 text-sm">Tổng điểm trừ</p>
                        <p className="text-2xl font-bold text-danger">
                            {student.pointHistory.filter(h => h.change < 0).reduce((acc, curr) => acc + curr.change, 0)}
                        </p>
                     </div>
                     <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center col-span-2">
                        <span className="text-4xl mb-2">🎁</span>
                        <p className="text-gray-500 text-sm">Quà đã đổi</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {student.rewardsRedeemed.length}
                        </p>
                        <div className="flex gap-1 mt-2 flex-wrap justify-center">
                            {student.rewardsRedeemed.slice(0, 5).map((r, i) => (
                                <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{r.rewardName}</span>
                            ))}
                            {student.rewardsRedeemed.length > 5 && <span className="text-xs text-gray-400">...</span>}
                        </div>
                     </div>
                     <div className="col-span-2 mt-4 pt-4 border-t border-gray-100">
                        <button 
                            onClick={() => onDelete(student.id)}
                            className="w-full flex items-center justify-center gap-2 p-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl font-bold transition-colors"
                        >
                            <Trash2 size={18} /> Xóa học sinh này
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-2">Hành động này không thể hoàn tác</p>
                     </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetailModal;