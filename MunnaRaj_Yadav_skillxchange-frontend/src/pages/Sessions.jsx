import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getUpcomingForMeApi } from "../services/sessionService";

const SessionCard = ({ session, item, isNext }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const startDate = new Date(item.date);
      const [h, m] = String(item.timeSlot || "00:00").split(":").map((x) => parseInt(x, 10));
      const start = new Date(startDate);
      start.setHours(h || 0, m || 0, 0, 0);
      const end = new Date(start.getTime() + 60 * 60000);

      if (now >= start && now <= end) {
        setIsLive(true);
        const diff = end - now;
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins}m ${secs}s left`);
      } else if (now < start) {
        setIsLive(false);
        const diff = start - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        
        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h left`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${mins}m left`);
        } else {
          setTimeLeft(`${mins}m ${secs}s left`);
        }
      } else {
        setIsLive(false);
        setTimeLeft("Ended");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [item]);

  const title = session.requestId?.teachSkill || "Skill Session";
  const valid = typeof session.meetLink === "string" && session.meetLink.startsWith("https://meet.google.com/");
  const dateStr = new Date(item.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  
  return (
    <div className={`rounded-2xl p-5 border-2 transition-all ${isLive ? 'border-green-500 bg-green-50 shadow-green-100' : isNext ? 'border-indigo-500 bg-indigo-50 shadow-indigo-100' : 'border-gray-100 bg-white'} shadow-lg mb-4`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900 truncate">{title}</h3>
            {isLive && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold uppercase animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                Live
              </span>
            )}
            {isNext && !isLive && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase">
                Next Up
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M4 11h16M5 19h14a2 2 0 002-2v-6H3v6a2 2 0 002 2z" />
              </svg>
              <span>{dateStr}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{item.timeSlot}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-xs font-bold uppercase ${isLive ? 'text-green-600' : 'text-indigo-600'}`}>
            {isLive ? 'Started' : 'Starts in'}
          </p>
          <p className="text-xl font-mono font-bold text-gray-900">{timeLeft}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
            {session.createdBy?.fullName?.charAt(0) || "U"}
          </div>
          <span className="text-xs text-gray-500">Scheduled by {session.createdBy?.fullName || "Partner"}</span>
        </div>
        
        {valid ? (
          <a 
            href={session.meetLink} 
            target="_blank" 
            rel="noreferrer" 
            className={`px-6 py-2 rounded-xl text-sm font-bold shadow-md transition-all ${
              isLive 
                ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-green-200' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200'
            }`}
          >
            {isLive ? 'Join Now' : 'Join Link'}
          </a>
        ) : (
          <span className="text-xs text-red-500 font-medium">Link not set</span>
        )}
      </div>
    </div>
  );
};

export default function Sessions() {
  const navigate = useNavigate();
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getUpcomingForMeApi();
      setUpcomingSessions(data || []);
    } catch (e) {
      setError("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const { nextItem, otherItems } = useMemo(() => {
    try {
      const allItems = upcomingSessions
        .flatMap((s) => (s.upcoming || []).map((u) => ({ session: s, item: u })))
        .sort((a, b) => new Date(a.item.date) - new Date(b.item.date));
      
      // Filter out duplicates if any (same date/time across multiple sessions)
      const uniqueItems = allItems.filter((item, index, self) =>
        index === self.findIndex((t) => (
          new Date(t.item.date).toDateString() === new Date(item.item.date).toDateString() &&
          t.item.timeSlot === item.item.timeSlot &&
          t.session._id === item.session._id
        ))
      );
      
      return {
        nextItem: uniqueItems[0] || null,
        otherItems: uniqueItems.slice(1)
      };
    } catch {
      return { nextItem: null, otherItems: [] };
    }
  }, [upcomingSessions]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="navbar sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl overflow-hidden ring-1 ring-gray-200 shadow-sm">
              <img src="/src/Image/logo skillxChange.jpeg" alt="SkillXchange" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">SkillXchange</p>
              <p className="text-xs text-indigo-600 font-medium">Class Sessions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/dashboard")} className="rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
              Dashboard
            </button>
            <button onClick={() => navigate("/conversations")} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition-colors">
              Manage in Chat
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Schedule</h1>
            <p className="text-gray-500 mt-1">Manage and join your 7-day class sessions.</p>
          </div>
          <button 
            onClick={load} 
            className="p-2 rounded-full hover:bg-white border border-transparent hover:border-gray-200 transition-all group"
            title="Refresh schedule"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-400 group-hover:text-indigo-600 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {loading && !nextItem ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Loading your sessions...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-600 font-bold">{error}</p>
            <button onClick={load} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors">Try Again</button>
          </div>
        ) : !nextItem ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M4 11h16M5 19h14a2 2 0 002-2v-6H3v6a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">No sessions scheduled</h3>
            <p className="text-gray-500 mt-2 max-w-xs mx-auto">Start a conversation with a match to schedule your first 7-day class.</p>
            <button onClick={() => navigate("/conversations")} className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
              Go to Chat
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <section>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Up Next</h2>
              <SessionCard session={nextItem.session} item={nextItem.item} isNext={true} />
            </section>

            {otherItems.length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Following Classes</h2>
                <div className="grid gap-4">
                  {otherItems.map((oi, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between hover:border-indigo-200 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex flex-col items-center justify-center border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(oi.item.date).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                          <span className="text-sm font-bold text-gray-700">{new Date(oi.item.date).getDate()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{oi.session.requestId?.teachSkill || "Session"}</p>
                          <p className="text-xs text-gray-500">{oi.item.timeSlot}</p>
                        </div>
                      </div>
                      <a 
                        href={oi.session.meetLink} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs font-bold text-indigo-600 hover:underline px-3 py-1 rounded-lg hover:bg-indigo-50"
                      >
                        Join Link
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

