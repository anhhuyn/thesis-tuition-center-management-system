// src/components/class/curriculum/SessionFormModal.tsx
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  X,
  Save,
  Trash2,
  Clock,
  BookOpen,
  Target,
  Home,
  FolderPlus,
  Loader2,
  Sparkles,
  FileText,
  GraduationCap,
  Award,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Mic,
  Users,
  PenTool,
  Video,
  Link2,
  Calendar,
  BarChart,
  Star,
} from "lucide-react";
import { toast } from "react-hot-toast";
import type { SessionDetailRequest, SessionDetailResponse } from "../../../../../utils/types/curriculum";

interface SessionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SessionDetailRequest) => Promise<void>;
  onDelete?: () => Promise<void>;
  initialData?: SessionDetailResponse;
  curriculumTitle?: string;
  sessionIndex?: number;
}

export const SessionFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  initialData,
  curriculumTitle,
  sessionIndex,
}: SessionFormModalProps) => {
  const [formData, setFormData] = useState<SessionDetailRequest>({
    topic: initialData?.topic || "",
    objectives: initialData?.objectives || "",
    content: initialData?.content || "",
    homework: initialData?.homework || "",
    materials: initialData?.materials || "",
    durationMinutes: initialData?.durationMinutes || 45,
    teachingMethod: initialData?.teachingMethod || "",
    assessmentCriteria: initialData?.assessmentCriteria || "",
    sessionNumber: initialData?.sessionNumber || undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');

  // Auto-save draft
  useEffect(() => {
    if (isOpen && !initialData) {
      const draft = localStorage.getItem('session_draft');
      if (draft) {
        const shouldLoad = window.confirm('Bạn có muốn khôi phục dữ liệu đã soạn thảo trước đó?');
        if (shouldLoad) {
          try {
            const parsed = JSON.parse(draft);
            setFormData(prev => ({ ...prev, ...parsed }));
          } catch (e) {}
        }
      }
    }
  }, [isOpen]);

  // Save draft
  useEffect(() => {
    if (isOpen && !initialData && formData.topic) {
      const timeout = setTimeout(() => {
        localStorage.setItem('session_draft', JSON.stringify(formData));
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [formData, isOpen, initialData]);

  const handleSubmit = async () => {
    if (!formData.topic.trim()) {
      toast.error("Vui lòng nhập tiêu đề buổi học");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      toast.success(initialData ? "Đã cập nhật buổi học" : "Đã thêm buổi học mới");
      localStorage.removeItem('session_draft');
      onClose();
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm("Bạn có chắc chắn muốn xóa buổi học này?")) return;

    setIsDeleting(true);
    try {
      await onDelete();
      toast.success("Đã xóa buổi học");
      onClose();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa");
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const inputClasses = (isFocused: boolean, hasError?: boolean) => `
    w-full px-4 py-3 
    bg-slate-50/50
    border-2 ${isFocused ? 'border-indigo-400 shadow-sm' : hasError ? 'border-red-300' : 'border-slate-200'}
    rounded-xl
    text-slate-700
    placeholder:text-slate-400
    transition-all duration-200
    focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400
    hover:border-slate-300
    text-base
  `;

  const labelClasses = "block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2";

  const FieldTooltip = ({ text }: { text: string }) => (
    <div className="group relative inline-flex">
      <HelpCircle size={14} className="text-slate-400 cursor-help hover:text-indigo-500 transition-colors" />
      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:block z-10">
        <div className="bg-slate-800 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
          {text}
        </div>
      </div>
    </div>
  );

  const QuickTemplate = ({ field, template }: { field: keyof SessionDetailRequest, template: string }) => (
    <button
      onClick={() => setFormData(prev => ({ ...prev, [field]: template }))}
      className="text-xs text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-lg transition-colors"
    >
      Gợi ý
    </button>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-black/50 via-black/40 to-black/50 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.34, 1.2, 0.64, 1],
              type: "spring",
              damping: 25,
              stiffness: 300
            }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header with Gradient */}
            <div className="relative btn-gradient px-8 pt-8 pb-6">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
              
              <div className="relative flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                      <Sparkles size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-white">
                        {initialData ? "Chỉnh sửa buổi học" : "Thêm buổi học mới"}
                      </h2>
                      {curriculumTitle && (
                        <p className="text-white/80 text-sm mt-1 flex items-center gap-1">
                          <ChevronRight size={14} />
                          {curriculumTitle}
                        </p>
                      )}
                    </div>
                  </div>
                  {sessionIndex !== undefined && initialData?.topic && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-xl">
                      <span className="text-xs font-semibold text-white">
                        Buổi {sessionIndex + 1}
                      </span>
                      <span className="text-xs text-white/60">•</span>
                      <span className="text-xs text-white/90">
                        {initialData.topic}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-8 pt-4 border-b border-slate-100 bg-white">
              <button
                onClick={() => setActiveTab('basic')}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 ${
                  activeTab === 'basic'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                Thông tin cơ bản
              </button>
              <button
                onClick={() => setActiveTab('advanced')}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 ${
                  activeTab === 'advanced'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                Chi tiết nâng cao
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 bg-gradient-to-b from-white to-slate-50/30">
              {activeTab === 'basic' ? (
                <>
                  {/* Topic - Main Field */}
                  <div className="group space-y-2">
                    <div className="flex items-center justify-between">
                      <label className={labelClasses}>
                        <FileText size={18} className="text-indigo-500" />
                        Tiêu đề buổi học
                        <span className="text-red-400 text-sm">*</span>
                        <FieldTooltip text="Tiêu đề nên ngắn gọn, rõ ràng và hấp dẫn" />
                      </label>
                      <QuickTemplate field="topic" template="Bài 1: Khám phá thế giới [Chủ đề]" />
                    </div>
                    <input
                      type="text"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      onFocus={() => setFocusedField('topic')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="VD: 🚀 Bài 1: Hành trình khám phá lập trình Python"
                      className={inputClasses(focusedField === 'topic')}
                    />
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">
                        {formData.topic.length}/100 ký tự
                      </span>
                      {formData.topic && (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          Đã nhập
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Duration & Session Number with visual indicators */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className={labelClasses}>
                        <Clock size={18} className="text-indigo-500" />
                        Thời lượng
                      </label>
                      <div className="relative group">
                        <input
                          type="number"
                          value={formData.durationMinutes}
                          onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 45 })}
                          min={15}
                          step={15}
                          className={inputClasses(false)}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                          phút
                        </span>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {[30, 45, 60, 90].map(mins => (
                          <button
                            key={mins}
                            onClick={() => setFormData({ ...formData, durationMinutes: mins })}
                            className={`text-xs px-2 py-1 rounded-lg transition-all ${
                              formData.durationMinutes === mins
                                ? 'bg-indigo-100 text-indigo-700 font-medium'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {mins}'
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={labelClasses}>
                        <GraduationCap size={18} className="text-indigo-500" />
                        Số thứ tự (PPCT)
                        <FieldTooltip text="Phân phối chương trình, để trống để tự động sắp xếp" />
                      </label>
                      <input
                        type="number"
                        value={formData.sessionNumber || ""}
                        onChange={(e) => setFormData({ ...formData, sessionNumber: e.target.value ? parseInt(e.target.value) : undefined })}
                        placeholder="Tự động"
                        className={inputClasses(false)}
                      />
                    </div>
                  </div>

                  {/* Objectives with rich formatting hints */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className={labelClasses}>
                        <Target size={18} className="text-indigo-500" />
                        Mục tiêu buổi học
                        <FieldTooltip text="Sử dụng các động từ hành động cụ thể, đo lường được" />
                      </label>
                      <div className="flex gap-2">
                        <QuickTemplate field="objectives" template="• Kiến thức: Hiểu được...\n• Kỹ năng: Thực hiện được...\n• Thái độ: Hình thành thói quen..." />
                      </div>
                    </div>
                    <textarea
                      value={formData.objectives || ""}
                      onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                      placeholder="🎯 Sau buổi học, học sinh có thể:&#10;• Hiểu được khái niệm cơ bản về...&#10;• Áp dụng được... vào giải quyết vấn đề&#10;• Phân tích và đánh giá được..."
                      rows={4}
                      className={inputClasses(focusedField === 'objectives') + ' resize-none font-mono text-sm'}
                    />
                    <div className="flex gap-3 text-xs text-slate-400">
                      <span>💡 Gợi ý: Sử dụng mô hình SMART</span>
                      <span>📊 Nên có 3-5 mục tiêu</span>
                    </div>
                  </div>

                  {/* Content with structure helper */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className={labelClasses}>
                        <BookOpen size={18} className="text-indigo-500" />
                        Nội dung chi tiết
                      </label>
                      <button
                        onClick={() => {
                          const structure = "1. Mở bài: (5 phút)\n   - Ổn định lớp\n   - Giới thiệu bài mới\n\n2. Nội dung chính: (30 phút)\n   - Phần 1: ...\n   - Phần 2: ...\n\n3. Thực hành: (10 phút)\n   - Bài tập nhóm\n\n4. Tổng kết: (5 phút)\n   - Củng cố kiến thức\n   - Dặn dò";
                          setFormData({ ...formData, content: structure });
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg"
                      >
                        📋 Chèn cấu trúc mẫu
                      </button>
                    </div>
                    <textarea
                      value={formData.content || ""}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="1. Phần 1: Giới thiệu (15 phút)&#10;2. Phần 2: Nội dung chính (60 phút)&#10;3. Phần 3: Thực hành (30 phút)&#10;4. Phần 4: Tổng kết (15 phút)"
                      rows={6}
                      className={inputClasses(focusedField === 'content') + ' resize-none font-mono text-sm'}
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Homework */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className={labelClasses}>
                        <Home size={18} className="text-indigo-500" />
                        Bài tập về nhà
                        <FieldTooltip text="Giao bài tập phù hợp với thời gian và trình độ học sinh" />
                      </label>
                      <QuickTemplate field="homework" template="📚 Bài tập bắt buộc:\n• ...\n\n⭐ Bài tập nâng cao:\n• ...\n\n🔍 Bài tập nghiên cứu:\n• ..." />
                    </div>
                    <textarea
                      value={formData.homework || ""}
                      onChange={(e) => setFormData({ ...formData, homework: e.target.value })}
                      placeholder="📚 Bài tập bắt buộc:&#10;• Đọc chương 1-3 sách giáo khoa&#10;• Hoàn thành bài tập số 1-5 trang 45&#10;&#10;⭐ Bài tập nâng cao:&#10;• Giải bài toán mở rộng số 6&#10;&#10;🔍 Chuẩn bị cho buổi sau:&#10;• Thuyết trình nhóm về chủ đề..."
                      rows={4}
                      className={inputClasses(focusedField === 'homework') + ' resize-none'}
                    />
                  </div>

                  {/* Materials */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className={labelClasses}>
                        <FolderPlus size={18} className="text-indigo-500" />
                        Tài liệu & học liệu
                        <FieldTooltip text="Thêm link Google Drive, YouTube, hoặc tài liệu tham khảo" />
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setFormData({ ...formData, materials: (formData.materials || '') + '\n• 📄 Slide bài giảng' })}
                          className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg"
                        >
                          + Slide
                        </button>
                        <button
                          onClick={() => setFormData({ ...formData, materials: (formData.materials || '') + '\n• 🎥 Video: ' })}
                          className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg"
                        >
                          + Video
                        </button>
                        <button
                          onClick={() => setFormData({ ...formData, materials: (formData.materials || '') + '\n• 🔗 Link: ' })}
                          className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg"
                        >
                          + Link
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={formData.materials || ""}
                      onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                      placeholder="📖 Sách: 'Lập trình cơ bản' - Chương 1&#10;🎥 Video: https://youtube.com/...&#10;📊 Slide bài giảng&#10;💻 Mã nguồn mẫu&#10;🔗 Tài liệu tham khảo: ..."
                      rows={4}
                      className={inputClasses(focusedField === 'materials') + ' resize-none'}
                    />
                  </div>

                  {/* Teaching Method & Assessment - Enhanced */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className={labelClasses}>
                        <Mic size={18} className="text-indigo-500" />
                        Phương pháp giảng dạy
                      </label>
                      <select
                        value={formData.teachingMethod || ""}
                        onChange={(e) => setFormData({ ...formData, teachingMethod: e.target.value })}
                        className={inputClasses(false)}
                      >
                        <option value="">Chọn phương pháp...</option>
                        <option value="Thuyết trình + Thảo luận">🎤 Thuyết trình + Thảo luận</option>
                        <option value="Dạy học dự án">📁 Dạy học dự án</option>
                        <option value="Hoạt động nhóm">👥 Hoạt động nhóm</option>
                        <option value="Nghiên cứu tình huống">🔍 Nghiên cứu tình huống</option>
                        <option value="Thực hành - Trải nghiệm">🖐️ Thực hành - Trải nghiệm</option>
                        <option value="Lớp học đảo ngược">🔄 Lớp học đảo ngược</option>
                      </select>
                      <div className="flex gap-2 mt-2">
                        {['Thuyết trình', 'Thảo luận', 'Dự án', 'Nhóm'].map(method => (
                          <button
                            key={method}
                            onClick={() => setFormData({ ...formData, teachingMethod: method })}
                            className="text-xs px-2 py-1 bg-slate-100 hover:bg-indigo-100 rounded-lg transition-colors"
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={labelClasses}>
                        <Award size={18} className="text-indigo-500" />
                        Tiêu chí đánh giá
                      </label>
                      <select
                        value={formData.assessmentCriteria || ""}
                        onChange={(e) => setFormData({ ...formData, assessmentCriteria: e.target.value })}
                        className={inputClasses(false)}
                      >
                        <option value="">Chọn hình thức đánh giá...</option>
                        <option value="Bài kiểm tra 15 phút">📝 Bài kiểm tra 15 phút</option>
                        <option value="Bài kiểm tra 45 phút">📄 Bài kiểm tra 45 phút</option>
                        <option value="Thực hành trên máy">💻 Thực hành trên máy</option>
                        <option value="Thuyết trình nhóm">🎤 Thuyết trình nhóm</option>
                        <option value="Sản phẩm dự án">🎨 Sản phẩm dự án</option>
                        <option value="Rubric đánh giá">📊 Rubric đánh giá</option>
                      </select>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                        <BarChart size={12} />
                        <span>Đánh giá quá trình: 40% | Đánh giá cuối kỳ: 60%</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Progress indicator */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>Tiến độ hoàn thành</span>
                  <span className="font-medium text-indigo-600">
                    {Object.values(formData).filter(v => v && v !== "" && v !== 45).length}/8 trường
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(Object.values(formData).filter(v => v && v !== "" && v !== 45).length / 8) * 100}%` }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-8 py-6 border-t border-slate-200 bg-white">
              <div>
                {onDelete && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="group flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                    )}
                    Xóa buổi học
                  </motion.button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200"
                >
                  Hủy bỏ
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="relative group flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} className="group-hover:scale-110 transition-transform" />
                  )}
                  {initialData ? "Cập nhật" : "Thêm mới"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};