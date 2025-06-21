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
  const [content, setContent] = useState('');
  const [showHint, setShowHint] = useState(false);
  const queryClient = useQueryClient();
  const modalRef = useRef<HTMLDivElement>(null);

  const apiType = type === 'holiday' ? 'holiday_homework' : 'what_had_done';
  const title = type === 'holiday' ? 'Holiday Homework' : 'What I Had Done';

  const { data, isLoading } = useQuery({
    queryKey: [`/api/special/${apiType}`],
  });

  const saveMutation = useMutation({
    mutationFn: async (content: string) =>
      apiRequest('POST', '/api/special', { type: apiType, content }),
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
    const handleEscape = (e: KeyboardEvent) => e.key === 'Escape' && handleClose();
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) handleClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClose = () => {
    onClose();
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    if (isAdmin) saveMutation.mutate(value);
  };

  const renderContent = (text: string) => {
    if (!text) return null;
    const lines = text.split(/\n/);
    const elements: JSX.Element[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Headings
      if (/^###\s+/.test(trimmed)) return elements.push(<h3 key={idx} className="text-base font-bold mt-3">{trimmed.replace(/^###\s+/, '')}</h3>);
      if (/^##\s+/.test(trimmed)) return elements.push(<h2 key={idx} className="text-lg font-bold mt-4">{trimmed.replace(/^##\s+/, '')}</h2>);
      if (/^#\s+/.test(trimmed)) return elements.push(<h1 key={idx} className="text-xl font-bold mt-5">{trimmed.replace(/^#\s+/, '')}</h1>);

      // Checklists
      if (/^- /.test(trimmed)) return elements.push(
        <div key={idx}><input type="checkbox" disabled className="mr-2" />{trimmed.replace(/^- \s*/, '')}</div>
      );
      if (/^- x/i.test(trimmed)) return elements.push(
        <div key={idx} className="line-through text-gray-600"><input type="checkbox" checked disabled className="mr-2" />{trimmed.replace(/^- x\s*/i, '')}</div>
      );

      // Inline images
      const imgMatches = [...trimmed.matchAll(/{(https?:[^\s{}]+\.(?:jpg|jpeg|png|gif))}/gi)];
      if (imgMatches.length) {
        let last = 0;
        const parts: (string | JSX.Element)[] = [];
        imgMatches.forEach(m => {
          const i = m.index || 0;
          parts.push(trimmed.slice(last, i));
          parts.push(<img key={`${idx}-${i}`} src={m[1]} alt="img" className="my-2 max-h-60 rounded-xl" onError={e => e.currentTarget.style.display = 'none'} />);
          last = i + m[0].length;
        });
        parts.push(trimmed.slice(last));
        return elements.push(<div key={idx}>{parts}</div>);
      }

      // Links
      const inline: (string | JSX.Element)[] = [];
      const urlRegex = /((https?:\/\/)?[\w.-]+\.[a-z]{2,}(\S*)?)/gi;
      let last = 0, match;
      while ((match = urlRegex.exec(trimmed)) !== null) {
        if (match.index > last) inline.push(trimmed.slice(last, match.index));
        const url = match[0].startsWith('http') ? match[0] : `https://${match[0]}`;
        inline.push(<a key={`${idx}-${match.index}`} href={url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{match[0]}</a>);
        last = urlRegex.lastIndex;
      }
      if (last < trimmed.length) inline.push(trimmed.slice(last));
      elements.push(<p key={idx} className="mb-2 text-sm text-black break-words">{inline}</p>);
    });

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
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto p-4 flex justify-center items-start">
        <div
          ref={modalRef}
          className="w-full sm:w-11/12 max-w-4xl bg-white rounded-xl shadow-xl border border-gray-300"
        >
          {/* Header */}
          <div className={`px-6 py-4 ${type === 'holiday' ? 'bg-pastel-pink' : 'bg-pastel-lavender'} flex justify-between items-center`}>
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-red-500 hover:text-white transition"
              aria-label="Close"
            >
              <span className="text-xl font-bold">×</span>
            </button>
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
              <div className="text-black">
                {renderContent(content)}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );
}
