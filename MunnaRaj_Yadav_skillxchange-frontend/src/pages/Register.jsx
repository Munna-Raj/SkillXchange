import { useState } from "react";
import { signupApi } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
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

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg">
            <img 
              src="/src/Image/logo skillxChange.jpeg" 
              alt="SkillXchange Logo" 
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join SkillXchange today</p>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                onFocus={() => setFocusedField("fullName")}
                onBlur={() => setFocusedField("")}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                  focusedField === "fullName"
                    ? "border-blue-500 ring-blue-500"
                    : "border-gray-300"
                } bg-white text-gray-900 placeholder-gray-400`}
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  @
                </span>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField("")}
                  className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                    focusedField === "username"
                      ? "border-blue-500 ring-blue-500"
                      : "border-gray-300"
                  } bg-white text-gray-900 placeholder-gray-400`}
                  placeholder="johndoe"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Letters, numbers, and underscores only
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField("")}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                  focusedField === "email"
                    ? "border-blue-500 ring-blue-500"
                    : "border-gray-300"
                } bg-white text-gray-900 placeholder-gray-400`}
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField("")}
                  className={`w-full pr-12 px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                    focusedField === "password"
                      ? "border-blue-500 ring-blue-500"
                      : "border-gray-300"
                  } bg-white text-gray-900 placeholder-gray-400`}
                  placeholder="•••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link 
                to="/login" 
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>


        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>By creating an account, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}
