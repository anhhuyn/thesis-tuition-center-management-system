// src/types/library.ts
export interface Document {
    id: string;
    title: string;
    description?: string;
    type: 'pdf' | 'doc' | 'video' | 'other';
    size: string;
    version: string;
    tags: string[];
    author: string;
    authorAvatar?: string;
    uploadDate: string;
    isPinned?: boolean;
    downloads?: number;
  }
  
  export interface Activity {
    id: string;
    user: string;
    userAvatar?: string;
    action: string;
    target: string;
    time: string;
    type: 'upload' | 'edit' | 'share' | 'delete';
  }
  
  export interface StorageStats {
    used: number;
    total: number;
    unit: string;
  }