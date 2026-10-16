import React from "react";
import {
    Navigate,
    Outlet,
    useLocation
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ allowedRoles }) {
    const { isLoggedIn, user } = useAuth();
    const location = useLocation();

    if (!isLoggedIn) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    const userRole = String(user?.role || "")
        .trim()
        .toLowerCase();

    const permittedRoles = allowedRoles?.map((role) =>
        String(role).trim().toLowerCase()
    );

    if (
        permittedRoles &&
        !permittedRoles.includes(userRole)
    ) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;