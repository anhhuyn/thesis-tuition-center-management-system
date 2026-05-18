import { ClassListSection } from "../../components/adminComponents/class/ClassListSection";
import { DashboardSummarySection } from "../../components/adminComponents/class/DashboardSummarySection";
import { useState } from "react";
import AddClassModal from "../../components/adminComponents/class/AddClassModal";


export function ClassListPage() {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Hàm refresh toàn bộ danh sách
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1); 
  };

  return (
    <main className="bg-gray-50 min-h-screen">

      {/* Gradient Header */}
      <section className="relative overflow-hidden pb-8 pt-0">

        {/* Gradient Background */}
        <div className="absolute inset-0 bg-[linear-gradient(169deg,rgba(102,126,234,1)_0%,rgba(118,75,162,1)_50%,rgba(240,147,251,1)_100%)]"></div>

        {/* Wave */}
        <svg
          className="absolute bottom-[-1px] left-0 w-full"
          viewBox="0 0 1440 270"
        >
          <path
            fill="#f9fafb"
            fillOpacity="1"
            d="M0,192L80,170.7C160,149,320,107,480,117.3C640,128,800,192,960,202.7C1120,213,1280,171,1360,149.3L1440,128L1440,320L0,320Z"
          ></path>
        </svg>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-6 pt-10">
          <DashboardSummarySection onAdd={() => setIsOpenModal(true)} />
        </div>
      </section>

      {/* Class List */}
      <div className="max-w-7xl mx-auto px-6">
        <ClassListSection
          key={refreshKey} 
          isOpenModal={isOpenModal}
          setIsOpenModal={setIsOpenModal}
          onRefresh={handleRefresh} 
        />

      </div>

       <AddClassModal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        mode="create"
        onSuccess={handleRefresh} 
      />

    </main>
  );
}