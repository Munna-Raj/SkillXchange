import { useMemo, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import ChatBox from "../components/ChatBox";
import { getMatchesApi } from "../services/matchService";
import { getReceivedRequestsApi } from "../services/requestService";
import logo from "../Image/logo skillxChange.jpeg";

function StatCard({ title, value, sub }) {
  return (
    <div className="stat-card rounded-2xl bg-white dark:bg-gray-900 p-5 ring-1 ring-gray-200 dark:ring-gray-800 shadow-lg transition-all">
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
      <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">{value}</p>
      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 font-medium">{sub}</p>
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="pill-badge inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
      {children}
    </span>
  );
}

function PrimaryButton({ children, to }) {
  return (
    <Link
      to={to}
      className="btn-primary inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-bold text-white bg-indigo-600 dark:bg-indigo-500 shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all"
    >
      {children}
    </Link>
  );
}

function SecondaryButton({ children, to }) {
  return (
    <Link
      to={to}
      className="btn-secondary inline-flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 px-4 py-2 text-sm font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
    >
      {children}
    </Link>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [recommendedMatches, setRecommendedMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const isAdminAccount = (user) => {
    if (!user) return false;
    const role = (user.role || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    const fullName = (user.fullName || user.name || "").toLowerCase();
    const username = (user.username || "").toLowerCase();
    return (
      role === "admin" ||
      email === "rajyadavproject@gmail.com" ||
      fullName.includes("system admin") ||
      username === "admin"
    );
  };

  const openChatFromRequest = (request) => {
    if (!request || request.status !== "accepted") return;
    const chatData = {
      requestId: request._id,
      otherUser: {
        _id: request.senderId._id,
        fullName: request.senderId.fullName,
        profilePic: request.senderId.profilePic,
      },
    };
    setActiveChat(chatData);
    try {
      localStorage.setItem("activeChat", JSON.stringify(chatData));
    } catch (err) {
      console.error("Failed to persist active chat", err);
    }
  };

  // Initial user data from storage
  const data = useMemo(() => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : {};
    } catch (e) {
      return {};
    }
  }, []);

  useEffect(() => {
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search-results?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  useEffect(() => {
    // Check admin
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");
    if (role === "admin" || email === "rajyadavproject@gmail.com") {
      navigate("/admin/dashboard");
      return;
    }

    fetchUserProfile();
    fetchMatches();
    fetchRecentRequests();
  }, []);

  // Fetch recommended matches
  const fetchMatches = async () => {
    try {
      setLoadingMatches(true);
      const matches = await getMatchesApi();
      // Filter out invalid match entries
      const validMatches = (matches || []).filter(m => m && m._id);
      setRecommendedMatches(validMatches);
    } catch (error) {
      console.error("Failed to fetch matches:", error);
    } finally {
      setLoadingMatches(false);
    }
  };

  // Fetch last 3 received requests
  const fetchRecentRequests = async () => {
    try {
      setLoadingRequests(true);
      const requests = await getReceivedRequestsApi();
      // Filter out requests where senderId might be null (e.g. user deleted)
      const validRequests = (requests || []).filter(r => r && r.senderId);
      setRecentRequests(validRequests.slice(0, 3));
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoadingRequests(false);
    }
  };


  // Get user profile data
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUserProfile(userData);
      } else if (response.status === 404 || response.status === 401) {
        // Clear session on error
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  // Format profile pic URL
  const getProfilePictureUrl = () => {
    if (userProfile?.profilePic) {
      return `${import.meta.env.VITE_API_URL}/uploads/${userProfile.profilePic}`;
    }
    return null;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="dashboard-page min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-200">
      {/* Navbar */}
      <header className="navbar-container sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="logo-box grid h-10 w-10 place-items-center rounded-xl ring-1 overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800">
              <img 
                src={logo} 
                alt="SkillXchange Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold leading-4 text-gray-900 dark:text-white">SkillXchange</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Dashboard</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="search-bar hidden w-full max-w-sm items-center gap-2 rounded-xl bg-gray-100 dark:bg-gray-800 px-3 py-2 ring-1 ring-gray-300 dark:ring-gray-700 md:flex">
            <span className="text-gray-500 dark:text-gray-400">⌕</span>
            <input
              className="w-full bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 outline-none"
              placeholder="Search skills, mentors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/conversations")}
              className="hidden sm:inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold ring-1 border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
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
              <span></span>
            </button>
            <button
              onClick={() => navigate("/sessions")}
              className="hidden sm:inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold ring-1 border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Add or Join Sessions"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M4 11h16M5 19h14a2 2 0 002-2v-6H3v6a2 2 0 002 2z"/>
              </svg>
              <span>Sessions</span>
            </button>
            <NotificationBell />
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{userProfile?.username || data.username || "User"}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Member</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 ring-1 ring-gray-300 dark:ring-gray-600 overflow-hidden">
              {getProfilePictureUrl() ? (
                <img
                  src={getProfilePictureUrl()}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                    {(userProfile?.fullName || data.username || "?").charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSettingsOpen((prev) => !prev)}
                className="rounded-xl bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white ring-1 ring-gray-300 dark:ring-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-1 transition-colors"
              >
                <span>⚙️</span>
                <span className="hidden sm:inline">Settings</span>
              </button>
              {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white dark:bg-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-800 py-1 text-sm z-10 transition-all">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      navigate("/profile");
                    }}
                    className="block w-full px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      navigate("/settings");
                    }}
                    className="block w-full px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Account Settings
                  </button>
                  {(userProfile?.role === 'mentor' || userProfile?.role === 'admin') && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSettingsOpen(false);
                        navigate("/mentor/dashboard");
                      }}
                      className="block w-full px-3 py-2 text-left text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Mentor Dashboard
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      logout();
                    }}
                    className="block w-full px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="dashboard-main relative mx-auto max-w-6xl px-4 py-8 transition-all">
        {/* Hero */}
        <div className="hero-section rounded-3xl bg-white dark:bg-gray-900 p-6 ring-1 ring-gray-200 dark:ring-gray-800 shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {userProfile?.fullName?.split(" ")[0] || data.username || "User"}!
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                You have new matches waiting for you.
              </p>
            </div>
            <div className="flex gap-3">
              <SecondaryButton to="/profile">Edit Profile</SecondaryButton>
              <PrimaryButton to="/matches">Find Matches ✨</PrimaryButton>
            </div>
          </div>
        </div>

        {/* Sessions quick link */}
        <div className="mt-6 rounded-3xl bg-white dark:bg-gray-900 p-6 ring-1 ring-gray-200 dark:ring-gray-800 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Sessions</h2>
            <button onClick={() => navigate('/sessions')} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
              Open Sessions →
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Create, update, and join your upcoming sessions.</p>
        </div>

        {/* Stats */}
        <div className="stats-grid mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Skills Added" 
            value={(userProfile?.skillsToTeach?.length || 0) + (userProfile?.skillsToLearn?.length || 0)} 
            sub="Teach or learn skills" 
          />
          <StatCard 
            title="Matches Found" 
            value={recommendedMatches.filter((m) => !isAdminAccount(m)).length} 
            sub="Recommended connections" 
          />
          <StatCard 
            title="Pending Requests" 
            value={recentRequests.filter(r => r.status === "pending").length} 
            sub="Awaiting responses" 
          />
          <StatCard 
            title="Rating" 
            value="4.8/5" 
            sub="After completed exchanges" 
          />
        </div>

        {/* Two columns */}
        <div className="dashboard-content-grid mt-6 grid gap-6 lg:grid-cols-3">
          {/* Recommended matches */}
          <section className="recommended-section lg:col-span-2 rounded-3xl bg-white dark:bg-gray-900 p-6 ring-1 ring-gray-200 dark:ring-gray-800 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recommended Matches</h2>
              <Link
                className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                to="/matches"
              >
                View all →
              </Link>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {/* Login User Card (First in list) */}
              {userProfile && (
                <div className="match-card rounded-2xl p-5 ring-1 shadow-sm relative overflow-hidden bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/30">
                    <div className="absolute top-0 right-0">
                      <span className="text-white text-[10px] px-3 py-1 font-bold uppercase tracking-widest rounded-bl-xl shadow-sm bg-indigo-600 dark:bg-indigo-500">
                      Me
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-100 dark:border-indigo-900/50"
                      >
                        {getProfilePictureUrl() ? (
                          <img src={getProfilePictureUrl()} alt="Me" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                            {userProfile.fullName?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-base font-bold text-gray-900 dark:text-white">{userProfile.fullName}</p>
                        <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Your Profile Details</p>
                      </div>
                    </div>
                  </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-white dark:bg-gray-800 p-3 shadow-sm ring-1 border-indigo-50 dark:border-indigo-900/30">
                        <p className="text-[10px] uppercase font-bold tracking-tight text-indigo-600 dark:text-indigo-400">I Teach</p>
                      <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {userProfile.skillsToTeach?.[0]?.name || "Not set"}
                      </p>
                    </div>
                      <div className="rounded-xl bg-white dark:bg-gray-800 p-3 shadow-sm ring-1 border-indigo-50 dark:border-indigo-900/30">
                        <p className="text-[10px] uppercase font-bold tracking-tight text-indigo-600 dark:text-indigo-400">I Want to Learn</p>
                      <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {userProfile.skillsToLearn?.[0]?.name || "Not set"}
                      </p>
                    </div>
                  </div>

                    <div className="mt-4 flex gap-3">
                      <button 
                        onClick={() => navigate("/profile")}
                        className="flex-1 rounded-xl bg-white dark:bg-gray-800 border border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 px-4 py-2 text-sm font-semibold hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
                      >
                      Update My Skills
                    </button>
                  </div>
                </div>
              )}

              {/* Recommended Matches */}
              {loadingMatches ? (
                <div className="col-span-full py-10 text-center text-gray-400 dark:text-gray-500 text-sm italic">
                  Finding best matches for you...
                </div>
              ) : recommendedMatches.filter((m) => !isAdminAccount(m)).length > 0 ? (
                recommendedMatches
                  .filter((m) => !isAdminAccount(m))
                  .slice(0, 3)
                  .map((m) => (
                  <div
                    key={m._id}
                    className="match-card rounded-2xl bg-white dark:bg-gray-800 p-5 ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm transition-all hover:shadow-md dark:hover:shadow-indigo-900/10"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 dark:border-gray-700">
                          {m.profilePic ? (
                            <img src={`${import.meta.env.VITE_API_URL}/uploads/${m.profilePic}`} alt={m.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold">
                              {m.fullName?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-base font-bold text-gray-900 dark:text-white">{m.fullName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{m.username}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-green-50 dark:bg-green-900/30 px-3 py-1 text-[10px] text-green-600 dark:text-green-400 font-bold uppercase border border-green-100 dark:border-green-900/50">
                        Match
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl p-3 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800">
                        <p className="text-[10px] uppercase font-bold tracking-tight text-indigo-600 dark:text-indigo-400">Can Teach</p>
                        <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {m.skillsToTeach?.[0]?.name || "Not set"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700 ring-1 ring-gray-50 dark:ring-transparent">
                        <p className="text-[10px] uppercase font-bold tracking-tight text-gray-400 dark:text-gray-500">Wants to Learn</p>
                        <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {m.skillsToLearn?.[0]?.name || "Not set"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => navigate(`/user/${m._id}`)}
                        className="flex-1 rounded-xl px-4 py-2 text-sm font-bold text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-sm transition-all"
                      >
                        Send Request
                      </button>
                      <button className="rounded-xl bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
                        Message
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-10 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No matches found. Try adding more skills to your profile!
                </div>
              )}
            </div>
          </section>

          {/* Requests */}
          <section className="requests-section rounded-3xl bg-white dark:bg-gray-900 p-6 ring-1 ring-gray-200 dark:ring-gray-800 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Requests</h2>
              <Link className="text-sm text-blue-700 dark:text-sky-400 hover:text-blue-800 dark:hover:text-sky-300" to="/requests">
                Open →
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {loadingRequests ? (
                <div className="py-4 text-center text-gray-400 dark:text-gray-500 text-xs italic">
                  Loading requests...
                </div>
              ) : recentRequests.length > 0 ? (
                recentRequests.map((r) => (
                  <div
                    key={r._id}
                    className="request-card rounded-2xl bg-gray-50 dark:bg-gray-800/50 p-4 ring-1 ring-gray-200 dark:ring-gray-700"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                          {r.senderId?.profilePic ? (
                            <img src={`${import.meta.env.VITE_API_URL}/uploads/${r.senderId.profilePic}`} alt={r.senderId.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-[10px] font-bold">
                              {r.senderId?.fullName?.charAt(0) || "?"}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.senderId?.fullName || "Deleted User"}</p>
                          <p className="text-[10px] text-gray-600 dark:text-gray-400">Wants: {r.learnSkill}</p>
                        </div>
                      </div>
                      <span
                        className={[
                          "status-badge rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 uppercase",
                          r.status === "accepted"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 ring-green-200 dark:ring-green-900/50"
                            : r.status === "rejected"
                            ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 ring-red-200 dark:ring-red-900/50"
                            : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 ring-yellow-200 dark:ring-yellow-900/50",
                        ].join(" ")}
                      >
                        {r.status}
                      </span>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button 
                        onClick={() => navigate("/requests")}
                        className="flex-1 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        View
                      </button>
                      {r.status === "pending" && (
                        <button 
                          onClick={() => navigate("/requests")}
                          className="flex-1 rounded-xl bg-blue-600 dark:bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 dark:hover:bg-blue-600 shadow-sm"
                        >
                          Respond
                        </button>
                      )}
                      {r.status === "accepted" && (
                        <button 
                          onClick={() => openChatFromRequest(r)}
                          className="flex-1 rounded-xl bg-indigo-600 dark:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-sm"
                        >
                          Chat
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No recent requests.
                </div>
              )}
            </div>
          </section>
        </div>

        {activeChat && (
          <ChatBox
            requestId={activeChat.requestId}
            currentUser={data}
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
      </main>
    </div>
  );
}
