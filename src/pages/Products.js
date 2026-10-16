import React, { useEffect, useState } from "react";

import ProductCard from "../components/ProductCard";

function Products() {

    // Store products received from backend
    const [products, setProducts] = useState([]);

    // Loading state
    const [loading, setLoading] = useState(true);

    // Error state
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchProducts = async () => {

            try {

                // Call backend API
                const response = await fetch(
                    "http://localhost:5000/product/list"
                );

                // Check whether API request was successful
                if (!response.ok) {

                    throw new Error(
                        "Failed to fetch products"
                    );
                }

                // Convert response to JSON
                const result = await response.json();

                // Store products in React state
                setProducts(result.data);

            } catch (error) {

                console.error(
                    "Error fetching products:",
                    error
                );

               setError(error.message);

            } finally {

                // Stop loading after success or failure
                setLoading(false);
            }
        };

        fetchProducts();

    }, []);

    // Loading UI
    if (loading) {

        return (
            <main className="container">

                <h1>
                    Our Products
                </h1>

                <p className="loading-message">
                    Loading products...
                </p>

            </main>
        );
    }

    // Error UI
    if (error) {

        return (
            <main className="container">

                <h1>
                    Our Products
                </h1>

                <p className="error-message">
                    {error}
                </p>

            </main>
        );
    }

    // Empty products UI
    if (products.length === 0) {

        return (
            <main className="container">

                <h1>
                    Our Products
                </h1>

                <p>
                    No products are available at the moment.
                </p>

            </main>
        );
    }

    return (

        <main
            className="container"
            id="products"
        >

            <h1>
                Our Products
            </h1>

            <p className="subtitle">
                Explore our latest products
            </p>

            <div className="product-grid">

                {products.map((product) => (

                    <ProductCard
                        key={product._id}
                        product={product}
                    />

                ))}

            </div>

        </main>

    );
}

export default Products;