
import React from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

import "./Navbar.css";

function Navbar() {
    const { user, isLoggedIn, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();

    const userRole = String(user?.role || "")
        .trim()
        .toLowerCase();

    const isAdmin = isLoggedIn && userRole === "admin";

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <nav className="navbar">
            <Link className="navbar-brand" to="/">
                MyStore
            </Link>

            <div className="navbar-links">
                {isAdmin ? (
                    <>
                        <Link to="/admin">
                            Dashboard
                        </Link>

                        <Link to="/admin/orders">
                            Manage Orders
                        </Link>

                        <Link to="/admin/products">
                            Manage Products
                        </Link>

                        <Link to="/admin/categories">
                            Manage Categories
                        </Link>
                    </>
                ) : (
                    <>
                        <Link to="/">
                            Home
                        </Link>

                        <Link to="/products">
                            Products
                        </Link>

                        <Link to="/cart">
                            Cart ({cartCount})
                        </Link>

                        {isLoggedIn && (
                            <Link to="/orders">
                                My Orders
                            </Link>
                        )}
                    </>
                )}

                {!isLoggedIn ? (
                    <>
                        <Link to="/login">
                            Login
                        </Link>

                        <Link to="/register">
                            Register
                        </Link>
                    </>
                ) : (
                    <>
                        <span className="navbar-user">
                            Welcome, {user?.username || user?.email}
                        </span>

                        <button
                            type="button"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
