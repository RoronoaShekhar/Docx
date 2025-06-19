import { useState, useEffect, useRef } from "react"; import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; import { motion, AnimatePresence } from "framer-motion"; import { Textarea } from "@/components/ui/textarea"; import { Label } from "@/components/ui/label"; import { apiRequest } from "@/lib/queryClient"; import type { SchoolEntry, WhatididEntry } from "@shared/schema";

interface DateModalProps { date: Date; section: 'school' | 'whatidid'; isAdmin: boolean; onClose: () => void; onContentChange: () => void; }

export default function DateModal({ date, section, isAdmin, onClose, onContentChange }: DateModalProps) { const [isVisible, setIsVisible] = useState(false); const [formData, setFormData] = useState<any>({}); const queryClient = useQueryClient(); const modalRef = useRef<HTMLDivElement>(null); const [showHint, setShowHint] = useState(false);

const dateString = date.toISOString().split('T')[0]; const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const { data, isLoading } = useQuery({ queryKey: [/api/${section}/${dateString}], enabled: !!dateString, });

const saveMutation = useMutation({ mutationFn: async (data: any) => await apiRequest('POST', /api/${section}, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: [/api/${section}/${dateString}] }); onContentChange(); }, });

useEffect(() => { setIsVisible(true); if (data) setFormData(data); const hintTimeout = setTimeout(() => setShowHint(true), 2000); return () => clearTimeout(hintTimeout); }, [data]);

useEffect(() => { if (!formData || !modalRef.current) return; const timeout = setTimeout(() => { const textareas = modalRef.current!.querySelectorAll("textarea"); textareas.forEach((ta) => { ta.style.height = "auto"; ta.style.height = Math.max(ta.scrollHeight, 44) + "px"; }); }, 50); return () => clearTimeout(timeout); }, [formData]);

useEffect(() => { const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); }; const handleClickOutside = (e: MouseEvent) => { if (modalRef.current && !modalRef.current.contains(e.target as Node)) handleClose(); }; document.addEventListener('keydown', handleEscape); document.addEventListener('mousedown', handleClickOutside); return () => { document.removeEventListener('keydown', handleEscape); document.removeEventListener('mousedown', handleClickOutside); }; }, []);

const handleClose = () => { setIsVisible(false); setTimeout(onClose, 300); };

const handleInputChange = (field: string, value: string) => { setFormData((prev: any) => ({ ...prev, [field]: value })); if (isAdmin) { const saveData = { ...formData, [field]: value, date: dateString }; saveMutation.mutate(saveData); } };

const autoExpandTextarea = (textarea: HTMLTextAreaElement) => { textarea.style.height = 'auto'; textarea.style.height = Math.max(textarea.scrollHeight, 44) + 'px'; };

const renderContent = (text: string) => { const urlRegex = /((https?://)?[\w.-]+.[a-z]{2,}(\S*)?)/gi; const imgRegex = /{(https?:.*.(?:png|jpg|jpeg|gif))}/gi;

if (!text) return "";

const elements: (JSX.Element | string)[] = [];
let lastIndex = 0;

const combinedRegex = new RegExp(`${imgRegex.source}|${urlRegex.source}`, 'gi');

let match;
while ((match = combinedRegex.exec(text)) !== null) {
  const matchText = match[0];
  const matchIndex = match.index;
  if (matchIndex > lastIndex) elements.push(text.slice(lastIndex, matchIndex));
  if (imgRegex.test(matchText)) {
    const url = matchText.replace(/[{}]/g, '');
    elements.push(<img key={matchIndex} src={url} alt="img" className="my-2 max-h-60 w-auto rounded-xl" />);
  } else {
    const url = matchText.startsWith("http") ? matchText : `https://${matchText}`;
    elements.push(
      <a key={matchIndex} href={url} className="text-blue-500 underline opacity-70 hover:opacity-100" target="_blank" rel="noopener noreferrer">
        {matchText}
      </a>
    );
  }
  lastIndex = combinedRegex.lastIndex;
}
if (lastIndex < text.length) elements.push(text.slice(lastIndex));
return elements;

};

const schoolPeriods = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']; const whatididActivities = ['ioqm', 'nsep', 'schol'];

const periodLabels = { p1: 'P1 - First Period', p2: 'P2 - Second Period', p3: 'P3 - Third Period', p4: 'P4 - Fourth Period', p5: 'P5 - Fifth Period', p6: 'P6 - Sixth Period', p7: 'P7 - Seventh Period', p8: 'P8 - Eighth Period', };

const activityLabels = { ioqm: 'IOQM', nsep: 'NSEP', schol: 'Schol', };

if (isLoading) return ( <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }}> <motion.div className="bg-white rounded-xl shadow-2xl p-8" initial={{ scale: 0.9 }} animate={{ scale: 1 }}> <div className="text-center">Loading...</div> </motion.div> </motion.div> );

return ( <AnimatePresence> {isVisible && ( <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}> <motion.div ref={modalRef} className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-[95%] sm:w-[90%] max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-white/30" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25, duration: 0.4 }} > <div className={${section === 'school' ? 'bg-pastel-mint' : 'bg-pastel-lavender'} px-6 py-5 flex justify-between items-center backdrop-blur-lg}> <h3 className="text-xl font-semibold text-foreground title-font"> {section === 'school' ? 'School' : 'What I Did'} - {formattedDate} </h3> <motion.button onClick={handleClose} className="text-foreground hover:text-muted-foreground text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-all" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} > × </motion.button> </div>

<div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)] relative">
          {showHint && <div className="absolute top-2 right-4 text-xs text-gray-600 animate-pulse">💡 Bhai tu SCROLL kar sakta hai</div>}
          <motion.div className="space-y-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}>
            {(section === 'school' ? schoolPeriods : whatididActivities).map((key, index) => (
              <motion.div
                key={key}
                className={`rounded-2xl p-5 ${['bg-pastel-mint/30','bg-pastel-lavender/30','bg-pastel-pink/30','bg-pastel-peach/30','bg-pastel-yellow/30'][index % 5]} border border-white/50 backdrop-blur-sm`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Label className="block text-sm font-semibold mb-3 label-font period-label">
                  {(section === 'school' ? periodLabels[key] : activityLabels[key]) || key.toUpperCase()}
                </Label>
                <div className="text-black text-sm leading-relaxed break-words">
                  {renderContent(formData[key] || '')}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

); }

