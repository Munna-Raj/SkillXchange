import { useState } from "react";
import { signupApi } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Calculate password strength
    if (name === "password") {
      let strength = 0;
      if (value.length >= 8) strength++;
      if (value.length >= 12) strength++;
      if (/[A-Z]/.test(value)) strength++;
      if (/[a-z]/.test(value)) strength++;
      if (/[0-9]/.test(value)) strength++;
      if (/[^A-Za-z0-9]/.test(value)) strength++;
      setPasswordStrength(strength);
    }
  };

  const validateForm = () => {
    if (!form.fullName) {
      setError("Full name is required");
      return false;
    }
    if (form.fullName.length < 2) {
      setError("Full name must be at least 2 characters");
      return false;
    }
    if (!form.username) {
      setError("Username is required");
      return false;
    }
    if (form.username.length < 3) {
      setError("Username must be at least 3 characters");
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      setError("Username can only contain letters, numbers, and underscores");
      return false;
    }
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
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await signupApi(form);
      setSuccess(res?.data?.msg || "Account created successfully! Please login.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err?.response?.data?.msg || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 4) return "Medium";
    return "Strong";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-50 dark:via-white dark:to-gray-50 text-white dark:text-gray-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 dark:bg-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 dark:bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-lg font-bold text-white">SX</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 dark:from-indigo-600 dark:to-purple-600 bg-clip-text text-transparent">
              SkillXchange
            </h1>
          </div>
          <p className="text-gray-300 dark:text-gray-600">Join our community of skill sharers</p>
        </div>

        {/* Registration form */}
        <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/50">
          {error && (
            <div className="mb-6 rounded-xl bg-red-500/20 dark:bg-red-500/10 p-4 text-red-200 dark:text-red-700 border border-red-500/30 dark:border-red-500/20">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-xl bg-green-500/20 dark:bg-green-500/10 p-4 text-green-200 dark:text-green-700 border border-green-500/30 dark:border-green-500/20">
              <div className="flex items-center gap-2">
                <span className="text-lg">✅</span>
                <span className="text-sm font-medium">{success}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 dark:text-gray-600 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 dark:text-gray-500">👤</span>
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("fullName")}
                  onBlur={() => setFocusedField("")}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 dark:bg-gray-700/50 text-white dark:text-gray-900 outline-none ring-2 transition-all duration-200 ${
                    focusedField === "fullName" 
                      ? "ring-indigo-500 dark:ring-indigo-400 bg-white/10 dark:bg-gray-700/70" 
                      : "ring-white/20 dark:ring-gray-600/50"
                  } placeholder="John Doe"}
                  required
                />
              </div>
            </div>

            {/* Username field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 dark:text-gray-600 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 dark:text-gray-500">@</span>
                </div>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField("")}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 dark:bg-gray-700/50 text-white dark:text-gray-900 outline-none ring-2 transition-all duration-200 ${
                    focusedField === "username" 
                      ? "ring-indigo-500 dark:ring-indigo-400 bg-white/10 dark:bg-gray-700/70" 
                      : "ring-white/20 dark:ring-gray-600/50"
                  }`} placeholder="Your-Name"}
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Letters, numbers, and underscores only
              </p>
            </div>

            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 dark:text-gray-600 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 dark:text-gray-500">📧</span>
                </div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField("")}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 dark:bg-gray-700/50 text-white dark:text-gray-900 outline-none ring-2 transition-all duration-200 ${
                    focusedField === "email" 
                      ? "ring-indigo-500 dark:ring-indigo-400 bg-white/10 dark:bg-gray-700/70" 
                      : "ring-white/20 dark:ring-gray-600/50"
                  } placeholder="you@example.com"}
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 dark:text-gray-600 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 dark:text-gray-500">🔒</span>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField("")}
                  className={`w-full pl-10 pr-12 py-3 rounded-xl bg-white/5 dark:bg-gray-700/50 text-white dark:text-gray-900 outline-none ring-2 transition-all duration-200 ${
                    focusedField === "password" 
                      ? "ring-indigo-500 dark:ring-indigo-400 bg-white/10 dark:bg-gray-700/70" 
                      : "ring-white/20 dark:ring-gray-600/50"
                  } placeholder="••••••••"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <span className="text-gray-400 dark:text-gray-500 hover:text-gray-300 dark:hover:text-gray-600 transition-colors">
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </span>
                </button>
              </div>
              
              {/* Password strength indicator */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400 dark:text-gray-500">Password strength</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength <= 2 ? "text-red-400" : 
                      passwordStrength <= 4 ? "text-yellow-400" : "text-green-400"
                    }`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 6) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Terms and conditions */}
            <div className="text-xs text-gray-400 dark:text-gray-500">
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="text-indigo-400 hover:text-indigo-300 dark:text-indigo-600 dark:hover:text-indigo-500">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-indigo-400 hover:text-indigo-300 dark:text-indigo-600 dark:hover:text-indigo-500">
                Privacy Policy
              </Link>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-300 dark:text-gray-600">
              Already have an account?{" "}
              <Link 
                to="/login" 
                className="text-indigo-400 hover:text-indigo-300 dark:text-indigo-600 dark:hover:text-indigo-500 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Theme toggle */}
        <div className="mt-6 flex justify-center">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
