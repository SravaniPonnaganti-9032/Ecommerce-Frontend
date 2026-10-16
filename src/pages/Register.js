
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        mobile: "",
        password: "",
        confirmPassword: ""
    });

    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));

        setErrors((previousErrors) => ({
            ...previousErrors,
            [name]: ""
        }));

        setMessage("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setErrors({});
        setMessage("");

        const validationErrors = {};

        if (!formData.username.trim()) {
            validationErrors.username = "Name is required.";
        }

        if (!formData.email.trim()) {
            validationErrors.email = "Email is required.";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                formData.email.trim()
            )
        ) {
            validationErrors.email = "Enter a valid email address.";
        }

        if (!formData.mobile.trim()) {
            validationErrors.mobile = "Mobile number is required.";
        }

        if (!formData.password) {
            validationErrors.password = "Password is required.";
        } else if (formData.password.length < 6) {
            validationErrors.password =
                "Password must contain at least 6 characters.";
        }

        if (!formData.confirmPassword) {
            validationErrors.confirmPassword =
                "Please confirm your password.";
        } else if (
            formData.password !== formData.confirmPassword
        ) {
            validationErrors.confirmPassword =
                "Passwords do not match.";
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                "http://localhost:5000/registration/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username: formData.username.trim(),
                        mobile: formData.mobile.trim(),
                        email: formData.email.trim(),
                        password: formData.password
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Registration failed."
                );
            }

            setMessage(
                "Registration successful! Your account has been created."
            );

            setFormData({
                username: "",
                email: "",
                mobile: "",
                password: "",
                confirmPassword: ""
            });

            // Go to login after successful registration.
            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (error) {
            setMessage(
                error.message === "Failed to fetch"
                    ? "Cannot connect to the backend. Check whether your server is running on port 5000."
                    : error.message
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="form-container">
            <h1>Create Account</h1>

            <p className="form-subtitle">
                Register to continue shopping
            </p>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Name</label>
                    <input
                        id="username"
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Enter your name"
                    />
                    {errors.username && (
                        <p className="error-message">
                            {errors.username}
                        </p>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                    />
                    {errors.email && (
                        <p className="error-message">
                            {errors.email}
                        </p>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="mobile">Mobile</label>
                    <input
                        id="mobile"
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="Enter your mobile number"
                    />
                    {errors.mobile && (
                        <p className="error-message">
                            {errors.mobile}
                        </p>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                    />
                    {errors.password && (
                        <p className="error-message">
                            {errors.password}
                        </p>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">
                        Confirm Password
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                    />
                    {errors.confirmPassword && (
                        <p className="error-message">
                            {errors.confirmPassword}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    className="form-button"
                    disabled={loading}
                >
                    {loading ? "Registering..." : "Create Account"}
                </button>
            </form>

            {message && (
                <p
                    className={
                        message.startsWith("Registration successful")
                            ? "success-message"
                            : "error-message"
                    }
                >
                    {message}
                </p>
            )}

            <p className="form-link">
                Already have an account?{" "}
                <Link to="/login">Login</Link>
            </p>
        </main>
    );
}

export default Register;
