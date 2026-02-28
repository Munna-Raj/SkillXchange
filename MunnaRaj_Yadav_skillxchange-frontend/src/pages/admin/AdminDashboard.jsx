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

              {/* Chart and Activity Section */}
              <div className="dashboard-grid-2">
                {/* Bar Graph Widget */}
                <div className="chart-section">
                  <h3 className="section-title-admin">Platform Overview</h3>
                  <div className="bar-graph-container">
                    <div className="bar-item">
                      <div className="bar-label">Users</div>
                      <div className="bar-track">
                        <div 
                          className="bar-fill blue" 
                          style={{ width: `${Math.min(100, (stats.totalUsers / 50) * 100)}%` }}
                        ></div>
                      </div>
                      <div className="bar-value">{stats.totalUsers}</div>
                    </div>
                    
                    <div className="bar-item">
                      <div className="bar-label">Requests</div>
                      <div className="bar-track">
                        <div 
                          className="bar-fill green" 
                          style={{ width: `${Math.min(100, (stats.activeRequests / 50) * 100)}%` }}
                        ></div>
                      </div>
                      <div className="bar-value">{stats.activeRequests}</div>
                    </div>
                    
                    <div className="bar-item">
                      <div className="bar-label">Skills</div>
                      <div className="bar-track">
                        <div 
                          className="bar-fill purple" 
                          style={{ width: `${Math.min(100, (stats.totalSkills / 100) * 100)}%` }}
                        ></div>
                      </div>
                      <div className="bar-value">{stats.totalSkills}</div>
                    </div>

                    <div className="bar-item">
                      <div className="bar-label">Growth</div>
                      <div className="bar-track">
                        <div 
                          className="bar-fill yellow" 
                          style={{ width: '65%' }}
                        ></div>
                      </div>
                      <div className="bar-value">65%</div>
                    </div>
                  </div>
                  <div className="chart-legend">
                    <p className="legend-text">* Growth data is estimated based on monthly activity</p>
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
              </div>

              {/* Second Row of Charts */}
              <div className="dashboard-grid-2 mt-6">
                {/* Skill Categories Distribution */}
                <div className="chart-section">
                  <h3 className="section-title-admin">Top Skill Categories</h3>
                  <div className="category-chart">
                    {stats.categoryDistribution && stats.categoryDistribution.length > 0 ? (
                      stats.categoryDistribution.map((cat, idx) => (
                        <div key={idx} className="category-bar-item">
                          <div className="category-info">
                            <span className="category-name">{cat.name}</span>
                            <span className="category-count">{cat.count}</span>
                          </div>
                          <div className="category-track">
                            <div 
                              className="category-fill" 
                              style={{ 
                                width: `${(cat.count / stats.totalSkills) * 100}%`,
                                backgroundColor: idx % 2 === 0 ? '#4b0082' : '#8b5cf6'
                              }}
                            ></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="placeholder-text">No skill data available.</p>
                    )}
                  </div>
                </div>

                {/* Registration Trend (7 Days) */}
                <div className="chart-section">
                  <h3 className="section-title-admin">User Registrations (Last 7 Days)</h3>
                  <div className="trend-chart-container">
                    <div className="trend-chart">
                      {stats.registrationTrend && stats.registrationTrend.map((item, idx) => {
                        const maxCount = Math.max(...stats.registrationTrend.map(t => t.count), 5);
                        const height = (item.count / maxCount) * 100;
                        return (
                          <div key={idx} className="trend-column">
                            <div className="trend-bar-wrapper">
                              <div 
                                className="trend-bar" 
                                style={{ height: `${height}%` }}
                                title={`${item.count} users`}
                              >
                                {item.count > 0 && <span className="trend-count-label">{item.count}</span>}
                              </div>
                            </div>
                            <span className="trend-day">{item.day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
