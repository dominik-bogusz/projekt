import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { useAuth } from '../context/AuthContext';
import BookList from '../components/BookList';
import { Book } from '../types/book';

const MyBooks: React.FC = () => {
	const [books, setBooks] = useState<Book[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { user } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!user) {
			navigate('/login');
			return;
		}

		const fetchBooks = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const { data, error } = await supabase
					.from('books')
					.select('*')
					.eq('user_id', user.id);

				if (error) throw error;

				const formattedBooks: Book[] = data.map((item) => ({
					id: item.google_books_id || item.id,
					title: item.title,
					authors: item.authors,
					description: item.description,
					publishedDate: item.published_date,
					imageLinks: item.thumbnail
						? { thumbnail: item.thumbnail }
						: undefined,
					publisher: item.publisher,
					isCustom: item.is_custom,
				}));

				setBooks(formattedBooks);
			} catch (err) {
				console.error('Error fetching books:', err);
				setError(
					'Wystąpił błąd podczas pobierania Twoich książek. Spróbuj ponownie.'
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchBooks();
	}, [user, navigate]);

	return (
		<div className='max-w-6xl mx-auto px-4'>
			<div className='flex justify-between items-center mb-6'>
				<h1 className='text-3xl font-bold'>Moja biblioteka</h1>
			</div>

			{error && (
				<div className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6'>
					<p>{error}</p>
				</div>
			)}

			<BookList books={books} isLoading={isLoading} />
		</div>
	);
};

export default MyBooks;
