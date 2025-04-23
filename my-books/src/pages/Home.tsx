import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchBooks } from '../api/googleBooks';
import { Book } from '../types/book';

const Home: React.FC = () => {
	const [popularBooks, setPopularBooks] = useState<Book[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		fetchPopularBooks();
	}, []);

	const fetchPopularBooks = async () => {
		setIsLoading(true);
		try {
			const response = await searchBooks('bestseller', 6);

			if (response.items && response.items.length > 0) {
				const books: Book[] = response.items.map((item) => ({
					id: item.id,
					title: item.volumeInfo.title,
					authors: item.volumeInfo.authors,
					description: item.volumeInfo.description,
					publishedDate: item.volumeInfo.publishedDate,
					imageLinks: item.volumeInfo.imageLinks,
					publisher: item.volumeInfo.publisher,
				}));

				setPopularBooks(books);
			}
		} catch (error) {
			console.error('Błąd podczas pobierania książek:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='max-w-6xl mx-auto px-4'>
			<div className='py-12 md:py-24 text-center'>
				<h1 className='text-4xl md:text-6xl font-bold mb-6'>
					Witaj w My Books
				</h1>
				<p className='text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto'>
					Twoja osobista biblioteka, która pozwala zarządzać Twoją kolekcją
					książek, odkrywać nowe pozycje i śledzić swoje czytelnicze postępy.
				</p>
			</div>

			<div className='popular-books-section mb-12'>
				<h2 className='text-2xl font-bold mb-6 text-center'>
					Odkryj popularne książki
				</h2>

				{isLoading ? (
					<div className='flex justify-center my-12'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
					</div>
				) : (
					<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-12'>
						{popularBooks.map((book) => (
							<div
								key={book.id}
								className='bg-white rounded-lg border border-gray-200 shadow-md flex flex-col h-full overflow-hidden'
							>
								<div className='p-4 flex justify-center'>
									<img
										src={
											book.imageLinks?.thumbnail ||
											'https://via.placeholder.com/128x192?text=Brak+Okładki'
										}
										alt={book.title}
										className='h-48 object-contain'
									/>
								</div>
								<div className='p-4 flex-grow'>
									<h5 className='mb-2 text-lg font-bold tracking-tight text-gray-900 line-clamp-2'>
										{book.title}
									</h5>
									<p className='mb-3 font-normal text-gray-700 line-clamp-1'>
										{book.authors ? book.authors.join(', ') : 'Nieznany autor'}
									</p>
								</div>
								<div className='p-4 border-t'>
									<Link
										to={`/book/${book.id}`}
										className='inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300'
									>
										Zobacz więcej
										<svg
											className='rtl:rotate-180 w-3.5 h-3.5 ms-2'
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
									</Link>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default Home;
