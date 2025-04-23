import React, { useState, useRef, useEffect } from 'react';
import { Book } from '../types/book';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabase';
import ReadingStatusSelector from './ReadingStatusSelector';

interface BookDetailsModalProps {
	book: Book;
	onClose: () => void;
}

const BookDetailsModal: React.FC<BookDetailsModalProps> = ({
	book,
	onClose,
}) => {
	const { user } = useAuth();
	const [imageError, setImageError] = useState(false);
	const modalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				modalRef.current &&
				!modalRef.current.contains(event.target as Node)
			) {
				onClose();
			}
		};

		const handleEscKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose();
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		document.addEventListener('keydown', handleEscKey);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('keydown', handleEscKey);
		};
	}, [onClose]);

	const saveBookToLibrary = async () => {
		if (!user) {
			window.location.href = '/login';
			return;
		}

		try {
			const { data: existingBook, error: checkError } = await supabase
				.from('books')
				.select('id')
				.eq('user_id', user.id)
				.or(`google_books_id.eq.${book.id},id.eq.${book.id}`)
				.maybeSingle();

			if (checkError) throw checkError;

			if (existingBook) {
				// Ciche powiadomienie zamiast alert
				const notification = document.createElement('div');
				notification.className =
					'fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded shadow-lg';
				notification.textContent = 'Ta książka jest już w Twojej bibliotece!';
				document.body.appendChild(notification);

				setTimeout(() => {
					document.body.removeChild(notification);
				}, 3000);

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
					user_id: user.id,
				},
			]);

			if (error) throw error;

			// Ciche powiadomienie zamiast alert
			const notification = document.createElement('div');
			notification.className =
				'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg';
			notification.textContent = 'Książka została dodana do Twojej biblioteki!';
			document.body.appendChild(notification);

			setTimeout(() => {
				document.body.removeChild(notification);
			}, 3000);

			setIsSaved(true);
		} catch (error) {
			console.error('Error saving book:', error);
			alert('Wystąpił błąd podczas zapisywania książki.');
		}
	};

	const removeBookFromLibrary = async () => {
		if (!user) return;

		if (window.confirm('Czy na pewno chcesz usunąć tę książkę z biblioteki?')) {
			try {
				const { data, error: findError } = await supabase
					.from('books')
					.select('id')
					.eq('user_id', user.id)
					.or(`google_books_id.eq.${book.id},id.eq.${book.id}`)
					.single();

				if (findError) throw findError;

				if (data) {
					const { error: deleteError } = await supabase
						.from('books')
						.delete()
						.eq('id', data.id);

					if (deleteError) throw deleteError;
					await supabase
						.from('reading_status')
						.delete()
						.eq('user_id', user.id)
						.eq('book_id', data.id);

					// Ciche powiadomienie zamiast alert
					const notification = document.createElement('div');
					notification.className =
						'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg';
					notification.textContent = 'Książka została usunięta z biblioteki.';
					document.body.appendChild(notification);

					setTimeout(() => {
						document.body.removeChild(notification);
					}, 3000);

					onClose();
				}
			} catch (error) {
				console.error('Błąd podczas usuwania książki:', error);
				alert('Wystąpił błąd podczas usuwania książki.');
			}
		}
	};
	const [isInLibrary, setIsSaved] = React.useState(false);

	React.useEffect(() => {
		const checkIfInLibrary = async () => {
			if (!user) return;

			try {
				const { data, error } = await supabase
					.from('books')
					.select('id')
					.eq('user_id', user.id)
					.or(`google_books_id.eq.${book.id},id.eq.${book.id}`)
					.maybeSingle();

				if (!error) {
					setIsSaved(!!data);
				}
			} catch (error) {
				console.error('Błąd sprawdzania biblioteki:', error);
			}
		};

		checkIfInLibrary();
	}, [book.id, user]);

	return (
		<div className='fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4'>
			<div
				ref={modalRef}
				className='relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'
			>
				<div className='flex justify-between items-center p-4 border-b'>
					<h3 className='text-xl font-semibold text-gray-900'>{book.title}</h3>
					<button
						onClick={onClose}
						className='text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5'
						aria-label='Zamknij'
					>
						<svg
							className='w-5 h-5'
							fill='currentColor'
							viewBox='0 0 20 20'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								fillRule='evenodd'
								d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
								clipRule='evenodd'
							></path>
						</svg>
					</button>
				</div>

				<div className='p-6'>
					<div className='md:flex'>
						<div className='md:w-1/3 mb-6 md:mb-0 flex flex-col items-center'>
							<div className='w-48 h-72 bg-gray-100 rounded flex items-center justify-center overflow-hidden'>
								{!imageError && book.imageLinks?.thumbnail ? (
									<img
										src={book.imageLinks.thumbnail}
										alt={book.title}
										className='w-full h-full object-cover'
										onError={() => setImageError(true)}
									/>
								) : (
									<div className='text-center p-4 text-gray-500'>
										<svg
											className='mx-auto h-12 w-12 text-gray-400'
											xmlns='http://www.w3.org/2000/svg'
											fill='none'
											viewBox='0 0 24 24'
											stroke='currentColor'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M12 6v6m0 0v6m0-6h6m-6 0H6'
											/>
										</svg>
										<p className='mt-2 text-sm'>{book.title}</p>
									</div>
								)}
							</div>

							{user && (
								<>
									{isInLibrary ? (
										<>
											<div className='mt-4 text-center'>
												<span className='bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full'>
													W Twojej bibliotece
												</span>
											</div>
											<button
												onClick={removeBookFromLibrary}
												className='mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700'
											>
												<svg
													className='w-4 h-4 mr-2'
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
												Usuń z biblioteki
											</button>
										</>
									) : (
										<button
											onClick={saveBookToLibrary}
											className='mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700'
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
											Dodaj do biblioteki
										</button>
									)}

									{isInLibrary && <ReadingStatusSelector bookId={book.id} />}
								</>
							)}
						</div>

						<div className='md:w-2/3 md:pl-8'>
							<div className='mb-4'>
								<span className='text-lg font-medium'>Autor:</span>{' '}
								<span className='text-gray-700'>
									{book.authors ? book.authors.join(', ') : 'Nieznany autor'}
								</span>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
								{book.publisher && (
									<div>
										<span className='font-medium'>Wydawca:</span>
										<p className='text-gray-700'>{book.publisher}</p>
									</div>
								)}

								{book.publishedDate && (
									<div>
										<span className='font-medium'>Data wydania:</span>
										<p className='text-gray-700'>{book.publishedDate}</p>
									</div>
								)}

								{book.pageCount && (
									<div>
										<span className='font-medium'>Liczba stron:</span>
										<p className='text-gray-700'>{book.pageCount}</p>
									</div>
								)}

								{book.language && (
									<div>
										<span className='font-medium'>Język:</span>
										<p className='text-gray-700'>
											{book.language.toUpperCase()}
										</p>
									</div>
								)}
							</div>

							{book.averageRating && (
								<div className='mb-4'>
									<span className='font-medium'>Ocena:</span>
									<div className='mt-1 flex items-center'>
										{[...Array(5)].map((_, i) => (
											<svg
												key={i}
												className={`w-5 h-5 ${
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

							{book.categories && book.categories.length > 0 && (
								<div className='mb-4'>
									<span className='font-medium'>Kategorie:</span>
									<div className='flex flex-wrap gap-2 mt-1'>
										{book.categories.map((category, index) => (
											<span
												key={index}
												className='bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full'
											>
												{category}
											</span>
										))}
									</div>
								</div>
							)}

							{book.description && (
								<div>
									<h3 className='text-lg font-medium mb-2'>Opis</h3>
									<div
										className='text-gray-700'
										dangerouslySetInnerHTML={{ __html: book.description }}
									/>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BookDetailsModal;
