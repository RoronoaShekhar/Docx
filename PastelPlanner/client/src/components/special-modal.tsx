import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  const [isVisible, setIsVisible] = useState(true);
  const [content, setContent] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const queryClient = useQueryClient();
  const modalRef = useRef<HTMLDivElement>(null);

  const apiType = type === 'holiday' ? 'holiday_homework' : 'what_had_done';
  const title = type === 'holiday' ? 'Holiday Homework' : 'What I Had Done';

  const { data, isLoading } = useQuery({ queryKey: [`/api/special/${apiType}`] });

  const saveMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest('POST', '/api/special', { type: apiType, content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/special/${apiType}`] });
      onContentChange();
    },
  });

  useEffect(() => {
    if (data && typeof data === 'object' && 'content' in data) {
      setContent((data as any).content || '');
    }
    const hintTimeout = setTimeout(() => setShowHint(true), 2000);
    return () => clearTimeout(hintTimeout);
  }, [data]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
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
    if (isAdmin) saveMutation.mutate(value);
  };

  const renderContent = (text: string) => {
    const urlRegex = /((https?:\/\/)?[\w.-]+\.[a-z]{2,}(\S*)?)/gi;
    const imgRegex = /{(https?:.*\.(?:png|jpg|jpeg|gif))}/gi;

    const elements: (JSX.Element | string)[] = [];
    let lastIndex = 0;
    const combinedRegex = new RegExp(`${imgRegex.source}|${urlRegex.source}`, 'gi');
    let match;

    while ((match = combinedRegex.exec(text)) !== null) {
      const matchText = match[0];
      const matchIndex = match.index;

      if (matchIndex > lastIndex) {
        elements.push(text.slice(lastIndex, matchIndex));
      }

      if (imgRegex.test(matchText)) {
        const url = matchText.replace(/[{}]/g, '');
        elements.push(
          <img
            key={matchIndex}
            src={url}
            alt="img"
            className="my-2 max-h-60 w-auto rounded-xl border border-gray-300"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        );
      } else {
        const url = matchText.startsWith("http") ? matchText : `https://${matchText}`;
        elements.push(
          <a
            key={matchIndex}
            href={url}
            className="text-blue-600 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {matchText}
          </a>
        );
      }

      lastIndex = combinedRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex));
    }

    return elements;
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        Loading...
      </div>
    );
  }

  return (
    isVisible && (
      <div className={`fixed inset-0 bg-white z-50 overflow-y-auto p-4 flex justify-center items-start `}>
        <div
          ref={modalRef}
          className={`w-full ${isFullscreen ? 'h-full' : 'sm:w-11/12'} max-w-4xl bg-white rounded-xl shadow-xl border border-gray-300`}
        >
          {/* Header */}
          <div className={`px-6 py-4 ${type === 'holiday' ? 'bg-pastel-pink' : 'bg-pastel-lavender'} flex justify-between items-center`}>
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <div className="space-x-2">
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-red-500 hover:text-white transition"
                aria-label="Close"
              >
                <span className="text-xl font-bold">×</span>
              </button>
            </div>
          </div>

          {/* Hint */}
          {showHint && (
            <div className="text-right px-6 pt-2 text-sm text-gray-500 animate-pulse">
              💡 Bhai tu SCROLL kar sakta hai
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            <Label className="block mb-2 font-medium text-sm text-gray-700">{title} Details</Label>
            {isAdmin ? (
              <Textarea
                className="w-full resize-none text-black placeholder-gray-500 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder={`Enter ${title.toLowerCase()} details...`}
                rows={6}
              />
            ) : (
              <div className="text-black text-sm leading-relaxed break-words">
                {renderContent(content)}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );
}
