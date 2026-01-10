import React, { useState } from 'react';
import { Reward } from '../types';
import { X, Plus, Trash2, Save, Gift, Edit2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Common emoji list for rewards
const EMOJI_OPTIONS = [
  '🎁', '📝', '🪑', '✏️', '👨‍🏫', '📚', '🏆', '⭐', '🎯', '🎨',
  '🎮', '🎵', '🍕', '🍦', '🧁', '🎂', '🎉', '🎈', '💎', '👑',
  '🌟', '🏅', '🎖️', '🎪', '🎭', '🎬', '📱', '💻', '🎧', '🎤'
];

interface RewardSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewards: Reward[];
  onSaveRewards: (rewards: Reward[]) => void;
}

export const RewardSettingsModal: React.FC<RewardSettingsModalProps> = ({
  isOpen,
  onClose,
  rewards,
  onSaveRewards
}) => {
  const [editableRewards, setEditableRewards] = useState<Reward[]>(rewards);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddReward = () => {
    const newReward: Reward = {
      id: uuidv4(),
      name: 'Quà mới',
      icon: '🎁',
      cost: 50,
      description: 'Mô tả quà tặng'
    };
    setEditableRewards([...editableRewards, newReward]);
    setEditingId(newReward.id);
  };

  const handleUpdateReward = (id: string, field: keyof Reward, value: string | number) => {
    setEditableRewards(prev =>
      prev.map(r => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleDeleteReward = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa quà tặng này?')) {
      setEditableRewards(prev => prev.filter(r => r.id !== id));
      if (editingId === id) setEditingId(null);
    }
  };

  const handleSave = () => {
    // Validate
    const hasEmptyName = editableRewards.some(r => !r.name.trim());
    if (hasEmptyName) {
      alert('Vui lòng nhập tên cho tất cả quà tặng!');
      return;
    }
    onSaveRewards(editableRewards);
    onClose();
  };

  const handleSelectEmoji = (rewardId: string, emoji: string) => {
    handleUpdateReward(rewardId, 'icon', emoji);
    setShowEmojiPicker(null);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-purple-50 to-pink-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Gift className="text-purple-500" /> Cài đặt quà tặng
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-full text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {editableRewards.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Gift size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Chưa có quà tặng nào. Hãy thêm quà mới!</p>
            </div>
          ) : (
            editableRewards.map((reward, index) => (
              <div
                key={reward.id}
                className={`bg-white border-2 rounded-2xl p-4 transition-all ${
                  editingId === reward.id
                    ? 'border-purple-300 shadow-lg'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Emoji Picker */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowEmojiPicker(showEmojiPicker === reward.id ? null : reward.id)
                      }
                      className="w-14 h-14 text-3xl bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200 transition-all"
                      title="Chọn icon"
                    >
                      {reward.icon}
                    </button>
                    {showEmojiPicker === reward.id && (
                      <div className="absolute top-16 left-0 z-10 bg-white border border-gray-200 rounded-xl shadow-xl p-3 grid grid-cols-6 gap-2 w-64">
                        {EMOJI_OPTIONS.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => handleSelectEmoji(reward.id, emoji)}
                            className="text-2xl p-2 hover:bg-gray-100 rounded-lg transition-all"
                          >
                            {emoji}
                          </button>
                        ))}
                        <div className="col-span-6 mt-2 pt-2 border-t border-gray-100">
                          <input
                            type="text"
                            placeholder="Nhập emoji khác..."
                            maxLength={2}
                            className="w-full px-3 py-2 text-center border border-gray-200 rounded-lg text-xl"
                            onChange={(e) => {
                              if (e.target.value) {
                                handleSelectEmoji(reward.id, e.target.value);
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Fields */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-6">{index + 1}.</span>
                      <input
                        type="text"
                        value={reward.name}
                        onChange={e => handleUpdateReward(reward.id, 'name', e.target.value)}
                        onFocus={() => setEditingId(reward.id)}
                        placeholder="Tên quà tặng"
                        className="flex-1 font-bold text-gray-800 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:outline-none"
                      />
                      <div className="flex items-center gap-1 bg-blue-50 rounded-lg px-3 py-2">
                        <input
                          type="number"
                          value={reward.cost}
                          onChange={e =>
                            handleUpdateReward(reward.id, 'cost', parseInt(e.target.value) || 0)
                          }
                          onFocus={() => setEditingId(reward.id)}
                          className="w-16 text-center font-bold text-blue-600 bg-transparent focus:outline-none"
                          min={0}
                        />
                        <span className="text-blue-500 text-sm font-medium">điểm</span>
                      </div>
                    </div>

                    <textarea
                      value={reward.description}
                      onChange={e => handleUpdateReward(reward.id, 'description', e.target.value)}
                      onFocus={() => setEditingId(reward.id)}
                      placeholder="Mô tả quà tặng..."
                      rows={2}
                      className="w-full text-sm text-gray-600 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteReward(reward.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa quà tặng"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-wrap gap-3 justify-between">
          <button
            onClick={handleAddReward}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-dashed border-gray-300 text-gray-600 font-bold rounded-xl hover:border-purple-400 hover:text-purple-600 transition-all"
          >
            <Plus size={18} /> Thêm quà mới
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-all"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-purple-200 hover:shadow-xl transition-all"
            >
              <Save size={18} /> Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardSettingsModal;
