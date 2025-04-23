import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchBooks } from '../api/googleBooks';
import { supabase } from '../api/supabase';
import BookList from '../components/BookList';
import { Book, GoogleBookResponse } from '../types/book';
import Pagination from '../components/Pagination';

const Search: React.FC = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const initialQuery = searchParams.get('q') || '';
	const initialLanguage = searchParams.get('lang') || 'pl';
	const initialPage = parseInt(searchParams.get('page') || '1', 10);

	const [query, setQuery] = useState(initialQuery);
	const [books, setBooks] = useState<Book[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [language, setLanguage] = useState(initialLanguage);
	const [currentPage, setCurrentPage] = useState(initialPage);
	const [totalResults, setTotalResults] = useState(0);

	const resultsPerPage = 20;
	const totalPages = Math.min(1000, Math.ceil(totalResults / resultsPerPage)); // Google Books API ogranicza do 1000 wyników

	useEffect(() => {
		if (initialQuery) {
			handleSearchWithoutEvent();
		}
	}, [currentPage]); // Re-run search when page changes

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		// When initiating a new search, reset to page 1
		setCurrentPage(1);
		handleSearchWithoutEvent();
	};

	const handleSearchWithoutEvent = async () => {
		if (!query.trim()) return;

		setIsLoading(true);
		setError(null);

		// Update search parameters in URL
		setSearchParams({
			q: query,
			lang: language,
			page: currentPage.toString(),
		});

		try {
			const startIndex = (currentPage - 1) * resultsPerPage;
			const response: GoogleBookResponse = await searchBooks(
				query,
				resultsPerPage,
				startIndex,
				language
			);

			// Ustaw całkowitą liczbę wyników, ale uwzględnij rzeczywistą liczbę zwróconych elementów dla ostatniej strony
			if (response.totalItems === 0 || !response.items) {
				setTotalResults(0);
				setBooks([]);
				setIsLoading(false);
				return;
			}

			// Niektóre wyniki mogą być niedostępne nawet jeśli API twierdzi, że istnieją
			setTotalResults(response.totalItems);

			const formattedBooks: Book[] = response.items.map((item) => ({
				id: item.id,
				title: item.volumeInfo.title,
				authors: item.volumeInfo.authors,
				description: item.volumeInfo.description,
				publishedDate: item.volumeInfo.publishedDate,
				pageCount: item.volumeInfo.pageCount,
				categories: item.volumeInfo.categories,
				imageLinks: item.volumeInfo.imageLinks,
				language: item.volumeInfo.language,
				averageRating: item.volumeInfo.averageRating,
				publisher: item.volumeInfo.publisher,
			}));

			const sortedBooks = formattedBooks.sort((a, b) => {
				if (a.imageLinks?.thumbnail && !b.imageLinks?.thumbnail) return -1;
				if (!a.imageLinks?.thumbnail && b.imageLinks?.thumbnail) return 1;
				return 0;
			});

			setBooks(sortedBooks);

			// Jeśli zwrócono mniej wyników niż oczekiwano i to jest ostatnia strona, zaktualizuj całkowitą liczbę
			if (
				response.items.length < resultsPerPage &&
				currentPage * resultsPerPage >= response.totalItems
			) {
				const adjustedTotal =
					(currentPage - 1) * resultsPerPage + response.items.length;
				// Aktualizujemy tylko jeśli rzeczywista liczba jest mniejsza
				if (adjustedTotal < response.totalItems) {
					setTotalResults(adjustedTotal);
				}
			}

			// Jeśli jesteśmy na stronie, która nie powinna istnieć (zero wyników), wróć do strony 1
			if (response.items.length === 0 && currentPage > 1) {
				setCurrentPage(1);
				setSearchParams({
					q: query,
					lang: language,
					page: '1',
				});
			}
		} catch (error) {
			console.error('Błąd wyszukiwania książek:', error);
			setError('Wystąpił błąd podczas wyszukiwania. Spróbuj ponownie.');
		} finally {
			setIsLoading(false);
		}
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		// Scroll to top when changing pages
		window.scrollTo(0, 0);
	};

	const saveBookToLibrary = async (book: Book) => {
		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				alert('Musisz się zalogować, aby dodać książkę do biblioteki');
				return;
			}

			const { error } = await supabase.from('books').insert([
				{
					google_books_id: book.id,
					title: book.title,
					authors: book.authors,
					description: book.description,
					published_date: book.publishedDate,
					thumbnail: book.imageLinks?.thumbnail,
					publisher: book.publisher,
					user_id: session.user.id,
				},
			]);

			if (error) throw error;

			alert('Książka została dodana do twojej biblioteki!');
		} catch (error) {
			console.error('Błąd zapisywania książki:', error);
			alert('Wystąpił błąd podczas zapisywania książki.');
		}
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

					<div className='w-full md:w-36'>
						<select
							value={language}
							onChange={(e) => setLanguage(e.target.value)}
							className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
						>
							<option value='pl'>Polski</option>
							<option value='en'>Angielski</option>
							<option value='de'>Niemiecki</option>
							<option value='fr'>Francuski</option>
							<option value=''>Wszystkie</option>
						</select>
					</div>

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

			{books.length > 0 && (
				<div className='text-sm text-gray-600 mb-4'>
					Znaleziono {totalResults} wyników. Strona {currentPage} z{' '}
					{totalPages || 1}.
				</div>
			)}

			<BookList
				books={books}
				onSaveBook={saveBookToLibrary}
				showSaveButton={true}
				isLoading={isLoading}
			/>

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
