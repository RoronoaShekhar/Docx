// ✅ DateModal.tsx with all final features
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

const HOLIDAY_FLAG = "__IS_HOLIDAY__";

export default function DateModal({ date, section, isAdmin, onClose, onContentChange }: DateModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [showHint, setShowHint] = useState(false);
  const [showHolidayPrompt, setShowHolidayPrompt] = useState(isAdmin && section === 'school');
  const [isVisible, setIsVisible] = useState(true);
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
    if (text.trim() === HOLIDAY_FLAG && section === 'school') {
      return <div className="text-center text-lg font-medium py-6">🎉 Today was a Holiday!</div>;
    }

    const lines = text.split(/\n/);
    return lines.map((line, i) => {
      const trimmed = line.trim();

      if (/^- \[ \]/.test(trimmed)) {
        return <div key={i}><input type="checkbox" disabled={!isAdmin} className="mr-2" />{trimmed.replace(/^- \[ \] /, "")}</div>;
      }

      if (/^- \[x\]/i.test(trimmed)) {
        return <div key={i} className="line-through text-gray-600"><input type="checkbox" checked disabled={!isAdmin} className="mr-2" />{trimmed.replace(/^- \[x\] /i, "")}</div>;
      }

      if (trimmed.startsWith("### ")) return <h3 key={i} className="text-base font-bold mt-3">{trimmed.replace("### ", "")}</h3>;
      if (trimmed.startsWith("## ")) return <h2 key={i} className="text-lg font-bold mt-4">{trimmed.replace("## ", "")}</h2>;
      if (trimmed.startsWith("# ")) return <h1 key={i} className="text-xl font-bold mt-5">{trimmed.replace("# ", "")}</h1>;

      const imgMatches = [...trimmed.matchAll(/{(https?:[^\s{}]+\.(jpg|jpeg|png|gif))}/gi)];
      if (imgMatches.length) {
        const elements = [];
        let lastIndex = 0;
        for (const match of imgMatches) {
          const index = match.index || 0;
          elements.push(trimmed.slice(lastIndex, index));
          elements.push(<img key={index} src={match[1]} alt="img" className="my-3 rounded-xl max-h-60" />);
          lastIndex = index + match[0].length;
        }
        elements.push(trimmed.slice(lastIndex));
        return <div key={i}>{elements}</div>;
      }

      return <div key={i}>{line}</div>;
    });
  };

  const schoolPeriods = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"];
  const whatididActivities = ["ioqm", "nsep", "schol"];
  const periodLabels = {
    p1: "P1 - First Period", p2: "P2 - Second Period", p3: "P3 - Third Period", p4: "P4 - Fourth Period",
    p5: "P5 - Fifth Period", p6: "P6 - Sixth Period", p7: "P7 - Seventh Period", p8: "P8 - Eighth Period"
  };
  const activityLabels = { ioqm: "IOQM", nsep: "NSEP", schol: "Schol" };

  if (isLoading) return <div className="fixed inset-0 bg-white flex items-center justify-center z-50">Loading...</div>;

  if (showHolidayPrompt) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center p-6">
        <div className="bg-white border rounded-xl shadow-xl max-w-md w-full p-6 text-center">
          <h2 className="text-lg font-semibold mb-4">Was today a holiday?</h2>
          <div className="flex justify-center gap-4">
            <button onClick={() => {
              setShowHolidayPrompt(false);
              const saveData = { ...formData, p1: HOLIDAY_FLAG, date: dateString };
              saveMutation.mutate(saveData);
            }} className="bg-green-500 text-white px-4 py-2 rounded-md">Yes</button>
            <button onClick={() => setShowHolidayPrompt(false)} className="bg-gray-300 px-4 py-2 rounded-md">No</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    isVisible && (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto p-4 flex justify-center items-start">
        <div ref={modalRef} className="w-full sm:w-11/12 max-w-5xl bg-white rounded-xl shadow-xl border border-gray-300">
          <div className={`px-6 py-4 ${section === 'school' ? 'bg-pastel-mint' : 'bg-pastel-lavender'} flex justify-between items-center`}>
            <h3 className="text-xl font-semibold text-gray-900">
              {section === 'school' ? 'School' : 'What I Did'} - {formattedDate}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-red-500 hover:text-white transition"
              aria-label="Close"
            >
              <span className="text-xl font-bold">×</span>
            </button>
          </div>

          {showHint && (
            <div className="text-right px-6 pt-2 text-sm text-gray-500 animate-pulse">
              💡 Bhai tu SCROLL kar sakta hai
            </div>
          )}

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
    )
  );
}
