import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import type { SchoolEntry, WhatididEntry } from "@shared/schema";

interface DateModalProps {
  date: Date;
  section: 'school' | 'whatidid';
  isAdmin: boolean;
  onClose: () => void;
  onContentChange: () => void;
}

export default function DateModal({ date, section, isAdmin, onClose, onContentChange }: DateModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const queryClient = useQueryClient();
  const modalRef = useRef<HTMLDivElement>(null);

  const dateString = date.toISOString().split('T')[0];
  const formattedDate = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Fetch data for the selected date
  const { data, isLoading } = useQuery({
    queryKey: [`/api/${section}/${dateString}`],
    enabled: !!dateString,
  });

  // Mutation to save data
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', `/api/${section}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${section}/${dateString}`] });
      onContentChange();
    },
  });

  useEffect(() => {
    setIsVisible(true);
    
    // Set initial form data when data is loaded
    if (data) {
      setFormData(data);
    }
  }, [data]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    
    // Auto-save when admin makes changes
    if (isAdmin) {
      const saveData = { ...formData, [field]: value, date: dateString };
      saveMutation.mutate(saveData);
    }
  };

  const autoExpandTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.max(textarea.scrollHeight, 44) + 'px';
  };

  const schoolPeriods = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'];
  const whatididActivities = ['ioqm', 'nsep', 'schol'];

  const periodLabels = {
    p1: 'P1 - First Period',
    p2: 'P2 - Second Period', 
    p3: 'P3 - Third Period',
    p4: 'P4 - Fourth Period',
    p5: 'P5 - Fifth Period',
    p6: 'P6 - Sixth Period',
    p7: 'P7 - Seventh Period',
    p8: 'P8 - Eighth Period',
  };

  const activityLabels = {
    ioqm: 'IOQM',
    nsep: 'NSEP',
    schol: 'Schol',
  };

  if (isLoading) {
    return (
      <motion.div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div 
          className="bg-white rounded-2xl shadow-2xl p-8"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          <div className="text-center">Loading...</div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            ref={modalRef}
            className="bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-xs sm:max-w-2xl mx-2 sm:mx-4 max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-white/30"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 25,
              duration: 0.4
            }}
          >
            {/* Header */}
            <div className={`${section === 'school' ? 'bg-pastel-mint' : 'bg-pastel-lavender'} px-6 py-5 flex justify-between items-center backdrop-blur-lg`}>
              <h3 className="text-xl font-semibold text-foreground title-font">
                {section === 'school' ? 'School' : 'What I Did'} - {formattedDate}
              </h3>
              <motion.button
                onClick={handleClose}
                className="text-foreground hover:text-muted-foreground text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <motion.div 
                className="space-y-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                {section === 'school' ? (
                  // School periods
                  schoolPeriods.map((period, index) => (
                    <motion.div 
                      key={period} 
                      className={`rounded-2xl p-5 ${['bg-pastel-mint/30', 'bg-pastel-lavender/30', 'bg-pastel-pink/30', 'bg-pastel-peach/30', 'bg-pastel-yellow/30'][index % 5]} border border-white/50 backdrop-blur-sm`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                      <Label className="block text-sm font-semibold mb-3 label-font period-label">
                        {periodLabels[period as keyof typeof periodLabels]}
                      </Label>
                      <Textarea
                        className={`modal-textarea resize-none overflow-hidden transition-all duration-200 body-font ${!isAdmin ? 'cursor-not-allowed opacity-60' : ''}`}
                        value={formData[period] || ''}
                        onChange={(e) => {
                          handleInputChange(period, e.target.value);
                          autoExpandTextarea(e.target);
                        }}
                        placeholder={`Enter activities or subjects for ${period.toUpperCase()}...`}
                        readOnly={!isAdmin}
                        rows={1}
                        onInput={(e) => autoExpandTextarea(e.target as HTMLTextAreaElement)}
                      />
                    </motion.div>
                  ))
                ) : (
                  // What I Did activities
                  whatididActivities.map((activity, index) => (
                    <motion.div 
                      key={activity} 
                      className={`rounded-2xl p-5 ${['bg-pastel-lavender/30', 'bg-pastel-mint/30', 'bg-pastel-pink/30'][index % 3]} border border-white/50 backdrop-blur-sm`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                      <Label className="block text-sm font-semibold mb-3 label-font period-label">
                        {activityLabels[activity as keyof typeof activityLabels]}
                      </Label>
                      <Textarea
                        className={`modal-textarea resize-none overflow-hidden transition-all duration-200 body-font ${!isAdmin ? 'cursor-not-allowed opacity-60' : ''}`}
                        value={formData[activity] || ''}
                        onChange={(e) => {
                          handleInputChange(activity, e.target.value);
                          autoExpandTextarea(e.target);
                        }}
                        placeholder={`Enter ${activity.toUpperCase()} activities...`}
                        readOnly={!isAdmin}
                        rows={1}
                        onInput={(e) => autoExpandTextarea(e.target as HTMLTextAreaElement)}
                      />
                    </motion.div>
                  ))
                )}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
