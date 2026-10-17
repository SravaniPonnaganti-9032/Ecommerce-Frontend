
import React, { useState } from "react";
import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext";
import CartItem from "../components/CartItem";

function Cart() {
    const {
        cartItems,
        cartTotal,
        loading,
        error: cartError,
        refreshCart,
        updateQuantity,
        removeFromCart,
        clearCart
    } = useCart();

    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState("");
    const [actionMessage, setActionMessage] = useState("");

    const handleAction = async (action, successMessage = "") => {
        setActionLoading(true);
        setActionError("");
        setActionMessage("");

        try {
            await action();

            if (successMessage) {
                setActionMessage(successMessage);
            }
        } catch (error) {
            setActionError(
                error.message || "Unable to update your cart."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleClearCart = () => {
        if (cartItems.length === 0 || actionLoading) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to clear your entire cart?"
        );

        if (confirmed) {
            handleAction(
                clearCart,
                "Your cart has been cleared."
            );
        }
    };

    if (loading && cartItems.length === 0) {
        return (
            <main className="page-container">
                <h1>Shopping Cart</h1>
                <p>Loading your cart...</p>
            </main>
        );
    }

    return (
        <main className="page-container">
            <h1>Shopping Cart</h1>

            {cartError && (
                <div className="error-message" role="alert">
                    <p>{cartError}</p>

                    <button
                        type="button"
                        disabled={loading || actionLoading}
                        onClick={() => handleAction(refreshCart)}
                    >
                        Retry
                    </button>
                </div>
            )}

            {actionError && (
                <p className="error-message" role="alert">
                    {actionError}
                </p>
            )}

            {actionMessage && (
                <p className="success-message" role="status">
                    {actionMessage}
                </p>
            )}

            {loading && cartItems.length > 0 && (
                <p>Refreshing cart...</p>
            )}

            {!cartError && cartItems.length === 0 ? (
                <section>
                    <p>Your cart is empty.</p>

                    <Link to="/products">
                        Continue Shopping
                    </Link>
                </section>
            ) : cartItems.length > 0 ? (
                <>
                    <div className="management-table-wrapper">
                        <table className="management-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Subtotal</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {cartItems.map((item) => (
                                    <CartItem
                                        key={item._id}
                                        item={item}
                                        busy={actionLoading}
                                        onUpdateQuantity={(id, quantity) =>
                                            handleAction(() =>
                                                updateQuantity(id, quantity)
                                            )
                                        }
                                        onRemove={(id) =>
                                            handleAction(
                                                () => removeFromCart(id),
                                                "Item removed from cart."
                                            )
                                        }
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <section style={{ marginTop: "24px" }}>
                        <h2>
                            Total Items:{" "}
                            {cartItems.reduce(
                                (total, item) =>
                                    total + Number(item.quantity || 0),
                                0
                            )}
                        </h2>

                        <h2>
                            Grand Total: ₹
                            {Number(cartTotal || 0).toLocaleString("en-IN")}
                        </h2>
                    </section>

                    <div
                        style={{
                            display: "flex",
                            gap: "12px",
                            flexWrap: "wrap",
                            marginTop: "16px"
                        }}
                    >
                        <Link to="/products">
                            Continue Shopping
                        </Link>

                        <button
                            type="button"
                            disabled={actionLoading}
                            onClick={handleClearCart}
                        >
                            {actionLoading
                                ? "Please wait..."
                                : "Clear Cart"}
                        </button>
                    </div>
                </>
            ) : null}
        </main>
    );
}

export default Cart;
