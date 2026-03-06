
import { useState } from 'react';
import { ClassDetail } from '../../components/adminComponents/class/ClassDetail';
import { ClassDashboard } from '../../components/adminComponents/class/ClassDashboard';
import type { Subject } from '../../utils/types/subject';
export interface Student {
    id: string;
    name: string;
    phone: string;
    parentPhone: string;
    grade: string;
    status: 'active' | 'inactive';
}

export interface Schedule {
    day: string;
    startTime: string;
    endTime: string;
}
export function ClassListPage() {
  const [selectedClass, setSelectedClass] = useState<Subject | null>(null);

  return (
    <div className="min-h-screen">
      {selectedClass ? (
        <ClassDetail 
          classData={selectedClass} 
          onBack={() => setSelectedClass(null)}
        />
      ) : (
        <ClassDashboard onSelectClass={setSelectedClass} />
      )}
    </div>
  );
}