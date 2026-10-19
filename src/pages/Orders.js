
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import OrderCard from "../components/OrderCard";

const API_URL = "http://localhost:5000";

function Orders() {
    const { user, token, isLoggedIn } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isActive = true;

        async function fetchOrders() {
            setLoading(true);
            setError("");

            if (!isLoggedIn || !token || !user) {
                if (isActive) {
                    setError("Please log in to view your orders.");
                    setLoading(false);
                }
                return;
            }

            // Support the common user ID fields returned by the backend.
            const userId = user._id || user.id || user.userId;

            if (!userId) {
                if (isActive) {
                    setError(
                        "Your user ID is missing. Please log out and log in again."
                    );
                    setLoading(false);
                }
                return;
            }

            try {
                const response = await fetch(
                    `${API_URL}/order/user/${encodeURIComponent(userId)}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );

                const result = await response.json().catch(() => ({}));

                if (!response.ok || result.success === false) {
                    throw new Error(
                        result.message ||
                        "Unable to load your orders. Please try again."
                    );
                }

                const receivedOrders = Array.isArray(result)
                    ? result
                    : Array.isArray(result.orders)
                    ? result.orders
                    : Array.isArray(result.data?.orders)
                    ? result.data.orders
                    : [];

                if (isActive) {
                    setOrders(receivedOrders);
                }
            } catch (err) {
                if (isActive) {
                    setError(
                        err.message ||
                        "Something went wrong while loading your orders."
                    );
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        }

        fetchOrders();

        return () => {
            isActive = false;
        };
    }, [user, token, isLoggedIn]);

    return (
        <main
            style={{
                maxWidth: "1000px",
                margin: "30px auto",
                padding: "0 20px"
            }}
        >
            <h1>My Orders</h1>
            <p>View your previous orders and track their status.</p>

            {loading && (
                <p role="status">Loading your orders...</p>
            )}

            {!loading && error && (
                <div
                    role="alert"
                    style={{
                        padding: "15px",
                        color: "#721c24",
                        backgroundColor: "#f8d7da",
                        borderRadius: "6px",
                        marginTop: "20px"
                    }}
                >
                    <p>{error}</p>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </button>
                </div>
            )}

            {!loading && !error && orders.length === 0 && (
                <div
                    style={{
                        padding: "25px",
                        textAlign: "center",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        marginTop: "25px"
                    }}
                >
                    <h2>No orders yet</h2>
                    <p>Your placed orders will appear here.</p>
                    <Link to="/products">Browse Products</Link>
                </div>
            )}

            {!loading && !error && orders.length > 0 && (
                <section aria-label="Your orders">
                    <p>
                        Total orders: <strong>{orders.length}</strong>
                    </p>

                    {orders.map((order) => (
                        <OrderCard
                            key={order._id}
                            order={order}
                        />
                    ))}
                </section>
            )}
        </main>
    );
}

export default Orders;
