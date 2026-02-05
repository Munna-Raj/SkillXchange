import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");

  // Check if user is admin or the specific super admin email
  const isAdmin = role === "admin" || email === "rajyadavproject@gmail.com";

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Optional: Redirect to user dashboard if logged in but not admin
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
