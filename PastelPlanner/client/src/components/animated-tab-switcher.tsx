import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

interface AnimatedTabSwitcherProps {
  activeSection: 'school' | 'whatidid';
  onSectionChange: (section: 'school' | 'whatidid') => void;
}

export default function AnimatedTabSwitcher({ activeSection, onSectionChange }: AnimatedTabSwitcherProps) {
  const [tabWidth, setTabWidth] = useState(0);
  const [tabOffset, setTabOffset] = useState(0);
  const schoolTabRef = useRef<HTMLButtonElement>(null);
  const whatididTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const updateTabIndicator = () => {
      const activeTabRef = activeSection === 'school' ? schoolTabRef : whatididTabRef;
      if (activeTabRef.current) {
        setTabWidth(activeTabRef.current.offsetWidth);
        setTabOffset(activeTabRef.current.offsetLeft);
      }
    };

    updateTabIndicator();
    window.addEventListener('resize', updateTabIndicator);
    return () => window.removeEventListener('resize', updateTabIndicator);
  }, [activeSection]);

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex justify-center">
          <div className="relative">
            {/* Background container */}
            <div className="flex bg-gray-50 p-1 rounded-lg">
              
              {/* Animated background indicator */}
              <motion.div
                className="absolute top-1 h-[calc(100%-8px)] rounded-md"
                style={{
                  background: activeSection === 'school' 
                    ? 'hsl(var(--school-accent))' 
                    : 'hsl(var(--whatidid-accent))'
                }}
                animate={{
                  width: tabWidth,
                  x: tabOffset,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 40,
                }}
              />

              {/* School Tab */}
              <button
                ref={schoolTabRef}
                onClick={() => onSectionChange('school')}
                className={`relative z-10 px-8 py-3 rounded-md font-normal transition-colors duration-200 body-font text-base ${
                  activeSection === 'school' 
                    ? 'text-gray-800 font-medium' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                School
              </button>

              {/* What I Did Tab */}
              <button
                ref={whatididTabRef}
                onClick={() => onSectionChange('whatidid')}
                className={`relative z-10 px-8 py-3 rounded-md font-normal transition-colors duration-200 body-font text-base ${
                  activeSection === 'whatidid' 
                    ? 'text-gray-800 font-medium' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                What I Did
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}