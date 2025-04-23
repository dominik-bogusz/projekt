import React from 'react';

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
	currentPage,
	totalPages,
	onPageChange,
}) => {
	// Oblicz numery stron do wyświetlenia
	const getPageNumbers = () => {
		const pages = [];
		const maxPagesToShow = 5;

		if (totalPages <= maxPagesToShow) {
			// Pokaż wszystkie strony jeśli jest ich mniej niż maxPagesToShow
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Zawsze pokaż pierwszą stronę, ostatnią stronę, bieżącą stronę i strony wokół bieżącej
			const leftSiblingIndex = Math.max(currentPage - 1, 1);
			const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

			// Pokaż kropki tylko jeśli jest miejsce
			const shouldShowLeftDots = leftSiblingIndex > 2;
			const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

			if (!shouldShowLeftDots && shouldShowRightDots) {
				// Pokaż pierwsze kilka stron
				for (let i = 1; i <= 3; i++) {
					pages.push(i);
				}
				pages.push('dots' as any);
				pages.push(totalPages);
			} else if (shouldShowLeftDots && !shouldShowRightDots) {
				// Pokaż ostatnie kilka stron
				pages.push(1);
				pages.push('dots' as any);
				for (let i = totalPages - 2; i <= totalPages; i++) {
					pages.push(i);
				}
			} else if (shouldShowLeftDots && shouldShowRightDots) {
				// Pokaż pierwszą stronę, kropki, bieżącą i sąsiednie, kropki, ostatnią stronę
				pages.push(1);
				pages.push('dots' as any);
				for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
					pages.push(i);
				}
				pages.push('dots' as any);
				pages.push(totalPages);
			} else {
				// Pokaż wszystkie bez kropek
				for (let i = 1; i <= totalPages; i++) {
					pages.push(i);
				}
			}
		}

		return pages;
	};

	if (totalPages <= 1) return null;

	const pageNumbers = getPageNumbers();

	return (
		<nav className='flex justify-center my-6'>
			<ul className='inline-flex -space-x-px'>
				<li>
					<button
						onClick={() => onPageChange(currentPage - 1)}
						disabled={currentPage === 1}
						className={`px-3 py-2 ml-0 leading-tight ${
							currentPage === 1
								? 'text-gray-400 cursor-not-allowed'
								: 'text-gray-700 hover:bg-gray-100 hover:text-gray-700'
						} bg-white border border-gray-300 rounded-l-lg`}
						aria-label='Poprzednia strona'
					>
						Poprzednia
					</button>
				</li>

				{pageNumbers.map((pageNumber, index) => (
					<li key={index}>
						{pageNumber === 'dots' ? (
							<span className='px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300'>
								...
							</span>
						) : (
							<button
								onClick={() => onPageChange(pageNumber as number)}
								className={`px-3 py-2 leading-tight ${
									currentPage === pageNumber
										? 'text-blue-600 bg-blue-50 border-blue-300'
										: 'text-gray-700 bg-white hover:bg-gray-100 hover:text-gray-700'
								} border border-gray-300`}
								aria-label={`Strona ${pageNumber}`}
							>
								{pageNumber}
							</button>
						)}
					</li>
				))}

				<li>
					<button
						onClick={() => onPageChange(currentPage + 1)}
						disabled={currentPage === totalPages}
						className={`px-3 py-2 leading-tight ${
							currentPage === totalPages
								? 'text-gray-400 cursor-not-allowed'
								: 'text-gray-700 hover:bg-gray-100 hover:text-gray-700'
						} bg-white border border-gray-300 rounded-r-lg`}
						aria-label='Następna strona'
					>
						Następna
					</button>
				</li>
			</ul>
		</nav>
	);
};

export default Pagination;
