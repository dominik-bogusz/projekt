import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import BookList from '../components/BookList';
import Pagination from '../components/Pagination';
import useSearch from '../hooks/useSearch';
import useBook from '../hooks/useBook';

const Search: React.FC = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const initialQuery = searchParams.get('q') || '';
	const initialPage = parseInt(searchParams.get('page') || '1', 10);
	const initialCategory = searchParams.get('category') || '';

	const [query, setQuery] = useState(initialQuery);
	const [currentPage, setCurrentPage] = useState(initialPage);
	const [category, setCategory] = useState(initialCategory);
	const [categories, setCategories] = useState<string[]>([]);

	const { books, isLoading, error, totalResults, search } = useSearch();
	const { saveBook } = useBook();

	const resultsPerPage = 20;
	const totalPages = Math.min(50, Math.ceil(totalResults / resultsPerPage));

	useEffect(() => {
		if (initialQuery) {
			handleSearchWithoutEvent();
		}
	}, [currentPage, category]);

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		setCurrentPage(1);
		handleSearchWithoutEvent();
	};

	const handleSearchWithoutEvent = async () => {
		if (!query.trim()) return;

		const searchParamsObj: Record<string, string> = {
			q: query,
			page: currentPage.toString(),
		};

		if (category) {
			searchParamsObj.category = category;
		}

		setSearchParams(searchParamsObj);

		const startIndex = (currentPage - 1) * resultsPerPage;
		await search(query, startIndex, category);

		// Extract unique categories for filter
		const allCategories = books
			.flatMap((book) => book.categories || [])
			.filter((v, i, a) => a.indexOf(v) === i)
			.sort();

		setCategories(allCategories);
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		window.scrollTo(0, 0);
	};

	const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setCategory(e.target.value);
		setCurrentPage(1);
	};

	return (
		<div className='max-w-6xl mx-auto px-4 py-8'>
			<h1 className='text-3xl font-bold mb-6'>Wyszukaj książki</h1>

			<form onSubmit={handleSearch} className='mb-8'>
				<div className='flex flex-col md:flex-row gap-2'>
					<div className='flex-grow relative'>
						<div className='absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none'>
							<svg
								className='w-4 h-4 text-gray-500'
								aria-hidden='true'
								xmlns='http://www.w3.org/2000/svg'
								fill='none'
								viewBox='0 0 20 20'
							>
								<path
									stroke='currentColor'
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth='2'
									d='m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z'
								/>
							</svg>
						</div>
						<input
							type='text'
							className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5'
							placeholder='Tytuł, autor, ISBN...'
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							required
						/>
					</div>

					{categories.length > 0 && (
						<div className='w-full md:w-40'>
							<select
								value={category}
								onChange={handleCategoryChange}
								className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
							>
								<option value=''>Wszystkie kategorie</option>
								{categories.map((cat) => (
									<option key={cat} value={cat}>
										{cat}
									</option>
								))}
							</select>
						</div>
					)}

					<div>
						<button
							type='submit'
							disabled={isLoading}
							className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center w-full md:w-auto'
						>
							{isLoading ? (
								<>
									<div className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mr-2'></div>
									Szukam...
								</>
							) : (
								'Szukaj'
							)}
						</button>
					</div>
				</div>
			</form>

			{error && (
				<div
					className='p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50'
					role='alert'
				>
					<span className='font-medium'>Błąd!</span> {error}
				</div>
			)}

			{query && books.length > 0 && (
				<div className='text-sm text-gray-600 mb-4'>
					Znaleziono wyniki dla zapytania: <strong>{query}</strong>
					{category && (
						<span>
							{' '}
							w kategorii <strong>{category}</strong>
						</span>
					)}
				</div>
			)}

			<BookList
				books={books}
				onSaveBook={saveBook}
				showSaveButton={true}
				isLoading={isLoading}
			/>

			{query && books.length === 0 && !isLoading && (
				<div className='text-center py-8 bg-white rounded-lg shadow'>
					<p className='text-gray-500 text-lg'>
						Brak wyników dla zapytania "{query}"
					</p>
					<p className='text-gray-400 mt-2'>
						Spróbuj zmienić frazę wyszukiwania
					</p>
				</div>
			)}

			{totalResults > resultsPerPage && (
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={handlePageChange}
				/>
			)}
		</div>
	);
};

export default Search;
