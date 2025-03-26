import React from 'react';
import { Book } from '../types/book';
import BookCard from './BookCard';
import { Spinner } from 'flowbite-react';

interface BookListProps {
	books: Book[];
	onSaveBook?: (book: Book) => Promise<void>;
	showSaveButton?: boolean;
	isLoading?: boolean;
}

const BookList: React.FC<BookListProps> = ({
	books,
	onSaveBook,
	showSaveButton = false,
	isLoading = false,
}) => {
	if (isLoading) {
		return (
			<div className='flex justify-center items-center py-12'>
				<Spinner size='xl' />
			</div>
		);
	}

	if (books.length === 0) {
		return (
			<div className='text-center py-12'>
				<p className='text-xl text-gray-500'>Brak książek do wyświetlenia</p>
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
				/>
			))}
		</div>
	);
};

export default BookList;
