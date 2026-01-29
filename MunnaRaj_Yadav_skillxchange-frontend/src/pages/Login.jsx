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
    <div className="auth-page">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="auth-bg-bubble-1"></div>
        <div className="auth-bg-bubble-2"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and header */}
        <div className="auth-header">
          <div className="auth-logo-container">
            <img 
              src="/src/Image/logo skillxChange.jpeg" 
              alt="SkillXchange Logo" 
              className="auth-logo-img"
            />
            <h1 className="auth-title">
              SkillXchange
            </h1>
          </div>
          <p className="auth-subtitle">Welcome back! Sign in to continue</p>
        </div>

        {/* Login form */}
        <div className="auth-card">
          {error && (
            <div className="auth-alert-error">
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
              <label className="auth-label">
                Email Address
              </label>
              <div className="auth-input-wrapper">
                <div className="auth-input-icon">
                  <span className="text-gray-500">📧</span>
                </div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField("")}
                  className={`auth-input-field auth-input-field-icon-left ${
                    focusedField === "email"
                      ? "auth-input-focus"
                      : "auth-input-default"
                  }`}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="auth-label">
                Password
              </label>
              <div className="auth-input-wrapper">
                <div className="auth-input-icon">
                  <span className="text-gray-500">🔒</span>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField("")}
                  className={`auth-input-field auth-input-field-icon-both ${
                    focusedField === "password" 
                      ? "auth-input-focus" 
                      : "auth-input-default"
                  }`}
                  placeholder="•••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-input-icon-right"
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
                className="auth-link"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-auth-submit"
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
          <div className="auth-footer">
            <p className="auth-footer-text">
              Don't have an account?{" "}
              <Link 
                to="/register" 
                className="auth-link-bold"
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
