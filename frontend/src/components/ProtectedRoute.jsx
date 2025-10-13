import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (user == null) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default ProtectedRoute