import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { getChatHistoryApi, uploadChatFileApi } from "../services/chatService";
 
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

 

    return () => {
      socket.off("receive_message");
 
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
    try {
      setCreatingSession(true);
      const payload = {
        requestId,
        startDate,
        timeSlot,
      };
      const s = await createSessionApi(payload);
      setSessions((prev) => [s, ...prev]);
      setStartDate("");
      setTimeSlot("10:00");
    } catch (e) {
      alert("Failed to create session");
    } finally {
      setCreatingSession(false);
    }
  };

  const handleUpdateSession = async (sessionId) => {
    if (!startDate || !timeSlot) return;
    try {
      const updated = await updateSessionApi(sessionId, { startDate, timeSlot });
      setSessions((prev) => prev.map((s) => (s._id === sessionId ? updated : s)));
      setStartDate("");
      setTimeSlot("10:00");
    } catch {
      alert("Failed to update session");
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

  const containerClass =
    variant === "floating"
      ? "fixed bottom-4 right-4 w-80 md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col z-50 overflow-hidden animate-slide-up"
      : "flex-1 h-full bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden";

  return (
    <div className={containerClass}>
      <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
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
            <span className="text-[10px] text-indigo-100">Active now</span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
 
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        <div className="mb-3 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-indigo-700">Session (max 2 users)</span>
            <a href="https://meet.google.com/new" target="_blank" rel="noreferrer" className="text-xs text-indigo-600 underline">Generate Meet (manual)</a>
          </div>
          <form onSubmit={handleCreateSession} className="flex items-center gap-2 mb-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1 text-sm border rounded"
              required
            />
            <input
              type="time"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="px-2 py-1 text-sm border rounded"
              required
            />
            <button
              type="submit"
              disabled={creatingSession}
              className="px-3 py-1 bg-indigo-600 text-white rounded text-sm disabled:opacity-50"
            >
              Create Session
            </button>
          </form>
          {sessions.length === 0 ? (
            <div className="text-xs text-indigo-700">No sessions yet. Create one to schedule 7 classes.</div>
          ) : (
            <div className="space-y-2">
              {sessions.map((s) => (
                <div key={s._id} className="p-2 rounded bg-white border text-xs">
                  <div className="flex justify-between">
                    <span>Meet: <a className="text-indigo-600 underline" href={s.meetLink} target="_blank" rel="noreferrer">Join Session</a></span>
                    <span>Time: {s.timeSlot}</span>
                  </div>
                  <div className="mt-1">
                    Upcoming (7 days):
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      {(s.schedule || []).slice(0, 7).map((item, idx) => (
                        <div key={idx} className="px-2 py-1 rounded border">
                          {new Date(item.date).toLocaleDateString()} {item.timeSlot}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-2 py-1 border rounded"
                    />
                    <input
                      type="time"
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="px-2 py-1 border rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateSession(s._id)}
                      className="px-3 py-1 bg-gray-800 text-white rounded"
                    >
                      Update Time
                    </button>
                  </div>
                </div>
              ))}
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
              <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
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
