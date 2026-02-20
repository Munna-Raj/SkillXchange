import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { addSkillApi, deleteSkillApi } from "../services/profileService";
import { getFeedbackForUser } from "../services/feedbackService";
import NotificationBell from "../components/NotificationBell";

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [profile, setProfile] = useState({
    fullName: "",
    username: "",
    email: "",
    profilePic: null,
    bio: "",
    contactNumber: "",
    skillsToTeach: [],
    skillsToLearn: []
  });

  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    bio: "",
    contactNumber: ""
  });

  // Skill Management State
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [skillForm, setSkillForm] = useState({
    type: "teach",
    name: "",
    category: "",
    level: "Beginner",
    description: ""
  });

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [followListType, setFollowListType] = useState(null);

  useEffect(() => {
    // Admin check
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");
    if (role === "admin" || email === "rajyadavproject@gmail.com") {
      navigate("/admin/dashboard");
      return;
    }

    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        if (response.status === 404 || response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        throw new Error("Failed to fetch profile");
      }
      
      const data = await response.json();
      setProfile(data);
      setEditForm({
        fullName: data.fullName,
        email: data.email,
        bio: data.bio || "",
        contactNumber: data.contactNumber || ""
      });

      // Feedback
      try {
        const feedbackData = await getFeedbackForUser(data._id);
        setFeedbacks(feedbackData);
      } catch (err) {
        console.error("Failed to load feedback", err);
      }
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
      bio: profile.bio || "",
      contactNumber: profile.contactNumber || ""
    });
    setError("");
    setSuccess("");
  };

  // Profile Pic
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
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
    
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("profilePic", file);

      const response = await fetch("http://localhost:5000/api/profile/picture", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Upload failed");
      }

      const data = await response.json();
      setProfile(data.user);
      setSuccess("Profile picture updated successfully!");
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

  // Skill logic
  const handleSkillChange = (e) => {
    setSkillForm({ ...skillForm, [e.target.name]: e.target.value });
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await addSkillApi(skillForm);
      setProfile(res.data);
      setSuccess("Skill added successfully!");
      setShowSkillForm(false);
      setSkillForm({ type: "teach", name: "", category: "", level: "Beginner", description: "" });
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to add skill");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteSkill = async (type, skillId) => {
    if (!window.confirm("Are you sure you want to delete this skill?")) return;
    setUpdating(true);
    try {
      const res = await deleteSkillApi(type, skillId);
      setProfile(res.data);
      setSuccess("Skill deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to delete skill");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-text">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Background */}
      <div className="profile-bg-wrapper">
        <div className="profile-bg-blob-1" />
        <div className="profile-bg-blob-2" />
      </div>

      {/* Navbar */}
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
              <p className="text-xs text-gray-500">Profile</p>
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
        
        {/* Left Column */}
        <div className="md:col-span-1 space-y-6">
          <div className="profile-card text-center">
             <div className="profile-pic-wrapper">
              <div className="profile-pic-container">
                {getProfilePictureUrl() ? (
                  <img src={getProfilePictureUrl()} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="profile-pic-placeholder">
                    <span className="profile-pic-initial">
                      {profile.fullName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="btn-icon absolute bottom-0 right-0"
              >
                {uploading ? "..." : "📷"}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            </div>
            <h2 className="section-title text-center mb-0">{profile.fullName}</h2>
            <p className="text-sm text-gray-500">@{profile.username}</p>
            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-600">
              <button
                type="button"
                onClick={() =>
                  setFollowListType((prev) => (prev === "followers" ? null : "followers"))
                }
                className="flex items-center gap-1 hover:text-indigo-600"
              >
                <span className="font-semibold">
                  {Array.isArray(profile.followers) ? profile.followers.length : 0}
                </span>
                <span>Followers</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setFollowListType((prev) => (prev === "following" ? null : "following"))
                }
                className="flex items-center gap-1 hover:text-indigo-600"
              >
                <span className="font-semibold">
                  {Array.isArray(profile.following) ? profile.following.length : 0}
                </span>
                <span>Following</span>
              </button>
            </div>
          </div>

          {followListType && (
            <div className="profile-card">
              <h3 className="card-title">
                {followListType === "followers" ? "Followers" : "Following"}
              </h3>
              {followListType === "followers" ? (
                Array.isArray(profile.followers) && profile.followers.length > 0 ? (
                  <div className="space-y-3 mt-3">
                    {profile.followers.map((follower) => (
                      <button
                        key={follower._id}
                        onClick={() => navigate(`/user/${follower._id}`)}
                        className="w-full flex items-center gap-3 text-left p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <img
                          src={
                            follower.profilePic
                              ? `http://localhost:5000/uploads/${follower.profilePic}`
                              : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  follower.fullName || follower.username
                                )}&background=random`
                          }
                          alt={follower.fullName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {follower.fullName}
                          </p>
                          <p className="text-xs text-gray-500">@{follower.username}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 mt-2">No followers yet.</p>
                )
              ) : Array.isArray(profile.following) && profile.following.length > 0 ? (
                <div className="space-y-3 mt-3">
                  {profile.following.map((followed) => (
                    <button
                      key={followed._id}
                      onClick={() => navigate(`/user/${followed._id}`)}
                      className="w-full flex items-center gap-3 text-left p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <img
                        src={
                          followed.profilePic
                            ? `http://localhost:5000/uploads/${followed.profilePic}`
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                followed.fullName || followed.username
                              )}&background=random`
                        }
                        alt={followed.fullName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {followed.fullName}
                        </p>
                        <p className="text-xs text-gray-500">@{followed.username}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 mt-2">Not following anyone yet.</p>
              )}
            </div>
          )}

          <div className="profile-card">
             <h3 className="card-title">Contact Info</h3>
             <div className="space-y-3 text-sm">
               <div>
                 <span className="label-text text-xs">Email</span>
                 <span className="text-gray-900 break-all">{profile.email}</span>
               </div>
               <div>
                 <span className="label-text text-xs">Phone</span>
                 <span className="text-gray-900">{profile.contactNumber || "Not provided"}</span>
               </div>
             </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Messages */}
          {error && <div className="alert-error">{error}</div>}
          {success && <div className="alert-success">{success}</div>}

          {/* Edit Form */}
          <div className="profile-card">
            <h3 className="card-title">Edit Profile</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-grid-2">
                <div>
                  <label className="label-text">Username</label>
                  <input
                    type="text"
                    value={profile.username}
                    disabled
                    className="input-field-disabled"
                  />
                </div>
                <div>
                  <label className="label-text">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={editForm.fullName}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label-text">Email (Login ID)</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label-text">Bio</label>
                <textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={handleChange}
                  rows="3"
                  className="input-field"
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div>
                <label className="label-text">Contact Number</label>
                <input
                  type="text"
                  name="contactNumber"
                  value={editForm.contactNumber}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="+977 9812345678"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={handleCancel} disabled={updating} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={updating} className="btn-primary">
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>

          {/* Skills */}
          <div className="profile-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="card-title mb-0">Skills</h3>
              {showSkillForm && (
                <button 
                  onClick={() => setShowSkillForm(false)}
                  className="text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Add Skill */}
            {showSkillForm && (
              <form onSubmit={handleAddSkill} className="skill-form-container">
                <div className="form-grid-2">
                  <div>
                    <label className="label-uppercase">Type</label>
                    <select
                      name="type"
                      value={skillForm.type}
                      onChange={handleSkillChange}
                      className="select-field"
                    >
                      <option value="teach">I want to Teach</option>
                      <option value="learn">I want to Learn</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-uppercase">Level</label>
                    <select
                      name="level"
                      value={skillForm.level}
                      onChange={handleSkillChange}
                      className="select-field"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <div className="form-grid-2">
                  <div>
                    <label className="label-uppercase">Skill Name</label>
                    <input
                      type="text"
                      name="name"
                      value={skillForm.name}
                      onChange={handleSkillChange}
                      className="select-field"
                      placeholder="e.g. React, Guitar, Spanish"
                      required
                    />
                  </div>
                  <div>
                    <label className="label-uppercase">Category</label>
                    <input
                      type="text"
                      name="category"
                      value={skillForm.category}
                      onChange={handleSkillChange}
                      className="select-field"
                      placeholder="e.g. Programming, Music"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="label-uppercase">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={skillForm.description}
                    onChange={handleSkillChange}
                    className="select-field"
                    placeholder="Brief details..."
                  />
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="btn-primary">
                    Save Skill
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 gap-6">
              {/* Teaching */}
              <div>
                <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
                  <h4 className="text-sm font-bold text-gray-500 uppercase mb-0 border-none">Skills I Teach</h4>
                  <button 
                    onClick={() => {
                      setSkillForm(prev => ({ ...prev, type: "teach" }));
                      setShowSkillForm(true);
                    }}
                    className="btn-add"
                  >
                    + Add
                  </button>
                </div>
                {profile.skillsToTeach?.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No skills listed yet.</p>
                ) : (
                  <div className="space-y-3">
                    {profile.skillsToTeach?.map((skill) => (
                      <div key={skill._id} className="skill-item">
                        <div>
                          <p className="font-semibold text-gray-900">{skill.name}</p>
                          <p className="text-xs text-gray-500">{skill.category} • {skill.level}</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteSkill('teach', skill._id)}
                          className="btn-delete"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Learning */}
              <div>
                <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
                  <h4 className="text-sm font-bold text-gray-500 uppercase mb-0 border-none">Skills I Want to Learn</h4>
                  <button 
                    onClick={() => {
                      setSkillForm(prev => ({ ...prev, type: "learn" }));
                      setShowSkillForm(true);
                    }}
                    className="btn-add"
                  >
                    + Add
                  </button>
                </div>
                {profile.skillsToLearn?.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No skills listed yet.</p>
                ) : (
                  <div className="space-y-3">
                    {profile.skillsToLearn?.map((skill) => (
                      <div key={skill._id} className="skill-item">
                        <div>
                          <p className="font-semibold text-gray-900">{skill.name}</p>
                          <p className="text-xs text-gray-500">{skill.category} • {skill.level}</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteSkill('learn', skill._id)}
                          className="btn-delete"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div className="profile-card">
            <h3 className="card-title mb-6 flex items-center gap-2">
              <span className="text-xl">⭐</span> Received Feedback
            </h3>
            <div className="space-y-4">
              {feedbacks.length > 0 ? (
                feedbacks.map((feedback) => (
                  <div key={feedback._id} className="feedback-card p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <img 
                          src={feedback.reviewer?.profilePic 
                            ? `http://localhost:5000/uploads/${feedback.reviewer.profilePic}` 
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(feedback.reviewer?.fullName || 'Anonymous')}&background=random`} 
                          alt={feedback.reviewer?.fullName}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <div>
                          <h4 className="font-bold text-gray-900">{feedback.reviewer?.fullName || "Unknown User"}</h4>
                          <p className="text-xs text-gray-500">{new Date(feedback.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < feedback.rating ? "text-yellow-400" : "text-gray-300"}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 pl-[52px]">{feedback.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p>No feedback received yet.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
