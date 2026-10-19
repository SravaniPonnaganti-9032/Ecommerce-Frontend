
import React from "react";

function OrderStatus({ status }) {
    const normalizedStatus = String(status || "pending")
        .trim()
        .toLowerCase();

    const statusConfig = {
        pending: {
            label: "Pending",
            symbol: "⏳",
            background: "#fff3cd",
            color: "#856404"
        },
        confirmed: {
            label: "Confirmed",
            symbol: "✓",
            background: "#d1ecf1",
            color: "#0c5460"
        },
        shipped: {
            label: "Shipped",
            symbol: "🚚",
            background: "#cce5ff",
            color: "#004085"
        },
        delivered: {
            label: "Delivered",
            symbol: "✓",
            background: "#d4edda",
            color: "#155724"
        },
        cancelled: {
            label: "Cancelled",
            symbol: "✕",
            background: "#f8d7da",
            color: "#721c24"
        }
    };

    const currentStatus = statusConfig[normalizedStatus];

    if (!currentStatus) {
        return (
            <span>
                Status: {String(status || "Unknown")}
            </span>
        );
    }

    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "20px",
                backgroundColor: currentStatus.background,
                color: currentStatus.color,
                fontWeight: "600",
                fontSize: "13px"
            }}
        >
            <span aria-hidden="true">
                {currentStatus.symbol}
            </span>
            {currentStatus.label}
        </span>
    );
}

export default OrderStatus;
