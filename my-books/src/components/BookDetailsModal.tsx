import React, { useState } from 'react';
import { Book } from '../types/book';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabase';
import LoginModal from './LoginModal';
import { Modal, Button, Badge, Rating } from 'flowbite-react';

interface BookDetailsModalProps {
	book: Book;
	onClose: () => void;
}

const BookDetailsModal: React.FC<BookDetailsModalProps> = ({
	book,
	onClose,
}) => {
	const [showLoginModal, setShowLoginModal] = useState(false);
	const { user } = useAuth();
	const defaultCover = 'https://via.placeholder.com/128x192?text=Brak+Okładki';

	const saveBookToLibrary = async () => {
		if (!user) {
			setShowLoginModal(true);
			return;
		}

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

			alert('Książka została dodana do twojej biblioteki!');
		} catch (error) {
			console.error('Błąd zapisywania książki:', error);
			alert('Wystąpił błąd podczas zapisywania książki.');
		}
	};

	return (
		<>
			<Modal show={true} onClose={onClose} size='4xl'>
				<Modal.Header>{book.title}</Modal.Header>
				<Modal.Body>
					<div className='md:flex'>
						<div className='md:w-1/3 mb-6 md:mb-0 flex flex-col items-center'>
							<img
								src={book.imageLinks?.thumbnail || defaultCover}
								alt={book.title}
								className='w-48 h-72 object-cover rounded'
								onError={(e) => {
									e.currentTarget.src = defaultCover;
								}}
							/>

							<Button color='blue' className='mt-4' onClick={saveBookToLibrary}>
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
							</Button>
						</div>

						<div className='md:w-2/3 md:pl-8'>
							<div className='mb-2'>
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
									<div className='mt-1'>
										<Rating>
											<Rating.Star filled={book.averageRating >= 1} />
											<Rating.Star filled={book.averageRating >= 2} />
											<Rating.Star filled={book.averageRating >= 3} />
											<Rating.Star filled={book.averageRating >= 4} />
											<Rating.Star filled={book.averageRating >= 5} />
											<p className='ml-2 text-sm font-medium text-gray-500'>
												{book.averageRating.toFixed(1)} / 5
											</p>
										</Rating>
									</div>
								</div>
							)}

							{book.categories && book.categories.length > 0 && (
								<div className='mb-4'>
									<span className='font-medium'>Kategorie:</span>
									<div className='flex flex-wrap gap-2 mt-1'>
										{book.categories.map((category, index) => (
											<Badge key={index} color='info'>
												{category}
											</Badge>
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
				</Modal.Body>
			</Modal>

			{showLoginModal && (
				<LoginModal
					onClose={() => setShowLoginModal(false)}
					onSuccess={saveBookToLibrary}
				/>
			)}
		</>
	);
};

export default BookDetailsModal;
