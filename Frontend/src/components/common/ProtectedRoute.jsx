import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Wraps routes that need login
// If not logged in → redirect to /login
// If not admin → redirect to home
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, token } = useSelector((state) => state.auth);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
