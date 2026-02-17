import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFeaturedUsersApi } from "../services/searchService";
import { searchSkillsApi } from "../services/skillService";

export default function Home() {
  const token = localStorage.getItem("token");
  const matchesLink = token ? "/matches" : "/login";
  const [featuredUsers, setFeaturedUsers] = useState([]);
  const [sampleSkills, setSampleSkills] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [users, skills] = await Promise.all([
          getFeaturedUsersApi(),
          searchSkillsApi({})
        ]);

        setFeaturedUsers(users || []);

        const uniqueSkillNames = [];
        const seen = new Set();
        (skills || []).forEach((item) => {
          if (item.skillName && !seen.has(item.skillName.toLowerCase())) {
            seen.add(item.skillName.toLowerCase());
            uniqueSkillNames.push(item.skillName);
          }
        });

        setSampleSkills(uniqueSkillNames.slice(0, 20));
      } catch {
        setFeaturedUsers([]);
        setSampleSkills([]);
      }
    };

    loadData();
  }, []);

  return (
    <div className="home-page min-h-screen bg-white text-gray-900 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="home-bg-elements absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <header className="fixed top-0 inset-x-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl overflow-hidden shadow-lg border border-gray-200">
              <img
                src="/src/Image/logo skillxChange.jpeg"
                alt="SkillXchange home"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-sm md:text-base font-semibold text-gray-900">
              SkillXchange
            </span>
          </Link>
          <div>
            {token ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 text-sm font-semibold rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                Go to dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold rounded-full border border-gray-300 text-gray-800 hover:bg-gray-50 transition-colors"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="home-content-container relative z-10 max-w-5xl w-full pt-20 md:pt-24">
        <div className="home-header text-center mb-12">
          <div className="brand-logo-container inline-flex items-center gap-3 mb-6 justify-center">
            <img
              src="/src/Image/logo skillxChange.jpeg"
              alt="SkillXchange Logo"
              className="logo-image w-16 h-16 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300 object-cover"
            />
            <div className="text-left">
              <h1 className="brand-title text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                SkillXchange
              </h1>
              <p className="mt-2 text-sm md:text-base text-gray-500">
                A peer‑to‑peer platform to trade skills, time, and knowledge.
              </p>
            </div>
          </div>

          <p className="home-tagline text-xl md:text-2xl text-gray-700 mb-6 max-w-2xl mx-auto leading-relaxed">
            Learn what you want and teach what you know in one simple system.
          </p>

          <div className="grid gap-6 md:grid-cols-3 mb-10">
            <div className="feature-card bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="feature-title text-lg font-semibold mb-2 text-gray-900">Smart Matching</h3>
              <p className="feature-desc text-sm text-gray-600">
                Our matching engine connects you with people who want to learn the skills you can teach.
              </p>
            </div>
            <div className="feature-card bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="text-3xl mb-3">🤝</div>
              <h3 className="feature-title text-lg font-semibold mb-2 text-gray-900">Request & Exchange</h3>
              <p className="feature-desc text-sm text-gray-600">
                Send and receive requests, chat, and plan sessions directly from the dashboard.
              </p>
            </div>
            <div className="feature-card bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="feature-title text-lg font-semibold mb-2 text-gray-900">Feedback & Growth</h3>
              <p className="feature-desc text-sm text-gray-600">
                Collect feedback after each exchange and track how your skills improve over time.
              </p>
            </div>
          </div>
        </div>

        <section className="homeSectionCard">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Recommended Matches</h2>
            <Link to={matchesLink} className="text-sm text-blue-700 hover:text-blue-800">
              View all →
            </Link>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Preview how SkillXchange recommends people you can learn from and teach.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {featuredUsers.length === 0 ? (
              <>
                <div className="rounded-xl bg-gray-50 p-4 border border-gray-200">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Aarav • Frontend</p>
                  <p className="text-xs text-gray-600 mb-2">Can teach React • Wants to learn Node.js</p>
                  <span className="inline-block text-[11px] px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                    92% Match
                  </span>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 border border-gray-200">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Sara • Design</p>
                  <p className="text-xs text-gray-600 mb-2">Can teach UI/UX • Wants to learn JavaScript</p>
                  <span className="inline-block text-[11px] px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                    88% Match
                  </span>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 border border-gray-200">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Rahul • Data</p>
                  <p className="text-xs text-gray-600 mb-2">Can teach Python • Wants to learn Public Speaking</p>
                  <span className="inline-block text-[11px] px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                    85% Match
                  </span>
                </div>
              </>
            ) : (
              featuredUsers.slice(0, 3).map((user) => (
                <div key={user._id} className="rounded-xl bg-gray-50 p-4 border border-gray-200">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    {user.fullName} {user.username ? `• @${user.username}` : ""}
                  </p>
                  <p className="text-xs text-gray-600 mb-2">
                    {user.skillsOffered && user.skillsOffered.length > 0
                      ? `Can teach ${user.skillsOffered.slice(0, 2).join(", ")}`
                      : "Can teach skills from the community"}
                    {user.skillsWanted && user.skillsWanted.length > 0
                      ? ` • Wants to learn ${user.skillsWanted.slice(0, 2).join(", ")}`
                      : ""}
                  </p>
                  <span className="inline-block text-[11px] px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                    {Math.round(user.matchScore)}% Match
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="homeSectionCard bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Skills available in the system</h2>
          <p className="text-sm text-gray-600 mb-3">
            A sample of skills learners and mentors are already exchanging:
          </p>
          <div className="flex flex-wrap gap-2">
            {sampleSkills.length === 0 ? (
              <>
                <span className="px-3 py-1 text-xs rounded-full bg-white border border-gray-200 text-gray-800">
                  React & Frontend
                </span>
                <span className="px-3 py-1 text-xs rounded-full bg-white border border-gray-200 text-gray-800">
                  Node.js & APIs
                </span>
                <span className="px-3 py-1 text-xs rounded-full bg-white border border-gray-200 text-gray-800">
                  Data Structures & Algorithms
                </span>
                <span className="px-3 py-1 text-xs rounded-full bg-white border border-gray-200 text-gray-800">
                  UI/UX Design
                </span>
                <span className="px-3 py-1 text-xs rounded-full bg-white border border-gray-200 text-gray-800">
                  Graphic Design
                </span>
                <span className="px-3 py-1 text-xs rounded-full bg-white border border-gray-200 text-gray-800">
                  Public Speaking
                </span>
                <span className="px-3 py-1 text-xs rounded-full bg-white border border-gray-200 text-gray-800">
                  English Communication
                </span>
                <span className="px-3 py-1 text-xs rounded-full bg-white border border-gray-200 text-gray-800">
                  Career & Resume
                </span>
              </>
            ) : (
              sampleSkills.map((name) => (
                <span
                  key={name}
                  className="px-3 py-1 text-xs rounded-full bg-white border border-gray-200 text-gray-800"
                >
                  {name}
                </span>
              ))
            )}
          </div>
        </section>

        <div className="action-buttons-container flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          {!token ? (
            <>
              <Link
                to="/login"
                className="btn-primary-home group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">Start exploring the system</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link
                to="/register"
                className="btn-secondary-home px-8 py-4 bg-white text-gray-900 font-semibold rounded-2xl border border-gray-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Create a free account
              </Link>
            </>
          ) : (
            <Link
              to="/dashboard"
              className="btn-dashboard-home group relative px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                View your SkillXchange workspace
                <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          )}
        </div>

        <div className="home-footer mt-4 text-center text-sm text-gray-500">
          <p>Built to make real skill exchange simple, structured, and fun.</p>
          <div className="mt-4 flex justify-center gap-6 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="text-green-600">✓</span> Free to use
            </span>
            <span className="flex items-center gap-1">
              <span className="text-green-600">✓</span> No credit card required
            </span>
            <span className="flex items-center gap-1">
              <span className="text-green-600">✓</span> Manage matches, requests, and feedback in one system
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
