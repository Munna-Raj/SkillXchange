import { useMemo, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";

function StatCard({ title, value, sub }) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-gray-200 shadow-lg">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-2 text-xs text-gray-500">{sub}</p>
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700 font-medium">
      {children}
    </span>
  );
}

function PrimaryButton({ children, to }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
    >
      {children}
    </Link>
  );
}

function SecondaryButton({ children, to }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 border border-gray-300 hover:bg-gray-50 transition-colors"
    >
      {children}
    </Link>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search-results?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUserProfile(userData);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  const getProfilePictureUrl = () => {
    if (userProfile?.profilePic) {
      return `http://localhost:5000/uploads/${userProfile.profilePic}`;
    }
    return null;
  };

  // For showcase: mock data (replace later with API)
  const data = useMemo(
    () => ({
      username: "SkillXchanger",
      stats: {
        skills: 6,
        matches: 12,
        requests: 3,
        rating: "4.8/5",
      },
      recommended: [
        {
          name: "Aarav Sharma",
          teach: "React",
          learn: "Node.js",
          level: "Intermediate",
          city: "Kathmandu",
        },
        {
          name: "Priya Singh",
          teach: "UI/UX",
          learn: "MongoDB",
          level: "Beginner",
          city: "Pokhara",
        },
        {
          name: "Sanjay Thapa",
          teach: "Java",
          learn: "Express",
          level: "Advanced",
          city: "Lalitpur",
        },
      ],
      requests: [
        { from: "Priya Singh", skill: "UI/UX Mentorship", status: "Pending" },
        { from: "Aarav Sharma", skill: "React Pair-Session", status: "Accepted" },
        { from: "Sanjay Thapa", skill: "Express Help", status: "Pending" },
      ],
      mySkills: ["React", "Node.js", "MongoDB", "Tailwind", "JWT", "Git"],
    }),
    []
  );

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 transition-colors duration-200">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute top-40 right-[-8rem] h-72 w-72 rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-[-8rem] h-72 w-72 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl ring-1 ring-blue-500/30 overflow-hidden">
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

          <form onSubmit={handleSearch} className="hidden w-full max-w-sm items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 ring-1 ring-gray-300 md:flex">
            <span className="text-gray-500">⌕</span>
            <input
              className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-600 outline-none"
              placeholder="Search skills, mentors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-900">{userProfile?.username || data.username}</p>
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
                    {(userProfile?.fullName || data.username).charAt(0).toUpperCase()}
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
      <main className="relative mx-auto max-w-6xl px-4 py-8">
        {/* Hero */}
        <div className="rounded-3xl bg-white p-6 ring-1 ring-gray-200 shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {userProfile?.fullName?.split(" ")[0] || data.username}!
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
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Skills Added" value={data.stats.skills} sub="Teach or learn skills" />
          <StatCard title="Matches Found" value={data.stats.matches} sub="Recommended connections" />
          <StatCard title="Pending Requests" value={data.stats.requests} sub="Awaiting responses" />
          <StatCard title="Rating" value={data.stats.rating} sub="After completed exchanges" />
        </div>

        {/* Two columns */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Recommended matches */}
          <section className="lg:col-span-2 rounded-3xl bg-white p-6 ring-1 ring-gray-200 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Recommended Matches</h2>
              <Link className="text-sm text-blue-700 hover:text-blue-800" to="/matches">
                View all →
              </Link>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {data.recommended.map((m) => (
                <div
                  key={m.name}
                  className="rounded-2xl bg-gray-50 p-5 ring-1 ring-gray-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-gray-900">{m.name}</p>
                      <p className="text-xs text-gray-600">{m.city} • {m.level}</p>
                    </div>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-900 font-medium">
                      Match
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-blue-50 p-3 ring-1 ring-blue-200">
                      <p className="text-xs text-blue-800">Can Teach</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">{m.teach}</p>
                    </div>
                    <div className="rounded-xl bg-purple-50 p-3 ring-1 ring-purple-200">
                      <p className="text-xs text-purple-800">Wants to Learn</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">{m.learn}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                      Send Request
                    </button>
                    <button className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-200">
                      Message
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Requests */}
          <section className="rounded-3xl bg-white p-6 ring-1 ring-gray-200 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Recent Requests</h2>
              <Link className="text-sm text-blue-700 hover:text-blue-800" to="/requests">
                Open →
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {data.requests.map((r, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{r.from}</p>
                      <p className="text-xs text-gray-600">{r.skill}</p>
                    </div>
                    <span
                      className={[
                        "rounded-full px-3 py-1 text-xs font-medium ring-1",
                        r.status === "Accepted"
                          ? "bg-green-100 text-green-900 ring-green-200"
                          : "bg-yellow-100 text-yellow-900 ring-yellow-200",
                      ].join(" ")}
                    >
                      {r.status}
                    </span>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-200">
                      View
                    </button>
                    <button className="flex-1 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                      Action
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-200">
              <p className="text-sm font-semibold text-blue-800">Showcase Tip</p>
              <p className="mt-1 text-xs text-gray-700">
                Click "Send Request" and "Message" (UI demo). You'll connect them to backend next week.
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-10 pb-10 text-center text-xs text-gray-500">
          SkillXchange • MERN + Tailwind • Showcase Build
        </footer>
      </main>
    </div>
  );
}
