import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import SkillSearch from "./pages/SkillSearch";
import SearchResults from "./pages/SearchResults";
import SkillMatches from "./pages/SkillMatches";
import UserProfileView from "./pages/UserProfileView";
import MyRequests from "./pages/MyRequests";
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={<SkillSearch />} />
          <Route path="/search-results" element={<SearchResults />} />
          <Route path="/user/:id" element={<UserProfileView />} />

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
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <Footer />
      </div>
    </BrowserRouter>
  );
}
