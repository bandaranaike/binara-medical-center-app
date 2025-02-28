import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({currentPage, totalPages, onPageChange,}) => {
    let pageNumbers: (number | string)[];

    if (totalPages <= 20) {
        // Show all pages if total is 20 or less
        pageNumbers = Array.from({length: totalPages}, (_, i) => i + 1);
    } else {
        // Always show the first 3 pages
        const startPages = [1, 2, 3];
        // Always show the last 3 pages
        const endPages = [totalPages - 2, totalPages - 1, totalPages];
        // Show the current page, one before, and one after
        const middlePages = [
            currentPage - 1,
            currentPage,
            currentPage + 1,
        ].filter(
            (page) => page > 3 && page < totalPages - 2
        );

        // Combine the page numbers with ellipses where appropriate
        pageNumbers = [
            ...startPages,
            // Add ellipsis if there's a gap between startPages and middlePages
            ...(middlePages.length && middlePages[0] > startPages[startPages.length - 1] + 1
                ? ['...']
                : []),
            ...middlePages,
            // Add ellipsis if there's a gap between middlePages and endPages
            ...(middlePages.length && middlePages[middlePages.length - 1] < endPages[0] - 1
                ? ['...']
                : []),
            ...endPages,
        ];
    }

    return (
        <nav aria-label="Pagination">
            <ul className="inline-flex -space-x-px rounded-md shadow-sm bg-gray-800">
                {/* Previous Button */}
                <li>
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700"
                    >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l4.293 4.293a1 1 0 01-1.414 1.414l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 0z"
                                  clipRule="evenodd"/>
                        </svg>
                    </button>
                </li>

                {/* Page Numbers */}
                {pageNumbers.map((pageNumber, index) => (
                    <li key={index}>
                        {typeof pageNumber === 'number' ? (
                            <button
                                onClick={() => onPageChange(pageNumber)}
                                className={`relative inline-flex items-center px-4 py-2 border border-gray-700 bg-gray-800 text-sm font-medium text-gray-500 hover:bg-gray-700 ${
                                    currentPage === pageNumber ? 'bg-gray-900 text-white' : ''
                                }`}
                                aria-current={currentPage === pageNumber ? 'page' : undefined}
                            >
                                {pageNumber}
                            </button>
                        ) : (
                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-700 bg-gray-800 text-sm font-medium text-gray-500">
                {pageNumber}
              </span>
                        )}
                    </li>
                ))}

                {/* Next Button */}
                <li>
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700"
                    >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10l-4.293-4.293a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                                  clipRule="evenodd"/>
                        </svg>
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Pagination;
