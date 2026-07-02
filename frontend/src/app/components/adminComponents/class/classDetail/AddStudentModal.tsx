// AddStudentModal.tsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, UserPlus, School, Calendar, Users, ChevronRight, Check, CheckSquare, Square } from "lucide-react";
import { studentSubjectApi } from "../../../../utils/api";
import type { StudentSubject } from "../../../../utils/types/studentSubject";
import { useOutletContext } from "react-router-dom";
import { cn } from "../../../../utils/cn";

type Props = {
  open: boolean;
  onClose: () => void;
  subjectId: number;
  grade: string;
  existingStudentIds: number[];
  onSuccess: () => void;
};

export const AddStudentModal = ({
  open,
  onClose,
  subjectId,
  grade,
  existingStudentIds,
  onSuccess,
}: Props) => {
  const [students, setStudents] = useState<StudentSubject[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const { setAlert } = useOutletContext<any>();

  const filteredStudents = students.filter(
    (s) => !existingStudentIds.includes(s.id)
  );

  const searchedStudents = filteredStudents.filter((s) =>
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset selection when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedIds(new Set());
    }
  }, [open]);

  useEffect(() => {
    if (!open || !grade) return;

    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await studentSubjectApi.getStudentsByGrade(grade);
        setStudents(res.data);
      } catch (err) {
        console.error(err);
        setAlert?.({
          type: "error",
          message: "Không thể tải danh sách học sinh",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
    setSearchTerm("");
    setSelectedIds(new Set());
  }, [grade, open, setAlert]);

  // Toggle select a student
  const toggleSelect = (studentId: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedIds(newSelected);
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedIds.size === searchedStudents.length && searchedStudents.length > 0) {
      setSelectedIds(new Set());
    } else {
      const allIds = new Set(searchedStudents.map(s => s.id));
      setSelectedIds(allIds);
    }
  };

  // Add all selected students
  const handleAddSelected = async () => {
    if (selectedIds.size === 0) {
      setAlert?.({
        type: "warning",
        message: "Vui lòng chọn ít nhất một học sinh",
      });
      return;
    }

    try {
      setAdding(true);

      // Add students one by one or batch
      const promises = Array.from(selectedIds).map(studentId =>
        studentSubjectApi.addStudentToSubject({
          studentId,
          subjectId,
        })
      );

      await Promise.all(promises);

      setAlert?.({
        type: "success",
        message: `Đã thêm thành công ${selectedIds.size} học sinh vào lớp`,
      });

      setSelectedIds(new Set());
      onSuccess();
    } catch (err: any) {
      setAlert?.({
        type: "error",
        message: err?.response?.data?.message || "Có lỗi xảy ra trong quá trình thêm học sinh",
      });
    } finally {
      setAdding(false);
    }
  };

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      } as any,
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      } as any,
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.03, duration: 0.2 },
    }),
  };

  if (!open) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER - Gradient */}
          <div className="relative btn-gradient px-5 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                  <UserPlus size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Thêm học sinh</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <School size={13} className="text-white/70" />
                    <span className="text-xs text-white/80">Lớp {grade}</span>
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                    <Users size={13} className="text-white/70" />
                    <span className="text-xs text-white/80">
                      {filteredStudents.length} học sinh
                    </span>
                    {selectedIds.size > 0 && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-white/30" />
                        <span className="text-xs font-semibold text-white">
                          Đã chọn: {selectedIds.size}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative circles */}
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-white/5 rounded-full" />
            <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-white/5 rounded-full" />
          </div>

          {/* SEARCH BAR */}
          <div className="px-5 pt-3 pb-2.5 border-b border-slate-100 bg-white">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={16} />
              <input
                type="text"
                placeholder="Tìm kiếm học sinh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white transition-all"
              />
              {searchTerm && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 inset-y-0 flex items-center justify-center p-1 rounded-full hover:bg-slate-200 transition-colors"
                  type="button"
                >
                  <X size={14} className="text-slate-400 hover:text-slate-600" />
                </motion.button>
              )}
            </div>
          </div>

          {/* LIST HEADER with Select All */}
          <div className="px-5 py-2 bg-gradient-to-r from-slate-50/80 to-violet-50/30 border-b border-slate-100">
            <div className="grid grid-cols-12 gap-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider items-center">
              <div className="col-span-1 flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleSelectAll}
                  className="p-0.5 rounded hover:bg-violet-100 transition-colors"
                  type="button"
                  disabled={searchedStudents.length === 0}
                >
                  {selectedIds.size === searchedStudents.length && searchedStudents.length > 0 ? (
                    <CheckSquare size={16} className="text-violet-600" />
                  ) : (
                    <Square size={16} className="text-slate-400" />
                  )}
                </motion.button>
              </div>
              <div className="col-span-6 flex items-center gap-1.5">
                <Users size={11} />
                Thông tin học sinh
              </div>
              <div className="col-span-3 flex items-center gap-1.5">
                <School size={11} />
                Trường
              </div>
              <div className="col-span-2 text-center">Trạng thái</div>
            </div>
          </div>

          {/* LIST CONTENT */}
          <div className="max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent hover:scrollbar-thumb-slate-300">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="relative">
                  <div className="w-10 h-10 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-violet-600 rounded-full animate-pulse" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3 font-medium">Đang tải danh sách...</p>
              </div>
            ) : searchedStudents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-10"
              >
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                  <Search size={24} className="text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">
                  {searchTerm ? "Không tìm thấy học sinh" : "Không có học sinh nào"}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {searchTerm ? "Thử tìm kiếm với từ khóa khác" : "Tất cả học sinh đã được thêm"}
                </p>
                {searchTerm && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSearchTerm("")}
                    className="text-xs text-violet-600 hover:text-violet-700 font-medium mt-2 flex items-center gap-1"
                    type="button"
                  >
                    Xóa tìm kiếm
                    <X size={12} />
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <div className="divide-y divide-slate-50">
                {searchedStudents.map((s, index) => (
                  <motion.div
                    key={s.id}
                    custom={index}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className={cn(
                      "px-5 py-2.5 hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-transparent transition-all group cursor-pointer",
                      selectedIds.has(s.id) && "bg-violet-50/50"
                    )}
                    onClick={() => toggleSelect(s.id)}
                  >
                    <div className="grid grid-cols-12 gap-3 items-center">
                      {/* CHECKBOX */}
                      <div className="col-span-1 flex justify-center">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={cn(
                            "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                            selectedIds.has(s.id)
                              ? "bg-violet-600 border-violet-600"
                              : "border-slate-300 bg-white hover:border-violet-400"
                          )}
                        >
                          {selectedIds.has(s.id) && (
                            <Check size={12} className="text-white" />
                          )}
                        </motion.div>
                      </div>

                      {/* STUDENT INFO */}
                      <div className="col-span-6">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-semibold text-white",
                            s.gender === true ? "bg-gradient-to-br from-blue-500 to-blue-600" :
                              s.gender === false ? "bg-gradient-to-br from-pink-500 to-pink-600" :
                                "bg-gradient-to-br from-slate-400 to-slate-500"
                          )}>
                            {s.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-slate-800 group-hover:text-violet-700 transition-colors truncate">
                              {s.fullName}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex items-center gap-1">
                                <Calendar size={10} className="text-slate-400" />
                                <p className="text-[10px] text-slate-500">
                                  {new Date(s.dateOfBirth).toLocaleDateString("vi-VN")}
                                </p>
                              </div>
                              <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                              <span className={cn(
                                "text-[9px] font-medium px-1.5 py-0.5 rounded-full",
                                s.gender === true ? "bg-blue-50 text-blue-600" :
                                  s.gender === false ? "bg-pink-50 text-pink-600" :
                                    "bg-slate-100 text-slate-500"
                              )}>
                                {s.gender === true ? "Nam" : s.gender === false ? "Nữ" : "Khác"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SCHOOL */}
                      <div className="col-span-3 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded-lg bg-slate-100 group-hover:bg-violet-100 transition-colors flex-shrink-0">
                            <School size={12} className="text-slate-400 group-hover:text-violet-500 transition-colors" />
                          </div>
                          <p className="text-xs text-slate-600 truncate" title={s.schoolName}>
                            {s.schoolName}
                          </p>
                        </div>
                      </div>

                      {/* STATUS */}
                      <div className="col-span-2 flex justify-center">
                        <div className={cn(
                          "text-xs font-medium px-2 py-1 rounded-full transition-all",
                          selectedIds.has(s.id)
                            ? "text-violet-700 bg-violet-100"
                            : "text-slate-400 bg-slate-50"
                        )}>
                          {selectedIds.has(s.id) ? "Đã chọn" : "Chưa chọn"}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* FOOTER with Add Selected Button */}
          <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="px-2 py-0.5 bg-violet-100 text-violet-700 rounded-lg text-[10px] font-semibold">
                  {searchedStudents.length}
                </div>
                <span className="text-[10px] text-slate-500">
                  {searchedStudents.length === 1 ? "học sinh" : "học sinh"}
                </span>
              </div>
              {selectedIds.size > 0 && (
                <>
                  <span className="w-px h-4 bg-slate-200" />
                  <div className="flex items-center gap-1.5">
                    <div className="px-2 py-0.5 bg-green-100 text-green-700 rounded-lg text-[10px] font-semibold">
                      {selectedIds.size}
                    </div>
                    <span className="text-[10px] text-slate-500">đã chọn</span>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="px-4 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                type="button"
              >
                Đóng
              </motion.button>
              <motion.button
                whileHover={!adding && selectedIds.size > 0 ? { scale: 1.02 } : {}}
                whileTap={!adding && selectedIds.size > 0 ? { scale: 0.98 } : {}}
                onClick={handleAddSelected}
                disabled={adding || selectedIds.size === 0}
                className={cn(
                  "px-5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 shadow-sm",
                  adding || selectedIds.size === 0
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "btn-gradient text-white hover:shadow-lg hover:shadow-violet-500/25 hover:-translate-y-0.5"
                )}
                type="button"
              >
                {adding ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang thêm...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={14} />
                    <span>Thêm {selectedIds.size > 0 ? `${selectedIds.size} học sinh` : "học sinh"}</span>
                    <ChevronRight size={12} className="opacity-70" />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};