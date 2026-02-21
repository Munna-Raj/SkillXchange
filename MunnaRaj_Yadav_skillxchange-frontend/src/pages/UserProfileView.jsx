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
    const newFeedback = await createFeedback(feedbackData);
    if (!newFeedback) {
      return;
    }
    const updatedFeedbacks = await getFeedbackForUser(id);
    setFeedbacks(updatedFeedbacks);
  };

  const refreshUserProfile = async () => {
    const updated = await getUserProfileApi(id);
    setUser(updated);
  };

  const normalizeId = (entry) => {
    if (!entry) return null;
    if (typeof entry === "string") return entry;
    if (typeof entry === "object" && entry._id) return entry._id.toString();
    return null;
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
      const isFollowing = Array.isArray(user.followers)
        && user.followers.some((f) => normalizeId(f) === currentUserId);

      if (isFollowing) {
        await unfollowUserApi(user._id);
      } else {
        await followUserApi(user._id);
      }

      await refreshUserProfile();
    } catch {
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
    } catch {
      setChatError("Failed to open chat. Please try again.");
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen flex items-center justify-center min-h-screen">
        <div className="loading-text text-xl font-medium text-gray-500">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-red-100 max-w-md">
          <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => navigate(-1)} className="btn-secondary px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Go Back</button>
        </div>
      </div>
    );
  }

  const viewerId = currentUser.id || currentUser._id;

  const isViewerFollowing = Array.isArray(user?.followers)
    && viewerId
    && user.followers.some((f) => normalizeId(f) === viewerId);

  const isViewerFollowedBy = Array.isArray(user?.following)
    && viewerId
    && user.following.some((u) => normalizeId(u) === viewerId);

  const followButtonLabel = isViewerFollowing
    ? "Following"
    : isViewerFollowedBy
      ? "Follow Back"
      : "Follow";

  return (
    <div className="page-container user-profile-view-page min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="btn-back inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Back
        </button>

        {user && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <img
                  src={
                    user.profilePic
                      ? `http://localhost:5000/uploads/${user.profilePic}`
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.fullName || user.username || "User"
                        )}&background=random`
                  }
                  alt={user.fullName}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-white"
                />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {user.fullName}
                  </h1>
                  <p className="text-indigo-600 font-medium">@{user.username}</p>
                  <p className="mt-3 text-gray-700">
                    {user.bio || "No bio provided."}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    {user.location && <span>📍 {user.location}</span>}
                    {user.createdAt && (
                      <span>
                        Joined{" "}
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    )}
                    {Array.isArray(user.followers) && (
                      <span>{user.followers.length} Followers</span>
                    )}
                    {Array.isArray(user.following) && (
                      <span>{user.following.length} Following</span>
                    )}
                  </div>
                </div>
              </div>

              {!isAdmin && (
                <div className="flex flex-wrap gap-3 justify-start md:justify-end">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-all active:scale-95"
                  >
                    Send Request
                  </button>
                  <button
                    onClick={handleToggleFollow}
                    disabled={followLoading}
                    className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {followButtonLabel}
                  </button>
                  <button
                    onClick={handleOpenChat}
                    disabled={chatLoading}
                    className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {chatLoading ? "Opening..." : "Message"}
                  </button>
                  <button
                    onClick={() => setIsFeedbackModalOpen(true)}
                    className="px-4 py-2.5 bg-yellow-50 border border-yellow-200 text-yellow-700 font-semibold rounded-xl hover:bg-yellow-100 transition-all"
                  >
                    Give Feedback
                  </button>
                </div>
              )}
            </div>

            {(chatError || followError) && (
              <div className="mt-2 text-sm">
                {chatError && (
                  <p className="text-red-500">{chatError}</p>
                )}
                {followError && (
                  <p className="text-red-500">{followError}</p>
                )}
              </div>
            )}

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Skills to Teach
                </h2>
                <div className="space-y-3">
                  {user.skillsToTeach && user.skillsToTeach.length > 0 ? (
                    user.skillsToTeach.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-gray-100"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {skill.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {skill.category}
                          </p>
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                          {skill.level}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No skills listed.
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Skills to Learn
                </h2>
                <div className="space-y-3">
                  {user.skillsToLearn && user.skillsToLearn.length > 0 ? (
                    user.skillsToLearn.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-gray-100"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {skill.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {skill.category}
                          </p>
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-indigo-50 text-indigo-700">
                          {skill.level}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No skills listed.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <SendRequestModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            receiver={user}
            currentUserSkills={currentUserSkills}
          />

          <FeedbackModal
            isOpen={isFeedbackModalOpen}
            onClose={() => setIsFeedbackModalOpen(false)}
            recipientId={id}
            onFeedbackSubmit={handleFeedbackSubmit}
          />

          {feedbacks && feedbacks.length > 0 && (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Received Feedback
              </h2>
              <div className="space-y-4">
                {feedbacks.map((feedback) => (
                  <div
                    key={feedback._id}
                    className="flex gap-3 border border-gray-100 rounded-2xl p-3 bg-gray-50"
                  >
                    <img
                      src={
                        feedback.reviewer?.profilePic
                          ? `http://localhost:5000/uploads/${feedback.reviewer.profilePic}`
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              feedback.reviewer?.fullName || "User"
                            )}&background=random`
                      }
                      alt={feedback.reviewer?.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {feedback.reviewer?.fullName || "Unknown User"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(
                              feedback.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-yellow-400 text-sm">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={
                                i < feedback.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-700">
                        {feedback.comment}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

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
