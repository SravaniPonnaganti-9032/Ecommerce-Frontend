
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "./AdminOrders.css";

const API_URL = "http://localhost:5000";

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("token");

                if (!token) {
                    throw new Error(
                        "Please log in again. Authentication token not found."
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
                        data.message || "Failed to load orders."
                    );
                }

                if (
                    !data.success ||
                    !Array.isArray(data.orders)
                ) {
                    throw new Error(
                        "Unexpected response received from the server."
                    );
                }

                setOrders(data.orders);
            } catch (err) {
                setError(
                    err.message || "Unable to load orders."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const formatDate = (date) => {
        if (!date) {
            return "Not available";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Not available";
        }

        return parsedDate.toLocaleString("en-IN");
    };

    const getCustomerName = (order) => {
        return (
            order.userId?.username ||
            order.userId?.email ||
            "Unknown Customer"
        );
    };

    const getItemCount = (order) => {
        return (order.items || []).reduce(
            (total, item) =>
                total + Number(item.quantity || 0),
            0
        );
    };

    const formatStatus = (status) => {
        if (!status) {
            return "Unknown";
        }

        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    if (loading) {
        return (
            <div className="admin-orders page-container">
                <h1>Manage Orders</h1>
                <p>Loading orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-orders page-container">
                <h1>Manage Orders</h1>
                <p className="admin-orders-error">{error}</p>

                <button
                    type="button"
                    onClick={() => window.location.reload()}
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="admin-orders page-container">
            <div className="admin-orders-header">
                <div>
                    <h1>Manage Orders</h1>
                    <p>
                        View and manage customer orders.
                    </p>
                </div>

                <Link
                    to="/admin"
                    className="admin-orders-back"
                >
                    Back to Dashboard
                </Link>
            </div>

            <div className="admin-orders-count">
                Total Orders: {orders.length}
            </div>

            {orders.length === 0 ? (
                <div className="admin-orders-empty">
                    <h3>No Orders Found</h3>
                    <p>
                        Customer orders will appear here after
                        an order is placed.
                    </p>
                </div>
            ) : (
                <div className="admin-orders-table-wrapper">
                    <table className="admin-orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Order Date</th>
                                <th>Items</th>
                                <th>Total Amount</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id}>
                                    <td className="admin-order-id">
                                        {order._id}
                                    </td>

                                    <td>
                                        <strong>
                                            {getCustomerName(order)}
                                        </strong>

                                        {order.userId?.email && (
                                            <div className="admin-customer-email">
                                                {order.userId.email}
                                            </div>
                                        )}
                                    </td>

                                    <td>
                                        {formatDate(order.createdAt)}
                                    </td>

                                    <td>
                                        {getItemCount(order)}
                                    </td>

                                    <td>
                                        ₹
                                        {Number(
                                            order.totalAmount || 0
                                        ).toLocaleString("en-IN")}
                                    </td>

                                    <td>
                                        <span
                                            className={
                                                "admin-order-status status-" +
                                                String(
                                                    order.status || "unknown"
                                                ).toLowerCase()
                                            }
                                        >
                                            {formatStatus(order.status)}
                                        </span>
                                    </td>

                                    <td>
                                        <Link
                                            to={`/admin/orders/${order._id}`}
                                            className="admin-order-view-button"
                                        >
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AdminOrders;
