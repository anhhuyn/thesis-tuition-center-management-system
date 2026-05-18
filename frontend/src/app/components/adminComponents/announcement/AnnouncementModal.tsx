// AnnouncementModal.tsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Image as ImageIcon,
  Paperclip,
  Trash2,
  File,
} from "lucide-react";
import type { Announcement } from "../../../utils/types/announcement";
import { getImageSrc } from "../../../utils/helpers";

interface Attachment {
  id: string;
  file: File;
  name: string;
  size: number;
}

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing?: boolean;
  initialData?: Announcement | null;
  onSubmit?: (formData: FormData) => Promise<void>;
  adminId?: number; // Thêm adminId từ component cha
}

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  isOpen,
  onClose,
  isEditing = false,
  initialData,
  onSubmit,
  adminId = 1, // Giá trị mặc định, bạn nên lấy từ context/auth
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "draft">("draft");
  const [pinned, setPinned] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageURL, setExistingImageURL] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<{ name: string; url: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  const imageInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  // Load initial data when editing
  useEffect(() => {
    if (initialData && isEditing) {
      setTitle(initialData.title);
      setContent(initialData.content);
      setStatus(initialData.status);
      setPinned(initialData.pinned);

      if (initialData.imageURL) {
        setExistingImageURL(initialData.imageURL);
        setImagePreview(getImageSrc(initialData.imageURL));
      }

      if (initialData.attachments && initialData.attachments.length > 0) {
        const existing = initialData.attachments.map(url => ({
          name: url.split('/').pop() || 'unknown',
          url: url
        }));
        setExistingAttachments(existing);
      }
    }
  }, [initialData, isEditing]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setStatus("draft");
    setPinned(false);
    setImage(null);
    setImagePreview(null);
    setExistingImageURL(null);
    setAttachments([]);
    setExistingAttachments([]);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: { title?: string; content?: string } = {};
    if (!title.trim()) newErrors.title = "Tiêu đề không được để trống";
    if (!content.trim()) newErrors.content = "Nội dung không được để trống";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước ảnh không được vượt quá 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert("Vui lòng chọn file hình ảnh");
        return;
      }
      setImage(file);
      setExistingImageURL(null);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    }
  };

  const removeImage = () => {
    setImage(null);
    setExistingImageURL(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleAttachmentsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => file.size <= 10 * 1024 * 1024);

    if (validFiles.length !== files.length) {
      alert("Một số file vượt quá 10MB và đã bị bỏ qua");
    }

    const newAttachments: Attachment[] = validFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = "";
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  const removeExistingAttachment = (url: string) => {
    setExistingAttachments((prev) => prev.filter(att => att.url !== url));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    const formData = new FormData();

    // Tạo data object (CHỈ chứa text fields)
    const data = {
      adminId: adminId,
      title: title,
      content: content,
      status: status,
      pinned: pinned,
    };

    // Append data dưới dạng JSON string (KHÔNG phải File)
    formData.append("data", JSON.stringify(data));  // 👈 Dùng JSON.stringify trực tiếp

    // Append image file (nếu có)
    if (image) {
      formData.append("imageFile", image);
    }

    // Append attachment files (nếu có)
    attachments.forEach((att) => {
      formData.append("attachments", att.file);
    });

    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Có lỗi xảy ra khi tạo thông báo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEditing ? "Chỉnh sửa thông báo" : "Tạo thông báo mới"}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Title Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nhập tiêu đề thông báo..."
                    className={`w-full px-4 py-2.5 rounded-xl border ${errors.title ? "border-red-500" : "border-gray-200"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                  />
                  {errors.title && (
                    <p className="mt-1 text-xs text-red-500">{errors.title}</p>
                  )}
                </div>

                {/* Content Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Viết nội dung thông báo tại đây..."
                    rows={6}
                    className={`w-full px-4 py-2.5 rounded-xl border ${errors.content ? "border-red-500" : "border-gray-200"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200`}
                  />
                  {errors.content && (
                    <p className="mt-1 text-xs text-red-500">{errors.content}</p>
                  )}
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hình ảnh
                  </label>
                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-gray-200">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors duration-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
                    >
                      <ImageIcon
                        size={32}
                        className="text-gray-400 group-hover:text-blue-500 transition-colors duration-200"
                      />
                      <span className="text-sm text-gray-500 group-hover:text-blue-600">
                        Nhấp để tải ảnh lên
                      </span>
                      <span className="text-xs text-gray-400">
                        PNG, JPG, GIF (Max 5MB)
                      </span>
                    </button>
                  )}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Existing Attachments */}
                {existingAttachments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500">
                      TỆP HIỆN TẠI ({existingAttachments.length})
                    </p>
                    {existingAttachments.map((attachment, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="p-2 bg-white rounded-lg">
                            <File size={16} className="text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">
                              {attachment.name}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeExistingAttachment(attachment.url)}
                          className="p-1.5 hover:bg-red-100 rounded-lg transition-colors duration-200 group"
                        >
                          <Trash2
                            size={16}
                            className="text-gray-400 group-hover:text-red-500 transition-colors duration-200"
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New Attachments Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isEditing ? "Thêm tệp đính kèm mới" : "Tệp đính kèm"}
                  </label>
                  <button
                    onClick={() => attachmentInputRef.current?.click()}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
                  >
                    <Paperclip
                      size={20}
                      className="text-gray-400 group-hover:text-blue-500 transition-colors duration-200"
                    />
                    <span className="text-sm text-gray-500 group-hover:text-blue-600">
                      Thêm tệp đính kèm
                    </span>
                  </button>
                  <input
                    ref={attachmentInputRef}
                    type="file"
                    multiple
                    onChange={handleAttachmentsUpload}
                    className="hidden"
                  />
                </div>

                {/* New Attachments List */}
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500">
                      TỆP MỚI ({attachments.length})
                    </p>
                    {attachments.map((attachment) => (
                      <motion.div
                        key={attachment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="p-2 bg-white rounded-lg">
                            <File size={16} className="text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">
                              {attachment.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatFileSize(attachment.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeAttachment(attachment.id)}
                          className="p-1.5 hover:bg-red-100 rounded-lg transition-colors duration-200 group"
                        >
                          <Trash2
                            size={16}
                            className="text-gray-400 group-hover:text-red-500 transition-colors duration-200"
                          />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Pin Checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pinned"
                    checked={pinned}
                    onChange={(e) => setPinned(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="pinned" className="text-sm font-medium text-gray-700">
                    Ghim bài viết này
                  </label>
                </div>

                {/* Status Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) =>
                        setStatus(e.target.value as "active" | "inactive" | "draft")
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer transition-all duration-200"
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Không hoạt động</option>
                      <option value="draft">Bản nháp</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-xl transition-all duration-200 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !title.trim() || !content.trim()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Đang xử lý...
                    </>
                  ) : (
                    isEditing ? "Cập nhật" : "Đăng thông báo"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AnnouncementModal;