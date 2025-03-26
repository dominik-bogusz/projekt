import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchBooks } from '../api/googleBooks';
import { supabase } from '../api/supabase';
import BookList from '../components/BookList';
import { Book, GoogleBookResponse } from '../types/book';

const Search: React.FC = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const initialQuery = searchParams.get('q') || '';
	const initialLanguage = searchParams.get('lang') || 'pl';

	const [query, setQuery] = useState(initialQuery);
	const [books, setBooks] = useState<Book[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [language, setLanguage] = useState(initialLanguage);

	useEffect(() => {
		if (initialQuery) {
			handleSearchWithoutEvent();
		}
	}, []);

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		handleSearchWithoutEvent();
	};

	const handleSearchWithoutEvent = async () => {
		if (!query.trim()) return;

		setIsLoading(true);
		setError(null);

		setSearchParams({ q: query, lang: language });

		try {
			const response: GoogleBookResponse = await searchBooks(
				query,
				20,
				0,
				language
			);

			if (!response.items || response.items.length === 0) {
				setBooks([]);
				setIsLoading(false);
				return;
			}

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
		} catch (error) {
			console.error('Błąd wyszukiwania książek:', error);
			setError('Wystąpił błąd podczas wyszukiwania. Spróbuj ponownie.');
		} finally {
			setIsLoading(false);
		}
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
		<div className='max-w-6xl mx-auto px-4'>
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
							className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center'
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

			<BookList
				books={books}
				onSaveBook={saveBookToLibrary}
				showSaveButton={true}
				isLoading={isLoading}
			/>
		</div>
	);
};

export default Search;
