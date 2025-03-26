import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchBooks } from '../api/googleBooks';
import { supabase } from '../api/supabase';
import BookList from '../components/BookList';
import { Book, GoogleBookResponse } from '../types/book';
import { TextInput, Button, Select, Spinner, Alert } from 'flowbite-react';
import { HiSearch, HiExclamation } from 'react-icons/hi';

const Search: React.FC = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const initialQuery = searchParams.get('q') || '';
	const initialLanguage = searchParams.get('lang') || 'pl';

	const [query, setQuery] = useState(initialQuery);
	const [books, setBooks] = useState<Book[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [language, setLanguage] = useState(initialLanguage);

	// Wykonaj wyszukiwanie automatycznie, jeśli query jest w URL
	useEffect(() => {
		if (initialQuery) {
			handleSearch(new Event('submit') as React.FormEvent<HTMLFormElement>);
		}
	}, []);

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!query.trim()) return;

		setIsLoading(true);
		setError(null);

		// Aktualizuj parametry URL
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

			// Przekształcenie danych z Google Books API do naszego formatu
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

			// Sortowanie - książki z okładkami na początku
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
			// Sprawdzamy, czy użytkownik jest zalogowany
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				alert('Musisz się zalogować, aby dodać książkę do biblioteki');
				return;
			}

			// Dodajemy książkę do bazy danych
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
					<div className='flex-grow'>
						<TextInput
							type='text'
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder='Tytuł, autor, ISBN...'
							icon={HiSearch}
							required
						/>
					</div>

					<div className='w-full md:w-36'>
						<Select
							value={language}
							onChange={(e) => setLanguage(e.target.value)}
						>
							<option value='pl'>Polski</option>
							<option value='en'>Angielski</option>
							<option value='de'>Niemiecki</option>
							<option value='fr'>Francuski</option>
							<option value=''>Wszystkie</option>
						</Select>
					</div>

					<div>
						<Button type='submit' disabled={isLoading}>
							{isLoading ? (
								<>
									<div className='mr-2'>
										<Spinner size='sm' />
									</div>
									Szukam...
								</>
							) : (
								'Szukaj'
							)}
						</Button>
					</div>
				</div>
			</form>

			{error && (
				<Alert color='failure' icon={HiExclamation} className='mb-6'>
					{error}
				</Alert>
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
