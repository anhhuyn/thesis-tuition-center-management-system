// src/components/class/curriculum/EditSessionButton.tsx
import { Edit } from "lucide-react";
import type { SessionDetailResponse } from "../../../../../utils/types/curriculum";

interface EditSessionButtonProps {
  session: SessionDetailResponse;
  curriculumTitle: string;
  sessionIndex: number;
  onClick: (session: SessionDetailResponse, curriculumTitle: string, sessionIndex: number) => void;
}

export const EditSessionButton = ({
  session,
  curriculumTitle,
  sessionIndex,
  onClick,
}: EditSessionButtonProps) => {
  return (
    <button
      onClick={() => onClick(session, curriculumTitle, sessionIndex)}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all"
    >
      <Edit size={12} />
      Chỉnh sửa
    </button>
  );
};