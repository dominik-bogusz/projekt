// src/pages/MyBooks.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BookList from '../components/BookList';
import useBook from '../hooks/useBook';

const MyBooks: React.FC = () => {
	const { books, isLoading, error, fetchBooks, removeBook } = useBook();
	const { user } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!user) {
			navigate('/login');
			return;
		}

		fetchBooks();
	}, [user, navigate, fetchBooks]);

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

			<BookList
				books={books}
				isLoading={isLoading}
				showRemoveButton={true}
				onRemove={removeBook}
			/>
		</div>
	);
};

export default MyBooks;
