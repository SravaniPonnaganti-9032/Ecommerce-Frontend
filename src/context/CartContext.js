
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";

import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

const API_URL = "http://localhost:5000/cart";

export function CartProvider({ children }) {
    const { user, token, isLoggedIn } = useAuth();

    const userId = user?._id || user?.id || "";
    const userRole = String(user?.role || "")
        .trim()
        .toLowerCase();

    const isCustomer =
        isLoggedIn &&
        userRole === "customer" &&
        Boolean(userId);

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [addingProductId, setAddingProductId] = useState("");

    const request = useCallback(async (url, options = {}) => {
        const headers = {
            "Content-Type": "application/json",
            ...(token
                ? { Authorization: `Bearer ${token}` }
                : {}),
            ...(options.headers || {})
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok || result.status === false) {
            throw new Error(
                result.message || "Cart request failed."
            );
        }

        return result;
    }, [token]);

    const refreshCart = useCallback(async () => {
        if (!isCustomer) {
            setCartItems([]);
            setError("");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const result = await request(
                `${API_URL}/${encodeURIComponent(userId)}`
            );

            const serverItems = Array.isArray(result.cart)
                ? result.cart
                : [];

            const normalizedItems = serverItems.map((item) => {
                const product =
                    item.productId &&
                    typeof item.productId === "object"
                        ? item.productId
                        : {};

                return {
                    ...item,
                    productId: product,
                    productMongoId:
                        product._id ||
                        (typeof item.productId === "string"
                            ? item.productId
                            : ""),
                    name: product.name || "Product",
                    price: Number(item.price ?? product.price ?? 0),
                    stock: Number(product.stock ?? 0),
                    isActive: product.isActive !== false,
                    image:
                        product.image ||
                        product.imageUrl ||
                        product.imageURL ||
                        "",
                    description: product.description || "",
                    quantity: Number(item.quantity || 1),
                    itemTotal:
                        Number(item.price ?? product.price ?? 0) *
                        Number(item.quantity || 1)
                };
            });

            setCartItems(normalizedItems);
        } catch (err) {
            setError(err.message || "Unable to load your cart.");
        } finally {
            setLoading(false);
        }
    }, [isCustomer, request, userId]);

    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    const addToCart = async (product, quantity = 1) => {
        if (!isCustomer) {
            throw new Error(
                "Please log in with a customer account to use the cart."
            );
        }

        if (!product?._id) {
            throw new Error("Product ID is missing.");
        }

        const stock = Number(product.stock || 0);
        const requestedQuantity = Number(quantity);

        if (product.isActive === false || stock <= 0) {
            throw new Error("This product is unavailable.");
        }

        if (
            !Number.isInteger(requestedQuantity) ||
            requestedQuantity < 1 ||
            requestedQuantity > stock
        ) {
            throw new Error("Please select a valid quantity.");
        }

        try {
            setAddingProductId(product._id);
            setError("");

            await request(`${API_URL}/add`, {
                method: "POST",
                body: JSON.stringify({
                    userId,
                    productId: product._id,
                    quantity: requestedQuantity
                })
            });

            await refreshCart();
        } catch (err) {
            setError(err.message || "Unable to add product to cart.");
            throw err;
        } finally {
            setAddingProductId("");
        }
    };

    const updateQuantity = async (cartItemId, quantity) => {
        if (!isCustomer) {
            throw new Error("Please log in as a customer.");
        }

        if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
            throw new Error("Quantity must be at least 1.");
        }

        try {
            setError("");

            await request(`${API_URL}/${encodeURIComponent(cartItemId)}`, {
                method: "PUT",
                body: JSON.stringify({
                    quantity: Number(quantity)
                })
            });

            await refreshCart();
        } catch (err) {
            setError(err.message || "Unable to update quantity.");
            throw err;
        }
    };

    const removeFromCart = async (cartItemId) => {
        if (!isCustomer) {
            throw new Error("Please log in as a customer.");
        }

        try {
            setError("");

            await request(`${API_URL}/${encodeURIComponent(cartItemId)}`, {
                method: "DELETE"
            });

            await refreshCart();
        } catch (err) {
            setError(err.message || "Unable to remove cart item.");
            throw err;
        }
    };

    const clearCart = async () => {
        if (!isCustomer) {
            throw new Error("Please log in as a customer.");
        }

        try {
            setError("");

            await request(
                `${API_URL}/user/${encodeURIComponent(userId)}`,
                { method: "DELETE" }
            );

            setCartItems([]);
        } catch (err) {
            setError(err.message || "Unable to clear your cart.");
            throw err;
        }
    };

    const cartCount = useMemo(
        () => cartItems.reduce(
            (total, item) => total + Number(item.quantity || 0),
            0
        ),
        [cartItems]
    );

    const cartTotal = useMemo(
        () => cartItems.reduce(
            (total, item) =>
                total +
                Number(item.price || 0) *
                Number(item.quantity || 0),
            0
        ),
        [cartItems]
    );

    const value = {
        cartItems,
        cartCount,
        cartTotal,
        loading,
        error,
        addingProductId,
        refreshCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error(
            "useCart must be used inside CartProvider."
        );
    }

    return context;
}
