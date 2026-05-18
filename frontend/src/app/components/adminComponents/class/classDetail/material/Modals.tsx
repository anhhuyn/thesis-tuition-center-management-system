// Modals.tsx
import React, { memo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloudUpload, X, Loader2, File, Video, FileText, Edit2 } from "lucide-react";
import type { EditModalProps, FloatingUploadButtonProps, UploadModalProps } from "./types";
import type { Material } from "../../../../../utils/types/material";

export const FloatingUploadButton = memo(({ onClick }: FloatingUploadButtonProps) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();
        setRipples((prev) => [...prev, { id, x, y }]);
        setTimeout(() => {
            setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 600);
        onClick();
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'u' || e.key === 'U') {
                const target = e.target as HTMLElement;
                if (!target.matches('input, textarea, [contenteditable]')) {
                    e.preventDefault();
                    onClick();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClick]);

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {showTooltip && (
                    <motion.div
                        initial={{ opacity: 0, x: -10, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -10, scale: 0.95 }}
                        className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-lg border border-slate-700/50 backdrop-blur-sm"
                    >
                        <div className="flex items-center gap-2">
                            <span>📄 Tải lên tài liệu</span>
                            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 dark:bg-slate-700 rounded-md border border-slate-600">U</kbd>
                        </div>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-1.5 h-1.5 rotate-45 bg-slate-900 dark:bg-slate-800 border-r border-t border-slate-700/50" />
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={handleClick}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="relative group w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 text-white shadow-2xl shadow-indigo-500/30 dark:shadow-indigo-600/40 backdrop-blur-sm overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all duration-300"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                animate={{ y: [0, -3, 0, -2, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            >
                <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ filter: "blur(8px)" }}
                />
                {ripples.map((ripple) => (
                    <motion.span
                        key={ripple.id}
                        className="absolute inset-0 rounded-full bg-white/30"
                        initial={{ scale: 0, opacity: 0.6 }}
                        animate={{ scale: 4, opacity: 0 }}
                        transition={{ duration: 0.6, ease: "circOut" }}
                        style={{ left: ripple.x, top: ripple.y, transform: "translate(-50%, -50%)" }}
                    />
                ))}
                <CloudUpload size={24} className="relative z-10 mx-auto md:w-6 md:h-6" strokeWidth={1.8} />
                <motion.span
                    className="absolute inset-0 rounded-full border-2 border-indigo-400/60"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
            </motion.button>
        </div>
    );
});

// Modals.tsx - UploadModal
export const UploadModal = memo(({ isOpen, onClose, onUpload, setAlert }: UploadModalProps) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [title, setTitle] = useState("");
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (files: FileList | null) => {
        if (files && files.length > 0) {
            setSelectedFiles(files);
            const firstFile = files[0];
            const fileNameWithoutExt = firstFile.name.replace(/\.[^/.]+$/, "");
            setTitle(fileNameWithoutExt);
        }
    };

    const handleUpload = async () => {
        if (!selectedFiles || selectedFiles.length === 0) {
            setAlert?.({
                type: "error",
                message: "Vui lòng chọn file để tải lên!",
            });
            return;
        }
        
        if (!onUpload) {
            setAlert?.({
                type: "error",
                message: "Chức năng tải lên chưa sẵn sàng!",
            });
            return;
        }

        setUploading(true);
        try {
            await onUpload(selectedFiles, title);
            setAlert?.({
                type: "success",
                message: `Tải lên tài liệu "${title || selectedFiles[0].name}" thành công!`,
            });
            // Reset form
            setSelectedFiles(null);
            setTitle("");
            onClose();
        } catch (error: any) {
            console.error("Upload failed:", error);
            setAlert?.({
                type: "error",
                message: error?.response?.data?.message || "Tải lên thất bại. Vui lòng thử lại!",
            });
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileSelect(files);
            setAlert?.({
                type: "info",
                message: `Đã chọn file: ${files[0].name}`,
            });
        }
    };

    const resetModal = () => {
        setSelectedFiles(null);
        setTitle("");
        setDragActive(false);
    };

    const handleClose = () => {
        if (uploading) {
            setAlert?.({
                type: "warning",
                message: "Đang tải lên, vui lòng đợi hoàn tất!",
            });
            return;
        }
        resetModal();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                                <CloudUpload size={18} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-900 dark:text-white">Tải lên tài liệu</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">PDF, DOCX, MP4, ... tối đa 100MB</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleClose} 
                            disabled={uploading}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                            <X size={18} className="text-slate-400" />
                        </button>
                    </div>

                    <div className="p-5 space-y-4">
                        {/* Title Input */}
                        {selectedFiles && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Tiêu đề tài liệu
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Nhập tiêu đề tài liệu..."
                                />
                            </div>
                        )}

                        {/* Drop Zone */}
                        <div
                            className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 text-center cursor-pointer
                                ${dragActive ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20" : "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"}
                                ${selectedFiles ? "bg-indigo-50/30 dark:bg-indigo-900/10" : ""}`}
                            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            onClick={() => !uploading && fileInputRef.current?.click()}
                        >
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                                <CloudUpload size={28} className="text-indigo-600 dark:text-indigo-400" />
                            </div>

                            {selectedFiles ? (
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">
                                        Đã chọn: {selectedFiles[0].name}
                                    </p>
                                    {selectedFiles.length > 1 && (
                                        <p className="text-xs text-slate-500">
                                            và {selectedFiles.length - 1} file khác
                                        </p>
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedFiles(null); setTitle(""); }}
                                        className="mt-2 text-xs text-red-500 hover:text-red-600"
                                        disabled={uploading}
                                    >
                                        Xóa
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">
                                        Kéo và thả file vào đây
                                    </p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
                                        hoặc
                                    </p>
                                    <span className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
                                        Chọn file từ máy tính
                                    </span>
                                </>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                multiple
                                onChange={(e) => handleFileSelect(e.target.files)}
                                disabled={uploading}
                            />

                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-4">
                                Hỗ trợ: PDF, DOCX, MP4, PPT, PPTX, JPG, PNG (tối đa 100MB)
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 p-5 border-t border-slate-100 dark:border-slate-800">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            disabled={uploading}
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={!selectedFiles || uploading}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Đang tải...
                                </>
                            ) : (
                                "Tải lên"
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
});

// Modals.tsx - EditModal
export const EditModal = memo(({ isOpen, onClose, material, onUpdate, setAlert }: EditModalProps) => {
    const [title, setTitle] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [updating, setUpdating] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (material) {
            setTitle(material.title);
            setSelectedFile(null);
        }
    }, [material]);

    const handleUpdate = async () => {
        if (!material) return;

        if (!title.trim()) {
            setAlert?.({
                type: "error",
                message: "Vui lòng nhập tiêu đề tài liệu!",
            });
            return;
        }

        setUpdating(true);
        try {
            await onUpdate(material.id, title, selectedFile || undefined);
            setAlert?.({
                type: "success",
                message: `Cập nhật tài liệu "${title}" thành công!`,
            });
            onClose();
        } catch (error: any) {
            console.error("Update failed:", error);
            setAlert?.({
                type: "error",
                message: error?.response?.data?.message || "Cập nhật thất bại. Vui lòng thử lại!",
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            setSelectedFile(file);
            setAlert?.({
                type: "info",
                message: `Đã chọn file mới: ${file.name}`,
            });
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setAlert?.({
                type: "info",
                message: `Đã chọn file mới: ${file.name}`,
            });
        }
    };

    const removeSelectedFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setAlert?.({
            type: "info",
            message: "Đã hủy chọn file mới",
        });
    };

    const handleClose = () => {
        if (updating) {
            setAlert?.({
                type: "warning",
                message: "Đang cập nhật, vui lòng đợi hoàn tất!",
            });
            return;
        }
        onClose();
    };

    if (!isOpen || !material) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                                <Edit2 size={18} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-900 dark:text-white">Chỉnh sửa tài liệu</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Cập nhật thông tin tài liệu</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={updating}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                            <X size={18} className="text-slate-400" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-5 space-y-4">
                        {/* Thông tin file cũ */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">File hiện tại</p>
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getFileStyle(material.type).iconBg}`}>
                                    {getFileIcon(material.type)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {material.fileURL?.split('/').pop() || material.type}
                                    </p>
                                    <p className="text-xs text-slate-400">{material.fileSize || "~1 MB"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Edit Title */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Tiêu đề tài liệu <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="Nhập tiêu đề tài liệu..."
                                disabled={updating}
                            />
                        </div>

                        {/* Upload new file */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Thay đổi file (không bắt buộc)
                            </label>

                            {/* Drop Zone */}
                            <div
                                className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 text-center cursor-pointer
                                    ${dragActive ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20" : "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"}
                                    ${selectedFile ? "bg-indigo-50/30 dark:bg-indigo-900/10" : ""}`}
                                onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                                onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                onClick={() => !updating && fileInputRef.current?.click()}
                            >
                                {selectedFile ? (
                                    <div>
                                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                                            <File size={24} className="text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <p className="font-medium text-slate-800 dark:text-slate-200 text-sm mb-1">
                                            {selectedFile.name}
                                        </p>
                                        <p className="text-xs text-slate-500 mb-2">
                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeSelectedFile(); }}
                                            className="text-xs text-red-500 hover:text-red-600 font-medium"
                                            disabled={updating}
                                        >
                                            Xóa file
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <CloudUpload size={24} className="text-slate-400" />
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">
                                            Kéo và thả file mới vào đây
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            hoặc <span className="text-indigo-600 dark:text-indigo-400">chọn file từ máy tính</span>
                                        </p>
                                    </>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                    disabled={updating}
                                />
                            </div>

                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                                Hỗ trợ: PDF, DOCX, MP4, PPT, PPTX, JPG, PNG (tối đa 100MB)
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 p-5 border-t border-slate-100 dark:border-slate-800">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            disabled={updating}
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleUpdate}
                            disabled={updating || !title.trim()}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {updating ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Đang cập nhật...
                                </>
                            ) : (
                                "Cập nhật"
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
});

// Helper functions
const getFileIcon = (type: string) => {
    const fileType = type.toLowerCase();
    if (fileType.includes("pdf")) {
        return <FileText size={18} className="text-red-500" />;
    }
    if (fileType.includes("mp4") || fileType.includes("video")) {
        return <Video size={18} className="text-purple-500" />;
    }
    return <File size={18} className="text-blue-500" />;
};

const getFileStyle = (type: string) => {
    const fileType = type.toLowerCase();
    if (fileType.includes("pdf")) {
        return { iconBg: "bg-red-50 dark:bg-red-900/20" };
    }
    if (fileType.includes("mp4") || fileType.includes("video")) {
        return { iconBg: "bg-purple-50 dark:bg-purple-900/20" };
    }
    return { iconBg: "bg-blue-50 dark:bg-blue-900/20" };
};