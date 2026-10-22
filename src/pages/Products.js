
import React, { useEffect, useMemo, useState } from "react";

import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";

const API_URL = "http://localhost:5000";
const PRODUCTS_PER_PAGE = 8;

function Products() {
    // Existing product state
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Assignment 11: category data and loading/error states
    const [categories, setCategories] = useState([]);
    const [categoryError, setCategoryError] = useState("");

    // Assignment 11: search, filters and sorting
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sortOrder, setSortOrder] = useState("default");

    // Assignment 11: pagination
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch products using your existing API
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${API_URL}/product/list`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch products");
                }

                const result = await response.json();

                if (result.success === false) {
                    throw new Error(
                        result.message || "Failed to fetch products"
                    );
                }

                setProducts(
                    Array.isArray(result.data) ? result.data : []
                );
            } catch (err) {
                console.error("Error fetching products:", err);
                setError(err.message || "Unable to load products.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Fetch categories from your existing category API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setCategoryError("");

                const response = await fetch(
                    `${API_URL}/category/list`
                );

                const result = await response.json();

                if (!response.ok || result.success === false) {
                    throw new Error(
                        result.message || "Failed to fetch categories"
                    );
                }

                setCategories(
                    Array.isArray(result.data) ? result.data : []
                );
            } catch (err) {
                console.error("Error fetching categories:", err);
                setCategoryError(
                    "Categories could not be loaded. You can still search products."
                );
            }
        };

        fetchCategories();
    }, []);

    // Get the category ID whether categoryId is a plain ObjectId
    // or a populated category object.
    const getCategoryId = (product) => {
        const category = product.categoryId;

        if (!category) {
            return "";
        }

        if (typeof category === "object") {
            return String(category._id || "");
        }

        return String(category);
    };

    // Search, filter and sort products
    const filteredProducts = useMemo(() => {
        let result = [...products];

        const search = searchTerm.trim().toLowerCase();

        // Search by product name, description or category name
        if (search) {
            result = result.filter((product) => {
                const categoryId = getCategoryId(product);

                const category = categories.find(
                    (item) => String(item._id) === categoryId
                );

                const searchableText = [
                    product.name,
                    product.description,
                    category?.name
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return searchableText.includes(search);
            });
        }

        // Category filter
        if (selectedCategory) {
            result = result.filter(
                (product) =>
                    getCategoryId(product) === selectedCategory
            );
        }

        // Minimum price filter
        if (minPrice !== "" && Number.isFinite(Number(minPrice))) {
            result = result.filter(
                (product) => Number(product.price) >= Number(minPrice)
            );
        }

        // Maximum price filter
        if (maxPrice !== "" && Number.isFinite(Number(maxPrice))) {
            result = result.filter(
                (product) => Number(product.price) <= Number(maxPrice)
            );
        }

        // Sorting
        if (sortOrder === "price-low-high") {
            result.sort(
                (a, b) => Number(a.price) - Number(b.price)
            );
        } else if (sortOrder === "price-high-low") {
            result.sort(
                (a, b) => Number(b.price) - Number(a.price)
            );
        } else if (sortOrder === "name-a-z") {
            result.sort((a, b) =>
                String(a.name || "").localeCompare(
                    String(b.name || "")
                )
            );
        } else if (sortOrder === "name-z-a") {
            result.sort((a, b) =>
                String(b.name || "").localeCompare(
                    String(a.name || "")
                )
            );
        }

        return result;
    }, [
        products,
        categories,
        searchTerm,
        selectedCategory,
        minPrice,
        maxPrice,
        sortOrder
    ]);

    // Reset to page 1 whenever a search or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [
        searchTerm,
        selectedCategory,
        minPrice,
        maxPrice,
        sortOrder
    ]);

    const totalPages = Math.ceil(
        filteredProducts.length / PRODUCTS_PER_PAGE
    );

    // Keep the current page valid if products change
    const safeCurrentPage = Math.min(
        Math.max(currentPage, 1),
        Math.max(totalPages, 1)
    );

    const startIndex = (safeCurrentPage - 1) * PRODUCTS_PER_PAGE;

    const paginatedProducts = filteredProducts.slice(
        startIndex,
        startIndex + PRODUCTS_PER_PAGE
    );

    // Clear all search/filter/sort values
    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedCategory("");
        setMinPrice("");
        setMaxPrice("");
        setSortOrder("default");
        setCurrentPage(1);
    };

    // Existing loading state
    if (loading) {
        return (
            <main className="container" id="products">
                <h1>Our Products</h1>
                <p className="loading-message">
                    Loading products...
                </p>
            </main>
        );
    }

    // Existing error state
    if (error) {
        return (
            <main className="container" id="products">
                <h1>Our Products</h1>
                <p className="error-message">{error}</p>

                <button
                    type="button"
                    onClick={() => window.location.reload()}
                >
                    Try Again
                </button>
            </main>
        );
    }

    return (
        <main className="container products-page" id="products">
            <h1>Our Products</h1>

            <p className="subtitle">
                Explore our latest products
            </p>

            {/* Assignment 11: Search and filters */}
            <section
                className="product-filters"
                aria-label="Search and filter products"
            >
                <div className="filter-field search-field">
                    <label htmlFor="product-search">
                        Search Products
                    </label>

                    <input
                        id="product-search"
                        type="search"
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(event.target.value)
                        }
                        placeholder="Search by name or keyword..."
                    />
                </div>

                <div className="filter-field">
                    <label htmlFor="category-filter">
                        Category
                    </label>

                    <select
                        id="category-filter"
                        value={selectedCategory}
                        onChange={(event) =>
                            setSelectedCategory(event.target.value)
                        }
                    >
                        <option value="">All Categories</option>

                        {categories
                            .filter(
                                (category) =>
                                    (category.status || "active")
                                        .toLowerCase() === "active"
                            )
                            .map((category) => (
                                <option
                                    key={category._id}
                                    value={category._id}
                                >
                                    {category.name}
                                </option>
                            ))}
                    </select>

                    {categoryError && (
                        <small className="filter-warning">
                            {categoryError}
                        </small>
                    )}
                </div>

                <div className="filter-field">
                    <label htmlFor="min-price">
                        Minimum Price (₹)
                    </label>

                    <input
                        id="min-price"
                        type="number"
                        min="0"
                        value={minPrice}
                        onChange={(event) =>
                            setMinPrice(event.target.value)
                        }
                        placeholder="Min price"
                    />
                </div>

                <div className="filter-field">
                    <label htmlFor="max-price">
                        Maximum Price (₹)
                    </label>

                    <input
                        id="max-price"
                        type="number"
                        min="0"
                        value={maxPrice}
                        onChange={(event) =>
                            setMaxPrice(event.target.value)
                        }
                        placeholder="Max price"
                    />
                </div>

                <div className="filter-field">
                    <label htmlFor="product-sort">
                        Sort By
                    </label>

                    <select
                        id="product-sort"
                        value={sortOrder}
                        onChange={(event) =>
                            setSortOrder(event.target.value)
                        }
                    >
                        <option value="default">
                            Default
                        </option>
                        <option value="price-low-high">
                            Price: Low to High
                        </option>
                        <option value="price-high-low">
                            Price: High to Low
                        </option>
                        <option value="name-a-z">
                            Name: A to Z
                        </option>
                        <option value="name-z-a">
                            Name: Z to A
                        </option>
                    </select>
                </div>

                <button
                    type="button"
                    className="clear-filters-button"
                    onClick={handleClearFilters}
                >
                    Clear Filters
                </button>
            </section>

            {/* Matching product count */}
            <p className="product-results-count" aria-live="polite">
                {filteredProducts.length === 0
                    ? "No matching products found."
                    : `Showing ${startIndex + 1}–${Math.min(
                        startIndex + PRODUCTS_PER_PAGE,
                        filteredProducts.length
                    )} of ${filteredProducts.length} products`}
            </p>

            {/* Product results */}
            {products.length === 0 ? (
                <p>
                    No products are available at the moment.
                </p>
            ) : filteredProducts.length === 0 ? (
                <div className="no-products-message">
                    <h2>No products found</h2>
                    <p>
                        Try changing your search or filter settings.
                    </p>

                    <button
                        type="button"
                        onClick={handleClearFilters}
                    >
                        Clear Filters
                    </button>
                </div>
            ) : (
                <>
                    <div className="product-grid">
                        {paginatedProducts.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                            />
                        ))}
                    </div>

                    <Pagination
                        currentPage={safeCurrentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}
        </main>
    );
}

export default Products;
