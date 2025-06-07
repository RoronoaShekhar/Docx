import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import AnimatedTabSwitcher from "@/components/animated-tab-switcher";
import Calendar from "@/components/calendar";
import DateModal from "@/components/date-modal";
import SpecialModal from "@/components/special-modal";
import AdminLoginModal from "@/components/admin-login-modal";

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeSection, setActiveSection] = useState<'school' | 'whatidid'>('school');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showSpecialModal, setShowSpecialModal] = useState<'holiday' | 'whathaddone' | null>(null);
  const [schoolCurrentMonth, setSchoolCurrentMonth] = useState(new Date(2024, 5, 1)); // June 2024
  const [whatididCurrentMonth, setWhatididCurrentMonth] = useState(new Date(2024, 5, 1)); // June 2024
  const { toast } = useToast();

  const handleAdminToggle = () => {
    if (!isAdmin) {
      setShowLoginModal(true);
    } else {
      setIsAdmin(false);
      setHasUnsavedChanges(false);
      toast({
        title: "Logged Out",
        description: "You have exited admin mode.",
      });
    }
  };

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    setShowLoginModal(false);
  };

  const handleSaveChanges = async () => {
    try {
      // In a real app, this would save all pending changes
      setHasUnsavedChanges(false);
      toast({
        title: "Changes Saved",
        description: "All changes have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDateClick = (date: Date) => {
    // Only allow dates from June 16, 2024 onwards
    const minDate = new Date(2024, 5, 16);
    if (date >= minDate) {
      setSelectedDate(date);
    }
  };

  const handleSpecialButtonClick = (type: 'holiday' | 'whathaddone') => {
    setShowSpecialModal(type);
  };

  const handleContentChange = () => {
    if (isAdmin) {
      setHasUnsavedChanges(true);
    }
  };

  const currentMonth = activeSection === 'school' ? schoolCurrentMonth : whatididCurrentMonth;
  const setCurrentMonth = activeSection === 'school' ? setSchoolCurrentMonth : setWhatididCurrentMonth;

  const navigateMonth = (direction: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const isJune2024 = currentMonth.getMonth() === 5 && currentMonth.getFullYear() === 2024;

  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ 
        backgroundColor: activeSection === 'school' 
          ? 'hsl(var(--school-bg))' 
          : 'hsl(var(--whatidid-bg))' 
      }}
    >
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-normal text-foreground title-font">CampusDocx</h1>
              <p className="text-sm text-muted-foreground mt-1 body-font">Answering the biggest problem of the era , <Bhai Aaj Kya Hua?></></p>
            </div>
            <div className="flex items-center gap-4">
              <AnimatePresence>
                {hasUnsavedChanges && isAdmin && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      onClick={handleSaveChanges}
                      className="flat-button special"
                    >
                      Save Changes
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={handleAdminToggle}
                className={`flat-button ${isAdmin ? 'bg-red-200 hover:bg-red-300' : 'special'}`}
              >
                {isAdmin ? "Logout" : "Admin Login"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Animated Tab Switcher */}
      <AnimatedTabSwitcher 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">

        {/* Calendar Section */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-normal text-foreground mb-2 title-font">
            {activeSection === 'school' ? 'Bhai Aaj School me Kya hua tha ?' : 'Bhai Syllabus Kha tak hua ?'}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground body-font">
            {activeSection === 'school' 
              ? 'Answer to Bhai <Aaj School me Kya hua tha ?> Also , ye 2024 ko ignore karna(me_ab_debug_nahi_karugna_bhot_time_waste_hai'
              : 'Bhai Syllabus Kha tak hua ?> , ye 2024 ko ignore karna(me_ab_debug_nahi_karugna_bhot_time_waste_hai'
            }
          </p>
        </div>

        {/* Calendar Navigation */}
        <div className="flex justify-between items-center mb-6 sm:mb-8 bg-white p-4 sm:p-6 rounded-lg border" style={{ borderColor: 'hsl(var(--border))' }}>
          <button
            onClick={() => navigateMonth(-1)}
            className="flat-button special text-xl sm:text-2xl w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
          >
            ‹
          </button>
          <h3 className="text-lg sm:text-xl font-normal text-foreground title-font text-center">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={() => navigateMonth(1)}
            className="flat-button special text-xl sm:text-2xl w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
          >
            ›
          </button>
        </div>

        {/* Special Buttons (visible only in June 2024 before 16th) */}
        {isJune2024 && (
          <div className="mb-6 sm:mb-8 text-center">
            <button
              onClick={() => handleSpecialButtonClick(activeSection === 'school' ? 'holiday' : 'whathaddone')}
              className="flat-button holiday px-6 sm:px-12 py-3 sm:py-4 text-base sm:text-lg"

            >
              {activeSection === 'school' ? 'Holiday Homework ' : 'What I Had Done'}
            </button>
          </div>
        )}

        {/* Calendar Grid */}
        <div className="p-4 sm:p-8 rounded-lg border" style={{ 
          backgroundColor: 'hsl(var(--calendar-bg))', 
          borderColor: 'hsl(var(--border))' 
        }}>
          <Calendar
            currentMonth={currentMonth}
            onDateClick={handleDateClick}
            activeSection={activeSection}
          />
        </div>
      </main>

      {/* Modals */}
      {selectedDate && (
        <DateModal
          date={selectedDate}
          section={activeSection}
          isAdmin={isAdmin}
          onClose={() => setSelectedDate(null)}
          onContentChange={handleContentChange}
        />
      )}

      {showSpecialModal && (
        <SpecialModal
          type={showSpecialModal}
          isAdmin={isAdmin}
          onClose={() => setShowSpecialModal(null)}
          onContentChange={handleContentChange}
        />
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLoginSuccess}
      />
    </div>
  );
}
