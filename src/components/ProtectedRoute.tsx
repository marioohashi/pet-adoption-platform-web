import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute() {
    const { session } = useAuth();

    if (!session) {
        return <Navigate to="/pets" replace />;
    }

    return <Outlet />;
}