
import React from "react";

function CartItem({
    item,
    onUpdateQuantity,
    onRemove,
    busy = false
}) {
    const quantity = Number(item.quantity || 1);
    const stock = Number(item.stock || 0);
    const price = Number(item.price || 0);

    const product = item.productId;
    const productAvailable =
        Boolean(product && product._id);

    const isActive =
        productAvailable && product.isActive !== false;

    return (
        <tr>
            <td>
                {item.image && (
                    <img
                        src={item.image}
                        alt={item.name || "Product"}
                        style={{
                            width: "65px",
                            height: "65px",
                            objectFit: "contain",
                            marginRight: "10px"
                        }}
                    />
                )}

                <strong>{item.name || "Product"}</strong>

                {item.description && (
                    <p>{item.description}</p>
                )}

                {!productAvailable && (
                    <small>
                        Product details are unavailable.
                    </small>
                )}
            </td>

            <td>
                ₹{price.toLocaleString("en-IN")}
            </td>

            <td>
                <button
                    type="button"
                    aria-label={`Decrease quantity of ${item.name}`}
                    disabled={busy || quantity <= 1}
                    onClick={() =>
                        onUpdateQuantity(
                            item._id,
                            quantity - 1
                        )
                    }
                >
                    −
                </button>

                <span
                    style={{
                        display: "inline-block",
                        minWidth: "35px",
                        textAlign: "center"
                    }}
                >
                    {quantity}
                </span>

                <button
                    type="button"
                    aria-label={`Increase quantity of ${item.name}`}
                    disabled={
                        busy ||
                        !isActive ||
                        quantity >= stock
                    }
                    onClick={() =>
                        onUpdateQuantity(
                            item._id,
                            quantity + 1
                        )
                    }
                >
                    +
                </button>

                <p>
                    <small>Available stock: {stock}</small>
                </p>
            </td>

            <td>
                ₹{(price * quantity).toLocaleString("en-IN")}
            </td>

            <td>
                <button
                    type="button"
                    disabled={busy}
                    onClick={() => onRemove(item._id)}
                >
                    Remove
                </button>
            </td>
        </tr>
    );
}

export default CartItem;
