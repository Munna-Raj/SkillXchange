import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserProfileApi } from '../services/searchService';
import { getProfileApi } from '../services/profileService';
import SendRequestModal from '../components/SendRequestModal';
import NotificationBell from '../components/NotificationBell';

const UserProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentUserSkills, setCurrentUserSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if current user is admin
  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");
  const isAdmin = role === "admin" || email === "rajyadavproject@gmail.com";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Only fetch current user profile if not admin (needed for Send Request modal)
        const promises = [getUserProfileApi(id)];
        if (!isAdmin) {
          promises.push(getProfileApi().catch(() => ({ data: { skillsToTeach: [] } })));
        }

        const results = await Promise.all(promises);
        const userProfile = results[0];
        const currentUser = results[1]; // Will be undefined if isAdmin

        setUser(userProfile);
        
        // Safely access skills from the response if available
        if (currentUser) {
          const skills = currentUser?.data?.skillsToTeach || currentUser?.skillsToTeach || [];
          setCurrentUserSkills(skills);
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("User not found or server error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return (
    <div className="loading-screen flex items-center justify-center min-h-screen">
      <div className="loading-text text-xl font-medium text-gray-500">Loading profile...</div>
    </div>
  );

  if (error) return (
    <div className="page-container flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-red-100 max-w-md">
        <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={() => navigate(-1)} className="btn-secondary px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="page-container user-profile-view-page min-h-screen bg-white">
      {/* Background glow */}
      <div className="profile-bg-wrapper fixed inset-0 pointer-events-none overflow-hidden">
        <div className="profile-bg-blob-1 absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <button onClick={() => navigate(-1)} className="mb-6 btn-back inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
          ← Back
        </button>

        {/* Profile Header */}
        <div className="public-profile-header bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="public-profile-cover h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative"></div>
          
          <div className="public-profile-content pt-16 px-8 pb-8 relative">
            <div className="absolute -top-16 left-8">
               <img 
                 src={user.profilePic ? `http://localhost:5000/uploads/${user.profilePic}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`} 
                 alt={user.fullName} 
                 className="public-profile-avatar w-32 h-32 rounded-full border-4 border-white shadow-md object-cover bg-white"
               />
            </div>
            
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
               <div className="public-profile-details">
                 <h1 className="public-profile-name text-3xl font-bold text-gray-900">{user.fullName}</h1>
                 <p className="text-indigo-600 font-medium">@{user.username}</p>
                 <p className="public-profile-bio mt-4 text-gray-700 max-w-2xl leading-relaxed">{user.bio || "No bio provided."}</p>
                 
                 <div className="mt-4 flex gap-4 text-sm text-gray-500">
                    {user.location && <span>📍 {user.location}</span>}
                    <span>📅 Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                 </div>
               </div>

               {!isAdmin && (
                 <div className="public-profile-actions flex flex-col gap-3 min-w-[140px] mt-4 md:mt-0">
                   <button 
                     onClick={() => setIsModalOpen(true)}
                     className="action-btn-primary w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-all active:scale-95"
                   >
                     Send Request
                   </button>
                   <button className="action-btn-secondary w-full py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all">
                     Message
                   </button>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Skills To Teach */}
          <div className="skill-category-container bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
            <h2 className="section-title text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
              <span className="text-2xl">🎓</span> Skills to Teach
            </h2>
            <div className="space-y-3 mt-4">
              {user.skillsToTeach && user.skillsToTeach.length > 0 ? (
                user.skillsToTeach.map((skill, index) => (
                  <div key={index} className="public-skill-card flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                    <div>
                      <h3 className="font-bold text-gray-900">{skill.name}</h3>
                      <p className="text-sm text-gray-500">{skill.category}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider
                      ${skill.level === 'Beginner' ? 'bg-green-100 text-green-700' : 
                        skill.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'}`}>
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
          <div className="skill-category-container bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
            <h2 className="section-title text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
              <span className="text-2xl">🎯</span> Skills to Learn
            </h2>
            <div className="space-y-3 mt-4">
              {user.skillsToLearn && user.skillsToLearn.length > 0 ? (
                user.skillsToLearn.map((skill, index) => (
                  <div key={index} className="public-skill-card flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors">
                    <div>
                      <h3 className="font-bold text-gray-900">{skill.name}</h3>
                      <p className="text-sm text-gray-500">{skill.category}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider
                      ${skill.level === 'Beginner' ? 'bg-green-100 text-green-700' : 
                        skill.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'}`}>
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

      {/* Send Request Modal */}
      <SendRequestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        receiver={user}
        currentUserSkills={currentUserSkills}
      />
    </div>
  );
};

export default UserProfileView;
