// src/app/components/salary/TeacherAgreementDetail.tsx
import React from 'react';
import { Edit, Trash2, Plus, User, Calendar, DollarSign, BookOpen, ExternalLink, Eye, GraduationCap, Clock, FileText } from 'lucide-react';
import type { TeacherSubject } from '../../../utils/types/teacherSubject';

interface TeacherAgreementDetailProps {
  teacher: {
    teacherId: number;
    teacherName: string;
    teacherAvatar?: string;
    agreements: TeacherSubject[];
  };
  onEdit: (agreement: TeacherSubject) => void;
  onDelete: (id: number) => void;
  onAddAgreement: () => void;
  onViewAll: () => void;
  onAgreementClick: (agreementId: number) => void;
}

export const TeacherAgreementDetail: React.FC<TeacherAgreementDetailProps> = ({
  teacher,
  onEdit,
  onDelete,
  onAddAgreement,
  onViewAll,
  onAgreementClick,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50/50 via-indigo-50/50 to-purple-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 shadow-sm">
              <User className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">{teacher.teacherName}</h2>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                  #{teacher.teacherId}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  {teacher.agreements.length} thỏa thuận
                </span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="text-sm text-blue-600 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Đang hoạt động
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onAddAgreement}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105 text-sm"
            >
              <Plus className="w-4 h-4" />
              Thêm thỏa thuận
            </button>
           
          </div>
        </div>
      </div>

      {/* Agreements List */}
      <div className="p-6">
        {teacher.agreements.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-200">
              <BookOpen className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Chưa có thỏa thuận</h3>
            <p className="text-sm text-gray-400 mb-4">Giáo viên này chưa có thỏa thuận lương nào</p>
            <button
              onClick={onAddAgreement}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mx-auto text-sm"
            >
              <Plus className="w-4 h-4" />
              Thêm thỏa thuận mới
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">
                Tổng số <strong className="text-gray-700">{teacher.agreements.length}</strong> thỏa thuận
              </span>
              <span className="text-xs text-gray-400">Sắp xếp theo ngày tạo</span>
            </div>
            
            <div className="space-y-3">
              {teacher.agreements.map((agreement) => (
                <div
                  key={agreement.id}
                  className="group border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer bg-white"
                  onClick={() => onAgreementClick(agreement.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                          {agreement.subjectName}
                        </span>
                        {agreement.grade && (
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100 flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" />
                            Lớp {agreement.grade}
                          </span>
                        )}
                        <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-100 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          Đang áp dụng
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        <div className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                          <DollarSign className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-600">Mức lương:</span>
                          <span className="font-semibold text-blue-600">{agreement.salaryRate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Ngày tạo:</span>
                          <span className="font-medium text-gray-700">{agreement.createdAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-0.5 ml-4 items-start">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAgreementClick(agreement.id);
                        }}
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(agreement);
                        }}
                        className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        title="Sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                     
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs text-blue-600 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="w-3 h-3" />
                      Click để xem chi tiết
                    </span>
                    <span className="text-xs text-gray-400">ID: {agreement.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};