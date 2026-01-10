import React, { useMemo } from 'react';
import { X, Users, Trophy, TrendingUp, Award, BarChart2, Gift, Layers } from 'lucide-react';
import { Student, LEVELS, LevelType } from '../types';

interface ClassStatisticsModalProps {
    isOpen: boolean;
    onClose: () => void;
    students: Student[];
    className: string;
}

export const ClassStatisticsModal: React.FC<ClassStatisticsModalProps> = ({
    isOpen,
    onClose,
    students,
    className
}) => {
    if (!isOpen) return null;

    // Calculate statistics
    const stats = useMemo(() => {
        const totalStudents = students.length;
        const totalPoints = students.reduce((sum, s) => sum + s.totalPoints, 0);
        const avgPoints = totalStudents > 0 ? Math.round(totalPoints / totalStudents) : 0;
        const maxPoints = totalStudents > 0 ? Math.max(...students.map(s => s.totalPoints)) : 0;
        const minPoints = totalStudents > 0 ? Math.min(...students.map(s => s.totalPoints)) : 0;

        // Level distribution
        const levelCounts: Record<LevelType, number> = {
            'hat': 0,
            'nay-mam': 0,
            'cay-con': 0,
            'cay-to': 0
        };
        students.forEach(s => {
            levelCounts[s.level]++;
        });

        // Point distribution (ranges)
        const pointRanges = [
            { label: '0-19', min: 0, max: 19, count: 0, color: '#EAB308' },
            { label: '20-49', min: 20, max: 49, count: 0, color: '#22C55E' },
            { label: '50-99', min: 50, max: 99, count: 0, color: '#3B82F6' },
            { label: '100+', min: 100, max: Infinity, count: 0, color: '#9333EA' }
        ];
        students.forEach(s => {
            const range = pointRanges.find(r => s.totalPoints >= r.min && s.totalPoints <= r.max);
            if (range) range.count++;
        });

        // Total rewards redeemed
        const totalRewardsRedeemed = students.reduce((sum, s) => sum + s.rewardsRedeemed.length, 0);
        const totalPointsSpent = students.reduce((sum, s) =>
            sum + s.rewardsRedeemed.reduce((rSum, r) => rSum + r.pointsSpent, 0), 0
        );

        // Top 5 students
        const topStudents = [...students].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 5);

        // Progress overview (percentage of each level)
        const levelPercentages = Object.entries(levelCounts).map(([key, count]) => ({
            level: key as LevelType,
            count,
            percentage: totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0
        }));

        return {
            totalStudents,
            totalPoints,
            avgPoints,
            maxPoints,
            minPoints,
            levelCounts,
            levelPercentages,
            pointRanges,
            totalRewardsRedeemed,
            totalPointsSpent,
            topStudents
        };
    }, [students]);

    // Level info
    const levelInfo: Record<LevelType, { name: string; icon: string; color: string; gradient: string }> = {
        'hat': { name: 'Hạt', icon: '🌰', color: '#EAB308', gradient: 'from-yellow-400 to-amber-500' },
        'nay-mam': { name: 'Nảy mầm', icon: '🌱', color: '#22C55E', gradient: 'from-green-400 to-emerald-500' },
        'cay-con': { name: 'Cây con', icon: '🌿', color: '#3B82F6', gradient: 'from-blue-400 to-cyan-500' },
        'cay-to': { name: 'Cây to', icon: '🌳', color: '#9333EA', gradient: 'from-purple-400 to-pink-500' }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 rounded-xl p-2.5 backdrop-blur-sm">
                                <BarChart2 size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Thống kê lớp học</h2>
                                <p className="text-white/80 text-sm mt-0.5">{className}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {students.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <Users size={64} className="mx-auto mb-4 opacity-50" />
                            <p className="text-lg">Lớp chưa có học sinh nào</p>
                            <p className="text-sm mt-2">Thêm học sinh để xem thống kê</p>
                        </div>
                    ) : (
                        <>
                            {/* Overview Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <StatCard
                                    icon={<Users size={24} className="text-blue-500" />}
                                    label="Tổng học sinh"
                                    value={stats.totalStudents}
                                    bgColor="bg-blue-50"
                                    borderColor="border-blue-200"
                                />
                                <StatCard
                                    icon={<Trophy size={24} className="text-yellow-500" />}
                                    label="Tổng điểm lớp"
                                    value={stats.totalPoints.toLocaleString()}
                                    bgColor="bg-yellow-50"
                                    borderColor="border-yellow-200"
                                />
                                <StatCard
                                    icon={<TrendingUp size={24} className="text-green-500" />}
                                    label="Điểm trung bình"
                                    value={stats.avgPoints}
                                    bgColor="bg-green-50"
                                    borderColor="border-green-200"
                                />
                                <StatCard
                                    icon={<Gift size={24} className="text-purple-500" />}
                                    label="Quà đã đổi"
                                    value={stats.totalRewardsRedeemed}
                                    subValue={`${stats.totalPointsSpent.toLocaleString()} điểm`}
                                    bgColor="bg-purple-50"
                                    borderColor="border-purple-200"
                                />
                            </div>

                            {/* Point Range Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-amber-100">
                                    <div className="text-sm text-amber-700 font-medium">Điểm cao nhất</div>
                                    <div className="text-2xl font-bold text-amber-600">{stats.maxPoints}</div>
                                </div>
                                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-100">
                                    <div className="text-sm text-cyan-700 font-medium">Điểm thấp nhất</div>
                                    <div className="text-2xl font-bold text-cyan-600">{stats.minPoints}</div>
                                </div>
                                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100">
                                    <div className="text-sm text-emerald-700 font-medium">Trung vị điểm</div>
                                    <div className="text-2xl font-bold text-emerald-600">
                                        {getMedian(students.map(s => s.totalPoints))}
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-100">
                                    <div className="text-sm text-violet-700 font-medium">Độ lệch chuẩn</div>
                                    <div className="text-2xl font-bold text-violet-600">
                                        {getStandardDeviation(students.map(s => s.totalPoints)).toFixed(1)}
                                    </div>
                                </div>
                            </div>

                            {/* Level Distribution */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Layers size={20} className="text-indigo-500" />
                                    Phân bố cấp độ học sinh
                                </h3>
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                    {/* Circular Progress / Pie Visual */}
                                    <div className="flex flex-col md:flex-row items-center gap-8">
                                        {/* Pie Chart Visual */}
                                        <div className="relative w-48 h-48 flex-shrink-0">
                                            <PieChart data={stats.levelPercentages.map(l => ({
                                                value: l.count,
                                                color: levelInfo[l.level].color,
                                                label: levelInfo[l.level].name
                                            }))} />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="text-3xl font-bold text-gray-800">{stats.totalStudents}</div>
                                                    <div className="text-xs text-gray-500">học sinh</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Level Bars */}
                                        <div className="flex-1 w-full space-y-4">
                                            {stats.levelPercentages.map(({ level, count, percentage }) => (
                                                <div key={level} className="flex items-center gap-3">
                                                    <div className="w-8 text-xl text-center">{levelInfo[level].icon}</div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-sm font-semibold text-gray-700">
                                                                {levelInfo[level].name}
                                                            </span>
                                                            <span className="text-sm font-bold" style={{ color: levelInfo[level].color }}>
                                                                {count} ({percentage}%)
                                                            </span>
                                                        </div>
                                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full bg-gradient-to-r ${levelInfo[level].gradient} transition-all duration-700 ease-out`}
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Point Distribution Chart */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <BarChart2 size={20} className="text-blue-500" />
                                    Phân bố điểm số
                                </h3>
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                    <div className="flex items-end justify-around gap-4 h-40">
                                        {stats.pointRanges.map((range, index) => {
                                            const maxCount = Math.max(...stats.pointRanges.map(r => r.count), 1);
                                            const height = (range.count / maxCount) * 100;
                                            return (
                                                <div key={range.label} className="flex flex-col items-center flex-1 max-w-24">
                                                    <div className="text-sm font-bold mb-2" style={{ color: range.color }}>
                                                        {range.count}
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-t-lg relative flex-1 flex items-end">
                                                        <div
                                                            className="w-full rounded-t-lg transition-all duration-700 ease-out"
                                                            style={{
                                                                height: `${height}%`,
                                                                backgroundColor: range.color,
                                                                minHeight: range.count > 0 ? '8px' : '0px'
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="text-xs font-medium text-gray-600 mt-2 text-center">
                                                        {range.label} điểm
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Top Students */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Award size={20} className="text-yellow-500" />
                                    Top 5 học sinh xuất sắc
                                </h3>
                                <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                                    {stats.topStudents.length > 0 ? (
                                        <div className="divide-y divide-gray-50">
                                            {stats.topStudents.map((student, index) => {
                                                const rankColors = [
                                                    'bg-gradient-to-r from-yellow-400 to-amber-500 text-white',
                                                    'bg-gradient-to-r from-gray-300 to-gray-400 text-white',
                                                    'bg-gradient-to-r from-amber-600 to-orange-700 text-white',
                                                    'bg-gray-100 text-gray-600',
                                                    'bg-gray-100 text-gray-600'
                                                ];
                                                return (
                                                    <div
                                                        key={student.id}
                                                        className={`flex items-center gap-4 p-4 ${index === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-50' : ''}`}
                                                    >
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${rankColors[index]}`}>
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-bold text-gray-800">
                                                                {student.name}
                                                                {index === 0 && <span className="ml-2">👑</span>}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {levelInfo[student.level].icon} {levelInfo[student.level].name}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-xl font-bold text-primary">
                                                                {student.totalPoints.toLocaleString()}
                                                            </div>
                                                            <div className="text-xs text-gray-500">điểm</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-gray-400">
                                            Chưa có dữ liệu
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subValue?: string;
    bgColor: string;
    borderColor: string;
}> = ({ icon, label, value, subValue, bgColor, borderColor }) => (
    <div className={`${bgColor} rounded-2xl p-4 border ${borderColor} transition-transform hover:scale-105`}>
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white rounded-xl shadow-sm">{icon}</div>
        </div>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        <div className="text-sm text-gray-600">{label}</div>
        {subValue && <div className="text-xs text-gray-500 mt-1">{subValue}</div>}
    </div>
);

// Pie Chart Component
const PieChart: React.FC<{ data: { value: number; color: string; label: string }[] }> = ({ data }) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    if (total === 0) {
        return (
            <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="40" fill="#E5E7EB" />
            </svg>
        );
    }

    let currentAngle = -90;
    const arcs = data.map((d, i) => {
        const percentage = (d.value / total) * 100;
        const angle = (percentage / 100) * 360;
        const startAngle = currentAngle;
        currentAngle += angle;

        const startRad = (startAngle * Math.PI) / 180;
        const endRad = ((startAngle + angle) * Math.PI) / 180;

        const x1 = 50 + 40 * Math.cos(startRad);
        const y1 = 50 + 40 * Math.sin(startRad);
        const x2 = 50 + 40 * Math.cos(endRad);
        const y2 = 50 + 40 * Math.sin(endRad);

        const largeArc = angle > 180 ? 1 : 0;

        if (d.value === 0) return null;

        // Handle 100% case
        if (percentage >= 99.9) {
            return (
                <circle
                    key={i}
                    cx="50"
                    cy="50"
                    r="40"
                    fill={d.color}
                    className="transition-all duration-500"
                />
            );
        }

        return (
            <path
                key={i}
                d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={d.color}
                className="transition-all duration-500 hover:opacity-80"
            />
        );
    });

    return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
            {arcs}
            <circle cx="50" cy="50" r="28" fill="white" />
        </svg>
    );
};

// Helper functions
function getMedian(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function getStandardDeviation(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
}

export default ClassStatisticsModal;
