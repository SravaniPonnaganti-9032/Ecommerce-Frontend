
import "./ProductDetails.css";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";


const API_URL = "http://localhost:5000";

function ProductDetails({ onAddToCart }) {
    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        let active = true;

        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError("");
                setProduct(null);
                setQuantity(1);
                setMessage("");

                const response = await fetch(
                    `${API_URL}/product/${id}`
                );

                const result = await response.json();

                if (!response.ok || result.success === false) {
                    throw new Error(
                        result.message ||
                        "Failed to fetch product details."
                    );
                }

                if (!result.data) {
                    throw new Error("Product details not found.");
                }

                if (active) {
                    setProduct(result.data);
                }
            } catch (err) {
                if (active) {
                    setError(
                        err.message ||
                        "Unable to load product details."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        if (id) {
            fetchProduct();
        } else {
            setError("Product ID is missing.");
            setLoading(false);
        }

        return () => {
            active = false;
        };
    }, [id]);

    const handleAddToCart = async () => {
        if (!product || adding) {
            return;
        }

        if (!product.isActive) {
            setMessage("This product is currently unavailable.");
            return;
        }

        const stock = Number(product.stock);
        const selectedQuantity = Number(quantity);

        if (stock <= 0) {
            setMessage("This product is out of stock.");
            return;
        }

        if (
            !Number.isInteger(selectedQuantity) ||
            selectedQuantity < 1 ||
            selectedQuantity > stock
        ) {
            setMessage("Please select a valid quantity.");
            return;
        }

        if (typeof onAddToCart !== "function") {
            setMessage("Cart integration is not configured yet.");
            return;
        }

        try {
            setAdding(true);
            setMessage("");

            await onAddToCart(product, selectedQuantity);

            setMessage("Product added to cart successfully!");
        } catch (err) {
            setMessage(
                err.message || "Unable to add product to cart."
            );
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return (
            <div className="product-details">
                <p>Loading product details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="product-details">
                <p style={{ color: "red" }}>{error}</p>
                <Link to="/products">Back to Products</Link>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-details">
                <p>Product not found.</p>
                <Link to="/products">Back to Products</Link>
            </div>
        );
    }

    const categoryName =
        product.categoryId &&
        typeof product.categoryId === "object"
            ? product.categoryId.name
            : "Not specified";

    const stock = Number(product.stock || 0);
    const price = Number(product.price || 0);

    return (
        <div className="product-details">
            <h1>Product Details</h1>

            <div className="product-details-card">
                <h2>{product.name}</h2>

                <p>
                    <strong>Description:</strong>{" "}
                    {product.description || "No description available"}
                </p>

                <p>
                    <strong>Price:</strong>{" "}
                    ₹{price.toLocaleString("en-IN")}
                </p>

                <p>
                    <strong>Stock:</strong> {stock}
                </p>

                <p>
                    <strong>Category:</strong> {categoryName}
                </p>

                <p>
                    <strong>Status:</strong>{" "}
                    {product.isActive ? "Active" : "Inactive"}
                </p>

                {/* Quantity selector */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        margin: "20px 0",
                        flexWrap: "wrap"
                    }}
                >
                    <strong>Quantity:</strong>

                    <button
                        type="button"
                        onClick={() => {
                            setQuantity((previous) =>
                                Math.max(1, previous - 1)
                            );
                            setMessage("");
                        }}
                        disabled={
                            quantity <= 1 ||
                            !product.isActive ||
                            stock <= 0 ||
                            adding
                        }
                        style={{
                            padding: "6px 14px",
                            fontSize: "18px",
                            cursor: "pointer"
                        }}
                    >
                        −
                    </button>

                    <span
                        style={{
                            minWidth: "25px",
                            textAlign: "center",
                            fontWeight: "bold"
                        }}
                    >
                        {quantity}
                    </span>

                    <button
                        type="button"
                        onClick={() => {
                            setQuantity((previous) =>
                                Math.min(stock, previous + 1)
                            );
                            setMessage("");
                        }}
                        disabled={
                            quantity >= stock ||
                            !product.isActive ||
                            stock <= 0 ||
                            adding
                        }
                        style={{
                            padding: "6px 14px",
                            fontSize: "18px",
                            cursor: "pointer"
                        }}
                    >
                        +
                    </button>
                </div>

                <p>
                    <strong>Subtotal:</strong>{" "}
                    ₹{(price * quantity).toLocaleString("en-IN")}
                </p>

                {message && (
                    <p
                        role="status"
                        style={{
                            color: message.includes("successfully")
                                ? "green"
                                : "red"
                        }}
                    >
                        {message}
                    </p>
                )}

                <button
    type="button"
    className="add-to-cart-btn"
    onClick={handleAddToCart}
    disabled={
        !product.isActive ||
        stock <= 0 ||
        adding
    }
>
    {adding ? "Adding to Cart..." : "🛒 Add to Cart"}
</button>

                <Link to="/products" className="back-to-products">
                      ← Back to Products
                </Link>
            </div>
        </div>
    );
}

export default ProductDetails;
