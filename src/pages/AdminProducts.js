import React, { useEffect, useState } from "react";
import ProductForm from "../components/ProductForm";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:5000";

function AdminProduct() {

    const { token } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [productResponse, categoryResponse] =
                await Promise.all([
                    fetch(`${API_URL}/product/list`),
                    fetch(`${API_URL}/category/list`)
                ]);

            const productResult = await productResponse.json();
            const categoryResult = await categoryResponse.json();

            if (!productResponse.ok || productResult.success === false) {
                throw new Error(
                    productResult.message || "Failed to load products."
                );
            }

            if (!categoryResponse.ok || categoryResult.success === false) {
                throw new Error(
                    categoryResult.message || "Failed to load categories."
                );
            }

            setProducts(productResult.data || []);
            setCategories(categoryResult.data || []);
        } catch (err) {
            setError(err.message || "Unable to load data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdd = () => {
        setEditingProduct(null);
        setMessage("");
        setError("");
        setShowForm(true);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setMessage("");
        setError("");
        setShowForm(true);
    };

    const handleSave = async (formData) => {
        try {
            setSaving(true);
            setError("");
            setMessage("");

            const editing = Boolean(editingProduct);

            const response = await fetch(
                editing
                    ? `${API_URL}/product/${editingProduct._id}`
                    : `${API_URL}/product/create`,
                {
                    method: editing ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                }
            );

            const result = await response.json();

            if (!response.ok || result.success === false) {
                throw new Error(
                    result.message || "Failed to save product."
                );
            }

            setShowForm(false);
            setEditingProduct(null);
            setMessage(
                editing
                    ? "Product updated successfully."
                    : "Product created successfully."
            );

            await fetchData();
        } catch (err) {
            setError(err.message || "Failed to save product.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product?")) {
            return;
        }

        try {
            setError("");
            setMessage("");

            const response = await fetch(
                `${API_URL}/product/${productId}`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            const result = await response.json();

            if (!response.ok || result.success === false) {
                throw new Error(
                    result.message || "Failed to delete product."
                );
            }

            setProducts((previous) =>
                previous.filter((product) => product._id !== productId)
            );

            setMessage("Product deleted successfully.");
        } catch (err) {
            setError(err.message || "Failed to delete product.");
        }
    };

    const getCategoryName = (product) => {
        if (
            product.categoryId &&
            typeof product.categoryId === "object"
        ) {
            return product.categoryId.name || "Not assigned";
        }

        const category = categories.find(
            (item) => item._id === product.categoryId
        );

        return category ? category.name : "Not assigned";
    };

    return (
        <div className="management-page">
            <div className="management-header">
                <h1>Admin - Manage Products</h1>

                {!showForm && (
                    <button type="button" onClick={handleAdd}>
                        Add Product
                    </button>
                )}
            </div>

            {message && (
                <p className="success-message">{message}</p>
            )}

            {error && (
                <p className="error-message">{error}</p>
            )}

            {showForm && (
                <div className="management-form">
                    <h2>
                        {editingProduct ? "Edit Product" : "Create Product"}
                    </h2>

                    <ProductForm
                        product={editingProduct}
                        onSave={handleSave}
                        onCancel={() => {
                            setShowForm(false);
                            setEditingProduct(null);
                            setError("");
                        }}
                    />

                    {saving && <p>Saving product...</p>}
                </div>
            )}

            {loading ? (
                <p>Loading products...</p>
            ) : products.length === 0 ? (
                <p>No products found. Click Add Product to create one.</p>
            ) : (
                <div className="management-table-wrapper">
                    <table className="management-table">
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th>Price</th>
                                <th>Category</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {products.map((product) => (
                                <tr key={product._id}>
                                    <td>{product.name}</td>
                                    <td>₹{product.price}</td>
                                    <td>{getCategoryName(product)}</td>
                                    <td>{product.stock}</td>
                                    <td>
                                        {product.isActive ? "Active" : "Inactive"}
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(product)}
                                        >
                                            Edit
                                        </button>{" "}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(product._id)
                                            }
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AdminProduct;