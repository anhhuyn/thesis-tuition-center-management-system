import React, { useState, memo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, Sparkles } from "lucide-react";
import { materialApi } from "../../../../utils/api/material.api";
import type { MaterialSectionProps } from "./material/types";
import { filterButtons } from "./material/types";
import { MaterialCard, StorageCard, ActivityCard, AISuggestionCard, HelpCard } from "./material/Cards";
import { FloatingUploadButton, UploadModal, EditModal } from "./material/Modals";
import type { Material } from "../../../../utils/types/material";
import { useOutletContext } from "react-router-dom";

export const MaterialSection = memo(({ subject, isTeacher = false }: MaterialSectionProps) => {
    const [activeFilter, setActiveFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

    // Get setAlert from context
    const { setAlert } = useOutletContext<any>();

    // Lấy userId hiện tại từ localStorage
    const getCurrentUserId = useCallback((): number => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            return user.id;
        }
        return 1;
    }, []);

    const fetchMaterials = useCallback(async () => {
        if (!subject?.id) return;

        try {
            setLoading(true);
            const res = await materialApi.getBySubject(subject.id);
            setMaterials(res.data);
        } catch (error: any) {
            console.error("Failed to fetch materials:", error);
            setAlert?.({
                type: "error",
                message: error?.response?.data?.message || "Không thể tải danh sách tài liệu. Vui lòng thử lại!",
            });
        } finally {
            setLoading(false);
        }
    }, [subject?.id, setAlert]);

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    const handleUpload = async (files: FileList, title?: string) => {
        if (!subject?.id) {
            setAlert?.({
                type: "error",
                message: "Không có môn học được chọn. Vui lòng thử lại!",
            });
            return;
        }

        const userId = getCurrentUserId();
        const file = files[0];

        try {
            await materialApi.upload({
                title: title || file.name,
                subjectId: subject.id,
                userId: userId,
                file: file
            });

            // Refresh materials list after successful upload
            await fetchMaterials();

            setAlert?.({
                type: "success",
                message: `Tải lên tài liệu "${title || file.name}" thành công!`,
            });
        } catch (error: any) {
            console.error("Upload failed:", error);
            setAlert?.({
                type: "error",
                message: error?.response?.data?.message || "Tải lên thất bại. Vui lòng thử lại!",
            });
            throw error;
        }
    };

    const handleStar = async (id: number) => {
        try {
            // TODO: Implement star API call
            // await materialApi.star(id);
            setAlert?.({
                type: "success",
                message: "Đã đánh dấu tài liệu yêu thích!",
            });
        } catch (error: any) {
            setAlert?.({
                type: "error",
                message: error?.response?.data?.message || "Không thể đánh dấu tài liệu. Vui lòng thử lại!",
            });
        }
    };

    const BASE_IMAGE_URL = import.meta.env.VITE_BACKEND_URL_IMAGE;

    const getFileUrl = (path: string) => {
        if (!path) return "";
        if (path.startsWith("http")) return path;
        return `${BASE_IMAGE_URL}${path}`;
    };

    const handlePreview = (fileURL: string, material?: Material) => {
        const fullUrl = getFileUrl(fileURL);
        const type = material?.type?.toLowerCase();

        // PDF + IMAGE => open trực tiếp
        if (type === "pdf" || ["png", "jpg", "jpeg", "gif", "webp"].includes(type || "")) {
            window.open(fullUrl, "_blank");
            return;
        }

        // OFFICE FILE => fallback download OR open raw
        const office = ["doc", "docx", "ppt", "pptx", "xls", "xlsx"];
        if (office.includes(type || "")) {
            window.open(fullUrl, "_blank");
            return;
        }

        window.open(fullUrl, "_blank");
    };

    const handleDownload = (fileURL: string) => {
        const fullUrl = getFileUrl(fileURL);
        const a = document.createElement("a");
        a.href = fullUrl;
        a.download = fullUrl.split("/").pop() || "file";
        document.body.appendChild(a);
        a.click();
        a.remove();

        setAlert?.({
            type: "info",
            message: "Đang tải xuống tài liệu...",
        });
    };

    const handleDelete = async (id: number) => {
        try {
            await materialApi.delete(id);
            await fetchMaterials();
        } catch (error: any) {
            console.error("Delete failed:", error);
            throw error;
        }
    };

    const handleUpdate = async (id: number, title: string, file?: File) => {
        try {
            await materialApi.update(id, {
                title: title,
                file: file
            });

            // Refresh danh sách
            await fetchMaterials();

            setAlert?.({
                type: "success",
                message: `Cập nhật tài liệu "${title}" thành công!`,
            });
        } catch (error: any) {
            console.error("Cập nhật thất bại:", error);
            setAlert?.({
                type: "error",
                message: error?.response?.data?.message || "Cập nhật tài liệu thất bại. Vui lòng thử lại!",
            });
            throw error;
        }
    };

    // Mở modal edit
    const handleEdit = (material: Material) => {
        setEditingMaterial(material);
        setIsEditModalOpen(true);
    };

    // Đóng modal edit
    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingMaterial(null);
    };

    // Filter materials based on search query and active filter
    const filteredMaterials = materials.filter(material => {
        const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === "all" || true;
        return matchesSearch && matchesFilter;
    });

    // Lấy userId hiện tại để kiểm tra quyền
    const currentUserId = getCurrentUserId();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <div className="max-w-[1600px] mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column - Materials */}
                    <div className="lg:col-span-9 space-y-6">
                        {/* Search and Filter Bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                            <div className="relative flex-1 max-w-sm">
                                <div className="absolute left-3 inset-y-0 flex items-center">
                                    <Search size={15} className="text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm tài liệu..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div className="flex flex-nowrap sm:flex-wrap gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
                                {filterButtons.map((btn) => (
                                    <motion.button
                                        key={btn.value}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setActiveFilter(btn.value)}
                                        className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 whitespace-nowrap ${activeFilter === btn.value
                                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md shadow-slate-200 dark:shadow-slate-800"
                                            : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-700"
                                            }`}
                                    >
                                        {btn.label}
                                        {btn.count && (
                                            <span className={`ml-1.5 text-[10px] ${activeFilter === btn.value
                                                ? "text-white/70 dark:text-slate-900/70"
                                                : "text-slate-400"
                                                }`}>
                                                ({btn.count})
                                            </span>
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Featured Banner */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            whileHover={{ y: -2 }}
                            className="relative overflow-hidden bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 rounded-xl border border-indigo-100 dark:border-indigo-800/50 p-4 cursor-pointer group"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 btn-gradient rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-indigo-900/30 flex-shrink-0">
                                    <Sparkles className="text-white" size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-indigo-900 dark:text-indigo-300 font-bold text-sm mb-0.5">
                                        Tài liệu trọng tâm ôn thi
                                    </h3>
                                    <p className="text-indigo-600 dark:text-indigo-400 text-xs leading-relaxed line-clamp-1">
                                        Tổng hợp 10 dạng bài tập ma trận thường gặp
                                    </p>
                                </div>
                                <motion.button
                                    whileHover={{ x: 4 }}
                                    className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center gap-1 flex-shrink-0"
                                >
                                    Xem <ArrowRight size={12} />
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Materials Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {loading ? (
                                <div className="col-span-full text-center py-12">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                        <p className="text-slate-500">Đang tải tài liệu...</p>
                                    </div>
                                </div>
                            ) : filteredMaterials.length === 0 ? (
                                <div className="col-span-full text-center py-12">
                                    <p className="text-slate-500">Chưa có tài liệu</p>
                                </div>
                            ) : (
                                filteredMaterials.map((material) => (
                                    <MaterialCard
                                        key={material.id}
                                        material={material}
                                        onStar={handleStar}
                                        onDownload={handleDownload}
                                        onDelete={handleDelete}
                                        onPreview={handlePreview}
                                        onEdit={handleEdit}
                                        setAlert={setAlert}
                                        isTeacher={isTeacher}
                                        currentUserId={currentUserId}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="lg:col-span-3 space-y-6">
                        <StorageCard materials={materials} />
                        <ActivityCard />
                        <AISuggestionCard />
                        <HelpCard />
                    </div>
                </div>
            </div>

                <FloatingUploadButton onClick={() => setIsUploadModalOpen(true)} />

            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleUpload}
                setAlert={setAlert}
            />
            <EditModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                material={editingMaterial}
                onUpdate={handleUpdate}
                setAlert={setAlert}
            />
        </div>
    );
});