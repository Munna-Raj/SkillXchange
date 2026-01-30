import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserProfileApi } from '../services/searchService';

const UserProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserProfileApi(id);
        setUser(data);
      } catch (err) {
        console.error("Failed to load user:", err);
        setError("User not found or server error");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-text">Loading profile...</div>
    </div>
  );

  if (error) return (
    <div className="page-container flex items-center justify-center">
      <div className="text-center p-8 bg-red-50 rounded-2xl border border-red-100">
        <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={() => navigate(-1)} className="btn-secondary">Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="mb-6 btn-back inline-flex items-center gap-2">
          ← Back
        </button>

        {/* Profile Header */}
        <div className="public-profile-header">
          <div className="public-profile-cover"></div>
          
          <div className="public-profile-content">
            <img 
              src={user.profilePic ? `http://localhost:5000/uploads/${user.profilePic}` : "https://via.placeholder.com/150"} 
              alt={user.fullName} 
              className="public-profile-avatar"
            />
            
            <div className="public-profile-details">
              <h1 className="public-profile-name">{user.fullName}</h1>
              <p className="text-indigo-600 font-medium">@{user.username}</p>
              <p className="public-profile-bio">{user.bio || "No bio provided."}</p>
            </div>

            <div className="public-profile-actions">
              <button className="action-btn-primary">Connect</button>
              <button className="action-btn-secondary">Message</button>
            </div>
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Skills To Teach */}
          <div className="card-container">
            <h2 className="section-title text-indigo-700 border-b border-indigo-100 pb-2">Skills to Teach</h2>
            <div className="space-y-3 mt-4">
              {user.skillsToTeach && user.skillsToTeach.length > 0 ? (
                user.skillsToTeach.map((skill, index) => (
                  <div key={index} className="public-skill-card">
                    <div>
                      <h3 className="font-bold text-gray-900">{skill.name}</h3>
                      <p className="text-sm text-gray-500">{skill.category}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider
                      ${skill.level === 'Beginner' ? 'bg-green-50 text-green-700' : 
                        skill.level === 'Intermediate' ? 'bg-yellow-50 text-yellow-700' : 
                        'bg-red-50 text-red-700'}`}>
                      {skill.level}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No skills listed.</p>
              )}
            </div>
          </div>

          {/* Skills To Learn */}
          <div className="card-container">
            <h2 className="section-title text-green-700 border-b border-green-100 pb-2">Skills to Learn</h2>
            <div className="space-y-3 mt-4">
              {user.skillsToLearn && user.skillsToLearn.length > 0 ? (
                user.skillsToLearn.map((skill, index) => (
                  <div key={index} className="public-skill-card">
                    <div>
                      <h3 className="font-bold text-gray-900">{skill.name}</h3>
                      <p className="text-sm text-gray-500">{skill.category}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider
                      ${skill.level === 'Beginner' ? 'bg-green-50 text-green-700' : 
                        skill.level === 'Intermediate' ? 'bg-yellow-50 text-yellow-700' : 
                        'bg-red-50 text-red-700'}`}>
                      {skill.level}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No skills listed.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileView;
