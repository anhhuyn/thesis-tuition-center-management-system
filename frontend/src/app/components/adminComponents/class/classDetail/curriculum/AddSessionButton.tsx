// src/components/class/curriculum/AddSessionButton.tsx
import { Plus } from "lucide-react";

interface AddSessionButtonProps {
  onClick: () => void;  
}

export const AddSessionButton = ({ onClick }: AddSessionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:text-indigo-500 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group"
    >
      <Plus size={18} className="group-hover:scale-110 transition-transform" />
      <span className="text-sm font-medium">Thêm buổi học mới</span>
    </button>
  );
};