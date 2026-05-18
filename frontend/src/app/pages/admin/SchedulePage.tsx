import { ScheduleMainSection } from "../../components/adminComponents/schedule/ScheduleMainSection";
import { Plus } from "lucide-react";

export const SchedulePage = () => {
  return (
    <div className="flex flex-col relative">
      {/* Floating Action Button */}
      <div className="fixed right-8 bottom-8 z-10 bg-violet-700 w-14 h-14 rounded-full cursor-pointer flex items-center justify-center">
        <Plus size={22} className="text-white" />
      </div>

      {/* Main content */}
      <div className="max-w-[1600px] p-8 w-full">
        <ScheduleMainSection />
      </div>
    </div>
  );
};