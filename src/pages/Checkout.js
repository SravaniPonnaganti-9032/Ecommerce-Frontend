
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const API_URL = "http://localhost:5000";

const initialForm = {
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: ""
};

function Checkout() {
    const { user, token } = useAuth();
    const {
        cartItems,
        cartTotal,
        loading,
        error: cartError,
        refreshCart
    } = useCart();

    const navigate = useNavigate();

    const [formData, setFormData] = useState(initialForm);
    const [formErrors, setFormErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reviewed, setReviewed] = useState(false);

    const userId = user?._id || user?.id || "";

    const totalItems = cartItems.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
    );

    const formatPrice = (amount) =>
        Number(amount || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setFormErrors((previous) => ({
            ...previous,
            [name]: ""
        }));

        setErrorMessage("");
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.fullName.trim()) {
            errors.fullName = "Full name is required.";
        }

        if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
            errors.phone = "Enter a valid 10-digit phone number.";
        }

        if (!formData.address.trim()) {
            errors.address = "Delivery address is required.";
        }

        if (!formData.city.trim()) {
            errors.city = "City is required.";
        }

        if (!formData.state.trim()) {
            errors.state = "State is required.";
        }

        if (!/^[0-9]{6}$/.test(formData.pincode.trim())) {
            errors.pincode = "Enter a valid 6-digit PIN code.";
        }

        setFormErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        setErrorMessage("");

        if (!userId) {
            setErrorMessage(
                "Unable to identify your account. Please log in again."
            );
            return;
        }

        if (cartItems.length === 0) {
            setErrorMessage(
                "Your cart is empty. Add products before checking out."
            );
            return;
        }

        if (!validateForm()) {
            setErrorMessage("Please correct the delivery details.");
            return;
        }

        if (!reviewed) {
            setErrorMessage(
                "Please review your order and delivery details before placing it."
            );
            return;
        }

        const shippingAddress = [
            `Name: ${formData.fullName.trim()}`,
            `Phone: ${formData.phone.trim()}`,
            `Address: ${formData.address.trim()}`,
            `City: ${formData.city.trim()}`,
            `State: ${formData.state.trim()}`,
            `PIN Code: ${formData.pincode.trim()}`
        ].join(", ");

        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_URL}/order/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token
                        ? { Authorization: `Bearer ${token}` }
                        : {})
                },
                body: JSON.stringify({
                    userId,
                    shippingAddress
                })
            });

            const result = await response.json();

            if (!response.ok || result.success !== true || !result.order?._id) {
                throw new Error(
                    result.message ||
                    "Unable to place your order. Please try again."
                );
            }

            // The backend has created the order and cleared its cart.
            // Refresh frontend cart state so the navbar count updates.
            try {
                await refreshCart();
            } catch (refreshError) {
                console.error(
                    "Order was created, but refreshing the cart failed:",
                    refreshError
                );
            }

            // Use the ID returned by the backend.
            navigate(`/order-confirmation/${result.order._id}`, {
                replace: true
            });
        } catch (error) {
            setErrorMessage(
                error.message ||
                "Something went wrong while placing your order."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading && cartItems.length === 0) {
        return (
            <main className="page-container">
                <h1>Checkout</h1>
                <p>Loading your cart...</p>
            </main>
        );
    }

    if (cartItems.length === 0 && !cartError) {
        return (
            <main className="page-container">
                <h1>Checkout</h1>
                <p>Your cart is empty. Add products before checking out.</p>
                <Link to="/products">Continue Shopping</Link>
            </main>
        );
    }

    return (
        <main className="page-container">
            <h1>Checkout</h1>

            <p>Complete your delivery details and review your order.</p>

            {cartError && (
                <div className="error-message" role="alert">
                    <p>{cartError}</p>

                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => refreshCart()}
                    >
                        Retry Loading Cart
                    </button>
                </div>
            )}

            {errorMessage && (
                <p className="error-message" role="alert">
                    {errorMessage}
                </p>
            )}

            <section style={{ marginTop: "24px" }}>
                <h2>Delivery Details</h2>

                <form onSubmit={handleSubmit} noValidate>
                    <div style={{ marginBottom: "16px" }}>
                        <label htmlFor="fullName">Full Name *</label>
                        <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            value={formData.fullName}
                            onChange={handleChange}
                            autoComplete="name"
                            required
                            disabled={isSubmitting}
                            aria-invalid={Boolean(formErrors.fullName)}
                            style={{
                                display: "block",
                                width: "100%",
                                padding: "10px",
                                marginTop: "6px",
                                boxSizing: "border-box"
                            }}
                        />
                        {formErrors.fullName && (
                            <p className="error-message">
                                {formErrors.fullName}
                            </p>
                        )}
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                        <label htmlFor="phone">Phone Number *</label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            autoComplete="tel"
                            inputMode="numeric"
                            maxLength={10}
                            required
                            disabled={isSubmitting}
                            aria-invalid={Boolean(formErrors.phone)}
                            style={{
                                display: "block",
                                width: "100%",
                                padding: "10px",
                                marginTop: "6px",
                                boxSizing: "border-box"
                            }}
                        />
                        {formErrors.phone && (
                            <p className="error-message">
                                {formErrors.phone}
                            </p>
                        )}
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                        <label htmlFor="address">House Number / Street Address *</label>
                        <textarea
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            autoComplete="street-address"
                            rows={3}
                            required
                            disabled={isSubmitting}
                            aria-invalid={Boolean(formErrors.address)}
                            style={{
                                display: "block",
                                width: "100%",
                                padding: "10px",
                                marginTop: "6px",
                                boxSizing: "border-box"
                            }}
                        />
                        {formErrors.address && (
                            <p className="error-message">
                                {formErrors.address}
                            </p>
                        )}
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                        <label htmlFor="city">City *</label>
                        <input
                            id="city"
                            name="city"
                            type="text"
                            value={formData.city}
                            onChange={handleChange}
                            autoComplete="address-level2"
                            required
                            disabled={isSubmitting}
                            aria-invalid={Boolean(formErrors.city)}
                            style={{
                                display: "block",
                                width: "100%",
                                padding: "10px",
                                marginTop: "6px",
                                boxSizing: "border-box"
                            }}
                        />
                        {formErrors.city && (
                            <p className="error-message">
                                {formErrors.city}
                            </p>
                        )}
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                        <label htmlFor="state">State *</label>
                        <input
                            id="state"
                            name="state"
                            type="text"
                            value={formData.state}
                            onChange={handleChange}
                            autoComplete="address-level1"
                            required
                            disabled={isSubmitting}
                            aria-invalid={Boolean(formErrors.state)}
                            style={{
                                display: "block",
                                width: "100%",
                                padding: "10px",
                                marginTop: "6px",
                                boxSizing: "border-box"
                            }}
                        />
                        {formErrors.state && (
                            <p className="error-message">
                                {formErrors.state}
                            </p>
                        )}
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                        <label htmlFor="pincode">PIN Code *</label>
                        <input
                            id="pincode"
                            name="pincode"
                            type="text"
                            value={formData.pincode}
                            onChange={handleChange}
                            autoComplete="postal-code"
                            inputMode="numeric"
                            maxLength={6}
                            required
                            disabled={isSubmitting}
                            aria-invalid={Boolean(formErrors.pincode)}
                            style={{
                                display: "block",
                                width: "100%",
                                padding: "10px",
                                marginTop: "6px",
                                boxSizing: "border-box"
                            }}
                        />
                        {formErrors.pincode && (
                            <p className="error-message">
                                {formErrors.pincode}
                            </p>
                        )}
                    </div>

                    <section style={{ marginTop: "32px" }}>
                        <h2>Review Your Order</h2>

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
                                    {cartItems.map((item) => {
                                        const price = Number(item.price || 0);
                                        const quantity = Number(item.quantity || 0);

                                        return (
                                            <tr key={item._id}>
                                                <td>
                                                    {item.name ||
                                                        item.productId?.name ||
                                                        "Product"}
                                                </td>
                                                <td>{quantity}</td>
                                                <td>₹{formatPrice(price)}</td>
                                                <td>
                                                    ₹{formatPrice(price * quantity)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <h3>Total Items: {totalItems}</h3>
                        <h2>Grand Total: ₹{formatPrice(cartTotal)}</h2>

                        <p>
                            The final total and stock availability will be
                            verified by the backend when you place the order.
                        </p>

                        <label
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "8px",
                                margin: "20px 0"
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={reviewed}
                                onChange={(event) =>
                                    setReviewed(event.target.checked)
                                }
                                disabled={isSubmitting}
                            />
                            <span>
                                I have reviewed my order and confirm that my
                                delivery details are correct.
                            </span>
                        </label>
                    </section>

                    <div
                        style={{
                            display: "flex",
                            gap: "12px",
                            flexWrap: "wrap",
                            marginTop: "20px"
                        }}
                    >
                        <button
                            type="submit"
                            disabled={
                                isSubmitting ||
                                loading ||
                                Boolean(cartError) ||
                                cartItems.length === 0
                            }
                        >
                            {isSubmitting
                                ? "Placing Order..."
                                : "Place Order"}
                        </button>

                        <Link to="/cart">Back to Cart</Link>
                    </div>
                </form>
            </section>
        </main>
    );
}

export default Checkout;
