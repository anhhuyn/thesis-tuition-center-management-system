// SessionContentModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, CheckCircle, AlertCircle, List, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { sessionApi } from '../../../../utils/api';
import { curriculumApi } from '../../../../utils/api/curriculum.api';
import type { Subject } from '../../../../utils/types/subject';
import type { Session } from './AttendanceSection';
import type { SessionDetailResponse } from '../../../../utils/types/curriculum';

interface SessionContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
  subject: Subject | null;
  onSaveSuccess: () => void;
}

interface SessionContentData {
  isFollowPlan: boolean;
  plannedSessionDetailId?: number | null;
  actualTopic?: string;
  actualContent?: string;
  actualHomework?: string;
  deviationReason?: string;
  noteForNextSession?: string;
}

export const SessionContentModal: React.FC<SessionContentModalProps> = ({
  isOpen,
  onClose,
  session,
  subject,
  onSaveSuccess
}) => {
  const [isFollowPlan, setIsFollowPlan] = useState<boolean>(true);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SessionDetailResponse[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);
  
  // Actual fields (cho trường hợp dạy lệch)
  const [actualTopic, setActualTopic] = useState('');
  const [actualContent, setActualContent] = useState('');
  const [actualHomework, setActualHomework] = useState('');
  const [deviationReason, setDeviationReason] = useState('');
  const [noteForNextSession, setNoteForNextSession] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Fetch curriculum plans when modal opens
  useEffect(() => {
    if (isOpen && subject?.id) {
      fetchCurriculumPlans();
    }
  }, [isOpen, subject]);

  // Fetch existing content when modal opens
  useEffect(() => {
    if (isOpen && session) {
      fetchExistingContent();
    }
  }, [isOpen, session]);

  const fetchCurriculumPlans = async () => {
    if (!subject?.id) return;
    setLoadingPlans(true);
    try {
      // Lấy danh sách curriculum theo subject
      const curriculums = await curriculumApi.getCurriculumsBySubject(subject.id);
      
      // Lấy tất cả session details từ các curriculum
      let allPlans: SessionDetailResponse[] = [];
      for (const curriculum of curriculums) {
        if (curriculum.status === 'active') { // Chỉ lấy curriculum active
          const details = await curriculumApi.getSessionDetailsByCurriculum(curriculum.id);
          allPlans = [...allPlans, ...details];
        }
      }
      
      // Sắp xếp theo sessionNumber
      allPlans.sort((a, b) => {
        const numA = a.sessionNumber || a.displayOrder || 0;
        const numB = b.sessionNumber || b.displayOrder || 0;
        return numA - numB;
      });
      
      setAvailablePlans(allPlans);
    } catch (error) {
      console.error('Error fetching curriculum plans:', error);
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchExistingContent = async () => {
    if (!session) return;
    setFetching(true);
    try {
      const content = await sessionApi.getSessionContent(session.id);
      setIsFollowPlan(content.isFollowingPlan === true);
      
      if (content.isFollowingPlan === true) {
        // Cần lấy plannedSessionDetailId từ content
        // Bạn cần thêm field plannedSessionDetailId vào SessionContentResponse
        if ((content as any).plannedSessionDetailId) {
          setSelectedPlanId((content as any).plannedSessionDetailId);
        }
      } else {
        setActualTopic(content.displayTopic || '');
        setActualContent(content.displayContent || '');
        setActualHomework(content.displayHomework || '');
        setDeviationReason(content.deviationReason || '');
        setNoteForNextSession(content.noteForNextSession || '');
      }
    } catch (error) {
      console.error('Error fetching session content:', error);
    } finally {
      setFetching(false);
    }
  };

  const getSelectedPlan = () => {
    return availablePlans.find(plan => plan.id === selectedPlanId);
  };

  const handleSubmit = async () => {
  if (!session) return;
  setLoading(true);

  try {
    const followPlan = isFollowPlan === true;
    
    // ✅ Log để kiểm tra selectedPlanId
    console.log('=== CHECKING SELECTED PLAN ===');
    console.log('isFollowPlan:', followPlan);
    console.log('selectedPlanId:', selectedPlanId);
    console.log('selectedPlanId type:', typeof selectedPlanId);
    
    const data: SessionContentData = {
      isFollowPlan: followPlan,
    };

    if (followPlan) {
      // ✅ Dạy đúng kế hoạch: cần gửi plannedSessionDetailId
      if (selectedPlanId) {
        data.plannedSessionDetailId = selectedPlanId;
        console.log('Will send plannedSessionDetailId:', selectedPlanId);
      } else {
        console.error('No selectedPlanId! Available plans:', availablePlans);
        alert('Vui lòng chọn buổi học theo kế hoạch');
        setLoading(false);
        return;
      }
    } else {
      // Dạy lệch: gửi thông tin thực tế
      if (!actualTopic.trim() || !actualContent.trim()) {
        alert('Vui lòng nhập chủ đề và nội dung thực tế');
        setLoading(false);
        return;
      }
      data.actualTopic = actualTopic;
      data.actualContent = actualContent;
      data.actualHomework = actualHomework;
      data.deviationReason = deviationReason;
      data.noteForNextSession = noteForNextSession;
    }

    console.log('Final data to send:', JSON.stringify(data, null, 2));
    const response = await sessionApi.updateActualContent(session.id, data);
    console.log('Update successful:', response);
    
    onSaveSuccess();
    onClose();
  } catch (error: any) {
    console.error('Error saving session content:', error);
    alert(error.response?.data?.message || 'Có lỗi xảy ra khi lưu nội dung buổi học');
  } finally {
    setLoading(false);
  }
};

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/50">
                <BookOpen size={18} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  Cập nhật nội dung buổi học
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {session?.title} - {session?.date}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 max-h-[60vh] overflow-y-auto">
            {fetching ? (
              <div className="space-y-4">
                <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
              </div>
            ) : (
              <div className="space-y-5">
                {/* Follow Plan Toggle */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className={clsx(
                        isFollowPlan ? 'text-emerald-500' : 'text-gray-400'
                      )} />
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Dạy đúng kế hoạch
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setIsFollowPlan(!isFollowPlan);
                        if (!isFollowPlan) {
                          // Khi chuyển sang dạy đúng kế hoạch, reset selected plan
                          setSelectedPlanId(null);
                        }
                      }}
                      className={clsx(
                        "relative w-12 h-6 rounded-full transition-colors duration-200",
                        isFollowPlan ? "bg-indigo-500" : "bg-gray-300 dark:bg-gray-700"
                      )}
                    >
                      <div className={clsx(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200",
                        isFollowPlan ? "translate-x-7" : "translate-x-1"
                      )} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {isFollowPlan 
                      ? "Buổi học sẽ được thực hiện theo đúng kế hoạch đã đề ra" 
                      : "Buổi học có sự điều chỉnh so với kế hoạch ban đầu"}
                  </p>
                </div>

                {/* Khi dạy đúng kế hoạch - Chọn buổi học từ curriculum */}
                {isFollowPlan && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Chọn buổi học theo kế hoạch <span className="text-red-500">*</span>
                    </label>
                    
                    {loadingPlans ? (
                      <div className="space-y-2">
                        <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                        <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                      </div>
                    ) : availablePlans.length > 0 ? (
                      <div className="relative">
                        {/* Dropdown trigger */}
                        <button
                          onClick={() => setShowPlanDropdown(!showPlanDropdown)}
                          className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex-1 text-left">
                            {selectedPlanId ? (
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                    Buổi {getSelectedPlan()?.sessionNumber || getSelectedPlan()?.displayOrder}
                                  </span>
                                  <span className="text-sm text-gray-800 dark:text-gray-200">
                                    {getSelectedPlan()?.topic}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                  {getSelectedPlan()?.content}
                                </p>
                              </div>
                            ) : (
                              <span className="text-gray-400">Chọn buổi học...</span>
                            )}
                          </div>
                          <ChevronDown size={16} className={clsx(
                            "text-gray-400 transition-transform",
                            showPlanDropdown && "rotate-180"
                          )} />
                        </button>

                        {/* Dropdown menu */}
                        {showPlanDropdown && (
                          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg max-h-64 overflow-y-auto">
                            {availablePlans.map((plan) => (
                              <button
                                key={plan.id}
                                onClick={() => {
                                  setSelectedPlanId(plan.id);
                                  setShowPlanDropdown(false);
                                }}
                                className={clsx(
                                  "w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0",
                                  selectedPlanId === plan.id && "bg-indigo-50 dark:bg-indigo-950/30"
                                )}
                              >
                                <div className="flex items-start gap-2">
                                  <CheckCircle size={14} className={clsx(
                                    "mt-0.5 flex-shrink-0",
                                    selectedPlanId === plan.id ? "text-indigo-500" : "text-transparent"
                                  )} />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                        Buổi {plan.sessionNumber || plan.displayOrder}
                                      </span>
                                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        {plan.topic}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                      {plan.content}
                                    </p>
                                    {plan.homework && (
                                      <p className="text-xs text-gray-400 mt-1">
                                        BT: {plan.homework.substring(0, 50)}...
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
                        <List size={32} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Chưa có kế hoạch giảng dạy</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Vui lòng tạo curriculum trước
                        </p>
                      </div>
                    )}

                    {selectedPlanId && (
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl">
                        <h4 className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                          Nội dung kế hoạch:
                        </h4>
                        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                          <p><span className="font-medium">Chủ đề:</span> {getSelectedPlan()?.topic}</p>
                          <p><span className="font-medium">Nội dung:</span> {getSelectedPlan()?.content}</p>
                          <p><span className="font-medium">Bài tập:</span> {getSelectedPlan()?.homework || 'Không có'}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Khi dạy lệch - Nhập thông tin thực tế */}
                {!isFollowPlan && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Actual Topic */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Chủ đề thực tế <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={actualTopic}
                        onChange={(e) => setActualTopic(e.target.value)}
                        placeholder="Nhập chủ đề đã dạy..."
                        className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    {/* Actual Content */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nội dung thực tế <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={actualContent}
                        onChange={(e) => setActualContent(e.target.value)}
                        placeholder="Mô tả nội dung đã dạy..."
                        rows={4}
                        className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    {/* Actual Homework */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bài tập thực tế
                      </label>
                      <textarea
                        value={actualHomework}
                        onChange={(e) => setActualHomework(e.target.value)}
                        placeholder="Bài tập đã giao..."
                        rows={3}
                        className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    {/* Deviation Reason */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Lý do thay đổi
                      </label>
                      <textarea
                        value={deviationReason}
                        onChange={(e) => setDeviationReason(e.target.value)}
                        placeholder="Lý do dạy lệch kế hoạch..."
                        rows={2}
                        className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    {/* Note for next session */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ghi chú cho buổi sau
                      </label>
                      <textarea
                        value={noteForNextSession}
                        onChange={(e) => setNoteForNextSession(e.target.value)}
                        placeholder="Lưu ý cho buổi học tiếp theo..."
                        rows={2}
                        className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || (isFollowPlan && !selectedPlanId) || (!isFollowPlan && (!actualTopic.trim() || !actualContent.trim()))}
              className={clsx(
                "px-5 py-2 rounded-xl btn-gradient text-white font-medium shadow-lg transition-all",
                "hover:shadow-xl hover:shadow-indigo-500/25",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Lưu nội dung"
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};