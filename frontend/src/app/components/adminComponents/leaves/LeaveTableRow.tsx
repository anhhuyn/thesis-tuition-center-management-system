// src/app/components/leaves/LeaveTableRow.tsx

import React from 'react';
import {
  Check,
  X,
  MoreVertical,
  Mail,
  Calendar,
  Clock,
  User,
  Eye
} from 'lucide-react';

import type { LeaveRequest } from '../../../utils/types/teacherLeave';

interface LeaveTableRowProps {
  leave: LeaveRequest;
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewDetail?: (id: string) => void;
}

export const LeaveTableRow: React.FC<LeaveTableRowProps> = ({
  leave,
  isSelected,
  onSelect,
  onApprove,
  onReject,
  onViewDetail,
}) => {

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Chờ duyệt':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Đã duyệt':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Từ chối':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'Chờ duyệt':
        return 'bg-amber-500';
      case 'Đã duyệt':
        return 'bg-emerald-500';
      case 'Từ chối':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getLeaveTypeStyle = (type: string) => {
    switch (type) {
      case 'Nghỉ phép năm':
        return 'bg-blue-50 text-blue-700';
      case 'Nghỉ ốm':
        return 'bg-purple-50 text-purple-700';
      case 'Việc riêng':
        return 'bg-orange-50 text-orange-700';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onSelect(leave.id, e.target.checked);
  };

  const handleApproveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onApprove(leave.id);
  };

  const handleRejectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReject(leave.id);
  };

  const handleViewDetailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetail?.(leave.id);
  };

  return (
    <tr
      onClick={() => onViewDetail?.(leave.id)}
      className="hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <td
        className="p-5 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
        />
      </td>

      <td className="p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-100 flex items-center justify-center">
            <User className="w-5 h-5 text-purple-600" />
          </div>

          <div>
            <p className="font-semibold text-gray-900">
              {leave.teacherName}
            </p>

            <div className="flex items-center gap-2 mt-0.5">
              <Mail className="w-3 h-3 text-gray-400" />

              <p className="text-xs text-gray-500">
                {leave.department}
              </p>
            </div>
          </div>
        </div>
      </td>

      <td className="p-5 text-gray-600 font-medium">
        {leave.teacherCode}
      </td>

      <td className="p-5">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getLeaveTypeStyle(
            leave.leaveType
          )}`}
        >
          {leave.leaveType}
        </span>
      </td>

      <td className="p-5 text-gray-700 font-medium">
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          {leave.startDate}
          {leave.endDate && ` - ${leave.endDate}`}
        </div>
      </td>

      <td className="p-5 text-gray-700 font-medium">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          {leave.days} ngày
        </div>
      </td>

      <td className="p-5">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(
            leave.status
          )}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${getStatusDot(
              leave.status
            )}`}
          ></span>

          {leave.status}
        </span>
      </td>

      <td
        className="p-5 text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end gap-2">
          {leave.status === 'Chờ duyệt' && (
            <>
              <button
                onClick={handleApproveClick}
                className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors"
                title="Duyệt"
              >
                <Check className="w-5 h-5" />
              </button>

              <button
                onClick={handleRejectClick}
                className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                title="Từ chối"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          )}

          {leave.status !== 'Chờ duyệt' && (
            <>
              <button
                onClick={handleViewDetailClick}
                className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Xem chi tiết"
              >
                <Eye className="w-5 h-5" />
              </button>

              <button className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};