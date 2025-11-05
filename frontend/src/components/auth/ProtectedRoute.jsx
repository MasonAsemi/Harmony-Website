/**
 * Only renders its children when the user is authenticated within AuthContext 
 * @param {React.ReactNode} props.children - The content to conditionally render or navigate to /login
 * @returns {JSX.Element} 
 */

import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Loading from "../../pages/Loading";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    //TODO: Add loading component
    if (loading)
    {
        return <Loading />
    }

    if (user == null) {
        return <Navigate to="/login" replace />
    }
    return children
}

export default ProtectedRoute