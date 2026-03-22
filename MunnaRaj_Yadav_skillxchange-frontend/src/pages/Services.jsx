import { Link } from "react-router-dom";
import sessionVideo from "../Image/Sessioncreated.mp4";

export default function Services() {
  const token = localStorage.getItem("token");

  return (
    <div className="services-page min-h-screen bg-white text-gray-900 px-4 py-20 relative overflow-hidden">
      {/* Navbar - Matching Home.jsx */}
      <header className="fixed top-0 inset-x-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
              <img
                src="/src/Image/logo skillxChange.jpeg"
                alt="SkillXchange Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-lg font-black text-gray-900 tracking-tighter">SkillXchange</span>
          </Link>
          <div className="flex items-center gap-4">
            {token ? (
              <Link
                to="/dashboard"
                className="px-5 py-2 text-sm font-bold bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition-all"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 text-sm font-bold bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition-all"
                >
                  Join Now
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto pt-12">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-1.5 mb-6 bg-indigo-50 rounded-full border border-indigo-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
              Our Services
            </p>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-none">
            Empowering your <span className="text-indigo-600">learning journey.</span>
          </h1>
          <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto font-medium">
            We've built a comprehensive ecosystem designed to make peer-to-peer knowledge exchange seamless, structured, and highly rewarding.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">🎯</div>
            <h2 className="text-xl font-black text-gray-900 mb-3 tracking-tight">Smart Skill Matching</h2>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              Our advanced matching algorithm analyzes your teaching skills and learning desires to find the perfect peer mentors. We don't just find people; we find the right people for your specific growth path.
            </p>
          </div>

          <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">📅</div>
            <h2 className="text-xl font-black text-gray-900 mb-3 tracking-tight">Structured Session Manager</h2>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              Take the chaos out of scheduling. Our built-in session manager allows you to plan 7-day class cycles, generate meeting links, and track your attendance automatically with a live contribution graph.
            </p>
          </div>

          <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">💬</div>
            <h2 className="text-xl font-black text-gray-900 mb-3 tracking-tight">Real-time Collaboration</h2>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              Communication is key to learning. Use our integrated real-time chat to share files, coordinate class times, and build lasting professional relationships with your matches across the globe.
            </p>
          </div>

          <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">🔥</div>
            <h2 className="text-xl font-black text-gray-900 mb-3 tracking-tight">Growth & Gamification</h2>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              Stay motivated with our streak system and reputation engine. Earn badges, collect verified feedback, and showcase your teaching expertise through a professional profile that builds trust.
            </p>
          </div>
        </div>

        {/* How to Create a Session Section */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
              How to <span className="text-indigo-600">Create a Session</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto font-medium">
              Watch this quick tutorial to learn how to schedule your 7-day class cycle and start your skill exchange journey.
            </p>
          </div>
          
          <div className="relative max-w-4xl mx-auto group">
            {/* Video Background Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            
            {/* Video Container */}
            <div className="relative bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden aspect-video">
              <video 
                className="w-full h-full object-cover"
                controls
                muted
                loop
                playsInline
              >
                <source src={sessionVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          {/* Info Badge - Moved below video */}
          <div className="mt-8 flex justify-center">
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-black text-gray-900 uppercase tracking-tight">Step-by-Step</p>
                <p className="text-[10px] text-gray-500 font-medium">Simple 7-day class setup</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <div className="bg-gray-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tight">Ready to trade your knowledge?</h2>
            <p className="text-indigo-100/70 mb-8 font-medium">
              Join thousands of learners who are already growing their skills through peer-to-peer exchange. It's free, it's human, and it's effective.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 hover:scale-105 transition-all"
              >
                Create Free Account
              </Link>
              <Link
                to="/search"
                className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white font-black rounded-2xl backdrop-blur-md hover:bg-white/20 transition-all border border-white/10"
              >
                Explore Skills
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
