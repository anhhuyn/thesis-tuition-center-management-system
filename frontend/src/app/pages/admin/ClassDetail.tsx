// ClassDetail.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CourseOverviewSection } from "../../components/adminComponents/class/classDetail/CourseOverviewSection";
import { MainContentSection } from "../../components/adminComponents/class/classDetail/MainContentSection";
import { TabNavigationSection } from "../../components/adminComponents/class/classDetail/TabNavigationSection";
import type { Subject } from "../../utils/types/subject";
import { subjectApi } from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";

type Props = {
    isTeacher?: boolean; 
};

export const ClassDetail = ({isTeacher}: Props) => {
  const { user } = useAuth();
  
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSubjectDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const res = await subjectApi.getById(Number(id));
      setSubject(res.data);
    } catch (err) {
      console.error("Fetch subject detail failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjectDetail();
  }, [id]);

  // Hàm refresh data sau khi update
  const handleRefreshSubject = () => {
    fetchSubjectDetail();
  };

  console.log("Class ID:", id);

  return (
    <div className="flex flex-col w-full">
      <main className="w-full px-10 py-10">
        <div className="max-w-[1200px] w-full mx-auto flex flex-col gap-6">

          <CourseOverviewSection subject={subject} isTeacher={isTeacher} />
          <TabNavigationSection activeTab={activeTab} setActiveTab={setActiveTab} subject={subject} />
          <MainContentSection activeTab={activeTab} subject={subject} onRefreshSubject={handleRefreshSubject} isTeacher={isTeacher} />
        </div>
      </main>
    </div>
  );
};