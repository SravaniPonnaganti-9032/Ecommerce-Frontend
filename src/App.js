
import React from "react";
import "./App.css";

import {
    BrowserRouter,
    Routes,
    Route,
    Link
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider, useCart } from "./context/CartContext";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Products from "./pages/Products";
import ProductDetails from "./pages/productDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";

// Assignment 9 pages
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";

import AdminProduct from "./pages/AdminProducts";
import AdminCategory from "./pages/AdminCategory";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import AdminOrderDetails from "./pages/AdminOrderDetails";
// Unauthorized page
function Unauthorized() {
    return (
        <div className="page-container">
            <h2>Access Denied</h2>
            <p>You do not have permission to access this page.</p>
            <Link to="/">Go to Home</Link>
        </div>
    );
}

// Main app content can access authentication and cart contexts
function AppContent() {
    const { addToCart } = useCart();

    return (
        <>
            <Navbar />

            <Routes>
                {/* Public routes */}
                <Route path="/" element={<Products />} />

                <Route path="/products" element={<Products />} />

                <Route
                    path="/products/:id"
                    element={
                        <ProductDetails onAddToCart={addToCart} />
                    }
                />

                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Register />} />

                <Route
                    path="/unauthorized"
                    element={<Unauthorized />}
                />

                {/* Customer-only routes */}
                <Route
                    element={
                        <ProtectedRoute allowedRoles={["customer"]} />
                    }
                >
                    <Route path="/cart" element={<Cart />} />

                    {/* Assignment 8: Checkout */}
                    <Route
                        path="/checkout"
                        element={<Checkout />}
                    />

                    {/* Assignment 8: Order confirmation */}
                    <Route
                        path="/order-confirmation/:orderId"
                        element={<OrderConfirmation />}
                    />

                    {/* Assignment 9: Customer order history */}
                    <Route
                        path="/orders"
                        element={<Orders />}
                    />

                    {/* Assignment 9: Individual order details */}
                    <Route
                        path="/orders/:id"
                        element={<OrderDetails />}
                    />
                </Route>

                {/* Admin-only routes */}
                <Route
                    element={
                        <ProtectedRoute allowedRoles={["admin"]} />
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
                        path="/admin"
                        element={<AdminDashboard />}
                    />

                    {/* Preserve existing route aliases */}
                    <Route
                        path="/manage-products"
                        element={<AdminProduct />}
                    />

                    <Route
                        path="/manage-categories"
                        element={<AdminCategory />}
                    />
                </Route>

                <Route
                        path="/admin/orders"
                        element={<AdminOrders />}
                    />
                <Route
                        path="/admin/orders/:id"
                        element={<AdminOrderDetails />}
                    />
                {/* Unknown route */}
                <Route
                    path="*"
                    element={
                        <div className="page-container">
                            <h2>404 - Page Not Found</h2>
                            <Link to="/">Go to Home</Link>
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
            <CartProvider>
                <BrowserRouter>
                    <AppContent />
                </BrowserRouter>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
