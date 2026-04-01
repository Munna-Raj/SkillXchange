import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import NotificationBell from "./NotificationBell";

const Navbar = ({ userProfile, pageTitle = "Dashboard" }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentUser = useMemo(() => {
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

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/login");
  };

  const getProfilePictureUrl = () => {
    const pic = userProfile?.profilePic || currentUser?.profilePic;
    if (pic) {
      // If it's already a full URL (Cloudinary), return it directly
      if (pic.startsWith("http")) return pic;
      
      // Fallback for old local records
      let baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      if (baseUrl.endsWith("/api")) {
        baseUrl = baseUrl.replace("/api", "");
      } else if (baseUrl.endsWith("/")) {
        baseUrl = baseUrl.slice(0, -1);
      }
      return `${baseUrl}/uploads/${pic}`;
    }
    return null;
  };

  const username = userProfile?.username || currentUser?.username || "User";
  const fullName = userProfile?.fullName || currentUser?.fullName || "User";
  const role = userProfile?.role || currentUser?.role || "Member";

  return (
    <header className="navbar-container sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="logo-box grid h-10 w-10 place-items-center rounded-xl ring-1 overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800">
            <img 
              src="/logo%20skillxChange.jpeg" 
              alt="SkillXchange Logo" 
              className="w-full h-full object-cover"
            />
          </Link>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-4 text-gray-900 dark:text-white">SkillXchange</p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{pageTitle}</p>
          </div>
        </div>

        {/* Search Bar (Desktop) */}
        <form onSubmit={handleSearch} className="search-bar hidden w-full max-w-xs items-center gap-2 rounded-xl bg-gray-100 dark:bg-gray-800 px-3 py-2 ring-1 ring-gray-300 dark:ring-gray-700 md:flex mx-4">
          <button type="submit" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 transition-colors">
            ⌕
          </button>
          <input
            className="w-full bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none"
            placeholder="Search skills, mentors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Mobile Search Button (Visible on small screens) */}
        <div className="flex md:hidden ml-auto mr-2">
          <Link to="/search" className="p-2 text-gray-500 dark:text-gray-400" title="Search">
            <span className="text-xl">⌕</span>
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate("/conversations")}
            className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold ring-1 border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
            title="Messages"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 10c0 3.866-3.582 7-8 7a8.96 8.96 0 01-3.917-.885L5 18l1.2-3.2A6.99 6.99 0 013 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" />
            </svg>
          </button>

          <button
            onClick={() => navigate("/sessions")}
            className="hidden md:inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold ring-1 border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Sessions"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M4 11h16M5 19h14a2 2 0 002-2v-6H3v6a2 2 0 002 2z"/>
            </svg>
          </button>

          {role === "mentor" && (
            <button
              onClick={() => navigate("/mentor/dashboard")}
              className="hidden lg:inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold ring-1 border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              title="Mentor Workspace"
            >
              Workspace
            </button>
          )}

          <NotificationBell />

          <div className="hidden sm:block text-right mr-1">
            <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate max-w-[80px] sm:max-w-[120px] leading-tight">
              {username}
            </p>
            <p className="text-[9px] sm:text-[10px] text-indigo-600 dark:text-indigo-400 uppercase font-black tracking-tighter">
              {role}
            </p>
          </div>

          <div className="relative" ref={settingsRef}>
            <button
              type="button"
              onClick={() => setIsSettingsOpen((prev) => !prev)}
              className="flex items-center gap-1 sm:gap-2 rounded-xl bg-gray-50 dark:bg-gray-800 px-1.5 py-1.5 sm:px-2 sm:py-2 ring-1 ring-gray-200 dark:ring-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-sm"
            >
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 overflow-hidden ring-2 ring-white dark:ring-gray-800 shadow-sm transition-transform group-hover:scale-105">
                {getProfilePictureUrl() ? (
                  <img src={getProfilePictureUrl()} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <span className="text-xs sm:text-sm font-black text-indigo-700 dark:text-indigo-300">
                      {fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isSettingsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isSettingsOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-gray-900 shadow-xl ring-1 ring-black/5 dark:ring-gray-800 py-2 z-[30] animate-scaleIn">
                <div className="px-4 py-2 border-b border-gray-50 dark:border-gray-800 mb-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account</p>
                </div>
                <button
                  onClick={() => { setIsSettingsOpen(false); navigate("/profile"); }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 transition-colors"
                >
                  <span className="text-lg">👤</span>
                  <span>My Profile</span>
                </button>
                <button
                  onClick={() => { setIsSettingsOpen(false); navigate("/settings"); }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 transition-colors"
                >
                  <span className="text-lg">⚙️</span>
                  <span>Settings</span>
                </button>
                <div className="my-1 border-t border-gray-50 dark:border-gray-800"></div>
                <button
                  onClick={logout}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-semibold"
                >
                  <span className="text-lg">🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
