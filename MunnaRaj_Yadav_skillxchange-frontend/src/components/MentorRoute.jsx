import { Navigate } from "react-router-dom";

export default function MentorRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Mentor check (Admin also has access)
  const isMentor = role === "mentor" || role === "admin";

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!isMentor) {
    // Not mentor
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
