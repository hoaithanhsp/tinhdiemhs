export type LevelType = 'hat' | 'nay-mam' | 'cay-con' | 'cay-to';

export interface PointHistory {
  id: string;
  date: string;
  change: number;
  reason: string;
  pointsAfter: number;
}

export interface RedeemedReward {
  id: string;
  date: string;
  rewardName: string;
  pointsSpent: number;
}

export interface Student {
  id: string;
  classId: string; // ID của lớp học
  order?: number;
  name: string;
  dob?: string; // Ngày tháng năm sinh
  className?: string; // Tên lớp (để hiển thị/import)
  avatar: string | null;
  totalPoints: number;
  level: LevelType;
  pointHistory: PointHistory[];
  rewardsRedeemed: RedeemedReward[];
}

export interface ClassGroup {
  id: string;
  name: string;
}

export interface Reward {
  id: string;
  name: string;
  icon: string;
  cost: number;
  description: string;
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  LEADERBOARD = 'LEADERBOARD',
  STORE = 'STORE',
}

export const LEVELS = {
  hat: { min: 0, max: 19, name: 'Hạt', icon: '🌰' },
  'nay-mam': { min: 20, max: 49, name: 'Nảy mầm', icon: '🌱' },
  'cay-con': { min: 50, max: 99, name: 'Cây con', icon: '🌿' },
  'cay-to': { min: 100, max: Infinity, name: 'Cây to', icon: '🌳' },
};

export const DEFAULT_REWARDS: Reward[] = [
  { id: '1', name: 'Miễn 1 bài tập', icon: '📝', cost: 30, description: 'Miễn làm một bài tập về nhà' },
  { id: '2', name: 'Chọn chỗ ngồi', icon: '🪑', cost: 50, description: 'Được chọn chỗ ngồi trong 1 tuần' },
  { id: '3', name: '+5 điểm kiểm tra', icon: '✏️', cost: 80, description: 'Cộng điểm vào bài kiểm tra 15p' },
  { id: '4', name: 'Ngồi ghế GV', icon: '👨‍🏫', cost: 100, description: 'Ngồi ghế giáo viên 1 tiết học' },
  { id: '5', name: 'Voucher sách', icon: '📚', cost: 150, description: 'Voucher mua sách trị giá 50k' },
  { id: '6', name: 'Giải đặc biệt', icon: '🏆', cost: 200, description: 'Phần quà bí mật từ giáo viên' },
];