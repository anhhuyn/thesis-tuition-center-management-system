// material/types.ts
import type { Material } from "../../../../../utils/types/material";
import type { Subject } from "../../../../../utils/types/subject";

export type MaterialSectionProps = {
    subject: Subject | null;
    isTeacher?: boolean;
};

export interface FilterButton {
    label: string;
    value: string;
    count?: number;
}

export interface FloatingUploadButtonProps {
    onClick: () => void;
}

export interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload?: (files: FileList, title?: string) => Promise<void>;
    setAlert?: (alert: any) => void;
}

export interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    material: Material | null;
    onUpdate: (id: number, title: string, file?: File) => Promise<void>;
    setAlert?: (alert: any) => void;
}

export interface MaterialCardProps {
    material: Material;
    onStar: (id: number) => void;
    onDownload: (fileURL: string) => void;
    onDelete: (id: number) => Promise<void>;
    onPreview?: (fileURL: string, material?: Material) => void;
    onEdit?: (material: Material) => void;
    setAlert?: (alert: any) => void;
}

export interface StorageCardProps {
    materials: Material[];
}

export const filterButtons: FilterButton[] = [
    { label: "Tất cả", value: "all", count: 24 },
    { label: "Bài giảng", value: "lecture", count: 12 },
    { label: "Bài tập", value: "exercise", count: 8 },
    { label: "Đề thi", value: "exam", count: 3 },
    { label: "Tham khảo", value: "reference", count: 1 },
];