import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Users, Settings, Download, Plus, Search,
  ChevronDown, Trophy, Grid, FileText, Briefcase, Trash2, CheckCircle, FolderOpen, Edit2, X, Gift, BarChart2
} from 'lucide-react';
import StudentCard from './components/StudentCard';
import StudentDetailModal from './components/StudentDetailModal';
import { AddStudentModal } from './components/AddStudentModal';
import { ClassSettingsModal } from './components/ClassSettingsModal';
import { PointAdjustmentModal } from './components/PointAdjustmentModal';
import { RewardSettingsModal } from './components/RewardSettingsModal';
import { ClassStatisticsModal } from './components/ClassStatisticsModal';
import { Leaderboard } from './components/Leaderboard';
import { Student, ViewMode, Reward, LEVELS, PointHistory, RedeemedReward, ClassGroup, DEFAULT_REWARDS } from './types';
import { calculateLevel, triggerConfetti, toExcel, parseDocument, getAvatarUrl } from './utils';

// Constants
const DEFAULT_CLASS_ID = 'default-class';

const App: React.FC = () => {
  // --- State Initialization ---

  // Classes
  const [classes, setClasses] = useState<ClassGroup[]>(() => {
    const saved = localStorage.getItem('lhtc_classes');
    return saved ? JSON.parse(saved) : [{ id: DEFAULT_CLASS_ID, name: 'Lớp học của tôi' }];
  });

  const [currentClassId, setCurrentClassId] = useState<string>(() => {
    return localStorage.getItem('lhtc_current_class_id') || DEFAULT_CLASS_ID;
  });

  // Students
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('lhtc_students');
    let parsedStudents = saved ? JSON.parse(saved) : [];

    // Migration: Assign classId to old data if missing
    if (parsedStudents.length > 0 && !parsedStudents[0].classId) {
      parsedStudents = parsedStudents.map((s: any) => ({
        ...s,
        classId: DEFAULT_CLASS_ID
      }));
    }
    return parsedStudents;
  });

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showClassManager, setShowClassManager] = useState(false);
  const [showRewardSettings, setShowRewardSettings] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassGroup | null>(null); // For ClassSettingsModal
  const [adjustmentRequest, setAdjustmentRequest] = useState<{ student: Student, amount: number } | null>(null);

  // Rewards State
  const [rewards, setRewards] = useState<Reward[]>(() => {
    const saved = localStorage.getItem('lhtc_rewards');
    return saved ? JSON.parse(saved) : DEFAULT_REWARDS;
  });

  // Form State
  const [newClassName, setNewClassName] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: 'name' | 'points' | 'order', dir: 'asc' | 'desc' }>({ key: 'points', dir: 'desc' });
  const [searchQuery, setSearchQuery] = useState('');

  // --- Effects ---

  useEffect(() => {
    localStorage.setItem('lhtc_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('lhtc_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('lhtc_current_class_id', currentClassId);
  }, [currentClassId]);

  useEffect(() => {
    localStorage.setItem('lhtc_rewards', JSON.stringify(rewards));
  }, [rewards]);

  // Ensure "My Class" exists if list is empty (Safety net)
  useEffect(() => {
    if (classes.length === 0) {
      const newClass = { id: DEFAULT_CLASS_ID, name: 'Lớp học của tôi' };
      setClasses([newClass]);
      setCurrentClassId(DEFAULT_CLASS_ID);
    }
  }, [classes]);


  // --- Logic Helpers ---

  const currentClass = classes.find(c => c.id === currentClassId) || classes[0];
  const filteredStudents = students.filter(s => s.classId === currentClassId);

  // --- Handlers: Students ---

  const handleUpdatePoints = (id: string, amount: number, reason: string = '') => {
    setStudents(prev => prev.map(student => {
      if (student.id !== id) return student;

      const newPoints = Math.max(0, student.totalPoints + amount);
      const newLevel = calculateLevel(newPoints);

      if (LEVELS[newLevel].min > LEVELS[student.level].min) {
        triggerConfetti();
        // Delay alert to let confetti start
        setTimeout(() => alert(`🎉 Chúc mừng ${student.name} đã thăng hạng lên ${LEVELS[newLevel].name}!`), 100);
      }

      const historyItem: PointHistory = {
        id: uuidv4(),
        date: new Date().toISOString(),
        change: amount,
        reason: reason || (amount > 0 ? 'Thưởng điểm' : 'Trừ điểm'),
        pointsAfter: newPoints
      };

      return {
        ...student,
        totalPoints: newPoints,
        level: newLevel,
        pointHistory: [...student.pointHistory, historyItem]
      };
    }));
  };

  const handleRequestAdjustment = (student: Student, amount: number) => {
    setAdjustmentRequest({ student, amount });
  };

  const handleConfirmAdjustment = (reason: string) => {
    if (adjustmentRequest) {
      handleUpdatePoints(adjustmentRequest.student.id, adjustmentRequest.amount, reason);
      setAdjustmentRequest(null);
    }
  };

  const handleRedeemReward = (studentId: string, reward: Reward) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    if (student.totalPoints < reward.cost) {
      alert(`Học sinh không đủ điểm để đổi quà này! Cần ${reward.cost} điểm.`);
      return;
    }

    if (!window.confirm(`Xác nhận đổi "${reward.name}" cho học sinh này với giá ${reward.cost} điểm?`)) return;

    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;

      const redeemedItem: RedeemedReward = {
        id: uuidv4(),
        date: new Date().toISOString(),
        rewardName: reward.name,
        pointsSpent: reward.cost
      };

      const pointHistoryItem: PointHistory = {
        id: uuidv4(),
        date: new Date().toISOString(),
        change: -reward.cost,
        reason: `Đổi quà: ${reward.name}`,
        pointsAfter: s.totalPoints - reward.cost
      };

      return {
        ...s,
        totalPoints: s.totalPoints - reward.cost,
        pointHistory: [...s.pointHistory, pointHistoryItem],
        rewardsRedeemed: [...s.rewardsRedeemed, redeemedItem]
      };
    }));
  };

  const handleAddStudentWrapper = (name: string, order?: number) => {
    const maxOrder = Math.max(0, ...filteredStudents.map(s => s.order || 0));

    const newStudent: Student = {
      id: uuidv4(),
      classId: currentClassId,
      order: order ?? (maxOrder + 1),
      name: name,
      avatar: null,
      totalPoints: 0,
      level: 'hat',
      pointHistory: [],
      rewardsRedeemed: []
    };

    setStudents(prev => [...prev, newStudent]);
  };

  const handleDeleteStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    if (window.confirm(`Bạn có chắc chắn muốn xóa học sinh ${student.name.toUpperCase()}?`)) {
      setStudents(prev => prev.filter(s => s.id !== studentId));
      setSelectedStudent(null);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const parsed = await parseDocument(e.target.files[0]);
        let maxOrder = Math.max(0, ...filteredStudents.map(s => s.order || 0));

        const newStudents: Student[] = parsed.map((p, index) => ({
          id: uuidv4(),
          classId: currentClassId, // Import into current class
          order: p.order || (maxOrder + index + 1),
          name: p.name || 'Học sinh mới',
          dob: p.dob,
          className: p.className, // Keep display string
          avatar: null,
          totalPoints: 0,
          level: 'hat',
          pointHistory: [],
          rewardsRedeemed: []
        }));

        setStudents(prev => [...prev, ...newStudents]);
        alert(`Đã nhập thành công ${newStudents.length} học sinh vào lớp ${currentClass.name}!`);
        setSortConfig({ key: 'order', dir: 'asc' });

      } catch (err: any) {
        console.error(err);
        alert('Lỗi import: ' + err.message);
      }
    }
  };

  // --- Handlers: Class Management ---

  const handleAddClass = () => {
    if (!newClassName.trim()) return;
    const newClass: ClassGroup = {
      id: uuidv4(),
      name: newClassName.trim()
    };
    setClasses([...classes, newClass]);
    setCurrentClassId(newClass.id);
    setNewClassName('');
  };

  const handleUpdateCurrentClass = (name: string) => {
    if (!editingClass) return;
    setClasses(prev => prev.map(c => c.id === editingClass.id ? { ...c, name } : c));
    setEditingClass(null);
  };

  const handleDeleteEditingClass = () => {
    if (!editingClass) return;
    const classId = editingClass.id;

    // Check if class has students
    const count = students.filter(s => s.classId === classId).length;
    if (count > 0) {
      alert(`Không thể xóa! Lớp học này vẫn còn ${count} học sinh.\n\nVui lòng vào "Quản lý lớp" và xóa hết học sinh của lớp này trước khi xóa lớp.`);
      return;
    }

    if (!window.confirm("Bạn có chắc chắn muốn xóa lớp học này?")) return;

    const newClasses = classes.filter(c => c.id !== classId);
    setClasses(newClasses);

    if (currentClassId === classId) {
      if (newClasses.length > 0) {
        setCurrentClassId(newClasses[0].id);
      }
    }
    setEditingClass(null);
  };

  const handleDeleteClass = (classId: string) => {
    const count = students.filter(s => s.classId === classId).length;
    if (count > 0) {
      alert(`Lớp này còn ${count} học sinh. Vui lòng xóa hết học sinh (nút thùng rác) trước khi xóa lớp.`);
      return;
    }

    if (!window.confirm("Bạn có chắc chắn muốn xóa lớp học này?")) return;

    const newClasses = classes.filter(c => c.id !== classId);
    setClasses(newClasses);

    if (currentClassId === classId && newClasses.length > 0) {
      setCurrentClassId(newClasses[0].id);
    }
    // If empty, useEffect will handle default class creation
  };

  const handleDeleteAllStudentsInClass = (classId: string) => {
    const classInfo = classes.find(c => c.id === classId);
    const count = students.filter(s => s.classId === classId).length;
    if (count === 0) return;

    if (window.confirm(`⚠️ CẢNH BÁO: Bạn muốn xóa toàn bộ ${count} học sinh của lớp "${classInfo?.name}"?`)) {
      if (window.confirm("Xác nhận lần 2: Dữ liệu sẽ mất vĩnh viễn và không thể khôi phục?")) {
        setStudents(prev => prev.filter(s => s.classId !== classId));
      }
    }
  };

  // --- Processing ---

  const handleSort = (key: 'name' | 'points' | 'order') => {
    setSortConfig(prev => ({
      key,
      dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc'
    }));
  };

  const sortedStudents = [...filteredStudents]
    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortConfig.key === 'points') {
        return sortConfig.dir === 'desc' ? b.totalPoints - a.totalPoints : a.totalPoints - b.totalPoints;
      } else if (sortConfig.key === 'order') {
        const orderA = a.order ?? 9999;
        const orderB = b.order ?? 9999;
        return sortConfig.dir === 'asc' ? orderA - orderB : orderB - orderA;
      } else {
        return sortConfig.dir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
    });

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary rounded-lg p-1.5 text-white shadow-lg shadow-primary/30">
                <Users size={24} />
              </div>
              <h1 className="font-display font-bold text-xl text-gray-800 tracking-tight hidden md:block">
                LỚP HỌC TÍCH CỰC
              </h1>
            </div>

            <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
            <button
              onClick={() => setShowClassManager(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold text-gray-700 transition-colors"
            >
              <Briefcase size={16} />
              <span className="max-w-[150px] truncate">{currentClass?.name}</span>
              <ChevronDown size={14} />
            </button>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setViewMode(ViewMode.DASHBOARD)}
              className={`p-2 rounded-xl transition-all ${viewMode === ViewMode.DASHBOARD ? 'bg-green-50 text-primary font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Grid size={20} className="md:hidden" />
              <span className="hidden md:block">Lớp học</span>
            </button>
            <button
              onClick={() => setViewMode(ViewMode.LEADERBOARD)}
              className={`p-2 rounded-xl transition-all ${viewMode === ViewMode.LEADERBOARD ? 'bg-green-50 text-primary font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Trophy size={20} className="md:hidden" />
              <span className="hidden md:block">Bảng xếp hạng</span>
            </button>
            <div className="h-6 w-px bg-gray-200 mx-1"></div>
            <button onClick={() => setShowStatistics(true)} className="flex items-center gap-1 text-sm font-semibold text-indigo-500 hover:text-indigo-700 px-2 py-1 rounded-lg hover:bg-indigo-50">
              <BarChart2 size={18} /> <span className="hidden md:inline">Thống kê</span>
            </button>
            <button onClick={() => setShowRewardSettings(true)} className="flex items-center gap-1 text-sm font-semibold text-purple-500 hover:text-purple-700 px-2 py-1 rounded-lg hover:bg-purple-50">
              <Gift size={18} /> <span className="hidden md:inline">Cài đặt quà</span>
            </button>
            <button onClick={() => setShowClassManager(true)} className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-800 px-2 py-1 rounded-lg hover:bg-gray-50">
              <Settings size={18} /> <span className="hidden md:inline">Quản lý lớp</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6">

        {viewMode === ViewMode.DASHBOARD && (
          <>
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder={`Tìm trong ${currentClass.name}...`}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                <button onClick={() => handleSort('order')} className="whitespace-nowrap flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
                  STT <ChevronDown size={14} className={`transform ${sortConfig.key === 'order' && sortConfig.dir === 'asc' ? 'rotate-180' : ''}`} />
                </button>
                <button onClick={() => handleSort('points')} className="whitespace-nowrap flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
                  Điểm số <ChevronDown size={14} className={`transform ${sortConfig.key === 'points' && sortConfig.dir === 'asc' ? 'rotate-180' : ''}`} />
                </button>
                <button onClick={() => handleSort('name')} className="whitespace-nowrap flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
                  Tên <ChevronDown size={14} className={`transform ${sortConfig.key === 'name' && sortConfig.dir === 'asc' ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24">
              {sortedStudents.map(student => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onAdjustPoint={handleRequestAdjustment}
                  onClick={setSelectedStudent}
                />
              ))}
              {sortedStudents.length === 0 && (
                <div className="col-span-full text-center py-20 text-gray-400 flex flex-col items-center">
                  <FolderOpen size={48} className="mb-4 text-gray-300" />
                  <p>Lớp {currentClass.name} chưa có học sinh nào.</p>
                  <button onClick={() => setShowAddModal(true)} className="mt-4 text-primary font-bold hover:underline">
                    Thêm học sinh ngay
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {viewMode === ViewMode.LEADERBOARD && (
          <Leaderboard students={filteredStudents} />
        )}

      </main>

      {/* Floating Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 z-30">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center md:justify-end gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all"
          >
            <Plus size={18} /> Thêm học sinh
          </button>

          <label className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all cursor-pointer">
            <FileText size={18} /> Import DOCX
            <input type="file" accept=".pdf, .docx" className="hidden" onChange={handleImport} />
          </label>

          <button
            onClick={() => toExcel(filteredStudents)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all"
          >
            <Download size={18} /> Export Lớp
          </button>
        </div>
      </div>

      {/* Modals */}
      {selectedStudent && (
        <StudentDetailModal
          student={students.find(s => s.id === selectedStudent.id) || null}
          onClose={() => setSelectedStudent(null)}
          onRedeem={handleRedeemReward}
          onDelete={handleDeleteStudent}
          rewards={rewards}
        />
      )}

      <AddStudentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddStudentWrapper}
      />

      {/* Point Adjustment Modal */}
      <PointAdjustmentModal
        isOpen={!!adjustmentRequest}
        onClose={() => setAdjustmentRequest(null)}
        onConfirm={handleConfirmAdjustment}
        student={adjustmentRequest?.student || null}
        amount={adjustmentRequest?.amount || 0}
      />

      {/* Class Manager Modal (List View) */}
      {showClassManager && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Briefcase className="text-primary" /> Quản lý lớp học
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowClassManager(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                  <Users size={20} />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto flex-1 bg-gray-50/30">
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Tên lớp mới (VD: 10A2)..."
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none shadow-sm"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddClass()}
                />
                <button
                  onClick={handleAddClass}
                  disabled={!newClassName.trim()}
                  className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 disabled:opacity-50 disabled:shadow-none hover:bg-primary-dark transition-all"
                >
                  Thêm lớp
                </button>
              </div>

              <div className="space-y-3">
                {classes.map(cls => {
                  const count = students.filter(s => s.classId === cls.id).length;
                  const isActive = currentClassId === cls.id;

                  return (
                    <div
                      key={cls.id}
                      className={`
                                        group relative flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer
                                        ${isActive ? 'bg-white border-primary shadow-apple' : 'bg-white border-gray-100 hover:border-gray-300'}
                                    `}
                      onClick={() => setCurrentClassId(cls.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`
                                            w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                                            ${isActive ? 'bg-green-100 text-primary' : 'bg-gray-100 text-gray-500'}
                                        `}>
                          {cls.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className={`font-bold ${isActive ? 'text-gray-800' : 'text-gray-600'}`}>
                            {cls.name}
                            {isActive && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Đang xem</span>}
                          </h3>
                          <p className="text-sm text-gray-400">{count} học sinh</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingClass(cls); }}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Đổi tên lớp"
                        >
                          <Edit2 size={18} />
                        </button>

                        {/* Quick Delete All Students */}
                        {count > 0 ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteAllStudentsInClass(cls.id); }}
                            className="p-2 bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors group/trash"
                            title={`Lớp có ${count} học sinh. Bấm để xóa toàn bộ học sinh.`}
                          >
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium hidden group-hover/trash:block">Xóa HS</span>
                              <Trash2 size={18} />
                            </div>
                          </button>
                        ) : (
                          /* Delete Class (Only if empty) */
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteClass(cls.id); }}
                            className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors group/delete"
                            title="Xóa lớp học"
                          >
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold hidden group-hover/delete:block">Xóa Lớp</span>
                              <X size={20} />
                            </div>
                          </button>
                        )}

                        {isActive && <CheckCircle className="text-primary ml-2" size={20} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
              <button onClick={() => setShowClassManager(false)} className="text-gray-500 font-bold hover:text-gray-800">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Class Settings Modal (Edit/Delete Class) */}
      <ClassSettingsModal
        isOpen={!!editingClass}
        onClose={() => setEditingClass(null)}
        className={editingClass?.name || ''}
        onUpdateClassName={handleUpdateCurrentClass}
        onDeleteClass={handleDeleteEditingClass}
      />

      {/* Reward Settings Modal */}
      <RewardSettingsModal
        isOpen={showRewardSettings}
        onClose={() => setShowRewardSettings(false)}
        rewards={rewards}
        onSaveRewards={setRewards}
      />

      {/* Class Statistics Modal */}
      <ClassStatisticsModal
        isOpen={showStatistics}
        onClose={() => setShowStatistics(false)}
        students={filteredStudents}
        className={currentClass?.name || 'Lớp học'}
      />

    </div>
  );
};

export default App;
