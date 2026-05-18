// useAnnouncementForm.ts
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import type { Announcement } from "./AnnouncementPage";

interface UseAnnouncementFormProps {
    editingPost: Announcement | null;
    onSubmitSuccess: (newPost?: Announcement, updatedPost?: Announcement) => void;
    onClose: () => void;
}

interface FormData {
    title: string;
    content: string;
    status: "active" | "inactive" | "draft";
}

export const useAnnouncementForm = ({
    editingPost,
    onSubmitSuccess,
    onClose,
}: UseAnnouncementFormProps) => {
    const [formData, setFormData] = useState<FormData>({
        title: "",
        content: "",
        status: "active",
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

    // Load editing post data
    useEffect(() => {
        if (editingPost) {
            setFormData({
                title: editingPost.title || "",
                content: editingPost.contentText || "",
                status: editingPost.status || "active",
            });
            if (editingPost.postImage) {
                setImagePreview(editingPost.postImage);
            }
        }
    }, [editingPost]);

    const validateForm = useCallback((): boolean => {
        const newErrors: { title?: string; content?: string } = {};
        
        if (!formData.title.trim()) {
            newErrors.title = "Vui lòng nhập tiêu đề";
        } else if (formData.title.length < 5) {
            newErrors.title = "Tiêu đề phải có ít nhất 5 ký tự";
        } else if (formData.title.length > 200) {
            newErrors.title = "Tiêu đề không được vượt quá 200 ký tự";
        }
        
        if (!formData.content.trim()) {
            newErrors.content = "Vui lòng nhập nội dung";
        } else if (formData.content.length < 10) {
            newErrors.content = "Nội dung phải có ít nhất 10 ký tự";
        } else if (formData.content.length > 5000) {
            newErrors.content = "Nội dung không được vượt quá 5000 ký tự";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const resetForm = useCallback(() => {
        setFormData({
            title: "",
            content: "",
            status: "active",
        });
        setImageFile(null);
        setAttachments([]);
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview(null);
        }
        setErrors({});
        setProgress(0);
    }, [imagePreview]);

    // Simulate API call with FormData
    const submitToAPI = useCallback(async (formDataToSubmit: FormData) => {
        const apiFormData = new FormData();
        
        // Create request DTO
        const request = {
            title: formDataToSubmit.title,
            content: formDataToSubmit.content,
            status: formDataToSubmit.status,
            clearImage: editingPost && !imageFile && imagePreview === editingPost.postImage ? false : !imageFile,
            clearAttachments: editingPost && attachments.length === 0,
        };
        
        apiFormData.append("data", JSON.stringify(request));
        
        if (imageFile) {
            apiFormData.append("imageFile", imageFile);
        }
        
        attachments.forEach((file, index) => {
            apiFormData.append(`attachments`, file);
        });
        
        // Simulate upload progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + 10;
            });
        }, 200);
        
        // Mock API call - replace with actual API
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        clearInterval(interval);
        setProgress(100);
        
        // Mock response
        const mockResponse = {
            id: editingPost?.id || Date.now(),
            ...formDataToSubmit,
            imageUrl: imageFile ? URL.createObjectURL(imageFile) : editingPost?.postImage,
            createdAt: new Date().toISOString(),
        };
        
        return mockResponse;
    }, [imageFile, attachments, editingPost, imagePreview]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error("Vui lòng kiểm tra lại thông tin");
            return;
        }
        
        setIsLoading(true);
        setProgress(0);
        
        try {
            const response = await submitToAPI(formData);
            
            // Transform response to Announcement type
            const announcement: Announcement = {
                id: response.id,
                avatar: null,
                avatarBg: editingPost?.avatarBg || "bg-purple-100",
                avatarInitials: editingPost?.avatarInitials || "ND",
                avatarImg: editingPost?.avatarImg || "https://i.pravatar.cc/100?img=5",
                name: editingPost?.name || "Người dùng",
                badge: formData.status === "active" ? "CÔNG KHAI" : formData.status === "draft" ? "NHÁP" : "RIÊNG TƯ",
                badgeBg: formData.status === "active" ? "bg-green-100" : formData.status === "draft" ? "bg-gray-100" : "bg-yellow-100",
                badgeText: formData.status === "active" ? "text-green-700" : formData.status === "draft" ? "text-gray-700" : "text-yellow-700",
                time: "Vừa xong",
                content: <>{formData.content}</>,
                contentText: formData.content,
                title: formData.title,
                status: formData.status,
                hasImage: !!response.imageUrl,
                postImage: response.imageUrl || null,
                likeCount: "0",
                viewCount: "0 lượt xem",
                contentPb: "pb-[0.62px]",
                actionPt: "pt-[17.1px]",
            };
            
            if (editingPost) {
                announcement.id = editingPost.id;
                announcement.likeCount = editingPost.likeCount;
                announcement.viewCount = editingPost.viewCount;
                onSubmitSuccess(undefined, announcement);
            } else {
                onSubmitSuccess(announcement);
            }
            
            toast.success(editingPost ? "Cập nhật thành công!" : "Đăng bài thành công!");
            onClose();
        } catch (error) {
            console.error("Submit error:", error);
            toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra, vui lòng thử lại");
        } finally {
            setIsLoading(false);
            setProgress(0);
        }
    }, [formData, validateForm, submitToAPI, editingPost, onSubmitSuccess, onClose]);

    return {
        formData,
        setFormData,
        imageFile,
        setImageFile,
        attachments,
        setAttachments,
        imagePreview,
        setImagePreview,
        isLoading,
        setIsLoading,
        progress,
        setProgress,
        errors,
        validateForm,
        resetForm,
        handleSubmit,
    };
};