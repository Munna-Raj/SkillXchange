import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserProfileApi } from '../services/searchService';
import { getProfileApi, followUserApi, unfollowUserApi } from '../services/profileService';
import { getFeedbackForUser, createFeedback } from '../services/feedbackService';
import SendRequestModal from '../components/SendRequestModal';
import FeedbackModal from '../components/FeedbackModal';
import NotificationBell from '../components/NotificationBell';
import ChatBox from '../components/ChatBox';
import { getSentRequestsApi, getReceivedRequestsApi } from '../services/requestService';

const UserProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentUserSkills, setCurrentUserSkills] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [followLoading, setFollowLoading] = useState(false);
  const [followError, setFollowError] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");
  const isAdmin = role === "admin" || email === "rajyadavproject@gmail.com";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        // Only fetch current user profile if not admin
        const promises = [getUserProfileApi(id), getFeedbackForUser(id)];
        if (!isAdmin && token) {
          promises.push(getProfileApi().catch(() => ({ data: { skillsToTeach: [] } })));
        }

        const results = await Promise.all(promises);
        const userProfile = results[0];
        const feedbackList = results[1];
        // Result at index 2 if not admin
        const currentUser = (!isAdmin && token) ? results[2] : null;

        setUser(userProfile);
        setFeedbacks(feedbackList);
        
        // Safely access skills
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

  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      const newFeedback = await createFeedback(feedbackData);
      const feedbackWithUser = {
        ...newFeedback,
        reviewer: {
        }
      };
      const updatedFeedbacks = await getFeedbackForUser(id);
      setFeedbacks(updatedFeedbacks);
    } catch (error) {
      throw error; // Handle in modal
    }
  };

  const refreshUserProfile = async () => {
    try {
      const updated = await getUserProfileApi(id);
      setUser(updated);
    } catch (err) {
    }
  };

  const handleToggleFollow = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (!user || !user._id) {
      return;
    }

    const currentUserId = currentUser.id || currentUser._id;
    if (!currentUserId || currentUserId === user._id) {
      return;
    }

    setFollowError("");
    setFollowLoading(true);

    try {
      const normalizeId = (entry) => {
        if (!entry) return null;
        if (typeof entry === "string") return entry;
        if (typeof entry === "object" && entry._id) return entry._id.toString();
        return null;
      };

      const isFollowing = Array.isArray(user.followers)
        && user.followers.some((f) => normalizeId(f) === currentUserId);

      if (isFollowing) {
        await unfollowUserApi(user._id);
      } else {
        await followUserApi(user._id);
      }

      await refreshUserProfile();
    } catch (err) {
      setFollowError("Failed to update follow status. Please try again.");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleOpenChat = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (!user || !user._id) {
      return;
    }

    const myId = currentUser.id || currentUser._id;
    if (!myId) {
      return;
    }

    setChatError("");
    setChatLoading(true);

    try {
      const [sent, received] = await Promise.all([
        getSentRequestsApi(),
        getReceivedRequestsApi()
      ]);

      const acceptedSent = sent.find(
        (req) =>
          req.status === "accepted" &&
          req.receiverId &&
          req.receiverId._id === user._id
      );

      const acceptedReceived = received.find(
        (req) =>
          req.status === "accepted" &&
          req.senderId &&
          req.senderId._id === user._id
      );

      const activeRequest = acceptedSent || acceptedReceived;

      if (!activeRequest) {
        setChatError("You can start messaging after your skill exchange request is accepted.");
        return;
      }

      setActiveChat({
        requestId: activeRequest._id,
        otherUser: user
      });
    } catch (err) {
      setChatError("Failed to open chat. Please try again.");
    } finally {
      setChatLoading(false);
    }
  };

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
      {/* Background */}
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
                   {Array.isArray(user.followers) && (
                     <span>👥 {user.followers.length} Followers</span>
                   )}
                   {Array.isArray(user.following) && (
                     <span>➡️ {user.following.length} Following</span>
                   )}
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
                   <button 
                     onClick={handleToggleFollow}
                     disabled={followLoading}
                     className="action-btn-secondary w-full py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                   >
                     <span>
                       {(() => {
                         const viewerId = currentUser.id || currentUser._id;
                         const normalizeId = (entry) => {
                           if (!entry) return null;
                           if (typeof entry === "string") return entry;
                           if (typeof entry === "object" && entry._id) return entry._id.toString();
                           return null;
                         };

                         if (Array.isArray(user.followers) && viewerId &&
                           user.followers.some((f) => normalizeId(f) === viewerId)
                         ) {
                           return "Following";
                         }

                         if (Array.isArray(user.following) && viewerId &&
                           user.following.some((u) => normalizeId(u) === viewerId)
                         ) {
                           return "Follow Back";
                         }

                         return "Follow";
                       })()}
                     </span>
                   </button>
                   <button 
                     onClick={handleOpenChat}
                     disabled={chatLoading}
                     className="action-btn-secondary w-full py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 10c0 3.866-3.582 7-8 7a8.96 8.96 0 01-3.917-.885L5 18l1.2-3.2A6.99 6.99 0 013 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" />
                     </svg>
                     <span>{chatLoading ? "Opening..." : "Message"}</span>
                   </button>
                   {chatError && (
                     <p className="text-xs text-red-500 text-center">{chatError}</p>
                   )}
                   {followError && (
                     <p className="text-xs text-red-500 text-center">{followError}</p>
                   )}
                   <button 
                     onClick={() => setIsFeedbackModalOpen(true)}
                     className="action-btn-secondary w-full py-2.5 bg-yellow-50 border border-yellow-200 text-yellow-700 font-semibold rounded-xl hover:bg-yellow-100 transition-all"
                   >
                     Give Feedback
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

        {/* Received Feedback Section */}
        <div className="mt-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="section-title text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
            <span className="text-2xl">⭐</span> Received Feedback
          </h2>
          
          <div className="space-y-4">
            {feedbacks.length > 0 ? (
              feedbacks.map((feedback) => (
                <div key={feedback._id} className="feedback-card p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <img 
                        src={feedback.reviewer?.profilePic 
                          ? `http://localhost:5000/uploads/${feedback.reviewer.profilePic}` 
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(feedback.reviewer?.fullName || 'Anonymous')}&background=random`} 
                        alt={feedback.reviewer?.fullName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div>
                        <h4 className="font-bold text-gray-900">{feedback.reviewer?.fullName || "Unknown User"}</h4>
                        <p className="text-xs text-gray-500">{new Date(feedback.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < feedback.rating ? "text-yellow-400" : "text-gray-300"}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 pl-[52px]">{feedback.comment}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p>No feedback received yet.</p>
              </div>
            )}
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

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        recipientId={id}
        onFeedbackSubmit={handleFeedbackSubmit}
      />
      {activeChat && (
        <ChatBox
          requestId={activeChat.requestId}
          currentUser={currentUser}
          otherUser={activeChat.otherUser}
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  );
};

export default UserProfileView;
