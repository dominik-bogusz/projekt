import React, { useState } from 'react';
import { Book } from '../types/book';
import { useAuth } from '../context/AuthContext';
import BookDetailsModal from './BookDetailsModal';
import LoginModal from './LoginModal';
import { Card, Button, Badge, Rating } from 'flowbite-react';

interface BookCardProps {
	book: Book;
	onSave?: () => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onSave }) => {
	const [showDetails, setShowDetails] = useState(false);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const { user } = useAuth();
	const defaultCover = 'https://via.placeholder.com/128x192?text=Brak+Okładki';

	const handleAddClick = () => {
		if (!user) {
			setShowLoginModal(true);
		} else if (onSave) {
			onSave();
		}
	};

	const handleLoginSuccess = () => {
		if (onSave) {
			onSave();
		}
	};

	return (
		<>
			<Card className='h-full'>
				<div className='flex flex-col h-full'>
					<div className='flex mb-4'>
						<img
							src={book.imageLinks?.thumbnail || defaultCover}
							alt={book.title}
							className='w-32 h-48 object-cover rounded'
							onError={(e) => {
								e.currentTarget.src = defaultCover;
							}}
						/>
						<div className='ml-4 flex-1'>
							<h5 className='text-xl font-bold tracking-tight text-gray-900 dark:text-white'>
								{book.title}
							</h5>
							<p className='font-normal text-gray-700 dark:text-gray-400'>
								{book.authors ? book.authors.join(', ') : 'Nieznany autor'}
							</p>

							{book.publishedDate && (
								<Badge color='gray' className='mt-2'>
									{book.publishedDate}
								</Badge>
							)}

							{book.averageRating && (
								<div className='mt-2'>
									<Rating>
										<Rating.Star filled={book.averageRating >= 1} />
										<Rating.Star filled={book.averageRating >= 2} />
										<Rating.Star filled={book.averageRating >= 3} />
										<Rating.Star filled={book.averageRating >= 4} />
										<Rating.Star filled={book.averageRating >= 5} />
										<p className='ml-2 text-sm font-medium text-gray-500 dark:text-gray-400'>
											{book.averageRating.toFixed(1)} / 5
										</p>
									</Rating>
								</div>
							)}
						</div>
					</div>

					{book.description ? (
						<p className='text-gray-700 dark:text-gray-400 flex-grow line-clamp-3 mb-4'>
							{book.description}
						</p>
					) : (
						<div className='flex-grow mb-4'></div>
					)}

					<div className='flex justify-between items-center'>
						{onSave && (
							<Button color='blue' onClick={handleAddClick} size='sm'>
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
							</Button>
						)}

						<Button
							color='light'
							onClick={() => setShowDetails(true)}
							size='sm'
						>
							Szczegóły
						</Button>
					</div>
				</div>
			</Card>

			{showDetails && (
				<BookDetailsModal book={book} onClose={() => setShowDetails(false)} />
			)}

			{showLoginModal && (
				<LoginModal
					onClose={() => setShowLoginModal(false)}
					onSuccess={handleLoginSuccess}
				/>
			)}
		</>
	);
};

export default BookCard;
