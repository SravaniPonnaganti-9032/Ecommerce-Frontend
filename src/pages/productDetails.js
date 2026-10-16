
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

    useEffect(() => {
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

                setProduct(result.data);
            } catch (err) {
                setError(
                    err.message ||
                    "Unable to load product details."
                );
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        } else {
            setError("Product ID is missing.");
            setLoading(false);
        }
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;

        if (!product.isActive) {
            setMessage("This product is currently unavailable.");
            return;
        }

        if (product.stock <= 0) {
            setMessage("This product is out of stock.");
            return;
        }

        if (quantity < 1 || quantity > product.stock) {
            setMessage("Please select a valid quantity.");
            return;
        }

        if (typeof onAddToCart !== "function") {
            setMessage("Cart integration is not configured yet.");
            return;
        }

        // Add the selected quantity to the cart.
        onAddToCart({
            ...product,
            quantity: quantity
        });

        setMessage("Product added to cart successfully!");
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

    return (
        <div className="product-details">
            <h1>Product Details</h1>

            <div className="product-details-card">
                <h2>{product.name}</h2>

                <p>
                    <strong>Description:</strong>{" "}
                    {product.description ||
                        "No description available"}
                </p>

                <p>
                    <strong>Price:</strong> ₹{product.price}
                </p>

                <p>
                    <strong>Stock:</strong> {product.stock}
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
                            product.stock <= 0
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
                                Math.min(
                                    product.stock,
                                    previous + 1
                                )
                            );
                            setMessage("");
                        }}
                        disabled={
                            quantity >= product.stock ||
                            !product.isActive ||
                            product.stock <= 0
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
                    ₹{product.price * quantity}
                </p>

                {message && (
                    <p
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
                    onClick={handleAddToCart}
                    disabled={
                        !product.isActive ||
                        product.stock <= 0
                    }
                >
                    Add to Cart
                </button>

                <p>
                    <Link to="/products">
                        Back to Products
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default ProductDetails;