import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";

export default function AccountSettings() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("theme") || "light";
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setMessage("");

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setMessageType("error");
      setMessage("Please fill in all fields.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessageType("error");
      setMessage("New password and confirm password do not match.");
      return;
    }

    setMessageType("info");
    setMessage("Change password functionality will be connected soon.");
  };

  return (
    <div className="page-container">
      <div className="profile-bg-wrapper">
        <div className="profile-bg-blob-1" />
        <div className="profile-bg-blob-2" />
      </div>

      <header className="navbar">
        <div className="navbar-inner">
          <div className="flex items-center gap-3">
            <div className="nav-logo-container">
              <img
                src="/src/Image/logo skillxChange.jpeg"
                alt="SkillXchange Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold leading-4">SkillXchange</p>
              <p className="text-xs text-gray-500">Account Settings</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <button
              onClick={() => navigate("/dashboard")}
              className="btn-back"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="content-wrapper">
        <div className="md:col-span-2 space-y-6 w-full">
          <div className="profile-card">
            <h3 className="card-title flex items-center justify-between">
              <span>Appearance</span>
              <span className="text-xs text-gray-500">{theme === "light" ? "Light mode" : "Dark mode"}</span>
            </h3>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">Dark / Light Mode</p>
                <p className="text-xs text-gray-500">
                  Switch between light and dark theme. This is stored in your browser.
                </p>
              </div>
              <button
                type="button"
                onClick={handleThemeToggle}
                className={`relative inline-flex h-8 w-16 items-center rounded-full px-1 transition-colors ${
                  theme === "dark" ? "bg-gray-900" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                    theme === "dark" ? "translate-x-8" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="profile-card">
            <h3 className="card-title">Change Password</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="label-text">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="input-field"
                  placeholder="Enter current password"
                />
              </div>
              <div className="form-grid-2">
                <div>
                  <label className="label-text">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="input-field"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="label-text">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="input-field"
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>
              {message && (
                <div
                  className={
                    messageType === "error"
                      ? "alert-error"
                      : "alert-success"
                  }
                >
                  {message}
                </div>
              )}
              <div className="flex justify-end">
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

