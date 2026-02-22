import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AccountSettings from "./pages/AccountSettings";
import SkillSearch from "./pages/SkillSearch";
import SearchResults from "./pages/SearchResults";
import SkillMatches from "./pages/SkillMatches";
import UserProfileView from "./pages/UserProfileView";
import MyRequests from "./pages/MyRequests";
import Conversations from "./pages/Conversations";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import { AdminSkills, AdminRequests, AdminReports } from "./pages/admin/AdminPages";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Footer from "./components/Footer";
import ComingSoon from "./pages/ComingSoon";
import Services from "./pages/Services";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Layout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");
  // Safely determine admin status
  const isAdminUser = role === "admin" || email === "rajyadavproject@gmail.com";
  
  // Debug log (can be removed later)
  // console.log("Current user role:", role, "Is Admin:", isAdminUser);

  return (
    <div className="flex flex-col min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/search" element={<SkillSearch />} />
        <Route path="/search-results" element={<SearchResults />} />
        <Route path="/user/:id" element={<UserProfileView />} />
        
        {/* Footer Pages */}
        <Route path="/about" element={<ComingSoon title="About Us" />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<ComingSoon title="Contact Us" />} />
        <Route path="/privacy" element={<ComingSoon title="Privacy Policy" />} />

        {/* Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <AdminRoute>
              <AdminDashboard content={<AdminUsers />} />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/skills" 
          element={
            <AdminRoute>
              <AdminDashboard content={<AdminSkills />} />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/requests" 
          element={
            <AdminRoute>
              <AdminDashboard content={<AdminRequests />} />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/reports" 
          element={
            <AdminRoute>
              <AdminDashboard content={<AdminReports />} />
            </AdminRoute>
          } 
        />

        {/* Private routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/matches"
          element={
            <ProtectedRoute>
              <SkillMatches />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <MyRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/conversations"
          element={
            <ProtectedRoute>
              <Conversations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AccountSettings />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {!isAdminRoute && !isAdminUser && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
