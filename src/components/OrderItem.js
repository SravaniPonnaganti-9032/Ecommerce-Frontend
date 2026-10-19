
import React from "react";

function formatPrice(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(Number(amount) || 0);
}

function OrderItem({ item }) {
    const quantity = Number(item?.quantity) || 0;
    const price = Number(item?.price) || 0;

    const itemTotal =
        item?.total != null
            ? Number(item.total)
            : price * quantity;

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns:
                    "minmax(120px, 2fr) 1fr 1fr 1fr",
                gap: "12px",
                padding: "14px 0",
                borderBottom: "1px solid #e5e7eb",
                alignItems: "center"
            }}
        >
            <div>
                <strong>{item?.name || "Product"}</strong>
            </div>

            <div>
                <span>Qty: {quantity}</span>
            </div>

            <div>
                {formatPrice(price)}
            </div>

            <div>
                <strong>{formatPrice(itemTotal)}</strong>
            </div>
        </div>
    );
}

export default OrderItem;
