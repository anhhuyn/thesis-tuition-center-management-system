import React, { memo, useState } from "react";
import { motion } from "framer-motion";
import {
    FileText,
    File,
    Video,
    MoreVertical,
    CloudDownload,
    Eye,
    Download,
    Cloud,
    Sparkles,
    HelpCircle,
    ArrowRight,
    Trash2,
    Edit2
} from "lucide-react";
import type { StorageCardProps } from "./types";
import { parseFileSize, formatBytes, getFileStyle } from "./utils";
import { getImageSrc, getInitials } from "../../../../../utils/helpers";

const iconMap = {
    FileText,
    File,
    Video,
};

// Cập nhật interface props
interface MaterialCardProps {
    material: any;
    onStar: (id: number) => void;
    onDownload: (url: string) => void;
    onDelete: (id: number) => Promise<void>;
    onPreview: (url: string, material?: any) => void;
    onEdit: (material: any) => void;
    setAlert?: (alert: any) => void;
    isTeacher?: boolean;
    currentUserId?: number;
}

export const MaterialCard = memo(({ 
    material, 
    onStar, 
    onDownload, 
    onDelete, 
    onPreview, 
    onEdit, 
    setAlert,
    isTeacher = false,
    currentUserId 
}: MaterialCardProps) => {
    const style = getFileStyle(material.type);
    const IconComponent = iconMap[style.icon as keyof typeof iconMap] || File;
    const [isHovered, setIsHovered] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const avatarSrc = getImageSrc(material.uploadedByImage);
    const initials = getInitials(material.uploadedByName);

    // Kiểm tra quyền: 
    // - Nếu là admin (!isTeacher): được phép sửa/xóa tất cả
    // - Nếu là teacher: chỉ được sửa/xóa tài liệu do chính mình tải lên (uploadedById === currentUserId)
    const canEdit = !isTeacher || (currentUserId && material.uploadedById === currentUserId);

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        
        const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa tài liệu "${material.title}"?`);
        if (!confirmed) return;
        
        setIsDeleting(true);
        try {
            await onDelete(material.id);
            setAlert?.({
                type: "success",
                message: `Xóa tài liệu "${material.title}" thành công!`,
            });
        } catch (error: any) {
            console.error("Delete failed:", error);
            setAlert?.({
                type: "error",
                message: error?.response?.data?.message || "Xóa tài liệu thất bại. Vui lòng thử lại!",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit?.(material);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className={`group relative bg-white dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={() => onPreview?.(material.fileURL, material)}
        >
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 pointer-events-none"
            />

            <div className="p-5">
                <div className="flex justify-between items-start">
                    <div className="relative">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className={`w-12 h-12 flex items-center justify-center rounded-xl ${style.iconBg} transition-all duration-200`}
                        >
                            <IconComponent size={22} className={style.text} />
                        </motion.div>
                        <div className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 text-[9px] font-bold bg-white dark:bg-slate-800 border rounded-full ${style.border} ${style.text} shadow-sm`}>
                            {material.type.toUpperCase()}
                        </div>
                    </div>

                    {/* Chỉ hiển thị action buttons nếu có quyền (canEdit = true) */}
                    {canEdit && (
                        <div className="flex gap-1">
                            {/* Nút Edit */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleEdit}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <Edit2 size={14} className="text-slate-400 hover:text-indigo-500" />
                            </motion.button>

                            {/* Nút Delete */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleDelete}
                                className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Trash2 size={14} className="text-slate-400 hover:text-red-500 transition-colors" />
                                )}
                            </motion.button>

                            {/* Nút MoreVertical */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <MoreVertical size={14} className="text-slate-400" />
                            </motion.button>
                        </div>
                    )}
                </div>

                <div className="mt-4">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {material.title}
                    </h3>
                </div>

                <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 dark:text-slate-400">
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-medium">
                        {material.fileSize}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <span>{new Date(material.uploadedAt).toLocaleDateString("vi-VN")}</span>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center text-[11px] font-bold shadow-sm">
                            {avatarSrc ? (
                                <img
                                    src={avatarSrc}
                                    alt={material.uploadedByName || "avatar"}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = "none";
                                    }}
                                />
                            ) : (
                                initials
                            )}
                        </div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            {material.uploadedByName}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            onClick={(e) => { e.stopPropagation(); onDownload?.(material.fileURL); }}
                        >
                            <CloudDownload size={14} className="text-slate-400 hover:text-indigo-600 transition-colors" />
                        </motion.button>
                    </div>
                </div>

                <div className="flex items-center gap-3 mt-3 pt-2 text-[10px] text-slate-400 dark:text-slate-500">
                    <div className="flex items-center gap-1">
                        <Eye size={12} />
                        <span>{material.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Download size={12} />
                        <span>{material.downloads || 0}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

export const StorageCard = memo(({ materials }: StorageCardProps) => {
    const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
    const MAX_STORAGE = 2 * 1024 * 1024 * 1024;

    const totalUsed = materials.reduce((sum, item) => sum + parseFileSize(item.fileSize), 0);
    const usedPercent = Math.min((totalUsed / MAX_STORAGE) * 100, 100);

    const pdfSize = materials
        .filter(m => m.type.includes("pdf"))
        .reduce((sum, m) => sum + parseFileSize(m.fileSize), 0);

    const docSize = materials
        .filter(m => ["doc", "docx"].some(t => m.type.includes(t)))
        .reduce((sum, m) => sum + parseFileSize(m.fileSize), 0);

    const pptSize = materials
        .filter(m => ["ppt", "pptx"].some(t => m.type.includes(t)))
        .reduce((sum, m) => sum + parseFileSize(m.fileSize), 0);

    const xlsSize = materials
        .filter(m => ["xls", "xlsx"].some(t => m.type.includes(t)))
        .reduce((sum, m) => sum + parseFileSize(m.fileSize), 0);

    const videoSize = materials
        .filter(m => m.type.includes("mp4"))
        .reduce((sum, m) => sum + parseFileSize(m.fileSize), 0);

    const otherSize = Math.max(
        0,
        totalUsed - pdfSize - docSize - pptSize - xlsSize - videoSize
    );

    const segments = [
        { label: "PDF", percentage: totalUsed ? (pdfSize / totalUsed) * 100 : 0, color: "bg-red-500" },
        { label: "WORD", percentage: totalUsed ? (docSize / totalUsed) * 100 : 0, color: "bg-blue-500" },
        { label: "PPT", percentage: totalUsed ? (pptSize / totalUsed) * 100 : 0, color: "bg-orange-500" },
        { label: "EXCEL", percentage: totalUsed ? (xlsSize / totalUsed) * 100 : 0, color: "bg-emerald-500" },
        { label: "VIDEO", percentage: totalUsed ? (videoSize / totalUsed) * 100 : 0, color: "bg-purple-500" },
        { label: "KHÁC", percentage: totalUsed ? (otherSize / totalUsed) * 100 : 0, color: "bg-slate-400" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-5 shadow-sm hover:shadow-md transition-all duration-300"
        >
            <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-violet-100 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
                    <Cloud className="text-violet-600" size={18} />
                </div>
                <div>
                    <p className="font-bold text-slate-900 dark:text-white">Dung lượng lưu trữ</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Quản lý tài liệu của bạn</p>
                </div>
            </div>

            <div className="mb-4">
                <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">{formatBytes(totalUsed)}</span>
                    <span className="text-sm text-slate-400 ml-1">/ {formatBytes(MAX_STORAGE)}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Đã sử dụng {usedPercent < 1 && usedPercent > 0 ? usedPercent.toFixed(1) : usedPercent.toFixed(0)}%
                </p>
            </div>

            <div className="relative w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-5">
                {segments.map((segment, idx) => (
                    <motion.div
                        key={segment.label}
                        initial={{ width: 0 }}
                        animate={{ width: `${segment.percentage.toFixed(0)}%` }}
                        transition={{ duration: 1, delay: 0.3 + idx * 0.1 }}
                        className={`absolute h-full ${segment.color} transition-all duration-200 hover:brightness-110 cursor-pointer`}
                        style={{
                            left: `${segments.slice(0, idx).reduce((sum, s) => sum + s.percentage, 0).toFixed(1)}%`,
                            width: `${segment.percentage.toFixed(1)}%`
                        }}
                        onMouseEnter={() => setHoveredSegment(segment.label)}
                        onMouseLeave={() => setHoveredSegment(null)}
                    >
                        {hoveredSegment === segment.label && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-slate-900 dark:bg-slate-700 text-white text-[10px] rounded-lg whitespace-nowrap shadow-lg z-10"
                            >
                                {segment.label}: {segment.percentage.toFixed(1)}%
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                {segments.map((segment) => (
                    <div key={segment.label} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${segment.color}`} />
                        <span className="text-slate-600 dark:text-slate-400">{segment.label}</span>
                        <span className="text-slate-400 ml-auto">{segment.percentage.toFixed(1)}%</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
});

export const ActivityCard = memo(() => {
    const activities = [
        { id: 1, user: "Bạn", action: "đã tải lên", target: "Ma trận.pdf", time: "2 giờ trước", isHighlight: true },
        { id: 2, user: "Lê Minh", action: "đã xem", target: "Bài tập Không gian Vectơ", time: "5 giờ trước", isHighlight: false },
        { id: 3, user: "Trần Thị B", action: "đã tải về", target: "Đề thi giữa kỳ.pdf", time: "1 ngày trước", isHighlight: false },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-5 shadow-sm hover:shadow-md transition-all duration-300"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Hoạt động gần đây</h3>
                <button className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                    Xem tất cả
                </button>
            </div>

            <div className="space-y-4">
                {activities.map((activity, idx) => (
                    <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="flex gap-3 group cursor-pointer"
                    >
                        <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${activity.isHighlight ? "bg-indigo-500" : "bg-slate-400"}`} />
                        <div className="flex-1">
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{activity.user}</span>
                                {" "}{activity.action}{" "}
                                <span className="font-medium text-indigo-600 dark:text-indigo-400">{activity.target}</span>
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{activity.time}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
});

export const AISuggestionCard = memo(() => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 rounded-2xl p-5 shadow-xl shadow-indigo-200 dark:shadow-indigo-900/30"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />

            <div className="relative z-10">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <Sparkles className="text-white" size={20} />
                </div>
                <p className="text-white font-bold text-sm mb-1">Gợi ý từ AI</p>
                <p className="text-white/80 text-xs leading-relaxed">
                    Bạn có 15 bài tập chưa phân loại. Sắp xếp tự động?
                </p>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-4 w-full bg-white text-indigo-600 text-xs font-bold py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                    SẮP XẾP NGAY
                </motion.button>
            </div>
        </motion.div>
    );
});

export const HelpCard = memo(() => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -2 }}
            className="bg-white dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-5 text-center hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 cursor-pointer"
        >
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <HelpCircle size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="font-bold text-sm text-slate-900 dark:text-white mb-1">Cần hỗ trợ?</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Tìm hiểu cách quản lý tài liệu thông minh.
            </p>
            <motion.button
                whileHover={{ x: 4 }}
                className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold mt-3 flex items-center justify-center gap-1 mx-auto"
            >
                HƯỚNG DẪN <ArrowRight size={12} />
            </motion.button>
        </motion.div>
    );
});