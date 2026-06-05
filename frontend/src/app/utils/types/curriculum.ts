// src/types/curriculum.ts
import type { SessionStatus } from './session';

// ============ Curriculum Types ============
export interface CurriculumRequest {
  title: string;
  description?: string;
  orderIndex?: number;
  expectedSessions?: number;
  status?: string;
  semester?: string;
  schoolYear?: string;
}

export interface CurriculumResponse {
  id: number;
  subjectId: number;
  subjectName: string;
  title: string;
  description: string | null;
  orderIndex: number;
  expectedSessions: number;
  status: string;
  semester: string | null;
  schoolYear: string | null;
  totalSessionDetails: number;
  createdAt: string;
  updatedAt: string;
}

export interface CurriculumDetailResponse extends CurriculumResponse {
  sessionDetails: SessionDetailResponse[];
}

// ============ SessionDetail Types ============
export interface SessionDetailRequest {
  sessionNumber?: number | null;  // ✅ Cho phép null
  topic: string;
  objectives?: string;
  content?: string;
  homework?: string;
  materials?: string;
  durationMinutes?: number;
  teachingMethod?: string;
  assessmentCriteria?: string;
  displayOrder?: number;  // ✅ Thêm displayOrder (optional, backend sẽ tự tính)
}

export interface SessionDetailResponse {
  id: number;
  curriculumId: number;
  curriculumTitle: string;
  sessionNumber: number | null;  // ✅ Cho phép null
  displayOrder: number;  // ✅ THÊM displayOrder
  topic: string;
  objectives: string | null;
  content: string | null;
  homework: string | null;
  materials: string | null;
  durationMinutes: number;
  teachingMethod: string | null;
  assessmentCriteria: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============ Session Actual Content Types ============
export interface SessionActualContentRequest {
  isFollowPlan: boolean;
  plannedSessionDetailId?: number | null;
  actualTopic?: string;
  actualContent?: string;
  actualHomework?: string;
  deviationReason?: string;
  noteForNextSession?: string;
}

export interface SessionContentResponse {
  sessionId: number;
  sessionDate: string;
  startTime: string;
  endTime: string;
  displayTopic: string | null;
  displayContent: string | null;
  displayHomework: string | null;
  isFollowingPlan: boolean;
  plannedTopic: string | null;
  deviationReason: string | null;
  noteForNextSession: string | null;
}

// ============ Batch Create Types ============
export interface BatchCreateResult {
  success: SessionDetailResponse[];
  failed: Array<{
    sessionNumber: number;
    error: string;
  }>;
}

// ============ Reorder Types ============
export interface ReorderRequest {
  sessionDetailIdsInOrder: number[];  // Danh sách ID theo thứ tự mới
}