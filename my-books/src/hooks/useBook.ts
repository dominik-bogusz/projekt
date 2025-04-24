// src/hooks/useBook.ts
import { useState, useCallback } from 'react';
import { bookClient } from '../api/client';
import { Book } from '../types/book';
import { useAuth } from '../context/AuthContext';
import useToast from './useToast';

interface UseBookReturn {
	books: Book[];
	isLoading: boolean;
	error: string | null;
	fetchBooks: () => Promise<void>;
	saveBook: (book: Book) => Promise<boolean>;
	removeBook: (bookId: string) => Promise<boolean>;
}

/**
 * Hook for managing books in the user's library
 */
const useBook = (): UseBookReturn => {
	const [books, setBooks] = useState<Book[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { user } = useAuth();
	const toast = useToast();

	const fetchBooks = useCallback(async () => {
		if (!user) return;

		setIsLoading(true);
		setError(null);

		try {
			const fetchedBooks = await bookClient.getBooks(user.id);
			setBooks(fetchedBooks);
		} catch (err) {
			console.error('Error fetching books:', err);
			setError('Wystąpił błąd podczas pobierania książek. Spróbuj ponownie.');
		} finally {
			setIsLoading(false);
		}
	}, [user]);

	const saveBook = useCallback(
		async (book: Book): Promise<boolean> => {
			if (!user) {
				toast.error('Musisz się zalogować, aby dodać książkę do biblioteki');
				return false;
			}

			try {
				const result = await bookClient.saveBook(book, user.id);

				if (result) {
					toast.success('Książka została dodana do Twojej biblioteki!');
					// Refresh books list
					fetchBooks();
					return true;
				} else {
					toast.warning('Ta książka jest już w Twojej bibliotece!');
					return false;
				}
			} catch (err) {
				console.error('Error saving book:', err);
				toast.error('Wystąpił błąd podczas zapisywania książki.');
				return false;
			}
		},
		[user, fetchBooks, toast]
	);

	const removeBook = useCallback(
		async (bookId: string): Promise<boolean> => {
			if (!user) return false;

			try {
				const result = await bookClient.removeBook(bookId, user.id);

				if (result) {
					toast.success('Książka została usunięta z biblioteki.');
					// Update local state
					setBooks(books.filter((book) => book.id !== bookId));
					return true;
				} else {
					toast.error('Nie znaleziono książki w bazie danych.');
					return false;
				}
			} catch (err) {
				console.error('Error removing book:', err);
				toast.error('Wystąpił błąd podczas usuwania książki.');
				return false;
			}
		},
		[user, books, toast]
	);

	return {
		books,
		isLoading,
		error,
		fetchBooks,
		saveBook,
		removeBook,
	};
};

export default useBook;
