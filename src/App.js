import React, { useEffect, useState } from "react";
import "./App.css";

import {
    BrowserRouter,
    Routes,
    Route,
    Link
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Products from "./pages/Products";
import ProductDetails from "./pages/productDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminProduct from "./pages/AdminProducts";
import AdminCategory from "./pages/AdminCategory";

// Unauthorized page
function Unauthorized() {
    return (
        <div className="page-container">
            <h2>Access Denied</h2>
            <p>You do not have permission to access this page.</p>
        </div>
    );
}

// Cart page
function Cart({
    cartItems,
    onUpdateQuantity,
    onRemove
}) {
    const totalAmount = cartItems.reduce(
        (total, item) =>
            total + Number(item.price) * item.quantity,
        0
    );

    const quantityButtonStyle = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "36px",
        height: "36px",
        margin: "0 6px",
        padding: "0",
        fontSize: "20px",
        fontWeight: "bold",
        color: "#ffffff",
        backgroundColor: "#2563eb",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
    };

    return (
        <div className="page-container">
            <h2>Shopping Cart</h2>

            {cartItems.length === 0 ? (
                <div>
                    <p>Your cart is empty.</p>
                    <Link to="/products">
                        Continue Shopping
                    </Link>
                </div>
            ) : (
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
                                    <tr key={item._id}>
                                        <td>{item.name}</td>

                                        <td>
                                            ₹{Number(item.price)}
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                aria-label="Decrease quantity"
                                                style={{
                                                    ...quantityButtonStyle,
                                                    backgroundColor:
                                                        item.quantity <= 1
                                                            ? "#9ca3af"
                                                            : "#2563eb",
                                                    cursor:
                                                        item.quantity <= 1
                                                            ? "not-allowed"
                                                            : "pointer"
                                                }}
                                                disabled={
                                                    item.quantity <= 1
                                                }
                                                onClick={() =>
                                                    onUpdateQuantity(
                                                        item._id,
                                                        item.quantity - 1
                                                    )
                                                }
                                            >
                                                −
                                            </button>

                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    minWidth: "24px",
                                                    textAlign: "center",
                                                    fontWeight: "bold"
                                                }}
                                            >
                                                {item.quantity}
                                            </span>

                                            <button
                                                type="button"
                                                aria-label="Increase quantity"
                                                style={{
                                                    ...quantityButtonStyle,
                                                    backgroundColor:
                                                        item.quantity >=
                                                        Number(item.stock)
                                                            ? "#9ca3af"
                                                            : "#2563eb",
                                                    cursor:
                                                        item.quantity >=
                                                        Number(item.stock)
                                                            ? "not-allowed"
                                                            : "pointer"
                                                }}
                                                disabled={
                                                    item.quantity >=
                                                    Number(item.stock)
                                                }
                                                onClick={() =>
                                                    onUpdateQuantity(
                                                        item._id,
                                                        item.quantity + 1
                                                    )
                                                }
                                            >
                                                +
                                            </button>
                                        </td>

                                        <td>
                                            ₹
                                            {Number(item.price) *
                                                item.quantity}
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onRemove(item._id)
                                                }
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <h3>
                        Total Amount: ₹{totalAmount}
                    </h3>

                    <Link to="/products">
                        Continue Shopping
                    </Link>
                </>
            )}
        </div>
    );
}

// Main app content can access the logged-in user
function AppContent() {
    const { user } = useAuth();

    // Give each account its own cart storage key.
    // Guests also have a separate cart.
    const userIdentity = user
        ? String(
            user._id ||
            user.id ||
            user.email ||
            user.username ||
            "unknown-user"
        ).trim().toLowerCase()
        : "guest";

    const cartKey = `myStoreCart_${userIdentity}`;

    const [cartState, setCartState] = useState({
        key: null,
        items: []
    });

    // Load the cart belonging to the current account.
    useEffect(() => {
        let savedItems = [];

        try {
            const savedCart = localStorage.getItem(cartKey);

            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);

                if (Array.isArray(parsedCart)) {
                    savedItems = parsedCart;
                }
            } else if (user && user.role !== "admin") {
                // Migrate the old shared cart to the first
                // customer account that uses the new storage.
                // Never give the old shared cart to an admin.
                const oldCart = localStorage.getItem("myStoreCart");

                if (oldCart) {
                    const parsedOldCart = JSON.parse(oldCart);

                    if (Array.isArray(parsedOldCart)) {
                        savedItems = parsedOldCart;
                    }

                    localStorage.setItem(
                        cartKey,
                        JSON.stringify(savedItems)
                    );

                    localStorage.removeItem("myStoreCart");
                }
            }
        } catch (error) {
            console.error("Unable to load saved cart:", error);
            savedItems = [];
        }

        setCartState({
            key: cartKey,
            items: savedItems
        });
    }, [cartKey, user]);

    // Save changes only to the active account's cart.
    useEffect(() => {
        if (cartState.key !== cartKey) {
            return;
        }

        try {
            localStorage.setItem(
                cartKey,
                JSON.stringify(cartState.items)
            );
        } catch (error) {
            console.error("Unable to save cart:", error);
        }
    }, [cartState, cartKey]);

    // Avoid showing the previous account's cart while
    // the next account's cart is loading.
    const cartItems =
        cartState.key === cartKey
            ? cartState.items
            : [];

    // Add the selected quantity to the current account's cart.
    const handleAddToCart = (product) => {
        const stock = Number(product.stock);
        const requestedQuantity = Math.max(
            1,
            Number(product.quantity) || 1
        );

        if (!product.isActive || stock <= 0) {
            return;
        }

        setCartState((previousState) => {
            const previousItems =
                previousState.key === cartKey
                    ? previousState.items
                    : [];

            const existingItem = previousItems.find(
                (item) => item._id === product._id
            );

            if (existingItem) {
                const newQuantity = Math.min(
                    stock,
                    existingItem.quantity + requestedQuantity
                );

                return {
                    key: cartKey,
                    items: previousItems.map((item) =>
                        item._id === product._id
                            ? {
                                ...item,
                                quantity: newQuantity
                            }
                            : item
                    )
                };
            }

            return {
                key: cartKey,
                items: [
                    ...previousItems,
                    {
                        ...product,
                        quantity: Math.min(
                            stock,
                            requestedQuantity
                        )
                    }
                ]
            };
        });
    };

    // Change quantity while respecting stock limits.
    const handleUpdateQuantity = (
        productId,
        quantity
    ) => {
        setCartState((previousState) => {
            if (previousState.key !== cartKey) {
                return previousState;
            }

            return {
                key: cartKey,
                items: previousState.items.map((item) => {
                    if (item._id !== productId) {
                        return item;
                    }

                    const newQuantity = Math.max(
                        1,
                        Math.min(
                            Number(item.stock),
                            quantity
                        )
                    );

                    return {
                        ...item,
                        quantity: newQuantity
                    };
                })
            };
        });
    };

    // Remove a product from the current account's cart.
    const handleRemoveFromCart = (productId) => {
        setCartState((previousState) => {
            if (previousState.key !== cartKey) {
                return previousState;
            }

            return {
                key: cartKey,
                items: previousState.items.filter(
                    (item) => item._id !== productId
                )
            };
        });
    };

    // Total quantity displayed in the navbar.
    const cartCount = cartItems.reduce(
        (total, item) =>
            total + item.quantity,
        0
    );

    return (
        <>
            <Navbar cartCount={cartCount} />

            <Routes>
                {/* Public routes */}
                <Route
                    path="/"
                    element={<Products />}
                />

                <Route
                    path="/products"
                    element={<Products />}
                />

                <Route
                    path="/products/:id"
                    element={
                        <ProductDetails
                            onAddToCart={handleAddToCart}
                        />
                    }
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/unauthorized"
                    element={<Unauthorized />}
                />

                {/* Login required for Cart */}
                <Route element={<ProtectedRoute />}>
                    <Route
                        path="/cart"
                        element={
                            <Cart
                                cartItems={cartItems}
                                onUpdateQuantity={handleUpdateQuantity}
                                onRemove={handleRemoveFromCart}
                            />
                        }
                    />
                </Route>

                {/* Admin-only routes */}
                <Route
                    element={
                        <ProtectedRoute
                            allowedRoles={["admin"]}
                        />
                    }
                >
                    <Route
                        path="/admin/products"
                        element={<AdminProduct />}
                    />

                    <Route
                        path="/admin/categories"
                        element={<AdminCategory />}
                    />

                    <Route
                        path="/manage-products"
                        element={<AdminProduct />}
                    />

                    <Route
                        path="/manage-categories"
                        element={<AdminCategory />}
                    />
                </Route>

                {/* Unknown route */}
                <Route
                    path="*"
                    element={
                        <div className="page-container">
                            <h2>404 - Page Not Found</h2>
                        </div>
                    }
                />
            </Routes>
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppContent />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;