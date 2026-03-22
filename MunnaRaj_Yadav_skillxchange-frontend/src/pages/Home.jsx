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
    <div className="home-page font-moho min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="home-bg-elements absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-[40rem] h-[40rem] rounded-full blur-[100px] animate-pulse opacity-30"
          style={{ backgroundColor: "rgba(0, 95, 115, 0.3)" }}
        ></div>
        <div
          className="absolute -bottom-40 -left-40 w-[40rem] h-[40rem] rounded-full blur-[100px] animate-pulse delay-1000 opacity-40"
          style={{ backgroundColor: "rgba(148, 210, 189, 0.4)" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] rounded-full blur-[120px] animate-pulse delay-500 opacity-20"
          style={{ backgroundColor: "rgba(10, 147, 150, 0.2)" }}
        ></div>
      </div>

      <header className="fixed top-0 inset-x-0 z-20 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 md:py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-11 w-11 md:h-12 md:w-12 rounded-2xl overflow-hidden shadow-lg border border-gray-200">
              <img
                src="/src/Image/logo skillxChange.jpeg"
                alt="SkillXchange home"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-base md:text-lg font-semibold text-gray-900">
              SkillXchange
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {token ? (
              <Link
                to="/dashboard"
                className="px-5 py-2.5 text-sm md:text-base font-semibold rounded-full text-white transition-colors"
                style={{ backgroundColor: "#4b0082" }}
              >
                Explore
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-sm md:text-base font-semibold rounded-full text-white transition-colors"
                  style={{ backgroundColor: "#005f73" }}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm md:text-base font-semibold rounded-full border transition-colors"
                  style={{ borderColor: "#005f73", color: "#005f73", backgroundColor: "#e9f5f2" }}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="home-content-container relative z-10 max-w-5xl w-full pt-24 md:pt-28">
        <div className="home-header text-center mb-12">
          <div className="brand-logo-container inline-flex items-center gap-3 mb-6 justify-center">
            <img
              src="/src/Image/logo skillxChange.jpeg"
              alt="SkillXchange Logo"
              className="logo-image w-16 h-16 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300 object-cover"
            />
            <div className="text-left">
              <h1
                className="brand-title text-6xl md:text-8xl font-bold bg-clip-text text-transparent tracking-tight leading-none"
                style={{
                  backgroundImage: "linear-gradient(to right, #005f73, #94d2bd)",
                  WebkitTextStroke: "1px white",
                  filter: "drop-shadow(0 4px 12px rgba(0, 95, 115, 0.3))"
                }}
              >
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

          <div className="grid gap-8 md:grid-cols-3 mb-16">
            <div className="feature-card bg-gradient-to-br from-sky-100/60 to-blue-100/60 backdrop-blur-xl border border-sky-200/50 shadow-xl p-8 rounded-[2rem] hover:scale-105 hover:shadow-2xl transition-all duration-500 group">
              <div className="text-4xl mb-4 group-hover:animate-bounce">🎯</div>
              <h3 className="feature-title text-xl font-bold mb-3 text-gray-900">Smart Matching</h3>
              <p className="feature-desc text-sm text-gray-600 leading-relaxed">
                Our matching engine connects you with people who want to learn the skills you can teach.
              </p>
            </div>
            <div className="feature-card bg-gradient-to-br from-emerald-100/60 to-teal-100/60 backdrop-blur-xl border border-emerald-200/50 shadow-xl p-8 rounded-[2rem] hover:scale-105 hover:shadow-2xl transition-all duration-500 group">
              <div className="text-4xl mb-4 group-hover:animate-bounce">🤝</div>
              <h3 className="feature-title text-xl font-bold mb-3 text-gray-900">Request & Exchange</h3>
              <p className="feature-desc text-sm text-gray-600 leading-relaxed">
                Send and receive requests, chat, and plan sessions directly from the dashboard.
              </p>
            </div>
            <div className="feature-card bg-gradient-to-br from-teal-100/60 to-green-100/60 backdrop-blur-xl border border-teal-200/50 shadow-xl p-8 rounded-[2rem] hover:scale-105 hover:shadow-2xl transition-all duration-500 group">
              <div className="text-4xl mb-4 group-hover:animate-bounce">📊</div>
              <h3 className="feature-title text-xl font-bold mb-3 text-gray-900">Feedback & Growth</h3>
              <p className="feature-desc text-sm text-gray-600 leading-relaxed">
                Collect feedback after each exchange and track how your skills improve over time.
              </p>
            </div>
          </div>
        </div>

        {/* How it Works Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How it Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              SkillXchange is built on the principle of mutual learning. Here's how you can get started in 4 simple steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="relative p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xl mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">1</div>
              <h4 className="font-bold text-gray-900 mb-2">Create Profile</h4>
              <p className="text-xs text-gray-500 leading-relaxed">List the skills you can teach and the ones you want to learn.</p>
              <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-gray-200 text-2xl">→</div>
            </div>
            <div className="relative p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 font-bold text-xl mb-4 group-hover:bg-sky-600 group-hover:text-white transition-all">2</div>
              <h4 className="font-bold text-gray-900 mb-2">Find Matches</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Our system finds people with complementary skills to yours.</p>
              <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-gray-200 text-2xl">→</div>
            </div>
            <div className="relative p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xl mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all">3</div>
              <h4 className="font-bold text-gray-900 mb-2">Send Request</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Propose an exchange and chat to finalize the learning plan.</p>
              <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-gray-200 text-2xl">→</div>
            </div>
            <div className="relative p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-xl mb-4 group-hover:bg-amber-600 group-hover:text-white transition-all">4</div>
              <h4 className="font-bold text-gray-900 mb-2">Start Learning</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Join live sessions, share knowledge, and grow together.</p>
            </div>
          </div>
        </section>

        {/* Why SkillXchange Section */}
        <section className="mb-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-3xl opacity-20"></div>
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Community Learning" 
              className="relative rounded-[3rem] shadow-2xl border-8 border-white object-cover aspect-video md:aspect-square"
            />
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-3xl shadow-xl border border-gray-50 max-w-[200px]">
              <p className="text-2xl font-bold text-indigo-600">500+</p>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Active Mentors</p>
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              A community built on <span className="text-indigo-600">shared knowledge.</span>
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We believe everyone has something valuable to teach and something new to learn. SkillXchange removes the barriers of traditional learning by connecting you directly with peers.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs flex-shrink-0 mt-0.5">✓</div>
                <div>
                  <h5 className="font-bold text-gray-900 text-sm">No Monetary Cost</h5>
                  <p className="text-xs text-gray-500">Trade your time and skills instead of money.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs flex-shrink-0 mt-0.5">✓</div>
                <div>
                  <h5 className="font-bold text-gray-900 text-sm">Real Human Connection</h5>
                  <p className="text-xs text-gray-500">Learn from real people with real-world experience.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs flex-shrink-0 mt-0.5">✓</div>
                <div>
                  <h5 className="font-bold text-gray-900 text-sm">Structured Progress</h5>
                  <p className="text-xs text-gray-500">Track your learning journey with our session manager.</p>
                </div>
              </li>
            </ul>
          </div>
        </section>

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
                <div className="rounded-xl bg-gradient-to-br from-indigo-50/90 via-sky-50/90 to-emerald-50/90 p-4 border border-indigo-100 shadow-sm hover:shadow-md hover:-translate-y-1 transform transition-all duration-300">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Aarav • Frontend</p>
                  <p className="text-xs text-gray-600 mb-2">Can teach React • Wants to learn Node.js</p>
                  <span className="inline-block text-[11px] px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                    92% Match
                  </span>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-pink-50/90 via-rose-50/90 to-amber-50/90 p-4 border border-pink-100 shadow-sm hover:shadow-md hover:-translate-y-1 transform transition-all duration-300">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Sara • Design</p>
                  <p className="text-xs text-gray-600 mb-2">Can teach UI/UX • Wants to learn JavaScript</p>
                  <span className="inline-block text-[11px] px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                    88% Match
                  </span>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-emerald-50/90 via-teal-50/90 to-blue-50/90 p-4 border border-emerald-100 shadow-sm hover:shadow-md hover:-translate-y-1 transform transition-all duration-300">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Rahul • Data</p>
                  <p className="text-xs text-gray-600 mb-2">Can teach Python • Wants to learn Public Speaking</p>
                  <span className="inline-block text-[11px] px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                    85% Match
                  </span>
                </div>
              </>
            ) : (
              featuredUsers.slice(0, 3).map((user) => (
                <div
                  key={user._id}
                  className="rounded-xl bg-gradient-to-br from-white/90 via-indigo-50/90 to-sky-50/90 p-4 border border-indigo-100 shadow-sm hover:shadow-md hover:-translate-y-1 transform transition-all duration-300"
                >
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

        <section className="homeSectionCard">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Skills available in the system</h2>
          <p className="text-sm text-gray-600 mb-3">
            A sample of skills learners and mentors are already exchanging:
          </p>
          <div className="flex flex-wrap gap-2">
            {sampleSkills.length === 0 ? (
              <>
                <span className="px-3 py-1 text-xs rounded-full bg-indigo-50 border border-indigo-100 text-indigo-800 hover:bg-indigo-100 hover:-translate-y-0.5 transform transition-all duration-200">
                  React & Frontend
                </span>
                <span className="px-3 py-1 text-xs rounded-full bg-sky-50 border border-sky-100 text-sky-800 hover:bg-sky-100 hover:-translate-y-0.5 transform transition-all duration-200">
                  Node.js & APIs
                </span>
                <span className="px-3 py-1 text-xs rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 hover:bg-emerald-100 hover:-translate-y-0.5 transform transition-all duration-200">
                  Data Structures & Algorithms
                </span>
                <span className="px-3 py-1 text-xs rounded-full bg-purple-50 border border-purple-100 text-purple-800 hover:bg-purple-100 hover:-translate-y-0.5 transform transition-all duration-200">
                  UI/UX Design
                </span>
                <span className="px-3 py-1 text-xs rounded-full bg-pink-50 border border-pink-100 text-pink-800 hover:bg-pink-100 hover:-translate-y-0.5 transform transition-all duration-200">
                  Graphic Design
                </span>
                <span className="px-3 py-1 text-xs rounded-full bg-amber-50 border border-amber-100 text-amber-800 hover:bg-amber-100 hover:-translate-y-0.5 transform transition-all duration-200">
                  Public Speaking
                </span>
                <span className="px-3 py-1 text-xs rounded-full bg-teal-50 border border-teal-100 text-teal-800 hover:bg-teal-100 hover:-translate-y-0.5 transform transition-all duration-200">
                  English Communication
                </span>
                <span className="px-3 py-1 text-xs rounded-full bg-blue-50 border border-blue-100 text-blue-800 hover:bg-blue-100 hover:-translate-y-0.5 transform transition-all duration-200">
                  Career & Resume
                </span>
              </>
            ) : (
              sampleSkills.map((name) => (
                <span
                  key={name}
                  className="px-3 py-1 text-xs rounded-full bg-sky-50 border border-sky-100 text-sky-800 hover:bg-sky-100 hover:-translate-y-0.5 transform transition-all duration-200"
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
                className="btn-primary-home group relative px-8 py-4 text-white font-semibold rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                style={{
                  backgroundImage: "linear-gradient(to right, #4b0082, #E6E6FA)",
                }}
              >
                <span className="relative z-10">Start exploring the system</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link
                to="/register"
                className="btn-secondary-home px-8 py-4 font-semibold rounded-2xl border shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                style={{ backgroundColor: "#E6E6FA", borderColor: "#4b0082", color: "#4b0082" }}
              >
                Create a free account
              </Link>
            </>
          ) : (
            <Link
              to="/dashboard"
              className="btn-dashboard-home group relative px-8 py-4 text-white font-semibold rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
              style={{
                backgroundImage: "linear-gradient(to right, #4b0082, #E6E6FA)",
              }}
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
