import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";

interface DateModalProps {
  date: Date;
  section: "school" | "whatidid";
  isAdmin: boolean;
  onClose: () => void;
  onContentChange: () => void;
}

export default function DateModal({ date, section, isAdmin, onClose, onContentChange }: DateModalProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [formData, setFormData] = useState<any>({});
  const [showHint, setShowHint] = useState(false);
  const queryClient = useQueryClient();
  const modalRef = useRef<HTMLDivElement>(null);

  const dateString = date.toISOString().split("T")[0];
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const { data, isLoading } = useQuery({
    queryKey: [`/api/${section}/${dateString}`],
    enabled: !!dateString,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => await apiRequest("POST", `/api/${section}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${section}/${dateString}`] });
      onContentChange();
    },
  });

  useEffect(() => {
    if (data) setFormData(data);
    const hintTimeout = setTimeout(() => setShowHint(true), 2000);
    return () => clearTimeout(hintTimeout);
  }, [data]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (isAdmin) {
      const saveData = { ...formData, [field]: value, date: dateString };
      saveMutation.mutate(saveData);
    }
  };

  const renderContent = (text: string) => {
    const urlRegex = /((https?:\/\/)?[\w.-]+\.[a-z]{2,}(\S*)?)/gi;
    const imgRegex = /{(https?:.*\.(?:png|jpg|jpeg|gif))}/gi;
    if (!text) return "";
    const elements: (JSX.Element | string)[] = [];
    let lastIndex = 0;
    const combinedRegex = new RegExp(`${imgRegex.source}|${urlRegex.source}`, "gi");
    let match;
    while ((match = combinedRegex.exec(text)) !== null) {
      const matchText = match[0];
      const matchIndex = match.index;
      if (matchIndex > lastIndex) elements.push(text.slice(lastIndex, matchIndex));
      if (imgRegex.test(matchText)) {
        const url = matchText.replace(/[{}]/g, "");
        elements.push(
          <img
            key={matchIndex}
            src={url}
            alt="img"
            className="my-2 max-h-60 w-auto rounded-xl border border-gray-300"
            onError={(e) => (e.currentTarget.style.display = "none")}
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
    if (lastIndex < text.length) elements.push(text.slice(lastIndex));
    return elements;
  };

  const schoolPeriods = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"];
  const whatididActivities = ["ioqm", "nsep", "schol"];
  const periodLabels = {
    p1: "P1 - First Period", p2: "P2 - Second Period", p3: "P3 - Third Period", p4: "P4 - Fourth Period",
    p5: "P5 - Fifth Period", p6: "P6 - Sixth Period", p7: "P7 - Seventh Period", p8: "P8 - Eighth Period"
  };
  const activityLabels = { ioqm: "IOQM", nsep: "NSEP", schol: "Schol" };

  if (isLoading) return <div className="fixed inset-0 bg-white flex items-center justify-center z-50">Loading...</div>;

  return (
    <div className={`fixed inset-0 bg-white z-50 overflow-y-auto p-4 flex justify-center items-start `}>
      <div ref={modalRef} className={`w-full ${isFullscreen ? 'h-full' : 'sm:w-11/12'} max-w-5xl bg-white rounded-xl shadow-xl border border-gray-300`}>
        <div className={`px-6 py-4 ${section === 'school' ? 'bg-pastel-mint' : 'bg-pastel-lavender'} flex justify-between items-center`}>
          <h3 className="text-xl font-semibold text-gray-900">
            {section === 'school' ? 'School' : 'What I Did'} - {formattedDate}
          </h3>
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

        {showHint && <div className="text-right px-6 pt-2 text-sm text-gray-500 animate-pulse">💡 Bhai tu SCROLL kar sakta hai</div>}

        <div className="p-6">
          {(section === 'school' ? schoolPeriods : whatididActivities).map((key, index) => (
            <div
              key={key}
              className={`rounded-2xl p-5 mb-4 ${['bg-pastel-mint/30','bg-pastel-lavender/30','bg-pastel-pink/30','bg-pastel-peach/30','bg-pastel-yellow/30'][index % 5]} border border-white/50`}
            >
              <Label className="block text-sm font-semibold mb-3">
                {(section === 'school' ? periodLabels[key] : activityLabels[key]) || key.toUpperCase()}
              </Label>
              {isAdmin ? (
                <Textarea
                  className="w-full resize-none text-black placeholder-gray-500 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={formData[key] || ''}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  placeholder={`Write something for ${key}...`}
                  rows={3}
                />
              ) : (
                <div className="text-black text-sm leading-relaxed break-words">
                  {renderContent(formData[key] || '')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
