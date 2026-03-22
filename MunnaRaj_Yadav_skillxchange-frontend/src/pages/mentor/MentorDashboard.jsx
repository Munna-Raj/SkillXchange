import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const MentorDashboard = () => {
  const navigate = useNavigate();
  const [mentorData, setMentorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, just getting profile data to confirm mentor status
    const fetchMentorProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.role !== 'mentor' && data.role !== 'admin') {
            toast.error("Unauthorized access to mentor dashboard");
            navigate('/dashboard');
            return;
          }
          setMentorData(data);
        } else {
          toast.error("Failed to load mentor profile");
        }
      } catch (err) {
        console.error("Mentor profile error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMentorProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mentor Workspace</h1>
            <p className="text-gray-600">Welcome, {mentorData?.fullName}. Manage your mentorship activities here.</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
          >
            User Dashboard
          </button>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Stats Cards */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Mentorships</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Sessions</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Average Rating</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">N/A</p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Your Mentorship Dashboard is coming soon!</h2>
          <p className="mt-2 text-gray-600 max-w-md mx-auto">
            We are building tools to help you track your students, schedule sessions, and manage your teaching profile more efficiently.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
