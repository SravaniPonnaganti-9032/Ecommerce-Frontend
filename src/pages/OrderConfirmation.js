
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:5000";

function OrderConfirmation() {
    const { orderId } = useParams();
    const { token } = useAuth();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let cancelled = false;

        const fetchOrder = async () => {
            setLoading(true);
            setErrorMessage("");

            try {
                const response = await fetch(
                    `${API_URL}/order/${encodeURIComponent(orderId)}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            ...(token
                                ? { Authorization: `Bearer ${token}` }
                                : {})
                        }
                    }
                );

                const result = await response.json();

                if (!response.ok || result.success !== true || !result.order) {
                    throw new Error(
                        result.message || "Unable to load order details."
                    );
                }

                if (!cancelled) {
                    setOrder(result.order);
                }
            } catch (error) {
                if (!cancelled) {
                    setErrorMessage(
                        error.message ||
                        "Unable to load your order. Please try again."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        if (orderId) {
            fetchOrder();
        } else {
            setErrorMessage("Order ID is missing.");
            setLoading(false);
        }

        return () => {
            cancelled = true;
        };
    }, [orderId, token]);

    const formatPrice = (amount) =>
        Number(amount || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    if (loading) {
        return (
            <main className="page-container">
                <h1>Order Confirmation</h1>
                <p>Loading your order details...</p>
            </main>
        );
    }

    if (errorMessage || !order) {
        return (
            <main className="page-container">
                <h1>Order Confirmation</h1>

                <p className="error-message" role="alert">
                    {errorMessage || "Order details could not be found."}
                </p>

                <Link to="/products">Continue Shopping</Link>
            </main>
        );
    }

    const items = Array.isArray(order.items) ? order.items : [];

    return (
        <main className="page-container">
            <section
                style={{
                    padding: "24px",
                    border: "1px solid #d1e7dd",
                    borderRadius: "8px",
                    marginBottom: "24px"
                }}
            >
                <h1>Order Placed Successfully!</h1>

                <p>
                    Thank you for your purchase. Your order has been saved
                    successfully.
                </p>

                <p>
                    <strong>Order ID:</strong> {order._id}
                </p>

                <p>
                    <strong>Order Status:</strong>{" "}
                    {order.status || "pending"}
                </p>
                
                
<p>
    <strong>Order Date:</strong>{" "}
    {order.createdAt
        ? new Date(order.createdAt).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true
          })
        : "Not available"}
</p>

                
            </section>

            <section>
                <h2>Order Summary</h2>

                {items.length > 0 ? (
                    <div className="management-table-wrapper">
                        <table className="management-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Item Total</th>
                                </tr>
                            </thead>

                            <tbody>
                                {items.map((item, index) => (
                                    <tr
                                        key={
                                            item.productId ||
                                            `${item.name}-${index}`
                                        }
                                    >
                                        <td>{item.name || "Product"}</td>
                                        <td>{item.quantity}</td>
                                        <td>₹{formatPrice(item.price)}</td>
                                        <td>
                                            ₹
                                            {formatPrice(
                                                item.total ??
                                                Number(item.price || 0) *
                                                Number(item.quantity || 0)
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p>No item details are available for this order.</p>
                )}

                <h2>
                    Grand Total: ₹{formatPrice(order.totalAmount)}
                </h2>
            </section>

            <section style={{ marginTop: "28px" }}>
                <h2>Delivery Address</h2>

                <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                    {order.shippingAddress || "Address not available"}
                </p>
            </section>

            <div style={{ marginTop: "28px" }}>
                <Link to="/products">
                    Continue Shopping
                </Link>
            </div>
        </main>
    );
}

export default OrderConfirmation;
