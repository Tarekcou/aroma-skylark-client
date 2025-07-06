// src/routes/PrivateRoute.jsx
import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
