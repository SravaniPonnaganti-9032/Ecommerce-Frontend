import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import "./AdminOrderDetails.css";

const API_URL = "http://localhost:5000";

const ORDER_STATUSES = [
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled"
];

function AdminOrderDetails() {
    const { id } = useParams();

    const [order, setOrder] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");
    const [updateMessage, setUpdateMessage] = useState("");

    useEffect(() => {
        const fetchOrder = async () => {
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
                    `${API_URL}/order/${id}`,
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
                        data.message || "Failed to load order details."
                    );
                }

                // Support common API response formats.
                const fetchedOrder =
                    data.order || data.data || data;

                if (!fetchedOrder || !fetchedOrder._id) {
                    throw new Error(
                        "Order details were not found in the server response."
                    );
                }

                setOrder(fetchedOrder);
                setSelectedStatus(
                    String(fetchedOrder.status || "pending").toLowerCase()
                );
            } catch (err) {
                setError(
                    err.message || "Unable to load order details."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

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

    const formatStatus = (status) => {
        if (!status) {
            return "Unknown";
        }

        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const formatAmount = (amount) => {
        return Number(amount || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const getCustomerName = () => {
        return (
            order?.userId?.username ||
            order?.userId?.email ||
            "Unknown Customer"
        );
    };

    const getDeliveryAddress = () => {
        const address = order?.shippingAddress;

        if (!address) {
            return "Delivery information not available.";
        }

        if (typeof address === "string") {
            return address;
        }

        if (typeof address === "object") {
            return Object.entries(address)
                .filter(
                    ([, value]) =>
                        value !== null &&
                        value !== undefined &&
                        String(value).trim() !== ""
                )
                .map(
                    ([key, value]) =>
                        `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`
                )
                .join("\n");
        }

        return "Delivery information not available.";
    };

    const isFinalStatus = ["cancelled", "delivered"].includes(
        String(order?.status || "").toLowerCase()
    );

    const handleStatusUpdate = async (event) => {
        event.preventDefault();

        if (!order || updating) {
            return;
        }

        if (isFinalStatus) {
            setError(
                "This order has a final status and cannot be updated."
            );
            return;
        }

        if (!ORDER_STATUSES.includes(selectedStatus)) {
            setError("Please select a valid order status.");
            return;
        }

        if (selectedStatus === order.status) {
            setUpdateMessage("The selected status is already current.");
            setError("");
            return;
        }

        try {
            setUpdating(true);
            setError("");
            setUpdateMessage("");

            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error(
                    "Please log in again. Authentication token not found."
                );
            }

            const response = await fetch(
                `${API_URL}/order/${id}/status`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        status: selectedStatus
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update order status."
                );
            }

            setOrder((previousOrder) => ({
                ...previousOrder,
                status: selectedStatus
            }));

            setUpdateMessage(
                `Order status updated to ${formatStatus(selectedStatus)} successfully.`
            );
        } catch (err) {
            setError(
                err.message || "Unable to update order status."
            );
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-order-details page-container">
                <h1>Order Details</h1>
                <p>Loading order details...</p>
            </div>
        );
    }

    if (error && !order) {
        return (
            <div className="admin-order-details page-container">
                <h1>Order Details</h1>
                <p className="admin-details-error">{error}</p>

                <Link
                    to="/admin/orders"
                    className="admin-details-back"
                >
                    Back to Manage Orders
                </Link>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="admin-order-details page-container">
                <h1>Order Details</h1>
                <p>Order not found.</p>

                <Link to="/admin/orders">
                    Back to Manage Orders
                </Link>
            </div>
        );
    }

    return (
        <div className="admin-order-details page-container">
            <div className="admin-details-header">
                <div>
                    <h1>Order Details</h1>
                    <p>
                        Review the order and manage its status.
                    </p>
                </div>

                <Link
                    to="/admin/orders"
                    className="admin-details-back"
                >
                    Back to Manage Orders
                </Link>
            </div>

            {error && (
                <div className="admin-details-error">
                    {error}
                </div>
            )}

            {updateMessage && (
                <div className="admin-details-success">
                    {updateMessage}
                </div>
            )}

            <section className="admin-details-card">
                <h2>Order Information</h2>

                <div className="admin-details-grid">
                    <div>
                        <strong>Order ID</strong>
                        <p className="admin-details-order-id">
                            {order._id}
                        </p>
                    </div>

                    <div>
                        <strong>Order Date</strong>
                        <p>{formatDate(order.createdAt)}</p>
                    </div>

                    <div>
                        <strong>Customer Name</strong>
                        <p>{getCustomerName()}</p>
                    </div>

                    <div>
                        <strong>Customer Email</strong>
                        <p>
                            {order.userId?.email || "Not available"}
                        </p>
                    </div>

                    <div>
                        <strong>Current Status</strong>
                        <p>
                            <span
                                className={
                                    "admin-details-status status-" +
                                    String(
                                        order.status || "unknown"
                                    ).toLowerCase()
                                }
                            >
                                {formatStatus(order.status)}
                            </span>
                        </p>
                    </div>

                    <div>
                        <strong>Total Amount</strong>
                        <p className="admin-details-total">
                            ₹{formatAmount(order.totalAmount)}
                        </p>
                    </div>
                </div>
            </section>

            <section className="admin-details-card">
                <h2>Products Ordered</h2>

                {!Array.isArray(order.items) ||
                order.items.length === 0 ? (
                    <p>No products found for this order.</p>
                ) : (
                    <div className="admin-details-table-wrapper">
                        <table className="admin-details-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Item Total</th>
                                </tr>
                            </thead>

                            <tbody>
                                {order.items.map((item, index) => (
                                    <tr
                                        key={
                                            item._id ||
                                            item.productId ||
                                            `${item.name}-${index}`
                                        }
                                    >
                                        <td>
                                            {item.name || "Product"}
                                        </td>

                                        <td>
                                            ₹{formatAmount(item.price)}
                                        </td>

                                        <td>
                                            {Number(item.quantity || 0)}
                                        </td>

                                        <td>
                                            ₹
                                            {formatAmount(
                                                item.total !== undefined
                                                    ? item.total
                                                    : Number(item.price || 0) *
                                                          Number(item.quantity || 0)
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                            <tfoot>
                                <tr>
                                    <td colSpan="3">
                                        <strong>Grand Total</strong>
                                    </td>
                                    <td>
                                        <strong>
                                            ₹{formatAmount(order.totalAmount)}
                                        </strong>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </section>

            <section className="admin-details-card">
                <h2>Delivery Information</h2>

                <p className="admin-details-address">
                    {getDeliveryAddress()}
                </p>
            </section>

            <section className="admin-details-card">
                <h2>Update Order Status</h2>

                {isFinalStatus ? (
                    <p className="admin-details-notice">
                        This order is {formatStatus(order.status)}.
                        Its status cannot be changed.
                    </p>
                ) : (
                    <form
                        className="admin-status-form"
                        onSubmit={handleStatusUpdate}
                    >
                        <div className="admin-status-field">
                            <label htmlFor="orderStatus">
                                Select New Status
                            </label>

                            <select
                                id="orderStatus"
                                value={selectedStatus}
                                onChange={(event) => {
                                    setSelectedStatus(event.target.value);
                                    setUpdateMessage("");
                                    setError("");
                                }}
                                disabled={updating}
                                required
                            >
                                {ORDER_STATUSES.map((status) => (
                                    <option
                                        key={status}
                                        value={status}
                                    >
                                        {formatStatus(status)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="admin-status-update-button"
                            disabled={
                                updating ||
                                selectedStatus === order.status
                            }
                        >
                            {updating
                                ? "Updating..."
                                : "Update Status"}
                        </button>
                    </form>
                )}
            </section>
        </div>
    );
}

export default AdminOrderDetails;