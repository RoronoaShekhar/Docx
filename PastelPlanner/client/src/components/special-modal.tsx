import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";

interface SpecialModalProps {
  type: 'holiday' | 'whathaddone';
  isAdmin: boolean;
  onClose: () => void;
  onContentChange: () => void;
}

export default function SpecialModal({ type, isAdmin, onClose, onContentChange }: SpecialModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();
  const modalRef = useRef<HTMLDivElement>(null);

  const apiType = type === 'holiday' ? 'holiday_homework' : 'what_had_done';
  const title = type === 'holiday' ? 'Holiday Homework' : 'What I Had Done';

  // Fetch existing content
  const { data, isLoading } = useQuery({
    queryKey: [`/api/special/${apiType}`],
  });

  // Mutation to save content
  const saveMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest('POST', '/api/special', {
        type: apiType,
        content
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/special/${apiType}`] });
      onContentChange();
    },
  });

  useEffect(() => {
    setIsVisible(true);
    
    // Set initial content when data is loaded
    if (data && typeof data === 'object' && 'content' in data) {
      setContent((data as any).content || '');
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

  const handleContentChange = (value: string) => {
    setContent(value);
    
    // Auto-save when admin makes changes
    if (isAdmin) {
      saveMutation.mutate(value);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
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
            className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden border border-white/30"
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
            <div className={`${type === 'holiday' ? 'bg-pastel-pink' : 'bg-pastel-lavender'} px-6 py-5 flex justify-between items-center backdrop-blur-lg`}>
              <h3 className="text-xl font-semibold text-foreground title-font">{title}</h3>
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
            <div className="p-6">
              <motion.div 
                className={`${type === 'holiday' ? 'bg-pastel-pink/30' : 'bg-pastel-lavender/30'} rounded-2xl p-6 border border-white/50 backdrop-blur-sm`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <Label className="block text-lg font-semibold mb-4 label-font period-label">
                  {title} Details
                </Label>
                <Textarea
                  className={`modal-textarea resize-none min-h-[300px] body-font transition-all duration-200 ${!isAdmin ? 'cursor-not-allowed opacity-60' : ''}`}
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder={`Enter ${title.toLowerCase()} details...`}
                  readOnly={!isAdmin}
                />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
