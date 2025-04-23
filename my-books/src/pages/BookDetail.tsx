import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBookById } from '../api/googleBooks';
import { supabase } from '../api/supabase';
import { useAuth } from '../context/AuthContext';
import { Book } from '../types/book';
import ReadingStatusSelector from '../components/ReadingStatusSelector';
import {
	HiOutlineArrowLeft,
	HiOutlineSave,
	HiOutlineTrash,
	HiStar,
} from 'react-icons/hi';

const BookDetail: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const [book, setBook] = useState<Book | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isSaved, setIsSaved] = useState(false);
	const { user } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		const checkIfSaved = async () => {
			if (!user || !id) return;

			try {
				const { data } = await supabase
					.from('books')
					.select('id')
					.eq('google_books_id', id)
					.eq('user_id', user.id)
					.maybeSingle();

				setIsSaved(!!data);
			} catch (error) {
				console.error('Error checking if book is saved:', error);
			}
		};

		checkIfSaved();
	}, [id, user]);

	useEffect(() => {
		const fetchBookDetails = async () => {
			if (!id) return;

			setIsLoading(true);
			setError(null);

			try {
				if (id.startsWith('custom_')) {
					const { data, error } = await supabase
						.from('books')
						.select('*')
						.eq('id', id)
						.single();

					if (error) throw error;

					if (data) {
						setBook({
							id: data.id,
							title: data.title,
							authors: data.authors,
							description: data.description,
							publishedDate: data.published_date,
							imageLinks: data.thumbnail
								? { thumbnail: data.thumbnail }
								: undefined,
							publisher: data.publisher,
							isCustom: data.is_custom,
						});
						setIsLoading(false);
						return;
					}
				}

				const bookData = await getBookById(id);
				const volumeInfo = bookData.volumeInfo;

				setBook({
					id: bookData.id,
					title: volumeInfo.title,
					authors: volumeInfo.authors,
					description: volumeInfo.description,
					publishedDate: volumeInfo.publishedDate,
					pageCount: volumeInfo.pageCount,
					categories: volumeInfo.categories,
					imageLinks: volumeInfo.imageLinks,
					language: volumeInfo.language,
					averageRating: volumeInfo.averageRating,
					publisher: volumeInfo.publisher,
				});
			} catch (err) {
				console.error('Error fetching book details:', err);
				setError('Nie udało się pobrać szczegółów książki. Spróbuj ponownie.');
			} finally {
				setIsLoading(false);
			}
		};

		fetchBookDetails();
	}, [id]);

	const handleSaveBook = async () => {
		if (!user) {
			navigate('/login');
			return;
		}

		if (!book) return;

		try {
			const { error } = await supabase.from('books').insert([
				{
					google_books_id: book.id,
					title: book.title,
					authors: book.authors,
					description: book.description,
					published_date: book.publishedDate,
					thumbnail: book.imageLinks?.thumbnail,
					publisher: book.publisher,
					user_id: user.id,
				},
			]);

			if (error) throw error;

			setIsSaved(true);

			// Powiadomienie (notification toast)
			const notification = document.createElement('div');
			notification.className =
				'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
			notification.textContent = 'Książka została dodana do Twojej biblioteki!';
			document.body.appendChild(notification);

			setTimeout(() => {
				document.body.removeChild(notification);
			}, 3000);
		} catch (error) {
			console.error('Error saving book:', error);
			alert('Wystąpił błąd podczas zapisywania książki.');
		}
	};

	const handleRemoveBook = async () => {
		if (!user || !book) return;

		if (window.confirm('Czy na pewno chcesz usunąć tę książkę z biblioteki?')) {
			try {
				const { data: bookData, error: findError } = await supabase
					.from('books')
					.select('id')
					.eq('user_id', user.id)
					.or(`google_books_id.eq.${book.id},id.eq.${book.id}`)
					.single();

				if (findError) throw findError;

				if (!bookData) {
					alert('Książka nie znaleziona w bazie danych.');
					return;
				}

				const bookId = bookData.id;

				const { error: statusError } = await supabase
					.from('reading_status')
					.delete()
					.eq('user_id', user.id)
					.eq('book_id', bookId);

				if (statusError) {
					console.error('Błąd podczas usuwania statusu czytania:', statusError);
				}

				const { error: deleteError } = await supabase
					.from('books')
					.delete()
					.eq('id', bookId)
					.eq('user_id', user.id);

				if (deleteError) throw deleteError;

				setIsSaved(false);

				// Powiadomienie (notification toast)
				const notification = document.createElement('div');
				notification.className =
					'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
				notification.textContent = 'Książka została usunięta z biblioteki.';
				document.body.appendChild(notification);

				setTimeout(() => {
					document.body.removeChild(notification);
				}, 3000);
			} catch (error) {
				console.error('Błąd podczas usuwania książki:', error);
				alert('Wystąpił błąd podczas usuwania książki. Spróbuj ponownie.');
			}
		}
	};

	if (isLoading) {
		return (
			<div className='max-w-6xl mx-auto px-4 py-12 flex justify-center'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
			</div>
		);
	}

	if (error || !book) {
		return (
			<div className='max-w-6xl mx-auto px-4 py-12'>
				<div className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4'>
					<p>{error || 'Nie znaleziono książki.'}</p>
				</div>
			</div>
		);
	}

	const defaultCover = 'https://via.placeholder.com/128x192?text=No+Cover';

	return (
		<div className='max-w-6xl mx-auto px-4 py-8'>
			<div className='mb-4'>
				<button
					onClick={() => navigate(-1)}
					className='inline-flex items-center text-blue-600 hover:text-blue-800'
				>
					<HiOutlineArrowLeft className='mr-1' /> Powrót
				</button>
			</div>

			<div className='bg-white rounded-lg shadow-md overflow-hidden'>
				<div className='bg-gray-50 p-6 border-b'>
					<h1 className='text-3xl font-bold text-center'>{book.title}</h1>
					{book.authors && book.authors.length > 0 && (
						<p className='text-xl text-gray-600 mt-2 text-center'>
							{book.authors.join(', ')}
						</p>
					)}
				</div>

				<div className='p-6 md:p-8'>
					<div className='md:flex'>
						<div className='md:w-1/3 mb-6 md:mb-0 flex flex-col items-center'>
							<img
								src={book.imageLinks?.thumbnail || defaultCover}
								alt={`Okładka książki ${book.title}`}
								className='w-48 h-72 object-cover rounded shadow-md'
							/>

							<div className='mt-6 w-48'>
								{book.averageRating && (
									<div className='flex items-center justify-center mb-4'>
										{[...Array(5)].map((_, i) => (
											<HiStar
												key={i}
												className={`w-6 h-6 ${
													i < Math.round(book.averageRating || 0)
														? 'text-yellow-400'
														: 'text-gray-300'
												}`}
											/>
										))}
										<span className='ml-2 font-medium'>
											{book.averageRating.toFixed(1)}
										</span>
									</div>
								)}

								{user && !isSaved ? (
									<button
										onClick={handleSaveBook}
										className='w-full bg-blue-600 text-white py-2 rounded flex items-center justify-center hover:bg-blue-700 transition'
									>
										<HiOutlineSave className='mr-2' />
										Dodaj do biblioteki
									</button>
								) : isSaved ? (
									<>
										<div className='text-center mb-3'>
											<span className='inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm'>
												W Twojej bibliotece
											</span>
										</div>
										<button
											onClick={handleRemoveBook}
											className='w-full bg-red-600 text-white py-2 rounded flex items-center justify-center hover:bg-red-700 transition'
										>
											<HiOutlineTrash className='mr-2' />
											Usuń z biblioteki
										</button>
									</>
								) : null}

								{isSaved && <ReadingStatusSelector bookId={book.id} />}

								<Link
									to={`/book/${book.id}/reviews`}
									className='mt-4 w-full bg-purple-600 text-white py-2 rounded text-center block hover:bg-purple-700 transition'
								>
									Zobacz recenzje
								</Link>
							</div>
						</div>

						<div className='md:w-2/3 md:pl-8'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg'>
								{book.publisher && (
									<div>
										<span className='text-gray-500 font-medium'>Wydawca:</span>
										<p>{book.publisher}</p>
									</div>
								)}

								{book.publishedDate && (
									<div>
										<span className='text-gray-500 font-medium'>
											Data wydania:
										</span>
										<p>{book.publishedDate}</p>
									</div>
								)}

								{book.pageCount && (
									<div>
										<span className='text-gray-500 font-medium'>
											Liczba stron:
										</span>
										<p>{book.pageCount}</p>
									</div>
								)}

								{book.language && (
									<div>
										<span className='text-gray-500 font-medium'>Język:</span>
										<p>{book.language.toUpperCase()}</p>
									</div>
								)}
							</div>

							{book.categories && book.categories.length > 0 && (
								<div className='mb-6'>
									<span className='text-gray-700 font-medium'>Kategorie:</span>
									<div className='flex flex-wrap gap-2 mt-2'>
										{book.categories.map((category, index) => (
											<span
												key={index}
												className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm'
											>
												{category}
											</span>
										))}
									</div>
								</div>
							)}

							<div>
								<h2 className='text-xl font-semibold mb-3 border-b pb-2'>
									Opis
								</h2>
								<div
									className='text-gray-700 prose max-w-none'
									dangerouslySetInnerHTML={{
										__html: book.description || 'Brak opisu.',
									}}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BookDetail;
