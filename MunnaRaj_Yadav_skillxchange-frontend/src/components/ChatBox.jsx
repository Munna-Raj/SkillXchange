import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { getChatHistoryApi, uploadChatFileApi } from "../services/chatService";
import { deleteMessageApi } from "../services/chatService";
 
import { createSessionApi, getSessionsByRequestApi, updateSessionApi } from "../services/sessionService";

const socket = io("http://localhost:5000");

const ChatBox = ({ requestId, currentUser, otherUser, onClose, variant = "floating" }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
 
  const [sessions, setSessions] = useState([]);
  const [creatingSession, setCreatingSession] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("10:00");
  const [meetLinkInput, setMeetLinkInput] = useState("");
  const [linkError, setLinkError] = useState("");
  const isValidMeetLink = (v) => typeof v === "string" && v.startsWith("https://meet.google.com/");
  const pasteLink = async () => {
    try {
      const t = await navigator.clipboard.readText();
      setMeetLinkInput(t || "");
      setLinkError(t && !isValidMeetLink(t) ? "Invalid Google Meet link" : "");
    } catch {}
  };

  useEffect(() => {
    socket.emit("join_room", requestId);
    socket.emit("register", { userId: currentUser.id || currentUser._id });
    const onConnect = () => {
      socket.emit("register", { userId: currentUser.id || currentUser._id });
    };
    socket.on("connect", onConnect);

    // History
    const fetchHistory = async () => {
      try {
        const history = await getChatHistoryApi(requestId);
        setMessages(history);
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    };

    fetchHistory();
    const fetchSessions = async () => {
      try {
        const s = await getSessionsByRequestApi(requestId);
        setSessions(s);
      } catch (e) {
        console.error("Failed to load sessions", e);
      }
    };
    fetchSessions();

    // Listen
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("message_deleted", ({ messageId }) => {
      if (!messageId) return;
      setMessages((prev) => prev.filter((m) => (m._id || m.id) !== messageId));
    });
 

    return () => {
      socket.off("receive_message");
      socket.off("message_deleted");
 
      socket.off("connect", onConnect);
    };
  }, [requestId]);

 

  useEffect(() => {
    // Scroll
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!startDate || !timeSlot) return;
    if (!isValidMeetLink(meetLinkInput)) return setLinkError("Invalid Google Meet link");
    try {
      setCreatingSession(true);
      const payload = {
        requestId,
        startDate,
        timeSlot,
        meetLink: meetLinkInput,
      };
      const s = await createSessionApi(payload);
      setSessions((prev) => [s, ...prev]);
      setStartDate("");
      setTimeSlot("10:00");
      setMeetLinkInput("");
      setLinkError("");
    } catch (e) {
      alert("Failed to create session");
    } finally {
      setCreatingSession(false);
    }
  };

  const handleUpdateSession = async (sessionId) => {
    if (!startDate && !timeSlot && !meetLinkInput) return;
    if (meetLinkInput && !isValidMeetLink(meetLinkInput)) return setLinkError("Invalid Google Meet link");
    try {
      const updated = await updateSessionApi(sessionId, { startDate, timeSlot, meetLink: meetLinkInput || undefined });
      setSessions((prev) => prev.map((s) => (s._id === sessionId ? updated : s)));
      setStartDate("");
      setTimeSlot("10:00");
      setMeetLinkInput("");
      setLinkError("");
    } catch {
      alert("Failed to update session");
    }
  };

  const handleDeleteMessage = async (msg) => {
    const id = msg._id || msg.id;
    if (!id) return;
    try {
      await deleteMessageApi(id);
      setMessages((prev) => prev.filter((m) => (m._id || m.id) !== id));
      socket.emit("delete_message", { requestId, messageId: id });
    } catch (e) {
      alert("Failed to delete message");
    }
  };

 

  const handleSendMessage = (e) => {

    const messageData = {
      requestId,
      senderId: currentUser.id || currentUser._id,
      receiverId: otherUser.id || otherUser._id,
      text: newMessage,
    };

    socket.emit("send_message", messageData);
    setNewMessage("");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("requestId", requestId);
    formData.append("receiverId", otherUser.id || otherUser._id);

    try {
      setUploading(true);
      const uploadedMsg = await uploadChatFileApi(formData);
      
      // Emit the uploaded message via socket to other user
      socket.emit("send_message", {
        ...uploadedMsg,
        fromUpload: true // Flag to prevent duplicate saving on server if handled differently
      });
      
      setMessages((prev) => [...prev, uploadedMsg]);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const activeSession = sessions.find(s => s.status === "active");

  const containerClass =
    variant === "floating"
      ? "fixed bottom-4 right-4 w-80 md:w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col z-50 overflow-hidden animate-slide-up"
      : "flex-1 h-full bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden";

  return (
    <div className={containerClass}>
      <div className="p-4 bg-indigo-600 text-white flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border border-white/30">
            {otherUser.profilePic ? (
              <img 
                src={`http://localhost:5000/uploads/${otherUser.profilePic}`} 
                alt={otherUser.fullName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold">{otherUser.fullName?.charAt(0)}</span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-sm leading-none">{otherUser.fullName}</h3>
            <span className="text-[10px] text-indigo-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
              Active match
            </span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {/* Session Section */}
        <div className="mb-4">
          {!activeSession ? (
            <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-sm">
              {!showScheduleForm ? (
                <div className="text-center py-2">
                  <p className="text-xs text-gray-500 mb-3 font-medium">No sessions scheduled yet.</p>
                  <button 
                    onClick={() => setShowScheduleForm(true)}
                    className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M4 11h16M5 19h14a2 2 0 002-2v-6H3v6a2 2 0 002 2z" />
                    </svg>
                    Schedule 7-Day Class
                  </button>
                </div>
              ) : (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900">Schedule Class</h4>
                    <button onClick={() => setShowScheduleForm(false)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                  </div>
                  <form onSubmit={handleCreateSession} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Start Date</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none" required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Fixed Time</label>
                        <input type="time" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none" required />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase flex justify-between">
                        Google Meet Link
                        <a href="https://meet.google.com/new" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">Generate Link</a>
                      </label>
                      <div className="flex gap-1">
                        <input type="url" value={meetLinkInput} onChange={(e) => setMeetLinkInput(e.target.value)} placeholder="https://meet.google.com/..." className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none" required />
                        <button type="button" onClick={pasteLink} className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors font-medium">Paste</button>
                      </div>
                      {linkError && <p className="text-[10px] text-red-500 mt-1 font-medium">{linkError}</p>}
                    </div>
                    <button 
                      type="submit" 
                      disabled={creatingSession || !isValidMeetLink(meetLinkInput)} 
                      className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"
                    >
                      {creatingSession ? "Scheduling..." : "Create 7 Daily Sessions"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M4 11h16M5 19h14a2 2 0 002-2v-6H3v6a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-indigo-900">Class Cycle Active</h4>
                    <p className="text-[10px] text-indigo-600 font-medium">7 sessions at {activeSession.timeSlot} daily</p>
                  </div>
                </div>
                <a 
                  href={activeSession.meetLink} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
                >
                  Join Link
                </a>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-white/60 p-2 rounded-xl border border-indigo-100/50">
                  <p className="text-[9px] font-bold text-gray-400 uppercase">Next Session</p>
                  <p className="text-[11px] font-bold text-gray-700">
                    {new Date(activeSession.schedule.find(s => s.status === "upcoming")?.date || activeSession.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <button 
                  onClick={() => navigate("/sessions")}
                  className="flex-1 px-3 py-2 bg-white border border-indigo-200 text-indigo-600 text-[11px] font-bold rounded-xl hover:bg-indigo-50 transition-colors"
                >
                  Full Schedule
                </button>
              </div>
            </div>
          )}
        </div>
 
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId._id === (currentUser.id || currentUser._id) || msg.senderId === (currentUser.id || currentUser._id);
            return (
              <div key={msg._id || index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                  isMe 
                    ? "bg-indigo-600 text-white rounded-tr-none" 
                    : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                }`}>
                  {msg.fileUrl && (
                    <div className="mb-2">
                      {msg.fileType === "image" ? (
                        <a href={`http://localhost:5000/uploads/${msg.fileUrl}`} target="_blank" rel="noopener noreferrer">
                          <img 
                            src={`http://localhost:5000/uploads/${msg.fileUrl}`} 
                            alt={msg.fileName} 
                            className="max-w-full rounded-lg border border-white/20 hover:opacity-90 transition-opacity"
                            style={{ maxHeight: "200px" }}
                          />
                        </a>
                      ) : (
                        <a 
                          href={`http://localhost:5000/uploads/${msg.fileUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 p-2 rounded-xl border ${
                            isMe ? "bg-white/10 border-white/20 text-white" : "bg-gray-50 border-gray-100 text-gray-700"
                          } hover:opacity-80 transition-opacity`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold truncate">{msg.fileName}</p>
                            <p className="text-[10px] opacity-70">Download File</p>
                          </div>
                        </a>
                      )}
                    </div>
                  )}
                  {msg.text && <p>{msg.text}</p>}
                  <div className={`text-[10px] mt-1 ${isMe ? "text-indigo-100" : "text-gray-400"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {isMe && (
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() => handleDeleteMessage(msg)}
                        className="text-[10px] px-2 py-1 rounded bg-white/10 hover:bg-white/20"
                        title="Delete message"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
 
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*, .pdf, .doc, .docx, .ppt, .pptx, .xls, .xlsx, .txt"
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-500 hover:text-indigo-600 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          )}
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
