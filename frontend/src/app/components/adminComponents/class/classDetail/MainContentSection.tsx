import { ClassDetailContent } from "./ClassDetailContent";
import { CalendarSection } from "./CalendarSection";
import { MaterialSection } from "./MaterialSection";
import { AttendanceSection } from "./AttendanceSection";
import type { Subject } from "../../../../utils/types/subject";
import { StudentTableSection } from "./students/StudentTableSection";
import { CurriculumSection } from "./CurriculumSection";

type Props = {
    activeTab: number;
    subject: Subject | null;
    onRefreshSubject?: () => void;
    isTeacher?: boolean;
    onTabChange?: (tabIndex: number) => void;
};

export const MainContentSection = ({ activeTab, subject, isTeacher, onTabChange }: Props) => {

    const handleNavigateToMaterials = () => {
        if (onTabChange) {
            onTabChange(4);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleNavigateToAttendance = () => {
        if (onTabChange) {
            onTabChange(5);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    const renderContent = () => {
        switch (activeTab) {
            case 0:
                return <ClassDetailContent subject={subject} isTeacher={isTeacher}
                    onNavigateToMaterials={handleNavigateToMaterials}
                    onNavigateToAttendance={handleNavigateToAttendance} />;

            case 1:
                return <StudentTableSection subject={subject} isTeacher={isTeacher} />;
            case 2:
                  return <CurriculumSection subject={subject!} isTeacher={isTeacher} />;

            case 3:
                return <CalendarSection subject={subject} isTeacher={isTeacher} />;

            case 4:
                return <MaterialSection subject={subject} isTeacher={isTeacher} />;

            case 5:
                return <AttendanceSection subject={subject} />;

            case 6:
                return <div>Báo cáo</div>;

            default:
                return null;
        }
    };
    return (
        <section className="flex flex-col gap-6 w-full">
            {renderContent()}
        </section>
    );
};
