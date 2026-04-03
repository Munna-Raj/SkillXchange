import { useState, useEffect } from "react";
import { signupApi } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    fullName: "", 
    username: "", 
    email: "", 
    password: "", 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  useEffect(() => {
    console.log("[REGISTER] Component mounted. Current environment:", import.meta.env.MODE);
  }, []);

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
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(form.email)) {
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
    console.log("[REGISTER] handleSubmit triggered.");
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
    <div className="register-page bg-white min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="register-header mb-10 text-center">
          <Link to="/" className="inline-flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity">
            <div className="h-12 w-12 rounded-2xl overflow-hidden border border-gray-100 shadow-xl">
              <img 
                src="/logo%20skillxChange.jpeg" 
                alt="SkillXchange Logo" 
                className="h-full w-full object-cover"
              />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter">
              SkillXchange
            </h1>
          </Link>
          <p className="text-gray-500 font-medium">Join SkillXchange today</p>
        </div>

        {/* Registration Card */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl">
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
                  placeholder="UserName"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Letters, numbers, underscores
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
              <div className="auth-input-wrapper relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField("")}
                  className={`auth-input-field auth-input-field-no-icon pr-12 ${
                    focusedField === "password"
                      ? "auth-input-focus"
                      : "auth-input-default"
                  }`}
                  placeholder="Create a strong password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 focus:outline-none"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.542 4.148 7.412 1 12 1c4.588 0 8.458 3.148 9.964 10.678.07.21.07.43 0 .644C20.458 19.852 16.588 23 12 23c-4.588 0-8.458-3.148-9.964-10.678z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
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
          <p>By creating an account, you agree to our Terms and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}
