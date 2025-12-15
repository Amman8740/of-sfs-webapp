import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
  currentItemsStart?: number;
  currentItemsEnd?: number;
  itemLabel?: string; // Custom label for items (e.g., "Models", "Notifications")
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showInfo = false,
  totalItems = 0,
  itemsPerPage = 10,
  currentItemsStart = 0,
  currentItemsEnd = 0,
  itemLabel = 'items',
}) => {
  const generatePageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 1) {
      pages.push(1);
      return pages;
    }

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    const rangeStart = Math.max(2, currentPage - 1);
    const rangeEnd = Math.min(totalPages - 1, currentPage + 1);

    // Add ellipsis after first page if needed
    if (rangeStart > 2) {
      pages.push('...');
    }

    // Add pages in range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    // Add ellipsis before last page if needed
    if (rangeEnd < totalPages - 1) {
      pages.push('...');
    }

    // Always show last page (if more than 1 page)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between w-full">
      {/* Info section on the left */}
      {showInfo && (
        <div 
          className="font-medium leading-6 align-middle"
          style={{
            fontFamily: 'Manrope',
            fontSize: '16px',
            lineHeight: '24px',
            letterSpacing: '0.5%',
            color: '#9BA1A6'
          }}
        >
          Showing <span className="font-medium">{String(currentItemsStart).padStart(2, '0')}</span>-<span className="font-medium">{String(currentItemsEnd).padStart(2, '0')}</span> of <span className="font-medium">{totalItems}</span> {itemLabel}
        </div>
      )}

      {/* Pagination controls on the right */}
      <div className="flex items-center space-x-2">
        {/* Previous button */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="w-3 h-3" />
        </button>

        {/* Page numbers */}
        {generatePageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-2 text-gray-400">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  (page as number) === currentPage
                    ? 'bg-[#0091FF] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-label={`Go to page ${page}`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRightIcon className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
