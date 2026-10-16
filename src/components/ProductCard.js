import React from "react";

import { Link } from "react-router-dom";

function ProductCard({ product }) {

    return (

        <div className="product-card">

            <div className="product-info">

                <h2>
                    {product.name}
                </h2>

                <p className="category">
                    Product
                </p>

                <p className="price">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                </p>

                <p className="product-description">
                    {product.description}
                </p>

                <p className="stock">

                    Stock: {product.stock}

                </p>

                <Link
                    to={`/products/${product._id}`}
                    className="view-details-button"
                >
                    View Details
                </Link>

            </div>

        </div>

    );
}

export default ProductCard;