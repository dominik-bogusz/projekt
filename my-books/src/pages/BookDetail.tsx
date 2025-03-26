import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookById } from '../api/googleBooks';
import { supabase } from '../api/supabase';
import { useAuth } from '../context/AuthContext';
import { Book } from '../types/book';

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
			alert('Książka została dodana do Twojej biblioteki!');
		} catch (error) {
			console.error('Error saving book:', error);
			alert('Wystąpił błąd podczas zapisywania książki.');
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
			<div className='bg-white rounded-lg shadow-md p-6 md:p-8'>
				<div className='md:flex'>
					<div className='md:w-1/3 mb-6 md:mb-0'>
						<img
							src={book.imageLinks?.thumbnail || defaultCover}
							alt={`Okładka książki ${book.title}`}
							className='w-48 h-72 object-cover rounded mx-auto md:mx-0'
						/>

						{user && !isSaved && (
							<button
								onClick={handleSaveBook}
								className='mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition'
							>
								Dodaj do biblioteki
							</button>
						)}

						{isSaved && (
							<div className='mt-4 text-center md:text-left'>
								<span className='inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm'>
									W Twojej bibliotece
								</span>
							</div>
						)}
					</div>

					<div className='md:w-2/3 md:pl-8'>
						<h1 className='text-3xl font-bold mb-2'>{book.title}</h1>

						{book.authors && book.authors.length > 0 && (
							<p className='text-xl text-gray-600 mb-4'>
								{book.authors.join(', ')}
							</p>
						)}

						<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
							{book.publisher && (
								<div>
									<span className='text-gray-500'>Wydawca:</span>
									<p>{book.publisher}</p>
								</div>
							)}

							{book.publishedDate && (
								<div>
									<span className='text-gray-500'>Data wydania:</span>
									<p>{book.publishedDate}</p>
								</div>
							)}

							{book.pageCount && (
								<div>
									<span className='text-gray-500'>Liczba stron:</span>
									<p>{book.pageCount}</p>
								</div>
							)}

							{book.language && (
								<div>
									<span className='text-gray-500'>Język:</span>
									<p>{book.language.toUpperCase()}</p>
								</div>
							)}

							{book.averageRating && (
								<div>
									<span className='text-gray-500'>Ocena:</span>
									<p className='flex items-center'>
										<span className='text-yellow-500 mr-1'>★</span>
										{book.averageRating} / 5
									</p>
								</div>
							)}
						</div>

						{book.categories && book.categories.length > 0 && (
							<div className='mb-6'>
								<span className='text-gray-500'>Kategorie:</span>
								<div className='flex flex-wrap gap-2 mt-1'>
									{book.categories.map((category, index) => (
										<span
											key={index}
											className='bg-gray-100 px-2 py-1 rounded-full text-sm'
										>
											{category}
										</span>
									))}
								</div>
							</div>
						)}

						<div>
							<h2 className='text-xl font-semibold mb-2'>Opis</h2>
							<div
								className='text-gray-700'
								dangerouslySetInnerHTML={{
									__html: book.description || 'Brak opisu.',
								}}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BookDetail;
