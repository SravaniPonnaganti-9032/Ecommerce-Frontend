import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:5000";

function AdminCategory() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "active"
    });

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_URL}/category/list`);
            const result = await response.json();

            if (!response.ok || result.success === false) {
                throw new Error(
                    result.message || "Failed to load categories."
                );
            }

            setCategories(result.data || []);
        } catch (err) {
            setError(err.message || "Unable to load categories.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            status: "active"
        });
        setEditingId(null);
        setShowForm(false);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleAdd = () => {
        resetForm();
        setError("");
        setMessage("");
        setShowForm(true);
    };

    const handleEdit = (category) => {
        setFormData({
            name: category.name || "",
            description: category.description || "",
            status: category.status || "active"
        });

        setEditingId(category._id);
        setShowForm(true);
        setError("");
        setMessage("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.name.trim()) {
            setError("Category name is required.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            const editing = Boolean(editingId);

            const response = await fetch(
                editing
                    ? `${API_URL}/category/${editingId}`
                    : `${API_URL}/category/create`,
                {
                    method: editing ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: formData.name.trim(),
                        description: formData.description.trim(),
                        status: formData.status
                    })
                }
            );

            const result = await response.json();

            if (!response.ok || result.success === false) {
                throw new Error(
                    result.message || "Failed to save category."
                );
            }

            resetForm();
            setMessage(
                editing
                    ? "Category updated successfully."
                    : "Category created successfully."
            );

            await fetchCategories();
        } catch (err) {
            setError(err.message || "Failed to save category.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (categoryId) => {
        if (!window.confirm("Are you sure you want to delete this category?")) {
            return;
        }

        try {
            setError("");
            setMessage("");

            const response = await fetch(
                `${API_URL}/category/${categoryId}`,
                { method: "DELETE" }
            );

            const result = await response.json();

            if (!response.ok || result.success === false) {
                throw new Error(
                    result.message ||
                    "Failed to delete category."
                );
            }

            setCategories((previous) =>
                previous.filter((category) => category._id !== categoryId)
            );

            setMessage("Category deleted successfully.");
        } catch (err) {
            setError(err.message || "Failed to delete category.");
        }
    };

    return (
        <div className="management-page">
            <div className="management-header">
                <h1>Admin - Manage Categories</h1>

                {!showForm && (
                    <button type="button" onClick={handleAdd}>
                        Add Category
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
                <form
                    className="management-form"
                    onSubmit={handleSubmit}
                >
                    <h2>
                        {editingId ? "Edit Category" : "Create Category"}
                    </h2>

                    <label htmlFor="category-name">
                        Category Name
                    </label>
                    <input
                        id="category-name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter category name"
                        required
                    />

                    <label htmlFor="category-description">
                        Description
                    </label>
                    <textarea
                        id="category-description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter category description"
                        rows="3"
                    />

                    <label htmlFor="category-status">
                        Status
                    </label>
                    <select
                        id="category-status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    <button type="submit" disabled={saving}>
                        {saving
                            ? "Saving..."
                            : editingId
                                ? "Update Category"
                                : "Create Category"}
                    </button>{" "}

                    <button
                        type="button"
                        onClick={() => {
                            resetForm();
                            setError("");
                        }}
                    >
                        Cancel
                    </button>
                </form>
            )}

            {loading ? (
                <p>Loading categories...</p>
            ) : categories.length === 0 ? (
                <p>No categories found. Click Add Category to create one.</p>
            ) : (
                <div className="management-table-wrapper">
                    <table className="management-table">
                        <thead>
                            <tr>
                                <th>Category Name</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {categories.map((category) => (
                                <tr key={category._id}>
                                    <td>{category.name}</td>
                                    <td>
                                        {category.description || "—"}
                                    </td>
                                    <td>
                                        {category.status || "active"}
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(category)}
                                        >
                                            Edit
                                        </button>{" "}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(category._id)
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

export default AdminCategory;