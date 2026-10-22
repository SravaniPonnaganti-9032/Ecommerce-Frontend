
import React from "react";

function Pagination({
    currentPage,
    totalPages,
    onPageChange
}) {
    if (totalPages <= 1) {
        return null;
    }

    const getPageNumbers = () => {
        const pages = [];

        for (let page = 1; page <= totalPages; page++) {
            pages.push(page);
        }

        return pages;
    };

    return (
        <nav className="pagination" aria-label="Product pages">
            <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
            >
                Previous
            </button>

            {getPageNumbers().map((page) => (
                <button
                    key={page}
                    type="button"
                    className={
                        currentPage === page
                            ? "pagination-page active"
                            : "pagination-page"
                    }
                    onClick={() => onPageChange(page)}
                    aria-current={
                        currentPage === page ? "page" : undefined
                    }
                >
                    {page}
                </button>
            ))}

            <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
            >
                Next
            </button>
        </nav>
    );
}

export default Pagination;
