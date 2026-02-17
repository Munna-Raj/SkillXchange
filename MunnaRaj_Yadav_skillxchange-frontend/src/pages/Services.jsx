import { Link } from "react-router-dom";

export default function Services() {
  const token = localStorage.getItem("token");

  return (
    <div className="min-h-[70vh] bg-white text-gray-900 px-4 py-10">
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
              className="px-5 py-2.5 text-sm md:text-base font-semibold rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            >
              Explore
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2.5 text-sm md:text-base font-semibold rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 text-sm md:text-base font-semibold rounded-full border border-gray-300 text-gray-800 hover:bg-gray-50 transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-2">
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
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-red-500 shadow-lg flex items-center justify-center">
                <span className="text-3xl md:text-4xl text-white">👥</span>
              </div>
              <div className="h-6 w-0.5 bg-red-400 mx-auto"></div>
            </div>
            <h2 className="text-base md:text-lg font-semibold text-red-600 mb-1">
              Smart Matching
            </h2>
            <p className="text-xs md:text-sm text-gray-600 max-w-xs">
              We connect you with people who want to learn what you can teach, and
              teach what you want to learn.
            </p>
          </div>

          <div className="flex-1 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-purple-500 shadow-lg flex items-center justify-center">
                <span className="text-3xl md:text-4xl text-white">📩</span>
              </div>
              <div className="h-6 w-0.5 bg-purple-400 mx-auto"></div>
            </div>
            <h2 className="text-base md:text-lg font-semibold text-purple-600 mb-1">
              Requests & Sessions
            </h2>
            <p className="text-xs md:text-sm text-gray-600 max-w-xs">
              Send and manage skill exchange requests with clear statuses so both
              sides know what is happening.
            </p>
          </div>

          <div className="flex-1 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-blue-500 shadow-lg flex items-center justify-center">
                <span className="text-3xl md:text-4xl text-white">🔔</span>
              </div>
              <div className="h-6 w-0.5 bg-blue-400 mx-auto"></div>
            </div>
            <h2 className="text-base md:text-lg font-semibold text-blue-600 mb-1">
              Chat & Notifications
            </h2>
            <p className="text-xs md:text-sm text-gray-600 max-w-xs">
              Coordinate sessions with built-in messaging and stay updated with a
              notification bell for new activity.
            </p>
          </div>

          <div className="flex-1 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-orange-400 shadow-lg flex items-center justify-center">
                <span className="text-3xl md:text-4xl text-white">🏆</span>
              </div>
              <div className="h-6 w-0.5 bg-orange-300 mx-auto"></div>
            </div>
            <h2 className="text-base md:text-lg font-semibold text-orange-500 mb-1">
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
              className="px-6 py-3 rounded-full bg-blue-600 text-white text-sm font-semibold shadow-md hover:bg-blue-700 transition-colors"
            >
              Create a free account
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-full border border-gray-300 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
