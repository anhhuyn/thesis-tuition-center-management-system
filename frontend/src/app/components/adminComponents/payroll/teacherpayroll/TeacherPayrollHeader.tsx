// src/components/teacherComponents/payroll/TeacherPayrollHeader.tsx
import { motion } from 'framer-motion';
import { DollarSign, RefreshCw } from 'lucide-react';

interface TeacherPayrollHeaderProps {
  teacherName: string;
  teacherId: number;
  onRefresh: () => void;
}

export const TeacherPayrollHeader = ({ teacherName, teacherId, onRefresh }: TeacherPayrollHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <DollarSign size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Bảng lương của tôi</h1>
            <p className="text-purple-100 mt-1">
              {teacherName} • Mã số: {teacherId}
            </p>
          </div>
        </div>
        
        <button
          onClick={onRefresh}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          title="Làm mới"
        >
          <RefreshCw size={20} />
        </button>
      </div>
    </motion.div>
  );
};