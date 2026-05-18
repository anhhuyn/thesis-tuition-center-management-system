// src/app/components/leaves/CreateLeaveModal.tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const CreateLeaveModal: React.FC<CreateLeaveModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    teacherId: 0,
    startDate: '',
    endDate: '',
    leaveType: 'ANNUAL',
    reason: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Tạo đơn nghỉ mới</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Mã giáo viên</label>
            <input
              type="number"
              required
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: parseInt(e.target.value) })}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ngày bắt đầu</label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ngày kết thúc</label>
            <input
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Loại nghỉ</label>
            <select
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
              className="w-full border rounded-lg p-2"
            >
              <option value="ANNUAL">Nghỉ phép năm</option>
              <option value="SICK">Nghỉ ốm</option>
              <option value="PERSONAL">Việc riêng</option>
              <option value="UNPAID">Nghỉ không lương</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Lý do</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full border rounded-lg p-2"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg">Tạo</button>
          </div>
        </form>
      </div>
    </div>
  );
};