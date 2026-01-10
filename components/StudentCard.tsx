import React from 'react';
import { Student, LEVELS } from '../types';
import { getNextLevelInfo, getAvatarUrl } from '../utils';
import { MoreHorizontal } from 'lucide-react';

interface StudentCardProps {
  student: Student;
  onAdjustPoint: (student: Student, amount: number) => void;
  onClick: (student: Student) => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, onAdjustPoint, onClick }) => {
  const levelConfig = LEVELS[student.level];
  const nextLevelInfo = getNextLevelInfo(student.totalPoints);
  
  const handlePointChange = (amount: number) => {
    onAdjustPoint(student, amount);
  };

  return (
    <div 
      className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 relative group cursor-pointer h-full flex flex-col"
      onClick={() => onClick(student)}
    >
      {/* Header: Level & Name */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3 w-full">
          <div className="relative flex-shrink-0">
            <img 
              src={getAvatarUrl(student.name, student.avatar)} 
              alt={student.name} 
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-50 bg-gray-100" 
            />
            <div className={`absolute -top-1 -right-1 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-xl border border-gray-50 z-10 text-shadow-sm`}>
              {levelConfig.icon}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-bold text-gray-800 text-lg leading-tight group-hover:text-primary transition-colors truncate">
              {student.name}
            </h3>
            <p className={`font-semibold text-2xl mt-1 ${student.totalPoints < 0 ? 'text-danger' : 'text-primary'}`}>
              {student.totalPoints} <span className="text-xs text-gray-400 font-normal">điểm</span>
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5 font-medium">
          <span>{levelConfig.name}</span>
          <span>
             {nextLevelInfo.remaining > 0 
                ? `Còn ${nextLevelInfo.remaining} → ${nextLevelInfo.nextLevelName}`
                : <span className="text-amber-500 font-bold">Max Level!</span>
             }
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${nextLevelInfo.percent}%` }}
          />
        </div>
      </div>

      {/* Quick Actions (Stop propagation to prevent opening modal) */}
      <div className="grid grid-cols-2 gap-2 mt-auto pt-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-1 justify-between bg-green-50 rounded-xl p-1.5 border border-green-100">
           {[1, 2, 5].map(amt => (
             <button 
                key={amt}
                onClick={() => handlePointChange(amt)} 
                className="flex-1 h-8 rounded-lg hover:bg-white hover:shadow-sm text-green-600 font-bold text-xs transition-all flex items-center justify-center"
             >
                +{amt}
             </button>
           ))}
        </div>
        <div className="flex gap-1 justify-between bg-red-50 rounded-xl p-1.5 border border-red-100">
           {[-1, -2, -5].map(amt => (
             <button 
                key={amt}
                onClick={() => handlePointChange(amt)} 
                className="flex-1 h-8 rounded-lg hover:bg-white hover:shadow-sm text-red-500 font-bold text-xs transition-all flex items-center justify-center"
             >
                {amt}
             </button>
           ))}
        </div>
      </div>
      
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-300">
        <MoreHorizontal size={20} />
      </div>
    </div>
  );
};

export default StudentCard;