// src/components/class/curriculum/types.ts

import type { CurriculumDetailResponse, SessionDetailResponse } from "../../../../../utils/types/curriculum";


export interface Resource {
  id: number;
  title: string;
  type: "document" | "video" | "link" | "quiz";
  url?: string;
}

export interface Assignment {
  id: number;
  title: string;
  dueDate: string;
  status: "pending" | "submitted" | "graded";
  score?: number;
}

export interface SessionDetailUI extends SessionDetailResponse {
  isCompleted?: boolean;
  actualTopic?: string | null;
  isFollowPlan?: boolean;
  resources?: Resource[];
  assignments?: Assignment[];
  teacherNotes?: string;
  studentFeedback?: string;
  keyConcepts?: string[];
  quizScore?: number;
}

export interface CurriculumUI extends Omit<CurriculumDetailResponse, 'sessionDetails'> {
  sessionDetails: SessionDetailUI[];
  totalHours?: number;
  isActive?: boolean;
  tags?: string[];
  difficulty?: "beginner" | "intermediate" | "advanced";
  prerequisites?: string[];
  learningOutcomes?: string[];
}

export type ViewMode = "list" | "grid";