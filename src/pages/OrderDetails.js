
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import OrderStatus from "../components/OrderStatus";
import OrderItem from "../components/OrderItem";

const API_URL = "http://localhost:5000";

function formatPrice(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(Number(amount) || 0);
}

function formatDate(date) {
    if (!date) {
        return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Not available";
    }

    return parsedDate.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
}

function formatAddress(address) {
    if (!address) {
        return "Delivery address not available";
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
            .map(([key, value]) => {
                const label = key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (character) =>
                        character.toUpperCase()
                    );

                return `${label}: ${value}`;
            })
            .join(", ") || "Delivery address not available";
    }

    return "Delivery address not available";
}

function OrderDetails() {
    const { id } = useParams();
    const { token, isLoggedIn } = useAuth();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isActive = true;

        async function fetchOrderDetails() {
            setLoading(true);
            setError("");
            setOrder(null);

            if (!isLoggedIn || !token) {
                if (isActive) {
                    setError("Please log in to view this order.");
                    setLoading(false);
                }
                return;
            }

            if (!id || !/^[a-fA-F0-9]{24}$/.test(id)) {
                if (isActive) {
                    setError("Invalid order ID.");
                    setLoading(false);
                }
                return;
            }

            try {
                const response = await fetch(
                    `${API_URL}/order/${encodeURIComponent(id)}`,
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
                        (response.status === 404
                            ? "Order not found."
                            : "Unable to load order details.")
                    );
                }

                const receivedOrder =
                    result.order ||
                    result.data?.order ||
                    result.data;

                if (
                    !receivedOrder ||
                    typeof receivedOrder !== "object" ||
                    Array.isArray(receivedOrder)
                ) {
                    throw new Error("Order details were not found.");
                }

                if (isActive) {
                    setOrder(receivedOrder);
                }
            } catch (err) {
                if (isActive) {
                    setError(
                        err.message ||
                        "Something went wrong while loading this order."
                    );
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        }

        fetchOrderDetails();

        return () => {
            isActive = false;
        };
    }, [id, token, isLoggedIn]);

    if (loading) {
        return (
            <main style={{ maxWidth: "900px", margin: "30px auto", padding: "0 20px" }}>
                <p role="status">Loading order details...</p>
            </main>
        );
    }

    if (error || !order) {
        return (
            <main style={{ maxWidth: "900px", margin: "30px auto", padding: "0 20px" }}>
                <h1>Order Details</h1>

                <div
                    role="alert"
                    style={{
                        padding: "15px",
                        color: "#721c24",
                        backgroundColor: "#f8d7da",
                        borderRadius: "6px"
                    }}
                >
                    {error || "Order not found."}
                </div>

                <p>
                    <Link to="/orders">Back to My Orders</Link>
                </p>
            </main>
        );
    }

    const items = Array.isArray(order.items) ? order.items : [];

    return (
        <main
            style={{
                maxWidth: "1000px",
                margin: "30px auto",
                padding: "0 20px"
            }}
        >
            <p>
                <Link to="/orders">← Back to My Orders</Link>
            </p>

            <h1>Order Details</h1>

            <section
                style={{
                    padding: "20px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    marginBottom: "25px"
                }}
            >
                <p>
                    <strong>Order ID:</strong>{" "}
                    {order._id || id}
                </p>

                <p>
                    <strong>Order Date:</strong>{" "}
                    {formatDate(order.createdAt)}
                </p>

                <p>
                    <strong>Status:</strong>{" "}
                    <OrderStatus status={order.status} />
                </p>

                <p>
                    <strong>Delivery Address:</strong>{" "}
                    {formatAddress(order.shippingAddress)}
                </p>
            </section>

            <section
                style={{
                    padding: "20px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    marginBottom: "25px"
                }}
            >
                <h2>Ordered Products</h2>

                {items.length === 0 ? (
                    <p>No product items were found for this order.</p>
                ) : (
                    <>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "minmax(120px, 2fr) 1fr 1fr 1fr",
                                gap: "12px",
                                padding: "12px 0",
                                borderBottom: "2px solid #ddd",
                                fontWeight: "bold"
                            }}
                        >
                            <span>Product</span>
                            <span>Quantity</span>
                            <span>Price</span>
                            <span>Item Total</span>
                        </div>

                        {items.map((item, index) => (
                            <OrderItem
                                key={
                                    item._id ||
                                    item.productId ||
                                    `${item.name || "product"}-${index}`
                                }
                                item={item}
                            />
                        ))}
                    </>
                )}
            </section>

            <section
                style={{
                    padding: "20px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    textAlign: "right"
                }}
            >
                <h2>
                    Grand Total: {formatPrice(order.totalAmount)}
                </h2>
            </section>
        </main>
    );
}

export default OrderDetails;
