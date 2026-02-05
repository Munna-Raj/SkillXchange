import { Link } from "react-router-dom";

export default function Home() {
  const token = localStorage.getItem("token");

  return (
    <div className="home-page min-h-screen bg-white text-gray-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="home-bg-elements absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="home-content-container relative z-10 max-w-4xl w-full">
        <div className="home-header text-center mb-12">
          {/* Logo and branding */}
          <div className="brand-logo-container inline-flex items-center gap-3 mb-6">
            <img 
              src="/src/Image/logo skillxChange.jpeg" 
              alt="SkillXchange Logo" 
              className="logo-image w-16 h-16 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300 object-cover"
            />
            <h1 className="brand-title text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              SkillXchange
            </h1>
          </div>
          
          {/* Tagline */}
          <p className="home-tagline text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Connect, Learn, and Grow with a Community of Skill Sharers
          </p>

          {/* Feature highlights */}
          <div className="features-grid grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="feature-card bg-white rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 border border-gray-200 shadow-lg">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="feature-title text-lg font-semibold mb-2 text-gray-900">Find Matches</h3>
              <p className="feature-desc text-sm text-gray-600">Get paired with the perfect learning partners based on your skills</p>
            </div>
            <div className="feature-card bg-white rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 border border-gray-200 shadow-lg">
              <div className="text-3xl mb-3">🤝</div>
              <h3 className="feature-title text-lg font-semibold mb-2 text-gray-900">Exchange Skills</h3>
              <p className="feature-desc text-sm text-gray-600">Teach what you know and learn what you want from others</p>
            </div>
            <div className="feature-card bg-white rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 border border-gray-200 shadow-lg">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="feature-title text-lg font-semibold mb-2 text-gray-900">Grow Together</h3>
              <p className="feature-desc text-sm text-gray-600">Build lasting connections and advance your skills</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="action-buttons-container flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          {!token ? (
            <>
              <Link
                to="/login"
                className="btn-primary-home group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link
                to="/register"
                className="btn-secondary-home px-8 py-4 bg-white text-gray-900 font-semibold rounded-2xl border border-gray-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Create Account
              </Link>
            </>
          ) : (
            <Link
              to="/dashboard"
              className="btn-dashboard-home group relative px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Go to Dashboard
                <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          )}
        </div>


        {/* Footer info */}
        <div className="home-footer mt-12 text-center text-sm text-gray-500">
          <p>Join thousands of learners sharing skills worldwide</p>
          <div className="mt-4 flex justify-center gap-6">
            <span className="flex items-center gap-1">
              <span className="text-green-600">✓</span> Free to use
            </span>
            <span className="flex items-center gap-1">
              <span className="text-green-600">✓</span> No credit card required
            </span>
            <span className="flex items-center gap-1">
              <span className="text-green-600">✓</span> Community driven
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
