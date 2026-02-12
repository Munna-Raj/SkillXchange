import { useState } from "react";
import { signupApi } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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
      const successMessage = res?.data?.msg || "Account created successfully! Please login.";
      setSuccess(successMessage);
      toast.success(successMessage);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const errorMessage = err?.response?.data?.msg || "Registration failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="register-header">
          <div className="register-logo-container">
            <img 
              src="/src/Image/logo skillxChange.jpeg" 
              alt="SkillXchange Logo" 
              className="register-logo-img-lg"
            />
          </div>
          <h1 className="register-title">Create Account</h1>
          <p className="register-subtitle">Join SkillXchange today</p>
        </div>

        {/* Registration Card */}
        <div className="register-card">
          {error && (
            <div className="register-error-alert">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="auth-alert-success">
              <p className="text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="auth-label">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                onFocus={() => setFocusedField("fullName")}
                onBlur={() => setFocusedField("")}
                className={`auth-input-field auth-input-field-no-icon ${
                  focusedField === "fullName"
                    ? "auth-input-focus"
                    : "auth-input-default"
                }`}
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label className="auth-label">
                Username
              </label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  @
                </span>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField("")}
                  className={`auth-input-field auth-input-field-icon-left ${
                    focusedField === "username"
                      ? "auth-input-focus"
                      : "auth-input-default"
                  }`}
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
              <label className="auth-label">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField("")}
                className={`auth-input-field auth-input-field-no-icon ${
                  focusedField === "email"
                    ? "auth-input-focus"
                    : "auth-input-default"
                }`}
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="auth-label">
                Password
              </label>
              <div className="auth-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField("")}
                  className={`auth-input-field auth-input-field-icon-right ${
                    focusedField === "password"
                      ? "auth-input-focus"
                      : "auth-input-default"
                  }`}
                  placeholder="•••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-input-icon-right"
                >
                  <span className="text-gray-500 hover:text-gray-700 transition-colors">
                    {showPassword ? "Hide" : "Show"}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-auth-submit"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Login Link */}
          <div className="auth-footer">
            <p className="auth-footer-text">
              Already have an account?{" "}
              <Link 
                to="/login" 
                className="auth-link-bold"
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
