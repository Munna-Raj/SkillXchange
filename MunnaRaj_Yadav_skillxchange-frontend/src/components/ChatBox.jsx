import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { getChatHistoryApi } from "../services/chatService";

const socket = io("http://localhost:5000");

const ChatBox = ({ requestId, currentUser, otherUser, onClose, variant = "floating" }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Join room
    socket.emit("join_room", requestId);

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

    // Listen
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [requestId]);

  useEffect(() => {
    // Scroll
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      requestId,
      senderId: currentUser.id || currentUser._id,
      receiverId: otherUser.id || otherUser._id,
      text: newMessage,
    };

    socket.emit("send_message", messageData);
    setNewMessage("");
  };

  const containerClass =
    variant === "floating"
      ? "fixed bottom-6 left-6 w-80 md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col z-50 overflow-hidden animate-slide-up"
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
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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
                  {msg.text}
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
