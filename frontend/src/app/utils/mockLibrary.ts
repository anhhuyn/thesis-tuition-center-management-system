// src/utils/mockLibrary.ts
import type { Document, Activity, StorageStats } from '../utils/types/library';

export const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Giáo trình Giải tích 1',
    description: 'Giáo trình giải tích cho sinh viên năm nhất',
    type: 'pdf',
    size: '4.2 MB',
    version: 'v2.4.0',
    tags: ['toancuong', 'Học kỳ 1'],
    author: 'Nguyên Lê',
    uploadDate: '12 giờ trước',
    isPinned: true,
    downloads: 245
  },
  {
    id: '2',
    title: 'Đề cương Ôn tập Lý 12',
    description: 'Đề cương ôn tập vật lý lớp 12',
    type: 'doc',
    size: '1.1 MB',
    version: 'v1.2.0',
    tags: ['on_thi', 'Vật lý'],
    author: 'Admin',
    uploadDate: '2 ngày trước',
    downloads: 189
  },
  {
    id: '3',
    title: 'Video Bài giảng Văn 11',
    description: 'Bài giảng ngữ văn lớp 11',
    type: 'video',
    size: '45 MB',
    version: 'v1.0.0',
    tags: ['nguvan'],
    author: 'Thầy Tùng',
    uploadDate: 'Hôm qua',
    downloads: 567
  }
];

export const mockActivities: Activity[] = [
  {
    id: '1',
    user: 'GS. Nguyễn Văn A',
    action: 'đã tải lên',
    target: 'Tài liệu Sinh học 10',
    time: '5 phút trước',
    type: 'upload'
  },
  {
    id: '2',
    user: 'Minh Lê',
    action: 'vừa chỉnh sửa',
    target: 'Đề thi HK1 Anh Văn',
    time: '2 giờ trước',
    type: 'edit'
  }
];

export const storageStats: StorageStats = {
  used: 15.4,
  total: 20,
  unit: 'GB'
};

export const formatStats = [
  { name: 'PDF', percentage: 65, color: 'primary' },
  { name: 'Docs', percentage: 25, color: 'blue-500' },
  { name: 'Khác', percentage: 10, color: 'slate-300' }
];

export const trendingTags = [
  '#thptquocgia', '#luyenthi', '#giaian_2024', '#toanhoc', '#k12'
];