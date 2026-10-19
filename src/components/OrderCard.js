
import React from "react";
import { Link } from "react-router-dom";
import OrderStatus from "./OrderStatus";

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

function OrderCard({ order }) {
    const orderId = order?._id;

    const items = Array.isArray(order?.items)
        ? order.items
        : [];

    const totalQuantity = items.reduce(
        (total, item) =>
            total + (Number(item.quantity) || 0),
        0
    );

    return (
        <article
            style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "20px",
                marginBottom: "18px",
                backgroundColor: "#fff",
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)"
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "12px"
                }}
            >
                <div>
                    <h3 style={{ marginTop: 0 }}>
                        Order #{orderId || "Unavailable"}
                    </h3>

                    <p>
                        <strong>Order Date:</strong>{" "}
                        {formatDate(order?.createdAt)}
                    </p>

                    <p>
                        <strong>Items:</strong>{" "}
                        {totalQuantity}
                    </p>

                    <p>
                        <strong>Total:</strong>{" "}
                        {formatPrice(order?.totalAmount)}
                    </p>
                </div>

                <div>
                    <strong>Status: </strong>
                    <OrderStatus status={order?.status} />
                </div>
            </div>

            {orderId ? (
                <Link
                    to={`/orders/${encodeURIComponent(orderId)}`}
                    style={{
                        display: "inline-block",
                        marginTop: "10px",
                        padding: "10px 18px",
                        backgroundColor: "#0d6efd",
                        color: "#fff",
                        textDecoration: "none",
                        borderRadius: "6px",
                        fontWeight: "600"
                    }}
                >
                    View Details
                </Link>
            ) : (
                <p>Order details are unavailable.</p>
            )}
        </article>
    );
}

export default OrderCard;
