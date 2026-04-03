import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getSentRequestsApi, getReceivedRequestsApi } from "../services/requestService";
import ChatBox from "../components/ChatBox";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

const Conversations = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeChat, setActiveChat] = useState(null);
  const [activeTab, setActiveTab] = useState("direct"); // "direct" or "groups"
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  
  const socketRef = useRef(null);

  const getProfilePictureUrl = (pic) => {
    if (!pic) return null;
    
    // If it's already a full URL (Cloudinary) or Base64 string, return it directly
    if (pic.startsWith("http") || pic.startsWith("data:image/")) return pic;
    
    // Fallback for old local records
    let baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    if (baseUrl.endsWith("/api")) {
      baseUrl = baseUrl.replace("/api", "");
    } else if (baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, -1);
    }
    
    return `${baseUrl}/uploads/${pic}`;
  };

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isMentor = currentUser.role === "mentor" || currentUser.role === "admin";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const [sent, received, groupsRes] = await Promise.all([
          getSentRequestsApi(),
          getReceivedRequestsApi(),
          fetch(`${import.meta.env.VITE_API_URL}/api/groups`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then(res => res.json())
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

        // Group by otherUser._id to ensure only one conversation per user
        const uniqueConversations = [];
        const seenUserIds = new Set();

        merged.forEach((conv) => {
          if (conv.otherUser && conv.otherUser._id && !seenUserIds.has(conv.otherUser._id)) {
            uniqueConversations.push(conv);
            seenUserIds.add(conv.otherUser._id);
          }
        });

        setConversations(uniqueConversations);
        setGroups(Array.isArray(groupsRes) ? groupsRes : []);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Failed to load conversations and groups.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

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

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newGroupName, description: newGroupDesc }),
      });
      const data = await res.json();
      if (res.ok) {
        // After creating the group, add selected members
        for (const memberId of selectedMembers) {
          await fetch(`${import.meta.env.VITE_API_URL}/api/groups/${data._id}/members`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userId: memberId }),
          });
        }
        
        toast.success("Group created successfully!");
        setGroups([data, ...groups]);
        setShowCreateModal(false);
        setNewGroupName("");
        setNewGroupDesc("");
        setSelectedMembers([]);
      } else {
        toast.error(data.msg || "Failed to create group");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    socketRef.current = io(import.meta.env.VITE_API_URL);
    const socket = socketRef.current;
    const register = () => {
      socket.emit("register", { userId: currentUser.id || currentUser._id });
    };
    socket.on("connect", register);
    register();
    socket.on("message_notification", (payload) => {
      const { requestId } = payload || {};
      const activeId = activeChat?.requestId;
      if (!activeId || activeId !== requestId) {
        toast.info("New message received");
      }
    });
    return () => {
      socket.off("connect", register);
      socket.off("message_notification");
      socket.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="profile-bg-wrapper">
        <div className="profile-bg-blob-1" />
        <div className="profile-bg-blob-2" />
      </div>

      <header className="navbar mb-8 border-b border-gray-100">
        <div className="navbar-inner">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="logo-box grid h-10 w-10 place-items-center rounded-xl ring-1 overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800">
              <img
                src="/logo%20skillxChange.jpeg"
                alt="SkillXchange Logo"
                className="w-full h-full object-cover"
              />
            </Link>
            <p className="text-sm font-semibold">SkillXchange</p>
          </div>
          <button onClick={() => navigate("/dashboard")} className="btn-back">
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="my-requests-title text-2xl font-bold text-gray-900">
            Conversations
          </h1>
          {isMentor && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition"
            >
              + Create Group
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 mb-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            Loading...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-fit lg:h-[600px] overflow-hidden">
              <div className="flex border-b border-gray-100 shrink-0">
                <button
                  onClick={() => setActiveTab("direct")}
                  className={`flex-1 py-3 text-sm font-bold transition ${
                    activeTab === "direct"
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Individual Chats ({conversations.length})
                </button>
                <button
                  onClick={() => setActiveTab("groups")}
                  className={`flex-1 py-3 text-sm font-bold transition ${
                    activeTab === "groups"
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Groups ({groups.length})
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {activeTab === "direct" ? (
                  conversations.length === 0 ? (
                    <p className="text-gray-500 text-center py-8 text-sm">
                      No direct conversations yet.
                    </p>
                  ) : (
                    conversations.map((conv) => {
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
                                src={getProfilePictureUrl(conv.otherUser.profilePic)}
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
                              {conv.role === "sent" ? "You want to learn" : "You teach"}{" "}
                              <span className="font-semibold text-indigo-600">
                                {conv.role === "sent" ? conv.learnSkill : conv.teachSkill}
                              </span>
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )
                ) : (
                  groups.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <p className="text-gray-500 text-sm mb-4">No groups yet.</p>
                      {isMentor && (
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="text-indigo-600 text-sm font-bold hover:underline"
                        >
                          Create your first group
                        </button>
                      )}
                    </div>
                  ) : (
                    groups.map((group) => (
                      <button
                        key={group._id}
                        onClick={() => navigate(`/groups/${group._id}`)}
                        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-indigo-50 transition-colors"
                      >
                        <div className="shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                          {group.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-900">
                              {group.name}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {group.members?.length} members
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {group.description || "Group conversation"}
                          </p>
                        </div>
                      </button>
                    ))
                  )
                )}
              </div>
            </div>

            {activeChat && activeTab === "direct" && (
              <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[500px] lg:h-[600px] overflow-hidden">
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
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl animate-scaleIn">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Create New Group</h2>
            <form onSubmit={handleCreateGroup}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Frontend Study Group"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows="2"
                  placeholder="What's this group for?"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Members (Partners)
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-xl p-2">
                  {conversations.map(conv => (
                    <label key={conv.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(conv.otherUser._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMembers([...selectedMembers, conv.otherUser._id]);
                          } else {
                            setSelectedMembers(selectedMembers.filter(id => id !== conv.otherUser._id));
                          }
                        }}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span className="text-sm text-gray-700">{conv.otherUser.fullName}</span>
                    </label>
                  ))}
                  {conversations.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">No active partners to add.</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newGroupName.trim()}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Conversations;
