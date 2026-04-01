import React from "react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({currentPage, totalPages, onPageChange}) => {
    let pageNumbers: (number | string)[];

    if (totalPages <= 20) {
        pageNumbers = Array.from({length: totalPages}, (_, index) => index + 1);
    } else {
        const startPages = [1, 2, 3];
        const endPages = [totalPages - 2, totalPages - 1, totalPages];
        const middlePages = [currentPage - 1, currentPage, currentPage + 1].filter(
            (page) => page > 3 && page < totalPages - 2
        );

        pageNumbers = [
            ...startPages,
            ...(middlePages.length && middlePages[0] > startPages[startPages.length - 1] + 1 ? ["..."] : []),
            ...middlePages,
            ...(middlePages.length && middlePages[middlePages.length - 1] < endPages[0] - 1 ? ["..."] : []),
            ...endPages,
        ];
    }

    return (
        <nav aria-label="Pagination">
            <ul className="inline-flex flex-wrap gap-2">
                <li>
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="app-button-secondary px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Previous
                    </button>
                </li>

                {pageNumbers.map((pageNumber, index) => (
                    <li key={index}>
                        {typeof pageNumber === "number" ? (
                            <button
                                onClick={() => onPageChange(pageNumber)}
                                className="min-w-10 rounded-[var(--radius-sm)] border px-3 py-2 text-sm font-medium transition"
                                style={{
                                    background: currentPage === pageNumber ? "linear-gradient(135deg, var(--accent), var(--accent-strong))" : "var(--surface-elevated)",
                                    borderColor: currentPage === pageNumber ? "transparent" : "var(--border-subtle)",
                                    color: currentPage === pageNumber ? "#ffffff" : "var(--foreground)",
                                }}
                                aria-current={currentPage === pageNumber ? "page" : undefined}
                            >
                                {pageNumber}
                            </button>
                        ) : (
                            <span
                                className="inline-flex min-w-10 items-center justify-center rounded-[var(--radius-sm)] border px-3 py-2 text-sm"
                                style={{background: "var(--surface-soft)", borderColor: "var(--border-subtle)", color: "var(--muted)"}}
                            >
                                {pageNumber}
                            </span>
                        )}
                    </li>
                ))}

                <li>
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="app-button-secondary px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Next
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Pagination;
