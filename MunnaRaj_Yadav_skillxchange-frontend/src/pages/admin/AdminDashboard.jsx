import React, { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import adminService from "../../services/adminService";
import "./AdminDashboard.css";

const AdminDashboard = ({ content }) => {
  const navigate = useNavigate();
  const [adminEmail, setAdminEmail] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeRequests: 0,
    pendingReports: 0,
    totalSkills: 0,
    recentActivity: []
  });

  useEffect(() => {
    // Auth check
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");

    // Admin check
    const isAdmin = role === "admin" || email === "rajyadavproject@gmail.com";

    // Auth redirect
    if (!token || !isAdmin) {
      navigate("/login");
    } else {
      setAdminEmail(email || "Admin");
      // Fetch stats
      if (!content) {
        fetchStats();
      }
    }
  }, [navigate, content]);

  const fetchStats = async () => {
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch admin stats", error);
    }
  };

  const handleLogout = () => {
    // Clear auth
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    
    // Redirect
    navigate("/login");
  };

  // Auth guard
  if (!adminEmail) return null;

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          SkillXchange Admin
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            Users
          </NavLink>
          <NavLink to="/admin/skills" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            Skills
          </NavLink>
          <NavLink to="/admin/requests" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            Requests
          </NavLink>
          <NavLink to="/admin/reports" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            Reports
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <h1 className="header-title">Dashboard</h1>
          <div className="user-info">
            <span className="user-email">Welcome, {adminEmail}</span>
            <div className="user-avatar">
              A
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-body">
          {content ? (
            // If a specific page content is provided (like Users list), show it
            content
          ) : (
            // Otherwise, show the default Dashboard widgets
            <>
              {/* Summary Cards */}
              <div className="stats-grid">
                <div className="stat-card blue">
                  <div className="stat-label">Total Users</div>
                  <div className="stat-value">{stats.totalUsers}</div>
                </div>
                
                <div className="stat-card green">
                  <div className="stat-label">Active Requests</div>
                  <div className="stat-value">{stats.activeRequests}</div>
                </div>
                
                <div className="stat-card yellow">
                  <div className="stat-label">Pending Reports</div>
                  <div className="stat-value">{stats.pendingReports}</div>
                </div>
                
                <div className="stat-card purple">
                  <div className="stat-label">Total Skills</div>
                  <div className="stat-value">{stats.totalSkills}</div>
                </div>
              </div>

              {/* Recent Activity Section */}
              <div className="activity-section">
                <h3 className="activity-title">Recent Activity</h3>
                {stats.recentActivity && stats.recentActivity.length > 0 ? (
                  <ul className="activity-list">
                    {stats.recentActivity.map((activity) => (
                      <li key={activity.id} className="activity-item">
                        <span className="activity-message">{activity.message}</span>
                        <span className="activity-date">
                          {new Date(activity.date).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="activity-placeholder">No recent activity to show.</p>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
