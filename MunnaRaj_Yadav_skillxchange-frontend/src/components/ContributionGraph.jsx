import React, { useEffect, useState, useMemo } from 'react';
import { getUserAttendanceApi } from '../services/attendanceService';

const ContributionGraph = ({ userId }) => {
  const [attendanceDates, setAttendanceDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const dates = await getUserAttendanceApi(userId);
        setAttendanceDates(Array.isArray(dates) ? dates : []);
      } catch (err) {
        // If it's a 404 (no attendance), just set empty array without error
        if (err.response?.status === 404) {
          setAttendanceDates([]);
        } else {
          console.error("Failed to fetch attendance:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchAttendance();
  }, [userId]);

  // Generate grid data for the last 6 months
  const gridData = useMemo(() => {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    
    // Adjust to start of the week (Sunday)
    const start = new Date(sixMonthsAgo);
    start.setDate(start.getDate() - start.getDay());
    
    const days = [];
    let current = new Date(start);
    
    while (current <= today) {
      const dateStr = current.toISOString().split('T')[0];
      days.push({
        date: new Date(current),
        dateStr,
        hasAttended: attendanceDates.includes(dateStr)
      });
      current.setDate(current.getDate() + 1);
    }
    
    // Group by weeks for vertical columns
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    
    return weeks;
  }, [attendanceDates]);

  // Calculate Streak
  const streak = useMemo(() => {
    if (attendanceDates.length === 0) return 0;
    
    // Sort dates descending (newest first)
    const sortedDates = [...attendanceDates].sort((a, b) => new Date(b) - new Date(a));
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastAttendance = new Date(sortedDates[0]);
    lastAttendance.setHours(0, 0, 0, 0);
    
    // If last attendance was not today or yesterday, streak is 0
    if (lastAttendance < yesterday) return 0;
    
    let currentStreak = 0;
    let checkDate = new Date(lastAttendance);
    
    // Check backwards from last attendance
    for (let i = 0; i < sortedDates.length; i++) {
      const attendanceDate = new Date(sortedDates[i]);
      attendanceDate.setHours(0, 0, 0, 0);
      
      if (attendanceDate.getTime() === checkDate.getTime()) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (attendanceDate < checkDate) {
        // Gap found
        break;
      }
    }
    
    return currentStreak;
  }, [attendanceDates]);

  if (loading) return <div className="h-32 flex items-center justify-center text-gray-400">Loading activity...</div>;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="contribution-graph-container p-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1014 0c0-1.187-.29-2.307-.813-3.286a4.09 4.09 0 00-1.332-1.458 8.682 8.682 0 00-2.1-1.104c-.537-.191-1.108-.36-1.36-.55zM10 17a3 3 0 110-6 3 3 0 010 6z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Current Streak</p>
            <p className="text-xl font-black text-gray-900 leading-none">{streak} Days</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Total Active</p>
          <p className="text-xl font-black text-gray-900 leading-none">{attendanceDates.length}</p>
        </div>
      </div>

      <div className="flex gap-1 min-w-max">
        {/* Day labels */}
        <div className="flex flex-col gap-1 pr-2 pt-6 text-[10px] text-gray-400 font-medium">
          <span>Sun</span>
          <span className="mt-1">Mon</span>
          <span>Tue</span>
          <span className="mt-1">Wed</span>
          <span>Thu</span>
          <span className="mt-1">Fri</span>
          <span>Sat</span>
        </div>

        {/* The Grid */}
        <div className="flex gap-1">
          {gridData.map((week, wIdx) => {
            // Show month label if it's the first week of the month
            const firstDay = week[0].date;
            const showMonth = firstDay.getDate() <= 7;
            
            return (
              <div key={wIdx} className="flex flex-col gap-1">
                <div className="h-4 text-[10px] text-gray-400">
                  {showMonth ? months[firstDay.getMonth()] : ''}
                </div>
                {week.map((day, dIdx) => (
                  <div
                    key={dIdx}
                    title={day.dateStr}
                    className={`w-3 h-3 rounded-sm transition-colors ${
                      day.hasAttended 
                        ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' 
                        : 'bg-gray-100'
                    }`}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-400">
        <span>Less</span>
        <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
        <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
        <span>More</span>
      </div>
    </div>
  );
};

export default ContributionGraph;
