import { Link } from "react-router-dom";

export default function About() {
  const token = localStorage.getItem("token");

  return (
    <div className="page-container min-h-screen text-gray-900 px-4 py-10">
      <header className="max-w-5xl mx-auto mb-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-10 w-10 md:h-11 md:w-11 rounded-2xl overflow-hidden shadow-lg border border-gray-200">
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
              className="px-6 py-2.5 text-sm md:text-base font-semibold rounded-full text-white transition-all shadow-md hover:shadow-lg"
              style={{ backgroundColor: "#4b0082" }}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-6 py-2.5 text-sm md:text-base font-semibold rounded-full text-white transition-all shadow-md hover:shadow-lg"
                style={{ backgroundColor: "#4b0082" }}
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 text-sm md:text-base font-semibold rounded-full border transition-all shadow-sm hover:shadow-md"
                style={{ borderColor: "#4b0082", color: "#4b0082", backgroundColor: "#E6E6FA" }}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            About <span style={{ color: "#4b0082" }}>SkillXchange</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
            SkillXchange is a platform built on the belief that everyone has something to teach and everyone has something to learn. We're here to make knowledge sharing accessible, direct, and community-driven.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/50">
            <h2 className="text-2xl font-bold mb-4" style={{ color: "#4b0082" }}>Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              To democratize learning by enabling people to exchange skills directly with one another. We want to remove the barriers of traditional education and create a global network of peer-to-peer mentors.
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/50">
            <h2 className="text-2xl font-bold mb-4" style={{ color: "#4b0082" }}>How it Works</h2>
            <p className="text-gray-700 leading-relaxed">
              It's simple: you list the skills you can teach and the skills you want to learn. Our platform matches you with others who have complementary needs, allowing you to connect and start exchanging knowledge.
            </p>
          </div>
        </div>

        <div className="bg-white/40 backdrop-blur-md p-10 rounded-3xl border border-white/20 text-center shadow-2xl">
          <h2 className="text-3xl font-bold mb-6">Join our community today</h2>
          <p className="text-gray-700 mb-8 max-w-xl mx-auto">
            Ready to share your expertise or master a new craft? Join thousands of learners and teachers on SkillXchange.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-4 rounded-full text-white font-bold text-lg shadow-xl hover:scale-105 transition-transform"
              style={{ backgroundImage: "linear-gradient(to right, #4b0082, #6a0dad)" }}
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
