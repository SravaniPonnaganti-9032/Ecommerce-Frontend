
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        const cleanEmail = email.trim();

        if (!cleanEmail || !password) {
            setError("Please enter your email and password.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                "http://localhost:5000/registration/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: cleanEmail,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Invalid email or password."
                );
            }

            if (!data.token || !data.user) {
                throw new Error(
                    "Login response is missing the token or user information."
                );
            }

            login({
                token: data.token,
                user: data.user
            });

            const requestedPath =
                location.state?.from?.pathname;

            // Admins should not be redirected to an
            // admin page unless their returned role is admin.
            if (
                requestedPath?.startsWith("/admin/") &&
                data.user.role !== "admin"
            ) {
                navigate("/unauthorized", { replace: true });
                return;
            }

            navigate(requestedPath || "/", {
                replace: true
            });
        } catch (err) {
            setError(
                err.message || "Unable to log in. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Login</h2>

                {error && (
                    <p className="error-message" role="alert">
                        {error}
                    </p>
                )}

                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                />

                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>

                <p>
                    Don't have an account?{" "}
                    <Link to="/register">Register here</Link>
                </p>
            </form>
        </div>
    );
}

export default Login;
