import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getUpcomingForMeApi } from "../services/sessionService";

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

  const upcomingItems = useMemo(() => {
    try {
      return upcomingSessions
        .flatMap((s) => (s.upcoming || []).map((u) => ({ session: s, item: u })))
        .sort((a, b) => new Date(a.item.date) - new Date(b.item.date));
    } catch {
      return [];
    }
  }, [upcomingSessions]);

  return (
    <div className="min-h-screen bg-white">
      <header className="navbar mb-6 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl overflow-hidden ring-1 ring-gray-200">
              <img src="/src/Image/logo skillxChange.jpeg" alt="SkillXchange" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">SkillXchange</p>
              <p className="text-xs text-gray-500">Sessions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/dashboard")} className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold ring-1 ring-gray-300 hover:bg-gray-200">
              ← Back to Dashboard
            </button>
            <button onClick={() => navigate("/conversations")} className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 hover:bg-gray-50">
              Manage in Chat
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-24">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Sessions</h1>

        <div className="rounded-3xl bg-white p-6 ring-1 ring-gray-200 shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">Scheduled Class</p>
            <button onClick={load} className="text-sm text-gray-600 hover:text-gray-900">Refresh</button>
          </div>
          {loading ? (
            <div className="py-6 text-gray-500">Loading sessions...</div>
          ) : error ? (
            <div className="py-6 text-red-600">{error}</div>
          ) : upcomingItems.length === 0 ? (
            <div className="py-6 text-gray-600">No sessions scheduled.</div>
          ) : (
            (() => {
              const { session, item } = upcomingItems[0];
              const startDate = new Date(item.date);
              const [h, m] = String(item.timeSlot || "00:00").split(":").map((x) => parseInt(x, 10));
              const start = new Date(startDate);
              start.setHours(h || 0, m || 0, 0, 0);
              const end = new Date(start.getTime() + 60 * 60000);
              const title = session.requestId?.teachSkill || "Session";
              const valid = typeof session.meetLink === "string" && session.meetLink.startsWith("https://meet.google.com/");
              const dateStr = start.toLocaleDateString(undefined, { weekday: "short", month: "long", day: "numeric" });
              const timeStr = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
              return (
                <div className="mt-3 rounded-xl bg-yellow-50 p-4 ring-1 ring-yellow-100 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
                    <p className="text-xs text-gray-700">{dateStr} · {timeStr}</p>
                  </div>
                  {valid ? (
                    <a href={session.meetLink} target="_blank" rel="noreferrer" className="text-sm font-semibold text-indigo-600 hover:underline">
                      Join
                    </a>
                  ) : (
                    <span className="text-xs text-red-600">Set valid Meet link</span>
                  )}
                </div>
              );
            })()
          )}
        </div>
      </main>
    </div>
  );
}
