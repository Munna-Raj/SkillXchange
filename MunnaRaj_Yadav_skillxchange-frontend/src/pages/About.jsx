import { Link } from "react-router-dom";

export default function About() {
  const token = localStorage.getItem("token");

  return (
    <div className="about-page min-h-screen bg-white text-gray-900 px-4 py-20 relative overflow-hidden">
      {/* Navbar - Matching Home.jsx style */}
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

      <main className="max-w-4xl mx-auto pt-12">
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-1.5 mb-6 bg-indigo-50 rounded-full border border-indigo-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
              Our Story
            </p>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-none">
            Learning without <span className="text-indigo-600">boundaries.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-3xl mx-auto font-medium">
            SkillXchange is a platform built on the belief that everyone has something valuable to teach and everyone has something new to learn. We're here to make knowledge sharing accessible, direct, and community-driven.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl mb-6">🎯</div>
            <h2 className="text-xl font-black text-gray-900 mb-4 tracking-tight">Our Mission</h2>
            <p className="text-gray-500 leading-relaxed font-medium">
              To democratize learning by enabling people to exchange skills directly with one another. We want to remove the barriers of traditional education and create a global network of peer-to-peer mentors where knowledge is the only currency.
            </p>
          </div>
          <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl mb-6">🤝</div>
            <h2 className="text-xl font-black text-gray-900 mb-4 tracking-tight">How it Works</h2>
            <p className="text-gray-500 leading-relaxed font-medium">
              It's simple: you list the skills you can teach and the skills you want to learn. Our platform matches you with others who have complementary needs, allowing you to connect, chat, and start exchanging knowledge in structured sessions.
            </p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tight">Join our growing community</h2>
            <p className="text-indigo-100/70 mb-8 font-medium">
              Ready to share your expertise or master a new craft? Join thousands of learners and teachers who are already growing together on SkillXchange.
            </p>
            <div className="flex justify-center">
              <Link
                to="/register"
                className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 hover:scale-105 transition-all"
              >
                Get Started for Free
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
