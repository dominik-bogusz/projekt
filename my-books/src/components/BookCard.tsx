import React, { useState } from 'react';
import { Book } from '../types/book';
import { useAuth } from '../context/AuthContext';
import BookDetailsModal from './BookDetailsModal';
import useToast from '../hooks/useToast';
import { getBookCoverUrl } from '../utils/helpers';
import Button from './ui/Button';
import Card from './ui/Card';
import Modal from './ui/Modal';
import {
	HiOutlinePlus,
	HiOutlineTrash,
	HiOutlineInformationCircle,
} from 'react-icons/hi';

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
	const [isDeleting, setIsDeleting] = useState(false);
	const { user } = useAuth();
	const toast = useToast();
	const defaultCover = 'https://via.placeholder.com/128x192?text=Brak+Okładki';

	const handleAddClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		if (!user) {
			window.location.href = '/login';
		} else if (onSave) {
			onSave();
		}
	};

	const handleRemoveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		if (!user) return;
		setIsDeleting(true);
	};

	const handleDetailsClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		setShowDetails(true);
	};

	const confirmDeletion = async () => {
		if (!user) return;

		try {
			if (onRemove) {
				onRemove(book.id);
			}
			toast.success('Książka została pomyślnie usunięta z biblioteki');
		} catch (error) {
			console.error('Błąd podczas usuwania książki:', error);
			toast.error('Wystąpił błąd podczas usuwania książki. Spróbuj ponownie.');
		} finally {
			setIsDeleting(false);
		}
	};

	const cancelDeletion = () => {
		setIsDeleting(false);
	};

	return (
		<>
			<Card
				className='h-full flex flex-col cursor-pointer hover:shadow-lg transition-shadow'
				onClick={() => setShowDetails(true)}
			>
				<div className='flex mb-4 p-4'>
					<div className='w-32 h-48 flex-shrink-0'>
						{!imageError ? (
							<img
								src={getBookCoverUrl(book)}
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
						<Button
							onClick={handleAddClick}
							variant='primary'
							icon={<HiOutlinePlus />}
						>
							Dodaj
						</Button>
					)}

					{showRemoveButton && (
						<Button
							onClick={handleRemoveClick}
							variant='danger'
							icon={<HiOutlineTrash />}
						>
							Usuń
						</Button>
					)}

					<Button
						onClick={handleDetailsClick}
						variant='secondary'
						icon={<HiOutlineInformationCircle />}
					>
						Szczegóły
					</Button>
				</div>
			</Card>

			{showDetails && (
				<BookDetailsModal book={book} onClose={() => setShowDetails(false)} />
			)}

			<Modal
				isOpen={isDeleting}
				onClose={cancelDeletion}
				title='Potwierdź usunięcie'
			>
				<p className='mb-6'>
					Czy na pewno chcesz usunąć książkę "{book.title}" z biblioteki?
				</p>
				<div className='flex justify-end gap-3'>
					<Button variant='secondary' onClick={cancelDeletion}>
						Anuluj
					</Button>
					<Button variant='danger' onClick={confirmDeletion}>
						Usuń
					</Button>
				</div>
			</Modal>
		</>
	);
};

export default BookCard;
