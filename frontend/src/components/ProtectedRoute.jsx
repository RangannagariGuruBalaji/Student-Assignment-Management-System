
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRole }) {

  const { isAuthenticated, user } = useAuth();

  // Check whether the user is logged in
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // Check whether the user has the required role
  if (allowedRole && user.role !== allowedRole) {

    return (
      <Navigate
        to={`/${user.role}/dashboard`}
        replace
      />
    );

  }

  // Allow access to the requested page
  return <Outlet />;
}
