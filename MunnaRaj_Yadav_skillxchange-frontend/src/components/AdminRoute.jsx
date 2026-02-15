import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");

  // Admin check
  const isAdmin = role === "admin" || email === "rajyadavproject@gmail.com";

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Not admin
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
