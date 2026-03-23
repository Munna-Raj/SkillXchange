import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import io from "socket.io-client";
import Navbar from "../components/Navbar";

const GroupDetails = () => {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [sessionForm, setSessionForm] = useState({
    startDate: "",
    timeSlot: "",
    meetLink: "",
  });

  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isMentor = group?.mentor?._id === currentUser.id;

  useEffect(() => {
    fetchGroupDetails();
    setupSocket();
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const setupSocket = () => {
    socketRef.current = io("http://localhost:5000");
    socketRef.current.emit("join_room", groupId);
    socketRef.current.on("receive_message", (message) => {
      if (message.groupId === groupId) {
        setMessages((prev) => [...prev, message]);
      }
    });
  };

  const fetchGroupDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setGroup(data);
        fetchMessages();
      } else {
        toast.error(data.msg || "Failed to fetch group details");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/chat/group/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      groupId,
      isGroupMessage: true,
      senderId: currentUser.id,
      text: newMessage,
    };

    socketRef.current.emit("send_message", messageData);
    setNewMessage("");
  };

  const handleSearchUsers = async () => {
    if (!userSearch.trim()) return;
    setIsSearching(true);
    try {
      const token = localStorage.getItem("token");
      // Pass existing member IDs to exclude them from search results
      const excludeIds = group.members.map(m => m._id).join(',');
      const res = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(userSearch)}&exclude=${excludeIds}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setSearchResults(data);
      } else {
        toast.error(data.message || "Search failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error during search");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/groups/${groupId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Member added!");
        fetchGroupDetails();
      } else {
        toast.error(data.msg || "Failed to add member");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...sessionForm,
          groupId,
          isGroupSession: true,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Group session scheduled!");
        setShowSessionModal(false);
      } else {
        toast.error(data.msg || "Failed to schedule session");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-10 text-center dark:text-white">Loading...</div>;
  if (!group) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors duration-200">
      <Navbar pageTitle={`Group: ${group.name}`} />
      
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-80px)] overflow-hidden">
        {/* Sidebar: Group Info & Members */}
      <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden">
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold dark:text-white mb-1">{group.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{group.description}</p>
          
          <div className="flex gap-2">
            {isMentor && (
              <>
                <button
                  onClick={() => setShowMemberModal(true)}
                  className="flex-1 text-xs bg-indigo-50 text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-100 transition"
                >
                  Add Members
                </button>
                <button
                  onClick={() => setShowSessionModal(true)}
                  className="flex-1 text-xs bg-emerald-50 text-emerald-600 px-3 py-2 rounded-lg hover:bg-emerald-100 transition"
                >
                  Schedule
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Members ({group.members.length})</h3>
          <div className="space-y-3">
            {group.members.map((member) => (
              <div key={member._id} className="flex items-center gap-3">
                <img
                  src={member.profilePic || "/default-avatar.png"}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium dark:text-white truncate">{member.fullName}</p>
                  <p className="text-[10px] text-gray-400 uppercase">{member.role}</p>
                </div>
                {member._id === group.mentor._id && (
                  <span className="bg-amber-100 text-amber-600 text-[10px] px-1.5 py-0.5 rounded">Mentor</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main: Chat Area */}
      <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30 dark:bg-gray-900/30">
          {messages.length > 0 ? (
            messages.map((msg, i) => {
              const isMine = msg.senderId?._id === currentUser.id || msg.senderId === currentUser.id;
              const sender = group.members.find(m => m._id === (msg.senderId?._id || msg.senderId));
              
              return (
                <div key={msg._id || i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] ${isMine ? "order-2" : ""}`}>
                    {!isMine && (
                      <p className="text-[10px] text-gray-400 ml-2 mb-1">
                        {sender?.fullName || "User"}
                      </p>
                    )}
                    <div
                      className={`px-4 py-2 rounded-2xl text-sm ${
                        isMine
                          ? "bg-indigo-600 text-white rounded-tr-none"
                          : "bg-white dark:bg-gray-700 dark:text-white rounded-tl-none shadow-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 italic">
              No messages yet. Start the conversation!
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-700 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            Send
          </button>
        </form>
      </div>

      </div>

      {/* Member Management Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Add Group Members</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button
                onClick={handleSearchUsers}
                disabled={isSearching}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 mb-6">
              {isSearching && (
                <div className="text-center py-4 text-xs text-gray-400">Searching for users...</div>
              )}
              {!isSearching && searchResults.length === 0 && (
                <div className="text-center py-4 text-xs text-gray-400">No users found. Try a different search.</div>
              )}
              {searchResults.map(user => (
                <div key={user._id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <img src={user.profilePic || "/default-avatar.png"} alt="" className="w-8 h-8 rounded-full" />
                    <div>
                      <p className="text-sm font-medium dark:text-white">{user.fullName}</p>
                      <p className="text-xs text-gray-400">{user.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddMember(user._id)}
                    disabled={group.members.some(m => m._id === user._id)}
                    className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded hover:bg-indigo-100 disabled:opacity-50"
                  >
                    {group.members.some(m => m._id === user._id) ? "Added" : "Add"}
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowMemberModal(false)}
              className="w-full py-2 border rounded-lg dark:text-white dark:border-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Session Scheduling Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Schedule Group Session</h2>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={sessionForm.startDate}
                  onChange={e => setSessionForm({...sessionForm, startDate: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Time Slot (HH:MM)</label>
                <input
                  type="time"
                  required
                  value={sessionForm.timeSlot}
                  onChange={e => setSessionForm({...sessionForm, timeSlot: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 flex justify-between items-center">
                  <span>Google Meet Link</span>
                  <a 
                    href="https://meet.new" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline font-bold"
                  >
                    Generate Link
                  </a>
                </label>
                <input
                  type="url"
                  required
                  pattern="https://meet.google.com/.*"
                  placeholder="https://meet.google.com/..."
                  value={sessionForm.meetLink}
                  onChange={e => setSessionForm({...sessionForm, meetLink: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSessionModal(false)}
                  className="flex-1 py-2 border rounded-lg dark:text-white dark:border-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
);
};

export default GroupDetails;
