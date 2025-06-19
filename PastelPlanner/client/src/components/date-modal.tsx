import { useState, useEffect, useRef } from "react"; import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; import { motion, AnimatePresence } from "framer-motion"; import { Textarea } from "@/components/ui/textarea"; import { Label } from "@/components/ui/label"; import { apiRequest } from "@/lib/queryClient"; import type { SchoolEntry, WhatididEntry } from "@shared/schema";

interface DateModalProps { date: Date; section: 'school' | 'whatidid'; isAdmin: boolean; onClose: () => void; onContentChange: () => void; }

export default function DateModal({ date, section, isAdmin, onClose, onContentChange }: DateModalProps) { const [isVisible, setIsVisible] = useState(false); const [formData, setFormData] = useState<any>({}); const [showScrollHint, setShowScrollHint] = useState(false); const queryClient = useQueryClient(); const modalRef = useRef<HTMLDivElement>(null);

const dateString = date.toISOString().split('T')[0]; const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const { data, isLoading } = useQuery({ queryKey: [/api/${section}/${dateString}], enabled: !!dateString, });

const saveMutation = useMutation({ mutationFn: async (data: any) => await apiRequest('POST', /api/${section}, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: [/api/${section}/${dateString}] }); onContentChange(); }, });

useEffect(() => { setIsVisible(true); if (data) setFormData(data); }, [data]);

useEffect(() => { if (!formData || !modalRef.current) return; const timeout = setTimeout(() => { const textareas = modalRef.current!.querySelectorAll("textarea"); textareas.forEach((ta) => { ta.style.height = "auto"; ta.style.height = Math.max(ta.scrollHeight, 44) + "px"; }); }, 50); return () => clearTimeout(timeout); }, [formData]);

useEffect(() => { const handleEscape = (e: KeyboardEvent) => e.key === 'Escape' && handleClose(); const handleClickOutside = (e: MouseEvent) => { if (modalRef.current && !modalRef.current.contains(e.target as Node)) handleClose(); }; document.addEventListener('keydown', handleEscape); document.addEventListener('mousedown', handleClickOutside); return () => { document.removeEventListener('keydown', handleEscape); document.removeEventListener('mousedown', handleClickOutside); }; }, []);

useEffect(() => { const scrollHintTimer = setTimeout(() => setShowScrollHint(true), 2000); return () => clearTimeout(scrollHintTimer); }, []);

const handleClose = () => { setIsVisible(false); setTimeout(onClose, 300); };

const handleInputChange = (field: string, value: string) => { setFormData((prev: any) => ({ ...prev, [field]: value })); if (isAdmin) saveMutation.mutate({ ...formData, [field]: value, date: dateString }); };

const autoExpandTextarea = (textarea: HTMLTextAreaElement) => { textarea.style.height = 'auto'; textarea.style.height = Math.max(textarea.scrollHeight, 44) + 'px'; };

const schoolPeriods = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']; const whatididActivities = ['ioqm', 'nsep', 'schol'];

const periodLabels = { p1: 'P1 - First Period', p2: 'P2 - Second Period', p3: 'P3 - Third Period', p4: 'P4 - Fourth Period', p5: 'P5 - Fifth Period', p6: 'P6 - Sixth Period', p7: 'P7 - Seventh Period', p8: 'P8 - Eighth Period', };

const activityLabels = { ioqm: 'IOQM', nsep: 'NSEP', schol: 'Schol', };

const renderContent = (items: string[], labels: Record<string, string>) => ( items.map((key, index) => ( <motion.div key={key} className={rounded-2xl p-5 bg-white border shadow-sm} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1, duration: 0.3 }} > <Label className="block text-sm font-semibold mb-3 text-black"> {labels[key as keyof typeof labels]} </Label> <Textarea className={resize-none overflow-hidden transition-all duration-200 text-black placeholder:text-gray-500 bg-white ${!isAdmin ? 'cursor-not-allowed opacity-60' : ''}} value={formData[key] || ''} onChange={(e) => { handleInputChange(key, e.target.value); autoExpandTextarea(e.target); }} readOnly={!isAdmin} rows={1} onInput={(e) => autoExpandTextarea(e.target as HTMLTextAreaElement)} /> </motion.div> )) );

if (isLoading) { return ( <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }}> <motion.div className="bg-white rounded-2xl shadow-2xl p-8" initial={{ scale: 0.9 }} animate={{ scale: 1 }}> <div className="text-center">Loading...</div> </motion.div> </motion.div> ); }

return ( <AnimatePresence> {isVisible && ( <motion.div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}> <motion.div ref={modalRef} className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-[95%] sm:w-[90%] max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden border" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25, duration: 0.4 }} > {/* Header */} <div className={${section === 'school' ? 'bg-pastel-mint' : 'bg-pastel-lavender'} px-6 py-5 flex justify-between items-center}> <h3 className="text-xl font-semibold text-black"> {section === 'school' ? 'School' : 'What I Did'} - {formattedDate} </h3> <motion.button onClick={handleClose} className="text-black hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} > × </motion.button> </div>

{/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          <motion.div className="space-y-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}>
            {section === 'school' ? renderContent(schoolPeriods, periodLabels) : renderContent(whatididActivities, activityLabels)}
          </motion.div>
          {showScrollHint && (
            <motion.div
              className="mt-4 text-center text-sm text-gray-500 animate-pulse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Bhai tu SCROLL kar sakta hai ↓
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

); }

