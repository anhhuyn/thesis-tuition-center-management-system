// src/components/class/curriculum/CurriculumFormModal.tsx
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  X,
  Save,
  Trash2,
  Plus,
  Clock,
  BookOpen,
  Target,
  Home,
  FolderPlus,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "react-hot-toast";
import type { CurriculumRequest, SessionDetailRequest } from "../../../../../utils/types/curriculum";

// Session Detail Form Component
const SessionDetailForm = ({
  session,
  index,
  onUpdate,
  onRemove,
  isEditing = false,
}: {
  session: SessionDetailRequest & { tempId?: string };
  index: number;
  onUpdate: (data: Partial<SessionDetailRequest>) => void;
  onRemove: () => void;
  isEditing?: boolean;
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="border border-slate-200 rounded-xl bg-white overflow-hidden"
    >
      <div
        className="flex items-center justify-between p-3 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-medium flex items-center justify-center">
            {index + 1}
          </div>
          <input
            type="text"
            placeholder="Tiêu đề buổi học"
            value={session.topic}
            onChange={(e) => onUpdate({ topic: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            className="bg-transparent border-none focus:outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400 w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock size={12} />
            <input
              type="number"
              value={session.durationMinutes || 45}
              onChange={(e) => onUpdate({ durationMinutes: parseInt(e.target.value) || 45 })}
              onClick={(e) => e.stopPropagation()}
              className="w-12 bg-transparent border-none focus:outline-none text-center"
              min={15}
              step={15}
            />
            <span>phút</span>
          </div>
          {!isEditing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-1 text-slate-400 hover:text-red-500 transition-colors rounded-lg"
            >
              <Trash2 size={14} />
            </button>
          )}
          {expanded ? (
            <ChevronUp size={14} className="text-slate-400" />
          ) : (
            <ChevronDown size={14} className="text-slate-400" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1">
                    <Target size={12} />
                    Mục tiêu
                  </label>
                  <textarea
                    value={session.objectives || ""}
                    onChange={(e) => onUpdate({ objectives: e.target.value })}
                    placeholder="Mục tiêu của buổi học..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1">
                    <BookOpen size={12} />
                    Nội dung
                  </label>
                  <textarea
                    value={session.content || ""}
                    onChange={(e) => onUpdate({ content: e.target.value })}
                    placeholder="Nội dung chính của buổi học..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1">
                  <Home size={12} />
                  Bài tập về nhà
                </label>
                <textarea
                  value={session.homework || ""}
                  onChange={(e) => onUpdate({ homework: e.target.value })}
                  placeholder="Giao bài tập về nhà..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1">
                  <FolderPlus size={12} />
                  Tài liệu / Vật liệu
                </label>
                <textarea
                  value={session.materials || ""}
                  onChange={(e) => onUpdate({ materials: e.target.value })}
                  placeholder="Sách, video, tài liệu tham khảo..."
                  rows={1}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">
                    Phương pháp giảng dạy
                  </label>
                  <input
                    type="text"
                    value={session.teachingMethod || ""}
                    onChange={(e) => onUpdate({ teachingMethod: e.target.value })}
                    placeholder="Thuyết trình, thảo luận, ..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">
                    Tiêu chí đánh giá
                  </label>
                  <input
                    type="text"
                    value={session.assessmentCriteria || ""}
                    onChange={(e) => onUpdate({ assessmentCriteria: e.target.value })}
                    placeholder="Bài kiểm tra, thực hành..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface CurriculumFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    curriculum: CurriculumRequest;
    sessions: SessionDetailRequest[];
  }) => Promise<void>;
  initialData?: {
    curriculum: CurriculumRequest;
    sessions: SessionDetailRequest[];
  };
  subjectName?: string;
  isEditing?: boolean;
}

export const CurriculumFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  subjectName,
  isEditing = false,
}: CurriculumFormModalProps) => {
  const [curriculumData, setCurriculumData] = useState<CurriculumRequest>({
    title: "",
    description: "",
    expectedSessions: 0,
    status: "active",
    semester: "",
    schoolYear: "",
    orderIndex: 0,
  });

  const [sessions, setSessions] = useState<(SessionDetailRequest & { tempId?: string })[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [includeSessions, setIncludeSessions] = useState(true);

  useEffect(() => {
    if (initialData) {
      setCurriculumData(initialData.curriculum);
      setSessions(initialData.sessions.map((s, idx) => ({ ...s, tempId: `temp-${idx}` })));
      setIncludeSessions(initialData.sessions.length > 0);
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setCurriculumData({
      title: "",
      description: "",
      expectedSessions: 0,
      status: "active",
      semester: "",
      schoolYear: "",
      orderIndex: 0,
    });
    setSessions([]);
    setIncludeSessions(true);
  };

  const addSession = () => {
    const newSession: SessionDetailRequest & { tempId?: string } = {
      topic: "",
      objectives: "",
      content: "",
      homework: "",
      materials: "",
      durationMinutes: 45,
      teachingMethod: "",
      assessmentCriteria: "",
      tempId: `temp-${Date.now()}-${Math.random()}`,
    };
    setSessions([...sessions, newSession]);
  };

  const updateSession = (index: number, data: Partial<SessionDetailRequest>) => {
    const updated = [...sessions];
    updated[index] = { ...updated[index], ...data };
    setSessions(updated);
    
    // Auto update expectedSessions
    if (!isEditing) {
      setCurriculumData(prev => ({
        ...prev,
        expectedSessions: updated.length,
      }));
    }
  };

  const removeSession = (index: number) => {
    const updated = sessions.filter((_, i) => i !== index);
    setSessions(updated);
    if (!isEditing) {
      setCurriculumData(prev => ({
        ...prev,
        expectedSessions: updated.length,
      }));
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!curriculumData.title.trim()) {
      toast.error("Vui lòng nhập tên lộ trình");
      return;
    }

    if (includeSessions && sessions.length === 0) {
      toast.error("Vui lòng thêm ít nhất một buổi học hoặc bỏ chọn 'Thêm buổi học'");
      return;
    }

    // Validate sessions
    for (let i = 0; i < sessions.length; i++) {
      if (!sessions[i].topic.trim()) {
        toast.error(`Vui lòng nhập tiêu đề cho buổi học ${i + 1}`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        curriculum: {
          ...curriculumData,
          expectedSessions: includeSessions ? sessions.length : curriculumData.expectedSessions,
        },
        sessions: includeSessions ? sessions.map(({ tempId, ...session }) => session) : [],
      };
      await onSubmit(submitData);
      onClose();
      resetForm();
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {isEditing ? "Chỉnh sửa lộ trình" : "Tạo lộ trình mới"}
            </h2>
            {subjectName && (
              <p className="text-sm text-slate-500 mt-0.5">
                Môn học: {subjectName}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Curriculum Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <BookOpen size={16} className="text-indigo-500" />
              Thông tin lộ trình
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tên lộ trình <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={curriculumData.title}
                  onChange={(e) => setCurriculumData({ ...curriculumData, title: e.target.value })}
                  placeholder="VD: Học kỳ 1 - Cơ bản"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Học kỳ
                </label>
                <select
                  value={curriculumData.semester || ""}
                  onChange={(e) => setCurriculumData({ ...curriculumData, semester: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                >
                  <option value="">Chọn học kỳ</option>
                  <option value="1">Học kỳ 1</option>
                  <option value="2">Học kỳ 2</option>
                  <option value="both">Cả năm</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mô tả
              </label>
              <textarea
                value={curriculumData.description || ""}
                onChange={(e) => setCurriculumData({ ...curriculumData, description: e.target.value })}
                placeholder="Mô tả tổng quan về lộ trình học..."
                rows={2}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Năm học
                </label>
                <input
                  type="text"
                  value={curriculumData.schoolYear || ""}
                  onChange={(e) => setCurriculumData({ ...curriculumData, schoolYear: e.target.value })}
                  placeholder="VD: 2024-2025"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Trạng thái
                </label>
                <select
                  value={curriculumData.status}
                  onChange={(e) => setCurriculumData({ ...curriculumData, status: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                >
                  <option value="active">Kích hoạt</option>
                  <option value="draft">Bản nháp</option>
                  <option value="archived">Lưu trữ</option>
                </select>
              </div>
            </div>
          </div>

          {/* Session Details Section */}
          {!isEditing && (
            <div className="border-t border-slate-100 pt-4">
              <label className="flex items-center gap-2 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={includeSessions}
                  onChange={(e) => {
                    setIncludeSessions(e.target.checked);
                    if (!e.target.checked) setSessions([]);
                  }}
                  className="w-4 h-4 text-indigo-500 rounded border-slate-300 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-slate-700">
                  Thêm buổi học ngay (có thể thêm sau)
                </span>
              </label>
            </div>
          )}

          {/* Sessions List */}
          {(includeSessions || isEditing) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Target size={16} className="text-indigo-500" />
                  Danh sách buổi học
                  <span className="text-xs text-slate-400">
                    ({sessions.length} buổi)
                  </span>
                </h3>
                {!isEditing && (
                  <button
                    onClick={addSession}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <Plus size={14} />
                    Thêm buổi học
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {sessions.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                    <AlertCircle size={32} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Chưa có buổi học nào</p>
                    {!isEditing && (
                      <button
                        onClick={addSession}
                        className="mt-2 text-sm text-indigo-500 hover:text-indigo-600"
                      >
                        + Thêm buổi học đầu tiên
                      </button>
                    )}
                  </div>
                ) : (
                  sessions.map((session, idx) => (
                    <SessionDetailForm
                      key={session.tempId || idx}
                      session={session}
                      index={idx}
                      onUpdate={(data) => updateSession(idx, data)}
                      onRemove={() => removeSession(idx)}
                      isEditing={isEditing}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Preview Stats */}
          {includeSessions && sessions.length > 0 && (
            <div className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-xl p-4 border border-indigo-100">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-indigo-500" />
                  <span className="text-slate-600">
                    Tổng thời gian:{" "}
                    <strong className="text-indigo-600">
                      {sessions.reduce((sum, s) => sum + (s.durationMinutes || 45), 0)} phút
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen size={14} className="text-indigo-500" />
                  <span className="text-slate-600">
                    Số buổi: <strong className="text-indigo-600">{sessions.length}</strong>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isEditing ? "Cập nhật" : "Tạo lộ trình"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};