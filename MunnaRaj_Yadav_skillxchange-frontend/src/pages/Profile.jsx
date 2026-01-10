import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState({
    fullName: "",
    username: "",
    email: "",
    profilePic: null,
  });
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      
      const data = await response.json();
      setProfile(data);
      setEditForm({
        fullName: data.fullName,
        email: data.email,
      });
    } catch (err) {
      setError("Failed to load profile");
      if (err.message.includes("401")) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Update failed");
      }

      const data = await response.json();
      setProfile(data.user);
      setSuccess("Profile updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      fullName: profile.fullName,
      email: profile.email,
    });
    setError("");
    setSuccess("");
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      
      // Check file type
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed");
        return;
      }

      uploadProfilePicture(file);
    }
  };

  const uploadProfilePicture = async (file) => {
    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("profilePic", file);

      const response = await fetch("http://localhost:5000/api/profile/picture", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Upload failed");
      }

      const data = await response.json();
      setProfile(data.user);
      setSuccess("Profile picture updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const getProfilePictureUrl = () => {
    if (profile.profilePic) {
      return `http://localhost:5000/uploads/${profile.profilePic}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 transition-colors duration-200">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute top-40 right-[-8rem] h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl ring-1 ring-indigo-500/30 overflow-hidden">
              <img 
                src="/src/Image/logo skillxChange.jpeg" 
                alt="SkillXchange Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold leading-4">SkillXchange</p>
              <p className="text-xs text-gray-500">Profile</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold ring-1 ring-gray-300 hover:bg-gray-200"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-3xl bg-gray-50 p-8 ring-1 ring-gray-200">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your account information
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-red-800 ring-1 ring-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 rounded-lg bg-green-50 p-3 text-green-800 ring-1 ring-green-200">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Profile Picture Section */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="h-24 w-24 rounded-full bg-gray-200 overflow-hidden ring-4 ring-gray-300">
                {getProfilePictureUrl() ? (
                  <img
                    src={getProfilePictureUrl()}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-600">
                      {profile.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-60"
              >
                {uploading ? (
                  <span className="text-xs">...</span>
                ) : (
                  <span className="text-xs">📷</span>
                )}
              </button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <p className="mt-2 text-xs text-gray-500">
              Click camera to change profile picture
            </p>
            <p className="text-xs text-gray-500">
              Max size: 5MB, JPG/PNG only
            </p>
          </div>
            {/* Username (Read-only) */}
            <div>
              <label className="text-sm text-gray-600">Username</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="text"
                  value={profile.username}
                  disabled
                  className="w-full rounded-lg bg-gray-100 px-3 py-2 text-gray-600 outline-none ring-1 ring-gray-300 cursor-not-allowed"
                  placeholder="Username"
                />
                <span className="rounded-full bg-gray-200 px-3 py-1 text-xs text-gray-600">
                  Cannot be changed
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Username is unique and cannot be modified
              </p>
            </div>

            {/* Full Name (Editable) */}
            <div>
              <label className="text-sm text-gray-600">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={editForm.fullName}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg bg-white px-3 py-2 text-gray-900 outline-none ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email (Editable) */}
            <div>
              <label className="text-sm text-gray-600">Email Address</label>
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg bg-white px-3 py-2 text-gray-900 outline-none ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={updating}
                className="flex-1 rounded-lg bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {updating ? "Updating..." : "Update Profile"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={updating}
                className="rounded-lg bg-gray-100 px-6 py-2 font-semibold ring-1 ring-gray-300 hover:bg-gray-200 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
