import { useState, useEffect, useRef } from "react"; import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; import { motion, AnimatePresence } from "framer-motion"; import { Textarea } from "@/components/ui/textarea"; import { Label } from "@/components/ui/label"; import { apiRequest } from "@/lib/queryClient"; import type { SchoolEntry, WhatididEntry } from "@shared/schema";

interface DateModalProps { date: Date; section: 'school' | 'whatidid'; isAdmin: boolean; onClose: () => void; onContentChange: () => void; }

export default function DateModal({ date, section, isAdmin, onClose, onContentChange }: DateModalProps) { const [isVisible, setIsVisible] = useState(false); const [formData, setFormData] = useState<any>({}); const queryClient = useQueryClient(); const modalRef = useRef<HTMLDivElement>(null);

const dateString = date.toISOString().split('T')[0]; const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const { data, isLoading } = useQuery({ queryKey: [/api/${section}/${dateString}], enabled: !!dateString, });

const saveMutation = useMutation({ mutationFn: async (data: any) => await apiRequest('POST', /api/${section}, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: [/api/${section}/${dateString}] }); onContentChange(); }, });

useEffect(() => { setIsVisible(true); if (data) setFormData(data); }, [data]);

useEffect(() => { if (!formData || !modalRef.current) return; const timeout = setTimeout(() => { const textareas = modalRef.current!.querySelectorAll("textarea"); textareas.forEach((ta) => { ta.style.height = "auto"; ta.style.height = Math.max(ta.scrollHeight, 44) + "px"; }); }, 50); return () => clearTimeout(timeout); }, [formData]);

useEffect(() => { const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); }; const handleClickOutside = (e: MouseEvent) => { if (modalRef.current && !modalRef.current.contains(e.target as Node)) handleClose(); }; document.addEventListener('keydown', handleEscape); document.addEventListener('mousedown', handleClickOutside); return () => { document.removeEventListener('keydown', handleEscape); document.removeEventListener('mousedown', handleClickOutside); }; }, []);

const handleClose = () => { setIsVisible(false); setTimeout(onClose, 300); };

const handleInputChange = (field: string, value: string) => { setFormData((prev: any) => ({ ...prev, [field]: value })); if (isAdmin) { const saveData = { ...formData, [field]: value, date: dateString }; saveMutation.mutate(saveData); } };

const autoExpandTextarea = (textarea: HTMLTextAreaElement) => { textarea.style.height = 'auto'; textarea.style.height = Math.max(textarea.scrollHeight, 44) + 'px'; };

const schoolPeriods = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']; const whatididActivities = ['ioqm', 'nsep', 'schol'];

const periodLabels: Record<string, string> = { p1: 'P1 - First Period', p2: 'P2 - Second Period', p3: 'P3 - Third Period', p4: 'P4 - Fourth Period', p5: 'P5 - Fifth Period', p6: 'P6 - Sixth Period', p7: 'P7 - Seventh Period', p8: 'P8 - Eighth Period', };

const activityLabels: Record<string, string> = { ioqm: 'IOQM', nsep: 'NSEP', schol: 'Schol', };

if (isLoading) return ( <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }}> <motion.div className="bg-white rounded-xl shadow-2xl p-8" initial={{ scale: 0.9 }} animate={{ scale: 1 }}> <div className="text-center">Loading...</div> </motion.div> </motion.div> );

return ( <AnimatePresence> {isVisible && ( <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}> <motion.div ref={modalRef} className="bg-white w-[96%] sm:w-[92%] lg:w-[85%] max-w-6xl h-[95vh] rounded-lg overflow-hidden border border-gray-200 shadow-xl" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 25, duration: 0.4 }} > <div className={${section === 'school' ? 'bg-pastel-mint' : 'bg-pastel-lavender'} px-6 py-5 flex justify-between items-center}> <h3 className="text-xl font-semibold text-gray-800"> {section === 'school' ? 'School' : 'What I Did'} - {formattedDate} </h3> <motion.button onClick={handleClose} className="text-gray-700 hover:text-black text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-all" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>×</motion.button> </div>

<div className="p-4 sm:p-6 overflow-y-auto h-[calc(95vh-100px)]">
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(section === 'school' ? schoolPeriods : whatididActivities).map((key, i) => (
              <motion.div key={key} className="bg-gray-50 border border-gray-300 rounded-xl p-4 shadow-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  {(section === 'school' ? periodLabels[key] : activityLabels[key]) ?? key.toUpperCase()}
                </Label>
                <Textarea
                  className="w-full text-black placeholder:text-gray-400 resize-none overflow-hidden bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent p-2"
                  value={formData[key] || ''}
                  onChange={(e) => {
                    handleInputChange(key, e.target.value);
                    autoExpandTextarea(e.target);
                  }}
                  readOnly={!isAdmin}
                  placeholder="Type here..."
                  rows={1}
                  onInput={(e) => autoExpandTextarea(e.target as HTMLTextAreaElement)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

); }

