// src/components/BookList.tsx
import React from 'react';
import { Book } from '../types/book';
import BookCard from './BookCard';
import { HiOutlineBookOpen, HiOutlineSearch } from 'react-icons/hi';

interface BookListProps {
	books: Book[];
	onSaveBook?: (book: Book) => Promise<void>;
	onRemove?: (bookId: string) => void;
	showSaveButton?: boolean;
	showRemoveButton?: boolean;
	isLoading?: boolean;
	emptyMessage?: string;
	showEmptyState?: boolean;
}

const BookList: React.FC<BookListProps> = ({
	books,
	onSaveBook,
	onRemove,
	showSaveButton = false,
	showRemoveButton = false,
	isLoading = false,
	emptyMessage = 'Brak książek do wyświetlenia',
	showEmptyState = true,
}) => {
	if (isLoading) {
		return (
			<div className='flex justify-center items-center py-12'>
				<div
					className='inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]'
					role='status'
				>
					<span className='!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]'>
						Ładowanie...
					</span>
				</div>
			</div>
		);
	}

	if (books.length === 0 && showEmptyState) {
		return (
			<div className='text-center py-12 bg-white rounded-lg shadow'>
				<div className='flex justify-center mb-4'>
					{window.location.pathname.includes('/search') ? (
						<HiOutlineSearch className='w-16 h-16 text-gray-400' />
					) : (
						<HiOutlineBookOpen className='w-16 h-16 text-gray-400' />
					)}
				</div>
				<p className='text-xl text-gray-500'>{emptyMessage}</p>
				{window.location.pathname.includes('/search') && (
					<p className='text-sm text-gray-400 mt-2'>
						Wprowadź frazę wyszukiwania, aby znaleźć książki
					</p>
				)}
			</div>
		);
	}

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
			{books.map((book) => (
				<BookCard
					key={book.id}
					book={book}
					onSave={
						showSaveButton && onSaveBook ? () => onSaveBook(book) : undefined
					}
					onRemove={
						showRemoveButton && onRemove ? () => onRemove(book.id) : undefined
					}
					showRemoveButton={showRemoveButton}
				/>
			))}
		</div>
	);
};

export default BookList;
