// src/components/ReadingStatusSelector.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';
import { useAuth } from '../context/AuthContext';

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
	const { user } = useAuth();

	useEffect(() => {
		if (!user || !bookId) return;

		const fetchStatus = async () => {
			try {
				// Najpierw sprawdź, czy mamy ID książki w naszej bazie
				const { data: bookData, error: bookError } = await supabase
					.from('books')
					.select('id')
					.or(`google_books_id.eq.${bookId},id.eq.${bookId}`)
					.eq('user_id', user.id)
					.maybeSingle();

				if (bookError) throw bookError;

				if (!bookData) return;

				const { data, error } = await supabase
					.from('reading_status')
					.select('status')
					.eq('user_id', user.id)
					.eq('book_id', bookData.id)
					.maybeSingle();

				if (!error && data) {
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

		setIsLoading(true);
		try {
			// Znajdź rzeczywiste ID książki w bazie danych
			const { data: bookData, error: bookError } = await supabase
				.from('books')
				.select('id')
				.or(`google_books_id.eq.${bookId},id.eq.${bookId}`)
				.eq('user_id', user.id)
				.maybeSingle();

			if (bookError) throw bookError;

			if (!bookData) {
				console.error('Książka nie znaleziona w bibliotece');
				return;
			}

			const dbBookId = bookData.id;

			// Sprawdź, czy istnieje już status
			const { data: statusData, error: statusError } = await supabase
				.from('reading_status')
				.select('id')
				.eq('user_id', user.id)
				.eq('book_id', dbBookId)
				.maybeSingle();

			if (statusError && statusError.code !== 'PGRST116') throw statusError;

			if (statusData) {
				// Istnieje status, zaktualizuj go
				if (currentStatus === status) {
					// Jeśli kliknięto ten sam status, usuń go
					const { error: deleteError } = await supabase
						.from('reading_status')
						.delete()
						.eq('id', statusData.id);

					if (deleteError) throw deleteError;

					setCurrentStatus(null);
					if (onStatusChange) onStatusChange('');
				} else {
					// Aktualizuj status
					const { error: updateError } = await supabase
						.from('reading_status')
						.update({ status, updated_at: new Date().toISOString() })
						.eq('id', statusData.id);

					if (updateError) throw updateError;

					setCurrentStatus(status);
					if (onStatusChange) onStatusChange(status);
				}
			} else {
				// Dodaj nowy status
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
			}
		} catch (error) {
			console.error('Błąd podczas aktualizacji statusu czytania:', error);
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
