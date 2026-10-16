
import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:5000";

function ProductForm({ product, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        isActive: true,
        categoryId: ""
    });

    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [categoryError, setCategoryError] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || "",
                description: product.description || "",
                price: product.price ?? "",
                stock: product.stock ?? "",
                isActive: product.isActive ?? true,
                categoryId: product.categoryId?._id
                    || product.categoryId
                    || ""
            });
        } else {
            setFormData({
                name: "",
                description: "",
                price: "",
                stock: "",
                isActive: true,
                categoryId: ""
            });
        }
        setError("");
    }, [product]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoadingCategories(true);
                setCategoryError("");

                const response = await fetch(
                    `${API_URL}/category/list`
                );

                const result = await response.json();

                if (!response.ok || result.success === false) {
                    throw new Error(
                        result.message || "Failed to load categories"
                    );
                }

                setCategories(
                    Array.isArray(result.data) ? result.data : []
                );
            } catch (err) {
                setCategoryError(err.message);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: name === "isActive"
                ? value === "true"
                : value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        const name = formData.name.trim();
        const description = formData.description.trim();
        const price = Number(formData.price);
        const stock = Number(formData.stock);

        if (!name || !description) {
            setError("Name and description are required.");
            return;
        }

        if (
            formData.price === "" ||
            !Number.isFinite(price) ||
            price <= 0
        ) {
            setError("Price must be greater than 0.");
            return;
        }

        if (
            formData.stock === "" ||
            !Number.isInteger(stock) ||
            stock < 0
        ) {
            setError("Stock must be a non-negative whole number.");
            return;
        }

        const payload = {
            name,
            description,
            price,
            stock,
            isActive: formData.isActive,
            ...(formData.categoryId
                ? { categoryId: formData.categoryId }
                : {})
        };

        try {
            setSaving(true);
            await onSave(payload);
        } catch (err) {
            setError(err.message || "Failed to save product.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="management-form">
            <h2>{product ? "Edit Product" : "Create Product"}</h2>

            {error && (
                <p className="message error-message">{error}</p>
            )}

            <form onSubmit={handleSubmit}>
                <label htmlFor="product-name">Product Name</label>
                <input
                    id="product-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="product-description">
                    Description
                </label>
                <textarea
                    id="product-description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="3"
                />

                <label htmlFor="product-price">Price</label>
                <input
                    id="product-price"
                    name="price"
                    type="number"
                    min="0.01"
                    step="any"
                    value={formData.price}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="product-stock">Stock</label>
                <input
                    id="product-stock"
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="product-category">Category</label>
                <select
                    id="product-category"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    disabled={loadingCategories}
                >
                    <option value="">
                        No category
                    </option>

                    {categories.map((category) => (
                        <option
                            key={category._id}
                            value={category._id}
                        >
                            {category.name} ({category.status})
                        </option>
                    ))}
                </select>

                {loadingCategories && (
                    <p>Loading categories...</p>
                )}

                {categoryError && (
                    <p className="message error-message">
                        {categoryError}
                    </p>
                )}

                <label htmlFor="product-active">Product Status</label>
                <select
                    id="product-active"
                    name="isActive"
                    value={String(formData.isActive)}
                    onChange={handleChange}
                >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>

                <div className="form-actions">
                    <button type="submit" disabled={saving}>
                        {saving
                            ? "Saving..."
                            : product
                                ? "Update Product"
                                : "Create Product"}
                    </button>

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={saving}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </section>
    );
}

export default ProductForm;
