import { ClassListSection } from "../../components/adminComponents/class/ClassListSection";
import { DashboardSummarySection } from "../../components/adminComponents/class/DashboardSummarySection";
import { useState } from "react";
import AddClassModal from "../../components/adminComponents/class/AddClassModal";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";

export function ClassListPage() {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const headerVariants: Variants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const contentVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 80,
        damping: 15,
      },
    },
  };

  const listVariants: Variants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 90,
        damping: 12,
        delay: 0.3,
      },
    },
  };

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-gray-50 min-h-screen"
    >
      {/* Header */}
      <motion.section
        variants={headerVariants}
        className="relative overflow-hidden pb-8 pt-0"
      >
        {/* Content */}
        <motion.div
          variants={contentVariants}
          className="relative max-w-7xl mx-auto px-6 pt-10"
        >
          <DashboardSummarySection onAdd={() => setIsOpenModal(true)} />
        </motion.div>
      </motion.section>

      {/* Class List */}
      <motion.div
        variants={listVariants}
        className="max-w-7xl mx-auto px-6"
      >
        <ClassListSection
          key={refreshKey}
          isOpenModal={isOpenModal}
          setIsOpenModal={setIsOpenModal}
          onRefresh={handleRefresh}
        />
      </motion.div>

      {/* Modal với animation */}
      <AnimatePresence>
        {isOpenModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <AddClassModal
              isOpen={isOpenModal}
              onClose={() => setIsOpenModal(false)}
              mode="create"
              onSuccess={handleRefresh}
            />
          </motion.div>
        )}
      </AnimatePresence>
</motion.main>
  );
}