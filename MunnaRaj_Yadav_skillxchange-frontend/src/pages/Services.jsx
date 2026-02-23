import { Link } from "react-router-dom";

export default function Services() {
  const token = localStorage.getItem("token");

  return (
    <div className="services-page min-h-[70vh] text-gray-900 px-4 py-10">
      <header className="max-w-5xl mx-auto mb-8 flex items-center justify-between">
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
                style={{ backgroundColor: "#4b0082" }}
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 text-sm md:text-base font-semibold rounded-full border transition-colors"
                style={{ borderColor: "#4b0082", color: "#4b0082", backgroundColor: "#E6E6FA" }}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#4b0082" }}>
            Our Services
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            How SkillXchange helps you learn and teach
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            Four core services work together to make real skill exchange simple, structured, and fun.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch justify-between gap-6 md:gap-4">
          <div className="flex-1 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div
                className="h-20 w-20 md:h-24 md:w-24 rounded-full shadow-lg flex items-center justify-center"
                style={{ backgroundColor: "#4b0082" }}
              >
                <span className="text-3xl md:text-4xl text-white">👥</span>
              </div>
              <div
                className="h-6 w-0.5 mx-auto"
                style={{ backgroundColor: "#E6E6FA" }}
              ></div>
            </div>
            <h2
              className="text-base md:text-lg font-semibold mb-1"
              style={{ color: "#4b0082" }}
            >
              Smart Matching
            </h2>
            <p className="text-xs md:text-sm text-gray-600 max-w-xs">
              We connect you with people who want to learn what you can teach, and
              teach what you want to learn.
            </p>
          </div>

          <div className="flex-1 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div
                className="h-20 w-20 md:h-24 md:w-24 rounded-full shadow-lg flex items-center justify-center"
                style={{ backgroundColor: "#4b0082" }}
              >
                <span className="text-3xl md:text-4xl text-white">📩</span>
              </div>
              <div
                className="h-6 w-0.5 mx-auto"
                style={{ backgroundColor: "#E6E6FA" }}
              ></div>
            </div>
            <h2
              className="text-base md:text-lg font-semibold mb-1"
              style={{ color: "#4b0082" }}
            >
              Requests & Sessions
            </h2>
            <p className="text-xs md:text-sm text-gray-600 max-w-xs">
              Send and manage skill exchange requests with clear statuses so both
              sides know what is happening.
            </p>
          </div>

          <div className="flex-1 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div
                className="h-20 w-20 md:h-24 md:w-24 rounded-full shadow-lg flex items-center justify-center"
                style={{ backgroundColor: "#4b0082" }}
              >
                <span className="text-3xl md:text-4xl text-white">🔔</span>
              </div>
              <div
                className="h-6 w-0.5 mx-auto"
                style={{ backgroundColor: "#E6E6FA" }}
              ></div>
            </div>
            <h2
              className="text-base md:text-lg font-semibold mb-1"
              style={{ color: "#4b0082" }}
            >
              Chat & Notifications
            </h2>
            <p className="text-xs md:text-sm text-gray-600 max-w-xs">
              Coordinate sessions with built-in messaging and stay updated with a
              notification bell for new activity.
            </p>
          </div>

          <div className="flex-1 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div
                className="h-20 w-20 md:h-24 md:w-24 rounded-full shadow-lg flex items-center justify-center"
                style={{ backgroundColor: "#4b0082" }}
              >
                <span className="text-3xl md:text-4xl text-white">🏆</span>
              </div>
              <div
                className="h-6 w-0.5 mx-auto"
                style={{ backgroundColor: "#E6E6FA" }}
              ></div>
            </div>
            <h2
              className="text-base md:text-lg font-semibold mb-1"
              style={{ color: "#4b0082" }}
            >
              Profiles & Feedback
            </h2>
            <p className="text-xs md:text-sm text-gray-600 max-w-xs">
              Showcase your skills, collect feedback after each exchange, and
              build trust over time.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600 max-w-xl">
            Whether you are just starting out or already an expert, SkillXchange helps you find the
            right people, structure your exchanges, and keep everything in one simple workspace.
          </p>
          <div className="flex gap-3">
            <Link
              to="/register"
              className="px-6 py-3 rounded-full text-white text-sm font-semibold shadow-md transition-colors"
              style={{
                backgroundImage: "linear-gradient(to right, #4b0082, #E6E6FA)",
              }}
            >
              Create a free account
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-full border text-sm font-semibold transition-colors"
              style={{ borderColor: "#4b0082", color: "#4b0082", backgroundColor: "#E6E6FA" }}
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
