import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSentRequestsApi, getReceivedRequestsApi } from "../services/requestService";
import ChatBox from "../components/ChatBox";

const Conversations = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeChat, setActiveChat] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const [sent, received] = await Promise.all([
          getSentRequestsApi(),
          getReceivedRequestsApi()
        ]);

        const acceptedSent = sent
          .filter((req) => req.status === "accepted")
          .map((req) => ({
            id: req._id,
            otherUser: req.receiverId,
            role: "sent",
            teachSkill: req.teachSkill,
            learnSkill: req.learnSkill,
            createdAt: req.createdAt
          }));

        const acceptedReceived = received
          .filter((req) => req.status === "accepted")
          .map((req) => ({
            id: req._id,
            otherUser: req.senderId,
            role: "received",
            teachSkill: req.teachSkill,
            learnSkill: req.learnSkill,
            createdAt: req.createdAt
          }));

        const merged = [...acceptedSent, ...acceptedReceived].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setConversations(merged);
      } catch (err) {
        console.error("Failed to load conversations:", err);
        setError("Failed to load conversations.");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-500 font-medium">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="page-container my-requests-page">
      <div className="profile-bg-wrapper">
        <div className="profile-bg-blob-1" />
        <div className="profile-bg-blob-2" />
      </div>

      <header className="navbar mb-8">
        <div className="navbar-inner">
          <div className="flex items-center gap-3">
            <div className="nav-logo-container">
              <img
                src="/src/Image/logo skillxChange.jpeg"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-sm font-semibold">SkillXchange</p>
          </div>
          <button onClick={() => navigate("/dashboard")} className="btn-back">
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <h1 className="my-requests-title text-3xl font-bold text-gray-900 mb-6">
          Conversations
        </h1>

        {error && (
          <div className="p-4 mb-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {conversations.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No conversations yet. Start by accepting a skill exchange request.
          </p>
        ) : (
          <div className="grid gap-4">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="request-card bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={
                      conv.otherUser?.profilePic
                        ? `http://localhost:5000/uploads/${conv.otherUser.profilePic}`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            conv.otherUser?.fullName || "User"
                          )}&background=random`
                    }
                    alt={conv.otherUser?.fullName}
                    className="w-14 h-14 rounded-full object-cover border border-gray-200"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {conv.otherUser?.fullName || "User"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      You {conv.role === "sent" ? "want to learn" : "teach"}{" "}
                      <span className="font-semibold text-indigo-600">
                        {conv.learnSkill}
                      </span>{" "}
                      and {conv.role === "sent" ? "teach" : "learn"}{" "}
                      <span className="font-semibold text-green-600">
                        {conv.teachSkill}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Started on{" "}
                      {new Date(conv.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setActiveChat({
                        requestId: conv.id,
                        otherUser: conv.otherUser
                      })
                    }
                    className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M21 10c0 3.866-3.582 7-8 7a8.96 8.96 0 01-3.917-.885L5 18l1.2-3.2A6.99 6.99 0 013 10c0-3.866 3.582-7 8-7s8 3.134 8 7z"
                      />
                    </svg>
                    <span>Open Chat</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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

export default Conversations;

