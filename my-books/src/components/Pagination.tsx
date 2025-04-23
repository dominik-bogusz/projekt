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
	// Maksymalna liczba wyświetlonych przycisków stron
	const maxVisibleButtons = 5;

	// Funkcja tworząca tablicę z numerami stron do wyświetlenia
	const getPageNumbers = () => {
		// Jeżeli jest mało stron, po prostu wyświetl wszystkie
		if (totalPages <= maxVisibleButtons) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}

		// Zawsze pokazujemy pierwszą i ostatnią stronę
		// Oraz stronę bieżącą i jedną przed nią i po niej (jeśli możliwe)

		// Inicjalizujemy wartości
		let startPage = Math.max(1, currentPage - 1);
		let endPage = Math.min(totalPages, currentPage + 1);

		// Upewniamy się, że mamy zawsze stałą liczbę stron
		if (endPage - startPage + 1 < 3) {
			if (startPage === 1) {
				endPage = Math.min(3, totalPages);
			} else if (endPage === totalPages) {
				startPage = Math.max(1, totalPages - 2);
			}
		}

		// Tworzymy tablicę stron do wyświetlenia
		const pages = [];

		// Zawsze dodajemy pierwszą stronę
		pages.push(1);

		// Dodajemy wielokropek po pierwszej stronie jeśli potrzeba
		if (startPage > 2) {
			pages.push('ellipsis1');
		}

		// Dodajemy strony pomiędzy
		for (
			let i = Math.max(2, startPage);
			i <= Math.min(totalPages - 1, endPage);
			i++
		) {
			pages.push(i);
		}

		// Dodajemy wielokropek przed ostatnią stroną jeśli potrzeba
		if (endPage < totalPages - 1) {
			pages.push('ellipsis2');
		}

		// Dodajemy ostatnią stronę jeśli jest więcej niż jedna strona
		if (totalPages > 1) {
			pages.push(totalPages);
		}

		return pages;
	};

	if (totalPages <= 1) return null;

	const pageNumbers = getPageNumbers();

	return (
		<nav aria-label='Paginacja' className='flex justify-center my-6'>
			<ul className='inline-flex -space-x-px'>
				{/* Przycisk "Poprzednia" */}
				<li>
					<button
						onClick={() => onPageChange(currentPage - 1)}
						disabled={currentPage === 1}
						className={`flex items-center px-4 py-2 ml-0 leading-tight rounded-l-lg border ${
							currentPage === 1
								? 'text-gray-400 bg-gray-100 cursor-not-allowed'
								: 'text-gray-700 bg-white hover:bg-gray-100 hover:text-blue-700'
						}`}
						aria-label='Poprzednia strona'
					>
						<svg
							className='w-3.5 h-3.5 mr-2 rtl:rotate-180'
							aria-hidden='true'
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 14 10'
						>
							<path
								stroke='currentColor'
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth='2'
								d='M13 5H1m0 0 4 4M1 5l4-4'
							/>
						</svg>
						Poprzednia
					</button>
				</li>

				{/* Przyciski numerów stron */}
				{pageNumbers.map((page, index) => (
					<li key={index}>
						{page === 'ellipsis1' || page === 'ellipsis2' ? (
							<span className='flex items-center px-3 py-2 text-gray-500 bg-white border'>
								...
							</span>
						) : (
							<button
								onClick={() => onPageChange(page as number)}
								className={`px-3 py-2 leading-tight border ${
									currentPage === page
										? 'text-blue-600 bg-blue-50 border-blue-300 font-medium'
										: 'text-gray-700 bg-white hover:bg-gray-100 hover:text-blue-700'
								}`}
								aria-label={`Strona ${page}`}
								aria-current={currentPage === page ? 'page' : undefined}
							>
								{page}
							</button>
						)}
					</li>
				))}

				{/* Przycisk "Następna" */}
				<li>
					<button
						onClick={() => onPageChange(currentPage + 1)}
						disabled={currentPage === totalPages}
						className={`flex items-center px-4 py-2 leading-tight rounded-r-lg border ${
							currentPage === totalPages
								? 'text-gray-400 bg-gray-100 cursor-not-allowed'
								: 'text-gray-700 bg-white hover:bg-gray-100 hover:text-blue-700'
						}`}
						aria-label='Następna strona'
					>
						Następna
						<svg
							className='w-3.5 h-3.5 ml-2 rtl:rotate-180'
							aria-hidden='true'
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 14 10'
						>
							<path
								stroke='currentColor'
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth='2'
								d='M1 5h12m0 0L9 1m4 4L9 9'
							/>
						</svg>
					</button>
				</li>
			</ul>
		</nav>
	);
};

export default Pagination;
