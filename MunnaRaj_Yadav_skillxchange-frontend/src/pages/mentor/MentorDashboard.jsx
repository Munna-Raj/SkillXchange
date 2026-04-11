import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';

const MentorDashboard = () => {
  const navigate = useNavigate();
  const [mentorData, setMentorData] = useState(null);
  const [groups, setGroups] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const profileRes = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!profileRes.ok) {
          toast.error("Could not fetch profile. Please log in again.");
          navigate("/login");
          return;
        }

        const profileData = await profileRes.json();
        if (profileData.role !== 'mentor' && profileData.role !== 'admin') {
          toast.error("Unauthorized access to mentor dashboard");
          navigate('/dashboard');
          return;
        }
        setMentorData(profileData);

        // Now that we have the mentor ID, fetch and filter groups
        const groupsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/groups`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (groupsRes.ok) {
          const groupsData = await groupsRes.json();
          const mentorId = profileData.id || profileData._id;
          setGroups(groupsData.filter(g => g.mentor?._id === mentorId));
        }

        // Fetch all upcoming sessions and filter on the client
        const sessionsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/sessions/upcoming/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (sessionsRes.ok) {
          const sessionsData = await sessionsRes.json();
          setSessions(sessionsData.filter(s => s.isGroupSession));
        }

      } catch (err) {
        console.error("Dashboard data fetch error:", err);
        toast.error("An error occurred while loading dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-200">
      <Navbar userProfile={mentorData} pageTitle="Assignment Portal" />
      
      <div className="max-w-6xl mx-auto p-6">
        <header className="mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase">Assignment Portal</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Welcome, {mentorData?.fullName}. Manage groups, sessions, and assignments from here.</p>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Stats Cards */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all">
            <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Active Mentorships</h3>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{groups.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all">
            <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Total Group Sessions</h3>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{sessions.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all">
            <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Total Members</h3>
            <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">
              {groups.reduce((acc, g) => acc + (g.members?.length || 0), 0)}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Group Management Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">My Learning Groups</h2>
              <button 
                onClick={() => navigate('/groups')}
                className="text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline"
              >
                View All
              </button>
            </div>
            <div className="p-6">
              {groups.length > 0 ? (
                <div className="space-y-4">
                  {groups.slice(0, 3).map(group => (
                    <div 
                      key={group._id} 
                      onClick={() => navigate(`/groups/${group._id}`)}
                      className="flex items-center justify-between p-4 rounded-xl border border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">
                          {group.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">{group.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{group.members?.length} members</p>
                        </div>
                      </div>
                      <div className="text-indigo-600 dark:text-indigo-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 dark:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">No Groups Yet</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">Start by creating a group for your students.</p>
                  <button 
                    onClick={() => navigate('/groups')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition"
                  >
                    Create Group
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Sessions Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Upcoming Group Classes</h2>
              <button 
                onClick={() => navigate('/sessions')}
                className="text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline"
              >
                Schedule
              </button>
            </div>
            <div className="p-6">
              {sessions.length > 0 ? (
                <div className="space-y-4">
                  {sessions.slice(0, 3).map(session => (
                    <div 
                      key={session._id}
                      className="flex items-center justify-between p-4 rounded-xl border border-emerald-50 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-900/10"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex flex-col items-center justify-center text-emerald-700 dark:text-emerald-400 shadow-sm">
                          <span className="text-[10px] font-black uppercase tracking-tighter">
                            {new Date(session.startDate).toLocaleString('default', { month: 'short' })}
                          </span>
                          <span className="text-sm font-black leading-none">
                            {new Date(session.startDate).getDate()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">{session.groupId?.name || "Group Session"}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{session.timeSlot}</p>
                        </div>
                      </div>
                      <a 
                        href={session.meetLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 dark:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M4 11h16M5 19h14a2 2 0 002-2v-6H3v6a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">No Scheduled Classes</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Schedule your first group session.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 text-center transition-all">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Ready to boost your impact?</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
            Open a group to chat, schedule sessions, and post assignments for your members.
          </p>
          <button 
            onClick={() => navigate('/groups')}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-xl hover:bg-indigo-700 hover:scale-105 transition-all"
          >
            Go to groups
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
