// src/hooks/useReadingStatus.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../api/supabase';
import { useAuth } from '../context/AuthContext';
import useToast from './useToast';

type ReadingStatus = 'want_to_read' | 'currently_reading' | 'read' | '';

interface UseReadingStatusReturn {
	status: ReadingStatus;
	isLoading: boolean;
	updateStatus: (newStatus: ReadingStatus) => Promise<void>;
}

/**
 * Hook for managing reading status of a book
 */
const useReadingStatus = (bookId: string): UseReadingStatusReturn => {
	const [status, setStatus] = useState<ReadingStatus>('');
	const [dbBookId, setDbBookId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const { user } = useAuth();
	const toast = useToast();

	// Fetch the current reading status
	useEffect(() => {
		if (!user || !bookId) {
			setIsLoading(false);
			return;
		}

		const fetchStatus = async () => {
			try {
				// First find the actual database ID for this book (could be Google Books ID or custom ID)
				const { data: bookData, error: bookError } = await supabase
					.from('books')
					.select('id')
					.or(`google_books_id.eq.${bookId},id.eq.${bookId}`)
					.eq('user_id', user.id)
					.maybeSingle();

				if (bookError && bookError.code !== 'PGRST116') {
					console.error('Błąd podczas pobierania książki:', bookError);
					return;
				}

				if (!bookData) {
					console.warn('Książka nie znaleziona w bazie danych');
					setIsLoading(false);
					return;
				}

				setDbBookId(bookData.id);

				const { data, error } = await supabase
					.from('reading_status')
					.select('status')
					.eq('user_id', user.id)
					.eq('book_id', bookData.id)
					.maybeSingle();

				if (error && error.code !== 'PGRST116') {
					console.error('Błąd podczas pobierania statusu czytania:', error);
					return;
				}

				if (data) {
					setStatus(data.status as ReadingStatus);
				}
			} catch (error) {
				console.error('Błąd podczas pobierania statusu czytania:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchStatus();
	}, [bookId, user]);

	// Update the reading status
	const updateStatus = useCallback(
		async (newStatus: ReadingStatus) => {
			if (!user || !bookId) return;
			if (!dbBookId) {
				toast.error('Nie można znaleźć książki w bazie danych');
				return;
			}

			setIsLoading(true);
			try {
				const { data: statusData, error: statusError } = await supabase
					.from('reading_status')
					.select('id')
					.eq('user_id', user.id)
					.eq('book_id', dbBookId)
					.maybeSingle();

				if (statusError && statusError.code !== 'PGRST116') {
					throw statusError;
				}

				if (statusData) {
					if (status === newStatus) {
						// If clicking the same status, remove it
						const { error: deleteError } = await supabase
							.from('reading_status')
							.delete()
							.eq('id', statusData.id);

						if (deleteError) throw deleteError;

						setStatus('');
						toast.info('Status czytania został usunięty');
					} else {
						// If changing status, update it
						const { error: updateError } = await supabase
							.from('reading_status')
							.update({
								status: newStatus,
								updated_at: new Date().toISOString(),
							})
							.eq('id', statusData.id);

						if (updateError) throw updateError;

						setStatus(newStatus);
						showStatusMessage(newStatus);
					}
				} else {
					// If no status exists, create new one
					const { error: insertError } = await supabase
						.from('reading_status')
						.insert([
							{
								user_id: user.id,
								book_id: dbBookId,
								status: newStatus,
							},
						]);

					if (insertError) throw insertError;

					setStatus(newStatus);
					showStatusMessage(newStatus);
				}
			} catch (error) {
				console.error('Błąd podczas aktualizacji statusu czytania:', error);
				toast.error('Wystąpił błąd podczas zmiany statusu czytania');
			} finally {
				setIsLoading(false);
			}
		},
		[dbBookId, status, user, bookId, toast]
	);

	// Helper function to show status-specific messages
	const showStatusMessage = (status: ReadingStatus) => {
		if (status === 'want_to_read') {
			toast.info('Książka oznaczona jako "Do przeczytania"');
		} else if (status === 'currently_reading') {
			toast.info('Książka oznaczona jako "Czytam teraz"');
		} else if (status === 'read') {
			toast.success('Książka oznaczona jako "Przeczytane"');
		}
	};

	return {
		status,
		isLoading,
		updateStatus,
	};
};

export default useReadingStatus;
