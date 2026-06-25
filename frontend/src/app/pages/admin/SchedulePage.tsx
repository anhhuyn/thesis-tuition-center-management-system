import { ScheduleMainSection } from "../../components/adminComponents/schedule/ScheduleMainSection";
import { Plus } from "lucide-react";

export const SchedulePage = () => {
  return (
    <div className="flex flex-col relative">
     
      {/* Main content */}
      <div className="max-w-[1600px] p-8 w-full">
        <ScheduleMainSection />
      </div>
    </div>
  );
};