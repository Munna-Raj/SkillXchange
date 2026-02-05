import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const AdminDashboard = ({ content }) => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");

    // Check if user is admin or the specific super admin email
    const isAdmin = role === "admin" || email === "rajyadavproject@gmail.com";

    if (!token || !isAdmin) {
      navigate("/login");
    } else {
      setAdmin(storedUser ? JSON.parse(storedUser) : { email });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/login");
  };

  if (!admin) return null; // Or loading spinner

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="sidebar w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-gray-700">
          SkillXchange Admin
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin/dashboard" className="sidebarItem block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-800 bg-gray-800">
            Dashboard
          </Link>
          <Link to="/admin/users" className="sidebarItem block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-800">
            Users
          </Link>
          <Link to="/admin/skills" className="sidebarItem block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-800">
            Skills
          </Link>
          <Link to="/admin/requests" className="sidebarItem block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-800">
            Requests
          </Link>
          <Link to="/admin/reports" className="sidebarItem block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-800">
            Reports
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center py-4 px-6 bg-white shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          <div className="flex items-center">
            <span className="text-gray-600 mr-2">Welcome, {admin.email}</span>
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              A
            </div>
          </div>
        </header>

        <main className="dashboardContent flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {content ? (
            content
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Stats Cards Placeholders */}
                <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
                  <div className="text-gray-500 text-sm uppercase font-bold mb-1">Total Users</div>
                  <div className="text-3xl font-bold text-gray-800">--</div>
                </div>
                <div className="bg-white rounded-lg shadow p-5 border-l-4 border-green-500">
                  <div className="text-gray-500 text-sm uppercase font-bold mb-1">Active Requests</div>
                  <div className="text-3xl font-bold text-gray-800">--</div>
                </div>
                <div className="bg-white rounded-lg shadow p-5 border-l-4 border-yellow-500">
                  <div className="text-gray-500 text-sm uppercase font-bold mb-1">Pending Reports</div>
                  <div className="text-3xl font-bold text-gray-800">--</div>
                </div>
                <div className="bg-white rounded-lg shadow p-5 border-l-4 border-purple-500">
                  <div className="text-gray-500 text-sm uppercase font-bold mb-1">Total Skills</div>
                  <div className="text-3xl font-bold text-gray-800">--</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
                <p className="text-gray-600">No recent activity to show.</p>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
