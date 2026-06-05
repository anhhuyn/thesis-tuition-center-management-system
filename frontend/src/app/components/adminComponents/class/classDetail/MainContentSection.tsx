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
};

export const MainContentSection = ({ activeTab, subject, onRefreshSubject, isTeacher }: Props) => {

    const renderContent = () => {
        switch (activeTab) {
            case 0:
                return <ClassDetailContent subject={subject} isTeacher={isTeacher} />;

            case 1:
                return <StudentTableSection subject={subject} isTeacher={isTeacher} />;
            case 2:
                return <CurriculumSection subject={subject} isTeacher={isTeacher} />;

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
