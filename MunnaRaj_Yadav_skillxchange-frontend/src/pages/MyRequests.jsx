import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSentRequestsApi, getReceivedRequestsApi, respondToRequestApi } from "../services/requestService";
import NotificationBell from "../components/NotificationBell";
import ChatBox from "../components/ChatBox";

const MyRequests = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("received");
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeChat, setActiveChat] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const [sent, received] = await Promise.all([
        getSentRequestsApi(),
        getReceivedRequestsApi(),
      ]);
      setSentRequests(sent);
      setReceivedRequests(received);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
      setError("Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId, status) => {
    try {
      await respondToRequestApi(requestId, status);
      // Update UI
      setReceivedRequests((prev) =>
        prev.map((req) => (req._id === requestId ? { ...req, status } : req))
      );
    } catch (err) {
      alert("Failed to update request status");
    }
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      accepted: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    };
    return (
      <span className={`status-badge px-2 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${styles[status] || "bg-gray-100"}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-500 font-medium">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="page-container my-requests-page">
      {/* Background */}
      <div className="profile-bg-wrapper">
        <div className="profile-bg-blob-1" />
        <div className="profile-bg-blob-2" />
      </div>

      <header className="navbar mb-8">
        <div className="navbar-inner">
          <div className="flex items-center gap-3">
             <div className="nav-logo-container">
               <img src="/src/Image/logo skillxChange.jpeg" alt="Logo" className="w-full h-full object-cover" />
             </div>
             <p className="text-sm font-semibold">SkillXchange</p>
          </div>
          <button onClick={() => navigate("/dashboard")} className="btn-back">
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <h1 className="my-requests-title text-3xl font-bold text-gray-900 mb-6">Skill Exchange Requests</h1>

        {/* Tabs */}
        <div className="tabs-container flex space-x-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("received")}
            className={`tab-button pb-2 px-4 font-semibold text-sm transition-colors ${
              activeTab === "received"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Received ({receivedRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`tab-button pb-2 px-4 font-semibold text-sm transition-colors ${
              activeTab === "sent"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Sent ({sentRequests.length})
          </button>
        </div>

        {error && <div className="p-4 mb-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

        <div className="requests-grid grid gap-4">
          {activeTab === "received" ? (
            receivedRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No received requests yet.</p>
            ) : (
              receivedRequests.map((req) => (
                <div key={req._id} className="request-card bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="request-user-info flex items-center gap-4 w-full md:w-auto">
                    <img
                      src={req.senderId.profilePic ? `http://localhost:5000/uploads/${req.senderId.profilePic}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(req.senderId.fullName)}&background=random`}
                      alt={req.senderId.fullName}
                      className="w-14 h-14 rounded-full object-cover border border-gray-200"
                    />
                    <div>
                      <h3 className="font-bold text-gray-900">{req.senderId.fullName}</h3>
                      <p className="text-sm text-gray-600">
                        Wants to learn <span className="font-semibold text-indigo-600">{req.learnSkill}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Offers to teach <span className="font-semibold text-green-600">{req.teachSkill}</span>
                      </p>
                    </div>
                  </div>

                  <div className="request-actions flex items-center gap-3 w-full md:w-auto justify-end">
                    {req.status === "pending" ? (
                      <>
                        <button
                          onClick={() => handleRespond(req._id, "rejected")}
                          className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleRespond(req._id, "accepted")}
                          className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                        >
                          Accept Request
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-3">
                        <StatusBadge status={req.status} />
                        {req.status === "accepted" && (
                          <button
                            onClick={() => setActiveChat({ requestId: req._id, otherUser: req.senderId })}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                            title="Chat with user"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )
          ) : sentRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">You haven't sent any requests yet.</p>
          ) : (
            sentRequests.map((req) => (
              <div key={req._id} className="request-card bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="request-user-info flex items-center gap-4">
                  <img
                    src={req.receiverId.profilePic ? `http://localhost:5000/uploads/${req.receiverId.profilePic}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(req.receiverId.fullName)}&background=random`}
                    alt={req.receiverId.fullName}
                    className="w-14 h-14 rounded-full object-cover border border-gray-200"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900">To: {req.receiverId.fullName}</h3>
                    <p className="text-sm text-gray-600">
                      You want to learn <span className="font-semibold text-indigo-600">{req.learnSkill}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      You offer to teach <span className="font-semibold text-green-600">{req.teachSkill}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={req.status} />
                  {req.status === "accepted" && (
                    <button
                      onClick={() => setActiveChat({ requestId: req._id, otherUser: req.receiverId })}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                      title="Chat with user"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat */}
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

export default MyRequests;
