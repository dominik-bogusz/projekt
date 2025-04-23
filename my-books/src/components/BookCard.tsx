// src/components/BookCard.tsx (zmodyfikowany)
import React, { useState } from 'react';
import { Book } from '../types/book';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabase';
import BookDetailsModal from './BookDetailsModal';
import ReadingStatusSelector from './ReadingStatusSelector';

interface BookCardProps {
	book: Book;
	onSave?: () => void;
	onRemove?: (bookId: string) => void;
	showRemoveButton?: boolean;
}

const BookCard: React.FC<BookCardProps> = ({
	book,
	onSave,
	onRemove,
	showRemoveButton = false,
}) => {
	const [showDetails, setShowDetails] = useState(false);
	const [imageError, setImageError] = useState(false);
	const { user } = useAuth();
	const defaultCover = 'https://via.placeholder.com/128x192?text=Brak+Okładki';

	const handleAddClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!user) {
			window.location.href = '/login';
		} else if (onSave) {
			onSave();
		}
	};

	const handleRemoveClick = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!user) return;

		if (window.confirm('Czy na pewno chcesz usunąć tę książkę z biblioteki?')) {
			try {
				// Znajdź rekord w bazie danych
				const { data, error: findError } = await supabase
					.from('books')
					.select('id')
					.eq('user_id', user.id)
					.or(`google_books_id.eq.${book.id},id.eq.${book.id}`)
					.single();

				if (findError) throw findError;

				if (data) {
					// Usuń rekord z bazy
					const { error: deleteError } = await supabase
						.from('books')
						.delete()
						.eq('id', data.id);

					if (deleteError) throw deleteError;

					// Usuń również status czytania
					await supabase
						.from('reading_status')
						.delete()
						.eq('user_id', user.id)
						.eq('book_id', data.id);

					if (onRemove) {
						onRemove(book.id);
					}
				}
			} catch (error) {
				console.error('Błąd podczas usuwania książki:', error);
				alert('Wystąpił błąd podczas usuwania książki.');
			}
		}
	};

	return (
		<>
			<div
				className='bg-white rounded-lg border border-gray-200 shadow-md h-full flex flex-col cursor-pointer hover:shadow-lg transition-shadow'
				onClick={() => setShowDetails(true)}
			>
				<div className='flex mb-4 p-4'>
					<div className='w-32 h-48 flex-shrink-0'>
						{!imageError ? (
							<img
								src={book.imageLinks?.thumbnail || defaultCover}
								alt={book.title}
								className='w-full h-full object-cover rounded'
								onError={(e) => {
									setImageError(true);
									e.currentTarget.src = defaultCover;
								}}
							/>
						) : (
							<div className='w-full h-full bg-gray-200 rounded flex items-center justify-center text-center p-2'>
								<span className='text-gray-500'>{book.title}</span>
							</div>
						)}
					</div>
					<div className='ml-4 flex-1'>
						<h5 className='text-xl font-bold tracking-tight text-gray-900'>
							{book.title}
						</h5>
						<p className='font-normal text-gray-700'>
							{book.authors ? book.authors.join(', ') : 'Nieznany autor'}
						</p>

						{book.publishedDate && (
							<span className='bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full mt-2 inline-block'>
								{book.publishedDate}
							</span>
						)}

						{book.averageRating && (
							<div className='mt-2 flex items-center'>
								<div className='flex items-center'>
									{[...Array(5)].map((_, i) => (
										<svg
											key={i}
											className={`w-4 h-4 ${
												i < Math.round(book.averageRating || 0)
													? 'text-yellow-300'
													: 'text-gray-300'
											}`}
											aria-hidden='true'
											xmlns='http://www.w3.org/2000/svg'
											fill='currentColor'
											viewBox='0 0 22 20'
										>
											<path d='M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z' />
										</svg>
									))}
									<p className='ml-2 text-sm font-medium text-gray-500'>
										{book.averageRating.toFixed(1)} / 5
									</p>
								</div>
							</div>
						)}
					</div>
				</div>

				{book.description ? (
					<p className='text-gray-700 flex-grow line-clamp-3 mb-4 px-4'>
						{book.description}
					</p>
				) : (
					<div className='flex-grow mb-4'></div>
				)}

				<div className='flex justify-between items-center p-4 border-t border-gray-200'>
					{onSave && (
						<button
							onClick={handleAddClick}
							className='inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300'
						>
							<svg
								className='w-5 h-5 mr-2'
								fill='currentColor'
								viewBox='0 0 20 20'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									fillRule='evenodd'
									d='M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z'
									clipRule='evenodd'
								/>
							</svg>
							Dodaj
						</button>
					)}

					{showRemoveButton && (
						<button
							onClick={handleRemoveClick}
							className='inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300'
						>
							<svg
								className='w-5 h-5 mr-2'
								fill='currentColor'
								viewBox='0 0 20 20'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									fillRule='evenodd'
									d='M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z'
									clipRule='evenodd'
								/>
							</svg>
							Usuń
						</button>
					)}

					<button
						onClick={(e) => {
							e.stopPropagation();
							setShowDetails(true);
						}}
						className='py-2 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200'
					>
						Szczegóły
					</button>
				</div>
			</div>

			{showDetails && (
				<BookDetailsModal book={book} onClose={() => setShowDetails(false)} />
			)}
		</>
	);
};

export default BookCard;
