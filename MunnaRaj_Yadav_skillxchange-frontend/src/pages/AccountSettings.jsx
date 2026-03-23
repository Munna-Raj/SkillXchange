import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import { useTheme } from "../context/ThemeContext";
import { changePasswordApi } from "../services/authService";
import { toast } from "react-toastify";

export default function AccountSettings() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error("Please fill in all fields.");
      setMessage("Please fill in all fields.");
      setMessageType("error");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match.");
      setMessage("New passwords do not match.");
      setMessageType("error");
      return;
    }

    try {
      const res = await changePasswordApi({
        oldPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
      toast.success(res.msg || "Password changed successfully!");
      setMessage(res.msg || "Password changed successfully!");
      setMessageType("success");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      const errorMsg = error.response?.data?.msg || "Failed to change password.";
      toast.error(errorMsg);
      setMessage(errorMsg);
      setMessageType("error");
    }
  };

  return (
    <div className="page-container bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <div className="profile-bg-wrapper">
        <div className="profile-bg-blob-1 opacity-20 dark:opacity-10" />
        <div className="profile-bg-blob-2 opacity-50 dark:opacity-5" />
      </div>

      <header className="navbar border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md transition-colors">
        <div className="navbar-inner">
          <div className="flex items-center gap-3">
            <div className="nav-logo-container border border-gray-100 dark:border-gray-800">
              <img
                src="/src/Image/logo skillxChange.jpeg"
                alt="SkillXchange Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold leading-4 text-gray-900 dark:text-white">SkillXchange</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Account Settings</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <button
              onClick={() => navigate("/dashboard")}
              className="btn-back bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white ring-1 ring-gray-300 dark:ring-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="content-wrapper">
        <div className="md:col-span-2 space-y-6 w-full">
          <div className="profile-card bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Appearance</h3>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                {theme === "light" ? "Light mode" : "Dark mode"}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 transition-colors">
              <div>
                <p className="text-base font-bold text-gray-900 dark:text-white">Dark / Light Mode</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Switch between light and dark theme. This is stored in your browser.
                </p>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 focus:outline-none ${
                  theme === "dark" ? "bg-indigo-600 dark:bg-indigo-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                    theme === "dark" ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="profile-card bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 shadow-lg">
            <h3 className="card-title text-gray-900 dark:text-white">Change Password</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="label-text text-gray-700 dark:text-gray-300">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="input-field bg-white dark:bg-gray-800 text-gray-900 dark:text-white ring-1 ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="Enter current password"
                />
              </div>
              <div className="form-grid-2">
                <div>
                  <label className="label-text text-gray-700 dark:text-gray-300">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="input-field bg-white dark:bg-gray-800 text-gray-900 dark:text-white ring-1 ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="label-text text-gray-700 dark:text-gray-300">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="input-field bg-white dark:bg-gray-800 text-gray-900 dark:text-white ring-1 ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>
              
              {message && (
                <div className={`text-sm mt-2 p-2 rounded-lg text-center ${
                  messageType === "error" 
                    ? "text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30" 
                    : "text-green-600 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30"
                }`}>
                  {message}
                </div>
              )}

              <div className="flex justify-end">
                <button type="submit" className="btn-primary bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all">
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

