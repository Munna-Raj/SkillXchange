import { useState } from "react";
import { loginApi } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validateForm = () => {
    if (!form.email) {
      setError("Email is required");
      return false;
    }
    if (!form.email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!form.password) {
      setError("Password is required");
      return false;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await loginApi(form);

      // If backend returns token as `token`
      if (res?.data?.token) {
        localStorage.setItem("token", res.data.token);
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <img 
              src="/src/Image/logo skillxChange.jpeg" 
              alt="SkillXchange Logo" 
              className="w-12 h-12 rounded-xl shadow-lg object-cover"
            />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              SkillXchange
            </h1>
          </div>
          <p className="text-gray-600">Welcome back! Sign in to continue</p>
        </div>

        {/* Login form */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200">
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-700 border border-red-200">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 ring-1 ring-blue-500/30">
                  <span className="text-lg font-bold text-white">SX</span>
                </div>
                <div>
                  <p className="text-sm font-semibold leading-4 text-gray-900">SkillXchange</p>
                  <p className="text-xs text-gray-500">Dashboard</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">📧</span>
                </div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField("")}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-900 outline-none ring-2 transition-all duration-200 ${
                    focusedField === "email"
                      ? "ring-blue-500 bg-white"
                      : "ring-gray-300"
                  } placeholder-gray-400`}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">🔒</span>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField("")}
                  className={`w-full pl-10 pr-12 py-3 rounded-xl bg-white text-gray-900 outline-none ring-2 transition-all duration-200 ${
                    focusedField === "password" 
                      ? "ring-blue-500 bg-white" 
                      : "ring-gray-300"
                  } placeholder-gray-400`}
                  placeholder="•••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <span className="text-gray-500 hover:text-gray-700 transition-colors">
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </span>
                </button>
              </div>
            </div>

            {/* Forgot password link */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Sign up link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link 
                to="/register" 
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
