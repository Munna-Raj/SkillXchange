import { Link } from "react-router-dom";

export default function Home() {
  const token = localStorage.getItem("token");

  return (
    <div className="home-page min-h-screen bg-white text-gray-900 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="home-bg-elements absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="home-content-container relative z-10 max-w-5xl w-full">
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

        <section className="mb-10 grid gap-6 md:grid-cols-2 items-start">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">How the system works</h2>
            <ol className="space-y-3 text-sm text-gray-700 list-decimal list-inside text-left">
              <li>Create your profile and list the skills you can teach and want to learn.</li>
              <li>Our system finds matches based on skills, level, and interests.</li>
              <li>Send a request, agree on time and format, and start the session.</li>
              <li>Use the built‑in chat and request management to stay organized.</li>
              <li>Share feedback after each exchange and unlock better matches.</li>
            </ol>
          </div>

          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 shadow-md text-left">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Why use SkillXchange?</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Turn your existing skills into learning opportunities.</li>
              <li>• Discover mentors and peers from different backgrounds.</li>
              <li>• Keep all your requests, messages, and sessions in one place.</li>
              <li>• No subscription fees or hidden costs to get started.</li>
              <li>• Designed for students, professionals, and lifelong learners.</li>
            </ul>
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
