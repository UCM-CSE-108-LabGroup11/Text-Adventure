import { Navigate } from "react-router-dom";

export default function PrivateRoute ({ children }) {
    const isAuthenticated = localStorage.getItem ("access_token");

    return (isAuthenticated ? children : <Navigate to="/Login" replace />);
}