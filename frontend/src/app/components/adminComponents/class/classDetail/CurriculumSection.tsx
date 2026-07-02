// src/components/class/CurriculumSection.tsx
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Plus, Loader2, AlertCircle, RefreshCw, BookOpen } from "lucide-react";
import { cn } from "../../../../utils/cn";
import { toast } from "react-hot-toast";
import type { Subject } from "../../../../utils/types/subject";
import type {
  CurriculumResponse,
  SessionDetailResponse,
  CurriculumRequest,
  SessionDetailRequest,
} from "../../../../utils/types/curriculum";
import { curriculumApi } from "../../../../utils/api/curriculum.api";
import {
  CurriculumCard,
  EmptyCurriculumState,
  StatsCard,
  Legend,
  CurriculumFormModal,
} from "./curriculum";

import type {
  CurriculumUI,
  ViewMode,
} from "./curriculum";
import { SessionFormModal } from "./curriculum/SessionFormModal";

interface Props {
  subject: Subject;
  isTeacher?: boolean;
}

export const CurriculumSection = ({ subject, isTeacher = false }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [curriculums, setCurriculums] = useState<CurriculumUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCurriculum, setEditingCurriculum] = useState<{
    curriculum: CurriculumUI;
    sessions: any[];
  } | null>(null);

  const [sessionModal, setSessionModal] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    curriculumId: number | null;
    curriculumTitle: string;
    session?: SessionDetailResponse;
    sessionIndex?: number;
  }>({
    isOpen: false,
    mode: "create",
    curriculumId: null,
    curriculumTitle: "",
  });

  const fetchCurriculums = useCallback(async (showRefreshLoader = false) => {
    if (!subject?.id) return;

    if (showRefreshLoader) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const curriculumList = await curriculumApi.getCurriculumsBySubject(subject.id);

      const curriculumDetails = await Promise.all(
        curriculumList.map(async (curriculum: CurriculumResponse) => {
          try {
            const sessionDetails = await curriculumApi.getSessionDetailsByCurriculum(curriculum.id);

            const totalMinutes = sessionDetails.reduce(
              (sum, session) => sum + (session.durationMinutes || 0),
              0
            );
            const totalHours = Math.round(totalMinutes / 60);

            return {
              ...curriculum,
              sessionDetails: sessionDetails.map((session) => ({
                ...session,
                isCompleted: false,
                isFollowPlan: true,
              })),
              totalHours,
              isActive: curriculum.status === "active",
              tags: [],
              difficulty: "beginner" as const,
            } as CurriculumUI;
          } catch (err) {
            console.error(`Failed to fetch session details for curriculum ${curriculum.id}:`, err);
            toast.error(`Không thể tải chi tiết buổi học cho lộ trình: ${curriculum.title}`);
            return null;
          }
        })
      );

      const validCurriculums = curriculumDetails.filter(
        (c): c is CurriculumUI => c !== null
      );
      setCurriculums(validCurriculums);
    } catch (err) {
      console.error("Failed to fetch curriculums:", err);
      setError("Không thể tải danh sách lộ trình. Vui lòng thử lại sau.");
      toast.error("Tải lộ trình thất bại");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [subject?.id]);

  useEffect(() => {
    fetchCurriculums();
  }, [fetchCurriculums]);

  const filteredCurriculums = useMemo(() => {
    return curriculums.filter((curriculum) => {
      const matchesSearch =
        curriculum.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (curriculum.description?.toLowerCase().includes(searchTerm.toLowerCase()) ??
          false);
      return matchesSearch;
    });
  }, [curriculums, searchTerm]);

  const stats = useMemo(() => {
    const totalSessions = curriculums.reduce(
      (acc, c) => acc + c.expectedSessions,
      0
    );
    const completedSessions = curriculums.reduce(
      (acc, c) => acc + c.sessionDetails.filter((s) => s.isCompleted).length,
      0
    );
    const totalHours = curriculums.reduce(
      (acc, c) => acc + (c.totalHours || 0),
      0
    );

    return {
      totalSessions,
      completedSessions,
      totalHours,
      remainingSessions: totalSessions - completedSessions,
      overallProgress:
        totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
    };
  }, [curriculums]);

  const handleProgressUpdate = async (
    curriculumId: number,
    sessionId: number,
    completed: boolean
  ) => {
    setCurriculums((prev) =>
      prev.map((curriculum) => {
        if (curriculum.id !== curriculumId) return curriculum;
        return {
          ...curriculum,
          sessionDetails: curriculum.sessionDetails.map((session) =>
            session.id === sessionId
              ? { ...session, isCompleted: completed }
              : session
          ),
        };
      })
    );
  };

  const handleReorder = async (curriculumId: number, sessionIdsInOrder: number[]) => {
    await curriculumApi.reorderSessionDetails(curriculumId, sessionIdsInOrder);
  };

  const handleRefresh = () => {
    fetchCurriculums(true);
  };

  const handleCreateCurriculum = async (data: {
    curriculum: CurriculumRequest;
    sessions: SessionDetailRequest[];
  }) => {
    try {
      const newCurriculum = await curriculumApi.createCurriculum(subject.id, data.curriculum);

      if (data.sessions.length > 0) {
        await curriculumApi.createBatchSessionDetails(newCurriculum.id, data.sessions);
      }

      toast.success("Tạo lộ trình thành công");
      await fetchCurriculums(true);
      setIsFormModalOpen(false);
    } catch (error) {
      console.error("Failed to create curriculum:", error);
      toast.error("Tạo lộ trình thất bại");
      throw error;
    }
  };

  const handleUpdateCurriculum = async (data: {
    curriculum: CurriculumRequest;
    sessions: SessionDetailRequest[];
  }) => {
    if (!editingCurriculum) return;

    try {
      await curriculumApi.updateCurriculum(editingCurriculum.curriculum.id, data.curriculum);

      const currentSessions = await curriculumApi.getSessionDetailsByCurriculum(editingCurriculum.curriculum.id);

      await Promise.all(currentSessions.map(session =>
        curriculumApi.deleteSessionDetail(session.id)
      ));

      if (data.sessions.length > 0) {
        await curriculumApi.createBatchSessionDetails(editingCurriculum.curriculum.id, data.sessions);
      }

      toast.success("Cập nhật lộ trình thành công");
      await fetchCurriculums(true);
      setEditingCurriculum(null);
      setIsFormModalOpen(false);
    } catch (error) {
      console.error("Failed to update curriculum:", error);
      toast.error("Cập nhật thất bại");
      throw error;
    }
  };

  const handleDeleteCurriculum = async (curriculumId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa lộ trình này? Các buổi học liên quan cũng sẽ bị xóa.")) {
      return;
    }

    try {
      await curriculumApi.deleteCurriculum(curriculumId);
      toast.success("Đã xóa lộ trình");
      await fetchCurriculums(true);
    } catch (error) {
      console.error("Failed to delete curriculum:", error);
      toast.error("Xóa lộ trình thất bại");
    }
  };

  const handleEditCurriculum = (curriculum: CurriculumUI) => {
    setEditingCurriculum({
      curriculum,
      sessions: curriculum.sessionDetails,
    });
    setIsFormModalOpen(true);
  };

  const handleAddSessionClick = (curriculumId: number, curriculumTitle: string) => {
    setSessionModal({
      isOpen: true,
      mode: "create",
      curriculumId,
      curriculumTitle,
    });
  };

  const handleEditSessionClick = (
    session: SessionDetailResponse,
    curriculumTitle: string,
    sessionIndex: number
  ) => {
    setSessionModal({
      isOpen: true,
      mode: "edit",
      curriculumId: session.curriculumId,
      curriculumTitle,
      session,
      sessionIndex,
    });
  };

  const handleSessionSubmit = async (data: SessionDetailRequest) => {
    const { mode, curriculumId, session } = sessionModal;
    if (!curriculumId) return;

    try {
      if (mode === "create") {
        const newSession = await curriculumApi.createSessionDetail(curriculumId, data);
        toast.success("Đã thêm buổi học mới");
        
        setCurriculums(prev =>
          prev.map(curriculum =>
            curriculum.id === curriculumId
              ? {
                  ...curriculum,
                  sessionDetails: [...curriculum.sessionDetails, { ...newSession, isCompleted: false, isFollowPlan: true }],
                  expectedSessions: curriculum.expectedSessions + 1,
                }
              : curriculum
          )
        );
      } else {
        if (!session) return;
        const updatedSession = await curriculumApi.updateSessionDetail(session.id, data);
        toast.success("Đã cập nhật buổi học");
        
        setCurriculums(prev =>
          prev.map(curriculum =>
            curriculum.id === curriculumId
              ? {
                  ...curriculum,
                  sessionDetails: curriculum.sessionDetails.map(s =>
                    s.id === updatedSession.id ? { ...s, ...updatedSession } : s
                  ),
                }
              : curriculum
          )
        );
      }
      
      setSessionModal(prev => ({ ...prev, isOpen: false }));
    } catch (error) {
      console.error("Failed to save session:", error);
      toast.error(mode === "create" ? "Thêm buổi học thất bại" : "Cập nhật thất bại");
      throw error;
    }
  };

  const handleDeleteSession = async () => {
    const { curriculumId, session } = sessionModal;
    if (!curriculumId || !session) return;
    
    if (!confirm("Bạn có chắc chắn muốn xóa buổi học này?")) return;
    
    try {
      await curriculumApi.deleteSessionDetail(session.id);
      toast.success("Đã xóa buổi học");
      
      setCurriculums(prev =>
        prev.map(curriculum =>
          curriculum.id === curriculumId
            ? {
                ...curriculum,
                sessionDetails: curriculum.sessionDetails.filter(s => s.id !== session.id),
                expectedSessions: curriculum.expectedSessions - 1,
              }
            : curriculum
        )
      );
      
      setSessionModal(prev => ({ ...prev, isOpen: false }));
    } catch (error) {
      console.error("Failed to delete session:", error);
      toast.error("Xóa buổi học thất bại");
      throw error;
    }
  };


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.key === 'c' || e.key === 'C') && isTeacher) {
        e.preventDefault();
        setIsFormModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTeacher]);

  if (!subject) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-3" />
        <p className="text-slate-500">Đang tải lộ trình học...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <p className="text-slate-700 font-medium mb-2">Có lỗi xảy ra</p>
          <p className="text-slate-500 text-sm mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            <RefreshCw size={16} />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-6 pb-10 px-10"
    >
      <div className="flex justify-between items-center">
        <div className="flex-1" />
      </div>

      {curriculums.length > 0 && (
        <StatsCard
          stats={stats}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
      )}

      <div
        className={cn(
          "space-y-4",
          viewMode === "grid" && "grid grid-cols-1 lg:grid-cols-2 gap-4 space-y-0"
        )}
      >
        {filteredCurriculums.length > 0 ? (
          viewMode === "list" ? (
            filteredCurriculums.map((curriculum) => (
              <CurriculumCard
                key={curriculum.id}
                curriculum={curriculum}
                isTeacher={isTeacher}
                onProgressUpdate={handleProgressUpdate}
                onReorder={handleReorder}
                onEdit={() => handleEditCurriculum(curriculum)}
                onDelete={() => handleDeleteCurriculum(curriculum.id)}
                onAddSessionClick={handleAddSessionClick}
                onEditSessionClick={handleEditSessionClick}
              />
            ))
          ) : (
            filteredCurriculums.map((curriculum) => (
              <div key={curriculum.id} className="h-full">
                <CurriculumCard
                  curriculum={curriculum}
                  isTeacher={isTeacher}
                  onProgressUpdate={handleProgressUpdate}
                  onReorder={handleReorder}
                  onEdit={() => handleEditCurriculum(curriculum)}
                  onDelete={() => handleDeleteCurriculum(curriculum.id)}
                  onAddSessionClick={handleAddSessionClick}
                  onEditSessionClick={handleEditSessionClick}
                />
              </div>
            ))
          )
        ) : curriculums.length === 0 ? (
          <EmptyCurriculumState
            isTeacher={isTeacher}
            onRefresh={handleRefresh}
            onCreate={() => setIsFormModalOpen(true)}
          />
        ) : (
          <div className="flex items-center justify-center py-20">
            <p className="text-slate-500">Không tìm thấy lộ trình phù hợp</p>
          </div>
        )}
      </div>

      <CurriculumFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingCurriculum(null);
        }}
        onSubmit={editingCurriculum ? handleUpdateCurriculum : handleCreateCurriculum}
        initialData={editingCurriculum ? {
          curriculum: {
            title: editingCurriculum.curriculum.title,
            description: editingCurriculum.curriculum.description || "",
            expectedSessions: editingCurriculum.curriculum.expectedSessions,
            status: editingCurriculum.curriculum.isActive ? "active" : "archived",
            semester: editingCurriculum.curriculum.semester || "",
            schoolYear: editingCurriculum.curriculum.schoolYear || "",
          },
          sessions: editingCurriculum.sessions.map(s => ({
            topic: s.topic,
            objectives: s.objectives || "",
            content: s.content || "",
            homework: s.homework || "",
            materials: s.materials || "",
            durationMinutes: s.durationMinutes,
            teachingMethod: s.teachingMethod || "",
            assessmentCriteria: s.assessmentCriteria || "",
            sessionNumber: s.sessionNumber || undefined,
          })),
        } : undefined}
        subjectName={subject.name}
        isEditing={!!editingCurriculum}
      />

      <SessionFormModal
        isOpen={sessionModal.isOpen}
        onClose={() => setSessionModal(prev => ({ ...prev, isOpen: false }))}
        onSubmit={handleSessionSubmit}
        onDelete={sessionModal.mode === "edit" ? handleDeleteSession : undefined}
        initialData={sessionModal.session}
        curriculumTitle={sessionModal.curriculumTitle}
        sessionIndex={sessionModal.sessionIndex}
      />

      {isTeacher && (
        <div className="fixed bottom-6 right-6 z-50">
          <motion.button
            onClick={() => setIsFormModalOpen(true)}
            className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 text-white shadow-2xl shadow-indigo-500/40 dark:shadow-indigo-600/50 backdrop-blur-sm overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all duration-300"
            animate={{
              y: [0, -3, 0, -2, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ filter: "blur(8px)" }}
            />
            
            <div className="relative z-10 flex items-center justify-center w-full h-full">
              <BookOpen size={24} strokeWidth={1.8} />
            </div>

            <motion.span
              className="absolute inset-0 rounded-full border-2 border-indigo-400/60"
              animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};