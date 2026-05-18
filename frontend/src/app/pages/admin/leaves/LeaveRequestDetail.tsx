// src/app/pages/LeaveRequestDetail.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, Mail, Phone, Quote, Sparkles, PlusCircle, Send, CheckCircle2, XCircle, Edit, CalendarDays, Clock3, UserCircle2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { teacherLeaveApi } from '../../../utils/api/teacherLeave.api';
import type { TeacherLeave, PreviewAffectedSessionResponse }from '../../../utils/types/teacherLeave'; 
import { LeaveApprovalModal } from '../../../components/adminComponents/leaves/LeaveApprovalModal';

export const LeaveRequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leave, setLeave] = useState<TeacherLeave | null>(null);
  const [affectedSessions, setAffectedSessions] = useState<PreviewAffectedSessionResponse[]>([]);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    navigate('/admin/teacher/leave');
  };

  const fetchLeaveDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await teacherLeaveApi.getById(Number(id));
      setLeave(data);
      // affectedSessions từ BE trả về (đã map đúng type)
      if (data.affectedSessions && data.affectedSessions.length > 0) {
        setAffectedSessions(data.affectedSessions);
      } else {
        // Nếu chưa có, thử gọi API riêng (chỉ hoạt động với đơn APPROVED)
        try {
          const sessions = await teacherLeaveApi.getAffectedSessions(Number(id));
          // Map từ AffectedSession sang PreviewAffectedSessionResponse (cần bổ sung subjectId)
          const mapped = sessions.map(s => ({
            sessionId: s.sessionId,
            sessionDate: s.sessionDate,
            startTime: s.startTime,
            endTime: s.endTime,
            subjectName: s.subjectName || '',
            subjectId: s.subjectId || 0,
            className: s.className,
            roomName: s.room,
          }));
          setAffectedSessions(mapped);
        } catch (e) {
          // Không có sessions thì để mảng rỗng
          setAffectedSessions([]);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải chi tiết đơn nghỉ');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLeaveDetail();
  }, [fetchLeaveDetail]);

  const handleOpenApproveModal = () => {
    setApprovalModalOpen(true);
  };

  const handleApproveSubmit = async (options: {
    approvalType: 'full_leave' | 'replace';
    replacements: Record<string, string>;
    comment: string;
  }) => {
    if (!leave) return;
    setIsSubmitting(true);
    try {
      let replacementsArray = undefined;
      if (options.approvalType === 'replace') {
        replacementsArray = Object.entries(options.replacements)
          .filter(([, teacherId]) => teacherId && teacherId !== '')
          .map(([sessionId, teacherId]) => ({
            sessionId: Number(sessionId),
            replacementTeacherId: Number(teacherId),
          }));
      }
      const res = await teacherLeaveApi.approve(leave.id, {
        action: 'APPROVED',
        affectType: options.approvalType === 'full_leave' ? 'CANCEL' : 'REPLACE',
        comment: options.comment,
        replacements: replacementsArray,
      });
      if (res.errCode !== 0) throw new Error(res.message);
      setApprovalModalOpen(false);
      // Tải lại dữ liệu
      fetchLeaveDetail();
    } catch (error: any) {
      setError(error.message || 'Phê duyệt thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!leave) return;
    try {
      setIsSubmitting(true);
      const res = await teacherLeaveApi.approve(leave.id, { action: 'REJECTED' });
      if (res.errCode !== 0) throw new Error(res.message);
      fetchLeaveDetail();
    } catch (error: any) {
      setError(error.message || 'Từ chối thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg font-semibold">{error}</p>
          <button onClick={handleBack} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-xl">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!leave) return null;

  const totalDays =
    leave.startDate && leave.endDate
      ? Math.ceil(
          (new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1
      : 0;

  const getStatusStyle = (status?: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  const statusMap: Record<string, string> = {
    PENDING: 'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Từ chối',
    CANCELLED: 'Đã hủy',
  };

  const leaveTypeMap: Record<string, string> = {
    SICK: 'Nghỉ ốm',
    ANNUAL: 'Nghỉ phép năm',
    UNPAID: 'Nghỉ không lương',
    PERSONAL: 'Việc riêng',
    OTHER: 'Khác',
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] font-sans antialiased text-slate-900">
      <main className="max-w-[1440px] mx-auto px-6 md:px-12 py-8">
        {/* Breadcrumbs & Title */}
        <section className="mb-8 space-y-2">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <span className="hover:text-purple-600 cursor-pointer" onClick={handleBack}>
              Quản lý lịch nghỉ
            </span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-medium">Chi tiết đơn</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              Chi tiết đơn xin nghỉ
            </h1>
            <span
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold w-fit ${getStatusStyle(
                leave.status
              )}`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              {statusMap[leave.status] || leave.status}
            </span>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content Left */}
          <div className="lg:col-span-8 space-y-10">
            {/* Teacher Profile Card */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8 hover:shadow-md transition-shadow">
              <div className="w-24 h-24 rounded-2xl bg-purple-50 overflow-hidden ring-4 ring-slate-50 flex-shrink-0">
                <img
                  alt={leave.teacherName}
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBy-hmbQ3Z48uHiDSJqvp74jDdhhn1P5x_vC9KbNkqY_A-qB4O5YeExDWRZmuAnSeBwnJ7FlLiL0_Sojs0l82VAl_JhPPrRDSwCuHMiGUk3nFuXzSX5ierXdHDyJ4pka9xwtIClAHyzY2J-X63e3ssitzp1aW_skM1gcIwVfKP410raDDQFkTYedC0HlTnRw8lTqcxCxYUF0kaiUpmTl6JInDw_MssECU8JrY_g_w9BSNZoZr0fCaKdgjCS1VQ5XdTdoKoyQbd2mu43"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-slate-900">{leave.teacherName}</h2>
                <div className="flex flex-wrap items-center gap-4 mt-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-purple-700 font-semibold">
                    <UserCircle2 className="w-4 h-4" />
                    <span>Mã GV: {leave.teacherId}</span>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-center md:justify-start">
                  <div className="flex items-center justify-center md:justify-start gap-2 text-slate-600 text-sm">
                    <Mail className="w-5 h-5 text-purple-500" />
                    <span>{leave.teacherEmail}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Leave Details Grid */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 text-slate-400">
                <div className="h-px flex-1 bg-slate-200"></div>
                <h3 className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                  Thông tin lịch nghỉ
                </h3>
                <div className="h-px flex-1 bg-slate-200"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <span className="text-slate-500 text-xs font-bold uppercase">Loại nghỉ</span>
                  <p className="text-lg font-bold mt-2 text-slate-900">
                    {leaveTypeMap[leave.leaveType] || leave.leaveType}
                  </p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <span className="text-slate-500 text-xs font-bold uppercase">Thời gian</span>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-slate-700">
                      <CalendarDays className="w-4 h-4 text-purple-500" />
                      <span className="font-semibold">{leave.startDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Clock3 className="w-4 h-4 text-purple-500" />
                      <span className="font-semibold">{leave.endDate}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                  <span className="text-purple-600 text-xs font-bold uppercase">Tổng số ngày</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <p className="text-3xl font-black text-purple-700">{totalDays}</p>
                    <p className="text-slate-900 font-semibold">ngày</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                <span className="text-slate-500 text-xs font-bold uppercase">Lý do nghỉ</span>
                <div className="mt-4 flex gap-4">
                  <Quote className="w-5 h-5 text-purple-400" />
                  <p className="text-slate-700 leading-relaxed italic text-lg">"{leave.reason}"</p>
                </div>
              </div>
            </section>

            {/* Table Affected Sessions */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Tiết dạy bị ảnh hưởng</h3>
                <span className="text-slate-500 text-sm">{affectedSessions.length} tiết học cần xử lý</span>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                    <tr>
                      <th className="px-6 py-4">Thời gian</th>
                      <th className="px-6 py-4">Lớp học</th>
                      <th className="px-6 py-4">Phòng</th>
                      <th className="px-6 py-4 text-center">Trạng thái thay thế</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {affectedSessions.length > 0 ? (
                      affectedSessions.map((session, idx) => (
                        <tr key={session.sessionId || idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900">{session.sessionDate}</span>
                              <span className="text-slate-500 text-xs">
                                {session.startTime} - {session.endTime}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <span className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                                {session.className?.charAt(0) || '?'}
                              </span>
                              <span className="font-semibold text-slate-900">{session.className || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-slate-600 font-medium">{session.roomName || 'N/A'}</td>
                          <td className="px-6 py-5 text-center">
                            {session.replacementTeacherName ? (
                              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                                {session.replacementTeacherName}
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                                Chưa phân công
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-slate-500">
                          Không có tiết học bị ảnh hưởng
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Sidebar Right */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Leave Balance - giữ nguyên hoặc bỏ */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">
                Quỹ phép còn lại
              </h4>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">Phép năm</span>
                  <span className="text-lg font-bold text-purple-700">
                    09/12 <span className="text-xs text-slate-400 font-normal italic">ngày</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full shadow-[0_0_8px_rgba(147,51,234,0.3)]"
                    style={{ width: '75%' }}
                  ></div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-700 font-medium">Nghỉ ốm (có phép)</span>
                  <span className="text-lg font-bold text-slate-900">05/05</span>
                </div>
              </div>
            </div>

            {/* Approval Actions */}
            {leave.status === 'PENDING' && (
              <>
                <div className="flex flex-col gap-4">
                  <button
                    onClick={handleOpenApproveModal}
                    className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold text-lg hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Phê duyệt đơn
                  </button>
                  <button
                    onClick={handleReject}
                    className="w-full py-4 bg-white text-red-600 border border-red-100 rounded-2xl font-bold text-lg hover:bg-red-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    <XCircle className="w-5 h-5" />
                    Từ chối
                  </button>
                </div>

                {/* AI Suggestions - giữ nguyên hoặc bỏ */}
                <div className="bg-purple-600 from-purple-50 to-white p-8 rounded-2xl border border-purple-100/50">
                  <div className="flex items-center gap-3 mb-6 text-purple-700">
                    <Sparkles className="w-5 h-5" />
                    <h4 className="font-bold">Gợi ý giáo viên thay thế</h4>
                  </div>
                  <div className="space-y-4">
                    {[
                      {
                        name: 'Lê Thị Thu',
                        info: 'Toán học • Đang rảnh tiết 1-2',
                        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJc2Bbm2B_tWkOCGizHkP2dYo66E7Q1I7_Mozs91pqRjgxAR5wjJ2w654NLhvhtXOvHUJOEGYBWRfp-nOUU6ADvoYR_KQtRJNKNAe8Oq8VPpa44UZkhd6L_8vcyICOB-8eCXhmqB8tBpuOx3kZnPIJqNX9lJpbRTU9bEB0JnPst85Klapx0wd13K8ZFQY_7YLZV6P6IfeuzQkWiTHjn7ots7aMukjjD5OpQi9Veki3bUROIS3pZ9hA9h5IsYN_VPKpaws8_6DyENuA',
                      },
                      {
                        name: 'Trần Hoàng Nam',
                        info: 'Toán học • Cùng tổ bộ môn',
                        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAV0FOUwRYG1nmHFckjgrJhg7zn_zwYspyOnnIqbCcZkGgwEdH4_Jg8qDigRq9_MRkE-Hfg8Oi1dW__MCMirVaQB3nCjFQqH5eArnY6PU6scsi9T0ehXrufbBLh3pimWoyJbi6nGW7ru16zvpbyAyhO8Mio9hCJX2kBGmPYO6szInOl9To7s6iwyrhijkcdm3reXv6_RsUUSCCD8ZxeU5QjzTvNGIHO2CxDPIIyor050-WTIevFvVr6jSjrPE2QDGOjsLT6y_CFIiPd',
                      },
                    ].map((teacher, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-white rounded-xl border border-slate-100 hover:border-purple-300 cursor-pointer transition-all flex items-center gap-4 group"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
                          <img alt={teacher.name} className="w-full h-full object-cover" src={teacher.img} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900 group-hover:text-purple-600">
                            {teacher.name}
                          </p>
                          <p className="text-[11px] text-slate-500">{teacher.info}</p>
                        </div>
                        <PlusCircle className="w-5 h-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div className="px-2 space-y-6">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Lịch sử xử lý</h4>
                  <div className="relative space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                    <div className="relative pl-8">
                      <span className="absolute left-0 top-1 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center ring-4 ring-white">
                        <Edit className="w-4 h-4" />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Đã cập nhật lý do</p>
                        <p className="text-xs text-slate-500">Nguyễn Văn An • Hôm nay, 08:45</p>
                      </div>
                    </div>
                    <div className="relative pl-8">
                      <span className="absolute left-0 top-1 w-6 h-6 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center ring-4 ring-white">
                        <Send className="w-4 h-4" />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Tạo đơn nghỉ phép</p>
                        <p className="text-xs text-slate-500">Nguyễn Văn An • Hôm qua, 16:30</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </aside>
        </div>
      </main>

      <LeaveApprovalModal
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        leaveId={leave?.id ?? 0}
        teacherName={leave?.teacherName || ''}
        leaveDate={leave ? `${leave.startDate} - ${leave.endDate}` : ''}
        reason={leave?.reason || ''}
        affectedSessions={affectedSessions}
        onApprove={handleApproveSubmit}
        onReject={handleReject}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};