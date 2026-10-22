
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import "./AdminDashboard.css";

const API_URL = "http://localhost:5000";

function AdminDashboard() {
    const { user } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            setError("");

            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    throw new Error(
                        "Authentication token not found. Please log in again."
                    );
                }

                const response = await fetch(
                    `${API_URL}/order/all`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to fetch orders."
                    );
                }

                if (!data.success || !Array.isArray(data.orders)) {
                    throw new Error(
                        "The server returned an unexpected orders response."
                    );
                }

                setOrders(data.orders);
            } catch (err) {
                setError(
                    err.message ||
                    "Unable to load dashboard information."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusCount = (status) =>
        orders.filter(
            (order) =>
                String(order.status || "").toLowerCase() === status
        ).length;

    const dashboardCards = [
        {
            title: "Total Orders",
            count: orders.length,
            className: "total-orders"
        },
        {
            title: "Pending Orders",
            count: getStatusCount("pending"),
            className: "pending-orders"
        },
        {
            title: "Confirmed Orders",
            count: getStatusCount("confirmed"),
            className: "confirmed-orders"
        },
        {
            title: "Shipped Orders",
            count: getStatusCount("shipped"),
            className: "shipped-orders"
        },
        {
            title: "Delivered Orders",
            count: getStatusCount("delivered"),
            className: "delivered-orders"
        },
        {
            title: "Cancelled Orders",
            count: getStatusCount("cancelled"),
            className: "cancelled-orders"
        }
    ];

    return (
        <div className="admin-dashboard page-container">
            <div className="dashboard-header">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>
                        Welcome, {user?.username || user?.email || "Admin"}!
                    </p>
                    <p>
                        Monitor orders and manage your store.
                    </p>
                </div>

                <Link
                    to="/admin/orders"
                    className="dashboard-orders-button"
                >
                    Manage Orders
                </Link>
            </div>

            {loading ? (
                <div className="dashboard-message">
                    <p>Loading dashboard information...</p>
                </div>
            ) : error ? (
                <div className="dashboard-error">
                    <h3>Unable to Load Dashboard</h3>
                    <p>{error}</p>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </button>
                </div>
            ) : (
                <>
                    <div className="dashboard-summary">
                        {dashboardCards.map((card) => (
                            <div
                                className={`dashboard-card ${card.className}`}
                                key={card.title}
                            >
                                <h3>{card.title}</h3>
                                <p className="dashboard-count">
                                    {card.count}
                                </p>
                            </div>
                        ))}
                    </div>

                    {orders.length === 0 ? (
                        <div className="dashboard-empty">
                            <h3>No Orders Yet</h3>
                            <p>
                                Order summaries will appear here when
                                customers place orders.
                            </p>
                        </div>
                    ) : (
                        <div className="dashboard-overview">
                            <h2>Order Overview</h2>
                            <p>
                                There are currently {orders.length} orders
                                in your store.
                            </p>

                            <Link to="/admin/orders">
                                View All Orders
                            </Link>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default AdminDashboard;
