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

    try {
      const stored = localStorage.getItem("activeChat");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.requestId && parsed.otherUser) {
          setActiveChat(parsed);
        }
      }
    } catch (err) {
      console.error("Failed to restore active chat", err);
    }
  }, []);

  return (
    <div className="page-container my-requests-page min-h-screen bg-white">
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

      <div className="max-w-6xl mx-auto px-4 pb-24 relative z-10">
        <h1 className="my-requests-title text-3xl font-bold text-gray-900 mb-6">
          Conversations
        </h1>

        {error && (
          <div className="p-4 mb-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            Loading conversations...
          </div>
        ) : conversations.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No conversations yet. Start by accepting a skill exchange request.
          </p>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Chats</span>
                <span className="text-xs text-gray-400">{conversations.length} active</span>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {conversations.map((conv) => {
                  const isActive = activeChat && activeChat.requestId === conv.id;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => {
                        const chatData = {
                          requestId: conv.id,
                          otherUser: conv.otherUser,
                        };
                        setActiveChat(chatData);
                        try {
                          localStorage.setItem("activeChat", JSON.stringify(chatData));
                        } catch (err) {
                          console.error("Failed to persist active chat", err);
                        }
                      }}
                      className={`w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-indigo-50 transition-colors ${
                        isActive ? "bg-indigo-50 border-l-4 border-indigo-500" : ""
                      }`}
                    >
                      <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
                        {conv.otherUser?.profilePic ? (
                          <img
                            src={`http://localhost:5000/uploads/${conv.otherUser.profilePic}`}
                            alt={conv.otherUser?.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (conv.otherUser?.fullName || "U").charAt(0)
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-900">
                            {conv.otherUser?.fullName || "User"}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(conv.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          You {conv.role === "sent" ? "want to learn" : "teach"}{" "}
                          <span className="font-semibold text-indigo-600">
                            {conv.learnSkill}
                          </span>{" "}
                          and {conv.role === "sent" ? "teach" : "learn"}{" "}
                          <span className="font-semibold text-green-600">
                            {conv.teachSkill}
                          </span>
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {activeChat && (
              <ChatBox
                requestId={activeChat.requestId}
                currentUser={currentUser}
                otherUser={activeChat.otherUser}
                onClose={() => {
                  setActiveChat(null);
                  try {
                    localStorage.removeItem("activeChat");
                  } catch (err) {
                    console.error("Failed to clear active chat", err);
                  }
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Conversations;
