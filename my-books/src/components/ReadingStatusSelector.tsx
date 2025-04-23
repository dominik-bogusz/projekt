import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from './Toast';

interface ReadingStatusSelectorProps {
	bookId: string;
	onStatusChange?: (status: string) => void;
}

const ReadingStatusSelector: React.FC<ReadingStatusSelectorProps> = ({
	bookId,
	onStatusChange,
}) => {
	const [currentStatus, setCurrentStatus] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [dbBookId, setDbBookId] = useState<string | null>(null);
	const { user } = useAuth();

	useEffect(() => {
		if (!user || !bookId) return;

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
					setCurrentStatus(data.status);
				}
			} catch (error) {
				console.error('Błąd podczas pobierania statusu czytania:', error);
			}
		};

		fetchStatus();
	}, [bookId, user]);

	const updateStatus = async (status: string) => {
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
				if (currentStatus === status) {
					// If clicking the same status, remove it
					const { error: deleteError } = await supabase
						.from('reading_status')
						.delete()
						.eq('id', statusData.id);

					if (deleteError) throw deleteError;

					setCurrentStatus(null);
					if (onStatusChange) onStatusChange('');
					toast.info('Status czytania został usunięty');
				} else {
					// If changing status, update it
					const { error: updateError } = await supabase
						.from('reading_status')
						.update({ status, updated_at: new Date().toISOString() })
						.eq('id', statusData.id);

					if (updateError) throw updateError;

					setCurrentStatus(status);
					if (onStatusChange) onStatusChange(status);

					// Show appropriate message
					if (status === 'want_to_read') {
						toast.info('Książka oznaczona jako "Do przeczytania"');
					} else if (status === 'currently_reading') {
						toast.info('Książka oznaczona jako "Czytam teraz"');
					} else if (status === 'read') {
						toast.success('Książka oznaczona jako "Przeczytane"');
					}
				}
			} else {
				// If no status exists, create new one
				const { error: insertError } = await supabase
					.from('reading_status')
					.insert([
						{
							user_id: user.id,
							book_id: dbBookId,
							status,
						},
					]);

				if (insertError) throw insertError;

				setCurrentStatus(status);
				if (onStatusChange) onStatusChange(status);

				// Show appropriate message
				if (status === 'want_to_read') {
					toast.info('Książka oznaczona jako "Do przeczytania"');
				} else if (status === 'currently_reading') {
					toast.info('Książka oznaczona jako "Czytam teraz"');
				} else if (status === 'read') {
					toast.success('Książka oznaczona jako "Przeczytane"');
				}
			}
		} catch (error) {
			console.error('Błąd podczas aktualizacji statusu czytania:', error);
			toast.error('Wystąpił błąd podczas zmiany statusu czytania');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='mt-4'>
			<div className='text-sm font-medium text-gray-700 mb-2'>
				Status czytania:
			</div>
			<div className='flex flex-wrap gap-2'>
				<button
					type='button'
					onClick={() => updateStatus('want_to_read')}
					className={`px-3 py-1 text-sm rounded-full ${
						currentStatus === 'want_to_read'
							? 'bg-blue-600 text-white'
							: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
					}`}
					disabled={isLoading}
				>
					Do przeczytania
				</button>
				<button
					type='button'
					onClick={() => updateStatus('currently_reading')}
					className={`px-3 py-1 text-sm rounded-full ${
						currentStatus === 'currently_reading'
							? 'bg-blue-600 text-white'
							: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
					}`}
					disabled={isLoading}
				>
					Czytam teraz
				</button>
				<button
					type='button'
					onClick={() => updateStatus('read')}
					className={`px-3 py-1 text-sm rounded-full ${
						currentStatus === 'read'
							? 'bg-blue-600 text-white'
							: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
					}`}
					disabled={isLoading}
				>
					Przeczytane
				</button>
			</div>
		</div>
	);
};

export default ReadingStatusSelector;
