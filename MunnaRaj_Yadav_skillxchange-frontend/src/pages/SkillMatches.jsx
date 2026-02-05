import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMatchesApi } from '../services/matchService';
import NotificationBell from '../components/NotificationBell';

const SkillMatches = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const data = await getMatchesApi();
      setMatches(data);
    } catch (err) {
      console.error("Failed to load matches:", err);
      setError("Could not load your matches. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-8">Loading matches...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="skill-matches-page min-h-screen bg-white">
      {/* Background glow */}
      <div className="profile-bg-wrapper">
        <div className="profile-bg-blob-1" />
        <div className="profile-bg-blob-2" />
      </div>

      <header className="navbar mb-8">
        <div className="navbar-inner">
          <div className="flex items-center gap-3">
             <div className="nav-logo-container">
               <img src="/src/Image/logo skillxChange.jpeg" alt="Logo" className="w-full h-full object-cover" />
             </div>
             <p className="text-sm font-semibold">SkillXchange</p>
          </div>
          <button onClick={() => navigate("/dashboard")} className="btn-back">
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <h1 className="matches-title text-3xl font-bold text-gray-900 mb-8">Recommended Matches</h1>
        
        {matches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No matches found based on your skills yet.</p>
            <p className="text-gray-400 mt-2">Try adding more skills to your profile!</p>
          </div>
        ) : (
          <div className="matches-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((user) => (
              <div key={user._id} className="user-match-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <img 
                      src={user.profilePic ? `http://localhost:5000/uploads/${user.profilePic}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`} 
                      alt={user.fullName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{user.fullName}</h3>
                      <p className="text-sm text-gray-500">{user.location || 'Location not set'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Teaches</p>
                      <div className="flex flex-wrap gap-2">
                        {user.skillsOffered?.map((skill, idx) => (
                          <span key={idx} className="skill-badge-teach px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-lg border border-green-100">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Wants to Learn</p>
                      <div className="flex flex-wrap gap-2">
                        {user.skillsWanted?.map((skill, idx) => (
                          <span key={idx} className="skill-badge-learn px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg border border-indigo-100">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => navigate(`/user/${user._id}`)}
                    className="view-user-profile-btn w-full py-2.5 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SkillMatches;
