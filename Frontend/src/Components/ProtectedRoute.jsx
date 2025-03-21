import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { jwtDecode } from "jwt-decode";
// import { toast } from "react-toastify";

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = sessionStorage.getItem("logintoken");
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decodedToken = jwtDecode(token);
    const userRole = decodedToken.role;
    if (requiredRole && !requiredRole.includes(userRole)) {
      return <Navigate to="/forbidden" replace />;
    }
  } catch (error) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.string,
};

export default ProtectedRoute;
