import { motion } from "framer-motion";

interface CalendarProps {
  currentMonth: Date;
  onDateClick: (date: Date) => void;
  activeSection: 'school' | 'whatidid';
}

export default function Calendar({ currentMonth, onDateClick, activeSection }: CalendarProps) {
  const today = new Date();
  const minDate = new Date(2024, 5, 23); // ✅ June 23, 2024

  const getDaysInMonth = () => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isBeforeMinDate = (date: Date) => {
    return date < minDate;
  };

  const isClickable = (date: Date) => {
    return isCurrentMonth(date) && !isBeforeMinDate(date);
  };

  const days = getDaysInMonth();

  return (
    <div>
      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar dates */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((date, index) => {
          const clickable = isClickable(date);
          const disabled = isCurrentMonth(date) && isBeforeMinDate(date);
          const empty = !isCurrentMonth(date);
          const todayClass = isToday(date);

          return (
            <motion.div
              key={index}
              onClick={() => clickable && onDateClick(date)}
              className={`
                calendar-day
                ${empty ? 'empty text-gray-400' : ''}
                ${disabled ? 'disabled' : ''}
                ${clickable ? `clickable-${activeSection}` : ''}
                ${todayClass && clickable ? 'border-2 border-yellow-500 text-yellow-700 font-bold' : ''}
              `}
              whileHover={clickable ? { scale: 1.05, y: -2 } : {}}
              whileTap={clickable ? { scale: 0.95 } : {}}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: index * 0.02,
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
            >
              {date.getDate()}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
