import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabase';
import { Book } from '../types/book';
import { HiOutlineSwitchHorizontal } from 'react-icons/hi';

interface BookExchangeButtonProps {
	book: Book;
	ownerId: string;
}

const BookExchangeButton: React.FC<BookExchangeButtonProps> = ({
	book,
	ownerId,
}) => {
	const [showModal, setShowModal] = useState(false);
	const [message, setMessage] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const { user } = useAuth();

	const handleExchangeRequest = async () => {
		if (!user) return;

		setIsLoading(true);
		try {
			// Najpierw sprawdzamy czy już istnieje prośba o wymianę
			const { data: existingRequest } = await supabase
				.from('exchange_requests')
				.select('*')
				.eq('requester_id', user.id)
				.eq('book_id', book.id)
				.eq('owner_id', ownerId)
				.eq('status', 'pending')
				.maybeSingle();

			if (existingRequest) {
				alert('Już wysłałeś prośbę o wymianę tej książki!');
				setShowModal(false);
				setIsLoading(false);
				return;
			}

			// Dodajemy nową prośbę
			const { error } = await supabase.from('exchange_requests').insert([
				{
					requester_id: user.id,
					book_id: book.id,
					owner_id: ownerId,
					status: 'pending',
					message: message,
				},
			]);

			if (error) throw error;

			// Wysyłamy powiadomienie
			await supabase.from('notifications').insert([
				{
					user_id: ownerId,
					type: 'exchange_request',
					content: `Użytkownik chce wymienić się z Tobą książką "${book.title}"`,
					is_read: false,
				},
			]);

			alert('Prośba o wymianę została wysłana!');
			setShowModal(false);
		} catch (error) {
			console.error('Błąd podczas wysyłania prośby o wymianę:', error);
			alert('Wystąpił błąd. Spróbuj ponownie.');
		} finally {
			setIsLoading(false);
		}
	};

	// Nie pokazujemy przycisku, jeśli to nasza książka
	if (user?.id === ownerId) return null;

	return (
		<>
			<button
				className='mt-2 flex items-center text-white bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg text-sm px-4 py-2'
				onClick={() => setShowModal(true)}
			>
				<HiOutlineSwitchHorizontal className='mr-2' />
				Wymiana
			</button>

			{showModal && (
				<div className='fixed inset-0 z-50 overflow-y-auto bg-gray-800 bg-opacity-50 flex items-center justify-center p-4'>
					<div className='relative bg-white rounded-lg shadow max-w-md w-full'>
						<div className='flex items-center justify-between p-4 border-b rounded-t'>
							<h3 className='text-xl font-semibold text-gray-900'>
								Poproś o wymianę książki
							</h3>
							<button
								type='button'
								className='text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center'
								onClick={() => setShowModal(false)}
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

						<div className='p-6 space-y-4'>
							<div className='flex mb-4'>
								<img
									src={
										book.imageLinks?.thumbnail ||
										'https://via.placeholder.com/128x192?text=Brak+Okładki'
									}
									alt={book.title}
									className='w-20 h-30 object-cover rounded mr-4'
								/>
								<div>
									<h5 className='text-lg font-medium'>{book.title}</h5>
									<p className='text-sm text-gray-600'>
										{book.authors ? book.authors.join(', ') : 'Nieznany autor'}
									</p>
								</div>
							</div>

							<p className='text-sm'>
								Dodaj krótką wiadomość do właściciela książki:
							</p>

							<textarea
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								placeholder='Cześć! Chciałbym wypożyczyć/wymienić się tą książką...'
								rows={4}
								className='shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border'
							/>
						</div>

						<div className='flex items-center justify-end p-6 space-x-2 border-t border-gray-200 rounded-b'>
							<button
								type='button'
								className='text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5'
								onClick={() => setShowModal(false)}
							>
								Anuluj
							</button>
							<button
								type='button'
								className='text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-purple-400'
								onClick={handleExchangeRequest}
								disabled={isLoading}
							>
								{isLoading ? 'Wysyłanie...' : 'Wyślij prośbę'}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default BookExchangeButton;
