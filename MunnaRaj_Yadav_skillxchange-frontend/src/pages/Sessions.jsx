import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getUpcomingForMeApi } from "../services/sessionService";
import { markAttendanceApi } from "../services/attendanceService";

const SessionCard = ({ session, item, isNext, partnerInfo }) => {
  const [imgError, setImgError] = useState(false);

  const partnerName = partnerInfo?.fullName || partnerInfo?.username || "User";
  const partnerPic = partnerInfo?.profilePic;

  useEffect(() => {
    setImgError(false);
  }, [partnerPic]);

  const getProfilePicUrl = () => {
    if (!partnerPic) return null;
    if (partnerPic.startsWith("http") || partnerPic.startsWith("data:image/")) return partnerPic;
    
    let baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
    if (baseUrl.endsWith("/api")) {
      baseUrl = baseUrl.replace("/api", "");
    } else if (baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, -1);
    }
    return `${baseUrl}/uploads/${partnerPic}`;
  };

  const profilePicUrl = getProfilePicUrl();

  const [isLive, setIsLive] = useState(() => {
    const now = new Date();
    const startDate = new Date(item.date);
    const [h, m] = String(item.timeSlot || "00:00").split(":").map((x) => parseInt(x, 10));
    const start = new Date(startDate);
    start.setHours(h || 0, m || 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60000);
    return now >= start && now <= end;
  });

  const [timeLeft, setTimeLeft] = useState(() => {
    const now = new Date();
    const startDate = new Date(item.date);
    const [h, m] = String(item.timeSlot || "00:00").split(":").map((x) => parseInt(x, 10));
    const start = new Date(startDate);
    start.setHours(h || 0, m || 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60000);

    if (now >= start && now <= end) {
      const diff = end - now;
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      return `${mins}m ${secs}s left`;
    } else if (now < start) {
      const diff = start - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (days > 0) return `${days}d ${hours}h left`;
      if (hours > 0) return `${hours}h ${mins}m left`;
      return `${mins}m ${secs}s left`;
    }
    return "Ended";
  });

  const handleJoin = async () => {
    try {
      await markAttendanceApi(session._id);
    } catch (err) {
      console.error("Failed to mark attendance:", err);
    }
  };

  useEffect(() => {
    const updateTime = () => {
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
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [item]);

  const skillTitle = session.isGroupSession ? "Group Session" : (session.requestId?.teachSkill || "Skill Session");
  const valid = typeof session.meetLink === "string" && session.meetLink.startsWith("https://meet.google.com/");
  const dateStr = new Date(item.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  
  return (
    <div className={`rounded-[2rem] p-6 border-2 transition-all relative overflow-hidden ${
      isLive 
        ? 'border-green-500 bg-[#f0fff4] dark:bg-green-900/20 shadow-[0_0_25px_rgba(34,197,94,0.25)] dark:shadow-none' 
        : isNext 
          ? 'border-indigo-400 bg-[#3f3bb1] text-white' 
          : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'
    } mb-6`}>
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className={`text-xl font-black tracking-tight truncate ${
              isNext && !isLive ? 'text-white' : 'text-gray-900 dark:text-white'
            }`}>
              {skillTitle} <span className={`text-sm font-medium italic ${isNext && !isLive ? 'text-indigo-200' : 'text-gray-400'}`}>{session.isGroupSession ? "for" : "with"}</span> <span className="text-lg">{partnerName}</span>
            </h3>
            {isLive && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500 text-white text-[10px] font-black uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-white animate-ping"></span>
                Live
              </span>
            )}
          </div>
          
          <div className={`flex items-center gap-4 text-sm font-medium ${
            isNext && !isLive ? 'text-indigo-100' : 'text-gray-500 dark:text-gray-400'
          }`}>
            <div className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M4 11h16M5 19h14a2 2 0 002-2v-6H3v6a2 2 0 002 2z" />
              </svg>
              <span>{dateStr}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{item.timeSlot}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
            isLive ? 'text-indigo-600 dark:text-indigo-400' : isNext ? 'text-indigo-200' : 'text-gray-400'
          }`}>
            {isLive ? 'Started' : 'Starts in'}
          </p>
          <p className={`text-xl font-mono font-black ${
            isNext && !isLive ? 'text-white' : 'text-gray-900 dark:text-white'
          }`}>
            {timeLeft}
          </p>
        </div>
      </div>

      <div className={`my-5 h-[1px] w-full ${
        isNext && !isLive ? 'bg-white/10' : 'bg-gray-200/60 dark:bg-gray-700'
      }`}></div>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className={`h-9 w-9 rounded-full flex items-center justify-center font-black text-sm shadow-sm overflow-hidden ${
            isNext && !isLive ? 'bg-white text-indigo-600' : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300'
          }`}>
            {profilePicUrl && !imgError ? (
              <img 
                src={profilePicUrl} 
                alt="" 
                className="h-full w-full object-cover" 
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="uppercase">{partnerName.charAt(0)}</span>
            )}
          </div>
          <div className="flex flex-col">
            <span className={`text-[10px] font-bold uppercase tracking-tight ${
              isNext && !isLive ? 'text-indigo-200' : 'text-gray-400 dark:text-gray-500'
            }`}>{session.isGroupSession ? "Group Name" : "Meeting with"}</span>
            <span className={`text-xs font-bold ${
              isNext && !isLive ? 'text-white' : 'text-gray-700 dark:text-gray-200'
            }`}>
              {partnerName}
            </span>
          </div>
        </div>
        
        {valid ? (
          <a 
            href={session.meetLink} 
            target="_blank" 
            rel="noreferrer" 
            onClick={handleJoin}
            className={`px-8 py-3 rounded-2xl text-sm font-black shadow-xl transition-all hover:scale-105 active:scale-95 ${
              isLive 
                ? 'bg-[#8b5cf6] text-white hover:bg-[#7c3aed]' 
                : isNext 
                  ? 'bg-[#8b5cf6] text-white hover:bg-[#7c3aed] border border-white/10'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isLive ? 'Join Now' : 'Join Link'}
          </a>
        ) : (
          <div className={`px-4 py-2 rounded-xl text-xs font-bold border ${
            isNext && !isLive ? 'border-white/20 text-white/50' : 'border-red-100 dark:border-red-900/30 text-red-400 dark:text-red-500'
          }`}>
            Link not set
          </div>
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

  const currentUser = useMemo(() => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }, []);

  const getPartnerInfo = (session) => {
    if (session.isGroupSession && session.groupId) {
      return {
        fullName: session.groupId.name,
        username: "Group",
        profilePic: session.groupId.groupPic,
        isGroup: true
      };
    }

    if (!currentUser || !session.requestId) return { fullName: "Unknown User", username: "unknown" };
    
    const sender = session.requestId.senderId;
    const receiver = session.requestId.receiverId;
    
    // Identify current user ID (handle both _id and id formats)
    const currentId = currentUser._id || currentUser.id;
    
    // The partner is the user who is NOT the current user
    const partner = (sender?._id === currentId || sender === currentId) ? receiver : sender;
    
    return partner || { fullName: "Unknown User", username: "unknown" };
  };

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <header className="navbar sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="logo-box grid h-10 w-10 place-items-center rounded-xl ring-1 overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800">
              <img 
                src="/logo%20skillxChange.jpeg" 
                alt="SkillXchange Logo" 
                className="w-full h-full object-cover"
              />
            </Link>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">SkillXchange</p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Class Sessions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/dashboard")} className="rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
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
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Your Schedule</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and join your 7-day class sessions.</p>
          </div>
          <button onClick={load} className="p-2 rounded-full hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all group">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-400 group-hover:text-indigo-600 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {loading && !nextItem ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Loading your sessions...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
            <p className="text-red-600 dark:text-red-400 font-bold">{error}</p>
            <button onClick={load} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors">Try Again</button>
          </div>
        ) : !nextItem ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-12 text-center shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">No sessions scheduled</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto">Start a conversation with a match to schedule your first 7-day class.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <section>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Up Next</h2>
              <SessionCard 
                session={nextItem.session} 
                item={nextItem.item} 
                isNext={true} 
                partnerInfo={getPartnerInfo(nextItem.session)}
              />
            </section>

            {otherItems.length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Following Classes</h2>
                <div className="grid gap-4">
                  {otherItems.map((oi, idx) => {
                    const partner = getPartnerInfo(oi.session);
                    const partnerName = partner?.fullName || partner?.username || "User";
                    return (
                      <div key={idx} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex items-center justify-between hover:border-indigo-200 dark:hover:border-indigo-500 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-700 flex flex-col items-center justify-center border border-gray-100 dark:border-gray-600">
                            <span className="text-[10px] font-bold text-gray-400 uppercase leading-none">{new Date(oi.item.date).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                            <span className="text-lg font-black text-gray-700 dark:text-gray-200 leading-none mt-1">{new Date(oi.item.date).getDate()}</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {oi.session.requestId?.teachSkill || "Session"} <span className="text-gray-400 font-medium italic">with</span> {partnerName}
                            </p>
                            <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{oi.item.timeSlot}</p>
                          </div>
                        </div>
                        <a 
                          href={oi.session.meetLink} 
                          target="_blank" 
                          rel="noreferrer" 
                          onClick={() => markAttendanceApi(oi.session._id)}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 transition-all hover:scale-105"
                        >
                          Join Link
                        </a>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
