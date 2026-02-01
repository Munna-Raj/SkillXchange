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

  return (
    <div className="page-container">
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
          <div className="flex items-center gap-4">
            <NotificationBell />
            <button onClick={() => navigate("/dashboard")} className="btn-back">
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="search-page-container relative z-10">
        <div className="search-header-simple">
          <h1 className="search-results-title">Your Skill Matches</h1>
          <p className="search-results-count">
            Based on what you want to learn and what others can teach.
          </p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Finding your best matches...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            {error}
          </div>
        ) : matches.length === 0 ? (
          <div className="no-matches-box">
            <h3>No matches found yet!</h3>
            <p>Try adding more skills to your "Skills to Learn" list in your profile.</p>
            <button onClick={() => navigate('/profile')} className="action-btn-primary mt-4">
              Update Profile
            </button>
          </div>
        ) : (
          <div className="results-grid-users">
            {matches.map((user) => (
              <div key={user._id} className="match-card">
                {/* Match Score Badge */}
                <div className="match-score-badge">
                  {user.matchScore > 15 ? "🔥 Perfect Match" : "✅ Good Match"}
                </div>

                <div className="user-card-header">
                  <img 
                    src={user.profilePic ? `http://localhost:5000/uploads/${user.profilePic}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`} 
                    alt={user.fullName} 
                    className="user-card-avatar"
                  />
                  <div className="user-card-info">
                    <h3 className="user-card-name">{user.fullName}</h3>
                    <p className="user-card-username">@{user.username}</p>
                  </div>
                </div>

                {/* Why matched? */}
                <div className="match-reason-section">
                  <p className="match-reason-title">They can teach you:</p>
                  <div className="match-tags-container">
                    {user.matchingSkills.map((skill, idx) => (
                      <span key={idx} className="match-tag-teach">{skill}</span>
                    ))}
                  </div>
                </div>

                {/* Mutual Match Bonus */}
                {user.mutualSkills.length > 0 && (
                  <div className="match-reason-section mt-3">
                    <p className="match-reason-title text-purple-600">You can swap skills (Mutual):</p>
                    <div className="match-tags-container">
                      {user.mutualSkills.map((skill, idx) => (
                        <span key={idx} className="match-tag-mutual">You teach {skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-4">
                  <button 
                    onClick={() => navigate(`/user/${user._id}`)}
                    className="view-profile-btn"
                  >
                    View Full Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillMatches;
