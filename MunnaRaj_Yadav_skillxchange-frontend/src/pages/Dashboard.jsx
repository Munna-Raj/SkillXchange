import { useMemo, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import { getMatchesApi } from "../services/matchService";
import { getReceivedRequestsApi } from "../services/requestService";

function StatCard({ title, value, sub }) {
  return (
    <div className="stat-card rounded-2xl bg-white p-5 ring-1 ring-gray-200 shadow-lg">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-2 text-xs text-gray-500">{sub}</p>
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="pill-badge inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700 font-medium">
      {children}
    </span>
  );
}

function PrimaryButton({ children, to }) {
  return (
    <Link
      to={to}
      className="btn-primary inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
    >
      {children}
    </Link>
  );
}

function SecondaryButton({ children, to }) {
  return (
    <Link
      to={to}
      className="btn-secondary inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 border border-gray-300 hover:bg-gray-50 transition-colors"
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

  // Initial user data from storage
  const data = useMemo(() => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : {};
    } catch (e) {
      return {};
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
      setRecommendedMatches(matches);
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
      setRecentRequests(requests.slice(0, 3));
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
      const response = await fetch("http://localhost:5000/api/profile", {
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
      return `http://localhost:5000/uploads/${userProfile.profilePic}`;
    }
    return null;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="dashboard-page min-h-screen bg-white text-gray-900 transition-colors duration-200">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute top-40 right-[-8rem] h-72 w-72 rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-[-8rem] h-72 w-72 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="navbar-container sticky top-0 z-20 border-b border-gray-200 bg-white backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="logo-box grid h-10 w-10 place-items-center rounded-xl ring-1 ring-blue-500/30 overflow-hidden">
              <img 
                src="/src/Image/logo skillxChange.jpeg" 
                alt="SkillXchange Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold leading-4 text-gray-900">SkillXchange</p>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="search-bar hidden w-full max-w-sm items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 ring-1 ring-gray-300 md:flex">
            <span className="text-gray-500">⌕</span>
            <input
              className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-600 outline-none"
              placeholder="Search skills, mentors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/conversations")}
              className="hidden sm:inline-flex items-center gap-1 rounded-xl bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 ring-1 ring-indigo-200 hover:bg-indigo-100"
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
            <NotificationBell />
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-900">{userProfile?.username || data.username || "User"}</p>
              <p className="text-xs text-gray-500">Member</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gray-200 ring-1 ring-gray-300 overflow-hidden">
              {getProfilePictureUrl() ? (
                <img
                  src={getProfilePictureUrl()}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-600">
                    {(userProfile?.fullName || data.username || "?").charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="rounded-xl bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-800 ring-1 ring-blue-300 hover:bg-blue-200"
            >
              Profile
            </button>
            <button
              onClick={logout}
              className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 hover:bg-gray-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="dashboard-main relative mx-auto max-w-6xl px-4 py-8">
        {/* Hero */}
        <div className="hero-section rounded-3xl bg-white p-6 ring-1 ring-gray-200 shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {userProfile?.fullName?.split(" ")[0] || data.username || "User"}!
              </h1>
              <p className="mt-2 text-gray-600">
                You have new matches waiting for you.
              </p>
            </div>
            <div className="flex gap-3">
              <SecondaryButton to="/profile">Edit Profile</SecondaryButton>
              <PrimaryButton to="/matches">Find Matches ✨</PrimaryButton>
            </div>
          </div>
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
            value={recommendedMatches.length} 
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
          <section className="recommended-section lg:col-span-2 rounded-3xl bg-white p-6 ring-1 ring-gray-200 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Recommended Matches</h2>
              <Link className="text-sm text-blue-700 hover:text-blue-800" to="/matches">
                View all →
              </Link>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {/* Login User Card (First in list) */}
              {userProfile && (
                <div className="match-card rounded-2xl bg-blue-50/50 p-5 ring-1 ring-blue-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0">
                    <span className="bg-blue-600 text-white text-[10px] px-3 py-1 font-bold uppercase tracking-widest rounded-bl-xl shadow-sm">
                      Me
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-200">
                        {getProfilePictureUrl() ? (
                          <img src={getProfilePictureUrl()} alt="Me" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {userProfile.fullName?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-base font-bold text-gray-900">{userProfile.fullName}</p>
                        <p className="text-xs text-blue-600 font-medium">Your Profile Details</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-blue-100">
                      <p className="text-[10px] uppercase font-bold text-blue-500 tracking-tight">I Teach</p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {userProfile.skillsToTeach?.[0]?.name || "Not set"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-purple-100">
                      <p className="text-[10px] uppercase font-bold text-purple-500 tracking-tight">I Want to Learn</p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {userProfile.skillsToLearn?.[0]?.name || "Not set"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button 
                      onClick={() => navigate("/profile")}
                      className="flex-1 rounded-xl bg-white border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
                    >
                      Update My Skills
                    </button>
                  </div>
                </div>
              )}

              {/* Recommended Matches from API */}
              {loadingMatches ? (
                <div className="col-span-full py-10 text-center text-gray-400 text-sm italic">
                  Finding best matches for you...
                </div>
              ) : recommendedMatches.length > 0 ? (
                recommendedMatches.slice(0, 3).map((m) => (
                  <div
                    key={m._id}
                    className="match-card rounded-2xl bg-gray-50 p-5 ring-1 ring-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200">
                          {m.profilePic ? (
                            <img src={`http://localhost:5000/uploads/${m.profilePic}`} alt={m.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                              {m.fullName?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-base font-semibold text-gray-900">{m.fullName}</p>
                          <p className="text-xs text-gray-600">
                            {m.matchScore}% Match • {m.skillsToTeach?.[0]?.level || "User"}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-green-100 px-3 py-1 text-[10px] text-green-700 font-bold uppercase">
                        Match
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-blue-50 p-3 ring-1 ring-blue-100">
                        <p className="text-[10px] uppercase font-bold text-blue-800 tracking-tight">Can Teach</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {m.skillsToTeach?.[0]?.name || "Skill"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-purple-50 p-3 ring-1 ring-purple-100">
                        <p className="text-[10px] uppercase font-bold text-purple-800 tracking-tight">Wants to Learn</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {m.skillsToLearn?.[0]?.name || "Skill"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button 
                        onClick={() => navigate(`/user/${m._id}`)}
                        className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm"
                      >
                        Send Request
                      </button>
                      <button className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-200">
                        Message
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-10 text-center text-gray-500 text-sm">
                  No matches found. Try adding more skills to your profile!
                </div>
              )}
            </div>
          </section>

          {/* Requests */}
          <section className="requests-section rounded-3xl bg-white p-6 ring-1 ring-gray-200 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Recent Requests</h2>
              <Link className="text-sm text-blue-700 hover:text-blue-800" to="/requests">
                Open →
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {loadingRequests ? (
                <div className="py-4 text-center text-gray-400 text-xs italic">
                  Loading requests...
                </div>
              ) : recentRequests.length > 0 ? (
                recentRequests.map((r) => (
                  <div
                    key={r._id}
                    className="request-card rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                          {r.senderId.profilePic ? (
                            <img src={`http://localhost:5000/uploads/${r.senderId.profilePic}`} alt={r.senderId.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-[10px] font-bold">
                              {r.senderId.fullName?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{r.senderId.fullName}</p>
                          <p className="text-[10px] text-gray-600">Wants: {r.learnSkill}</p>
                        </div>
                      </div>
                      <span
                        className={[
                          "status-badge rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 uppercase",
                          r.status === "accepted"
                            ? "bg-green-100 text-green-700 ring-green-200"
                            : r.status === "rejected"
                            ? "bg-red-100 text-red-700 ring-red-200"
                            : "bg-yellow-100 text-yellow-700 ring-yellow-200",
                        ].join(" ")}
                      >
                        {r.status}
                      </span>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button 
                        onClick={() => navigate("/requests")}
                        className="flex-1 rounded-xl bg-white border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        View
                      </button>
                      {r.status === "pending" && (
                        <button 
                          onClick={() => navigate("/requests")}
                          className="flex-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm"
                        >
                          Respond
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-gray-500 text-sm">
                  No recent requests.
                </div>
              )}
            </div>
          </section>
        </div>


      </main>
    </div>
  );
}
