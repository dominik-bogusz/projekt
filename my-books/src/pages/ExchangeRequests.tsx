import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabase';
import { ExchangeRequest } from '../types/exchange';
import { Book } from '../types/book';

const ExchangeRequests: React.FC = () => {
	const [incomingRequests, setIncomingRequests] = useState<
		(ExchangeRequest & { book: Book; requester: { email: string } })[]
	>([]);
	const [outgoingRequests, setOutgoingRequests] = useState<
		(ExchangeRequest & { book: Book; owner: { email: string } })[]
	>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('incoming');
	const { user } = useAuth();

	const fetchRequests = async () => {
		if (!user) return;

		setIsLoading(true);

		try {
			// Pobierz przychodzące prośby
			const { data: incoming, error: incomingError } = await supabase
				.from('exchange_requests')
				.select(
					`
          *,
          book:books(*),
          requester:profiles!requester_id(email)
        `
				)
				.eq('owner_id', user.id);

			if (incomingError) throw incomingError;

			// Pobierz wychodzące prośby
			const { data: outgoing, error: outgoingError } = await supabase
				.from('exchange_requests')
				.select(
					`
          *,
          book:books(*),
          owner:profiles!owner_id(email)
        `
				)
				.eq('requester_id', user.id);

			if (outgoingError) throw outgoingError;

			setIncomingRequests(incoming || []);
			setOutgoingRequests(outgoing || []);
		} catch (error) {
			console.error('Błąd podczas pobierania próśb o wymianę:', error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchRequests();

		// Subskrybuj się na zmiany
		const incomingSubscription = supabase
			.channel('incoming_requests')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'exchange_requests',
					filter: `owner_id=eq.${user?.id}`,
				},
				() => fetchRequests()
			)
			.subscribe();

		const outgoingSubscription = supabase
			.channel('outgoing_requests')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'exchange_requests',
					filter: `requester_id=eq.${user?.id}`,
				},
				() => fetchRequests()
			)
			.subscribe();

		return () => {
			incomingSubscription.unsubscribe();
			outgoingSubscription.unsubscribe();
		};
	}, [user]);

	const handleRequestAction = async (
		requestId: string,
		action: 'accept' | 'reject' | 'cancel'
	) => {
		try {
			if (action === 'cancel') {
				await supabase
					.from('exchange_requests')
					.delete()
					.eq('id', requestId)
					.eq('requester_id', user?.id);
			} else {
				await supabase
					.from('exchange_requests')
					.update({ status: action === 'accept' ? 'accepted' : 'rejected' })
					.eq('id', requestId);

				// Powiadomienie
				const request = incomingRequests.find((r) => r.id === requestId);
				if (request) {
					await supabase.from('notifications').insert([
						{
							user_id: request.requester_id,
							type: 'exchange_response',
							content: `Twoja prośba o wymianę książki "${
								request.book.title
							}" została ${
								action === 'accept' ? 'zaakceptowana' : 'odrzucona'
							}.`,
							is_read: false,
						},
					]);
				}
			}

			fetchRequests();
		} catch (error) {
			console.error('Błąd podczas aktualizacji prośby:', error);
			alert('Wystąpił błąd. Spróbuj ponownie.');
		}
	};

	const renderStatusBadge = (status: string) => {
		let colorClass = 'bg-gray-100 text-gray-800';

		switch (status) {
			case 'pending':
				colorClass = 'bg-yellow-100 text-yellow-800';
				break;
			case 'accepted':
				colorClass = 'bg-green-100 text-green-800';
				break;
			case 'rejected':
				colorClass = 'bg-red-100 text-red-800';
				break;
			case 'completed':
				colorClass = 'bg-blue-100 text-blue-800';
				break;
		}

		return (
			<span
				className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
			>
				{status === 'pending'
					? 'Oczekująca'
					: status === 'accepted'
					? 'Zaakceptowana'
					: status === 'rejected'
					? 'Odrzucona'
					: 'Ukończona'}
			</span>
		);
	};

	if (isLoading) {
		return (
			<div className='max-w-6xl mx-auto px-4 py-8'>
				<div className='flex justify-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
				</div>
			</div>
		);
	}

	return (
		<div className='max-w-6xl mx-auto px-4 py-8'>
			<h1 className='text-3xl font-bold mb-6'>Wymiana książek</h1>

			<div className='border-b border-gray-200 mb-6'>
				<ul className='flex flex-wrap -mb-px text-sm font-medium text-center'>
					<li className='mr-2'>
						<button
							onClick={() => setActiveTab('incoming')}
							className={`inline-block p-4 rounded-t-lg ${
								activeTab === 'incoming'
									? 'border-b-2 border-blue-600 text-blue-600'
									: 'hover:text-gray-600 hover:border-gray-300'
							}`}
						>
							Przychodzące prośby
						</button>
					</li>
					<li className='mr-2'>
						<button
							onClick={() => setActiveTab('outgoing')}
							className={`inline-block p-4 rounded-t-lg ${
								activeTab === 'outgoing'
									? 'border-b-2 border-blue-600 text-blue-600'
									: 'hover:text-gray-600 hover:border-gray-300'
							}`}
						>
							Wysłane prośby
						</button>
					</li>
				</ul>
			</div>

			{activeTab === 'incoming' ? (
				<>
					{incomingRequests.length === 0 ? (
						<div className='p-4 text-center text-gray-500'>
							Nie masz żadnych przychodzących próśb o wymianę.
						</div>
					) : (
						<div className='grid gap-4 mt-4'>
							{incomingRequests.map((request) => (
								<div
									key={request.id}
									className='bg-white border border-gray-200 rounded-lg shadow p-4'
								>
									<div className='flex flex-col md:flex-row'>
										<div className='flex mb-4 md:mb-0 md:mr-6'>
											<img
												src={
													request.book.thumbnail ||
													'https://via.placeholder.com/128x192?text=Brak+Okładki'
												}
												alt={request.book.title}
												className='w-24 h-36 object-cover rounded'
											/>
										</div>

										<div className='flex-grow'>
											<div className='flex justify-between flex-wrap'>
												<div>
													<h5 className='text-xl font-bold'>
														{request.book.title}
													</h5>
													<p className='text-gray-600'>
														{request.book.authors
															? request.book.authors.join(', ')
															: 'Nieznany autor'}
													</p>
												</div>

												<div>{renderStatusBadge(request.status)}</div>
											</div>

											<div className='mt-2'>
												<p className='text-sm text-gray-500'>
													Prośba od:{' '}
													<span className='font-medium'>
														{request.requester.email}
													</span>
												</p>
												<p className='text-sm text-gray-500'>
													Data:{' '}
													{new Date(request.created_at).toLocaleDateString()}
												</p>
											</div>

											{request.message && (
												<div className='mt-3 p-3 bg-gray-50 rounded'>
													<p className='text-sm italic'>"{request.message}"</p>
												</div>
											)}

											{request.status === 'pending' && (
												<div className='mt-4 flex gap-2'>
													<button
														onClick={() =>
															handleRequestAction(request.id, 'accept')
														}
														className='px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300'
													>
														Akceptuj
													</button>
													<button
														onClick={() =>
															handleRequestAction(request.id, 'reject')
														}
														className='px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300'
													>
														Odrzuć
													</button>
												</div>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</>
			) : (
				<>
					{outgoingRequests.length === 0 ? (
						<div className='p-4 text-center text-gray-500'>
							Nie wysłałeś żadnych próśb o wymianę.
						</div>
					) : (
						<div className='grid gap-4 mt-4'>
							{outgoingRequests.map((request) => (
								<div
									key={request.id}
									className='bg-white border border-gray-200 rounded-lg shadow p-4'
								>
									<div className='flex flex-col md:flex-row'>
										<div className='flex mb-4 md:mb-0 md:mr-6'>
											<img
												src={
													request.book.thumbnail ||
													'https://via.placeholder.com/128x192?text=Brak+Okładki'
												}
												alt={request.book.title}
												className='w-24 h-36 object-cover rounded'
											/>
										</div>

										<div className='flex-grow'>
											<div className='flex justify-between flex-wrap'>
												<div>
													<h5 className='text-xl font-bold'>
														{request.book.title}
													</h5>
													<p className='text-gray-600'>
														{request.book.authors
															? request.book.authors.join(', ')
															: 'Nieznany autor'}
													</p>
												</div>

												<div>{renderStatusBadge(request.status)}</div>
											</div>

											<div className='mt-2'>
												<p className='text-sm text-gray-500'>
													Właściciel:{' '}
													<span className='font-medium'>
														{request.owner.email}
													</span>
												</p>
												<p className='text-sm text-gray-500'>
													Data:{' '}
													{new Date(request.created_at).toLocaleDateString()}
												</p>
											</div>

											{request.message && (
												<div className='mt-3 p-3 bg-gray-50 rounded'>
													<p className='text-sm italic'>"{request.message}"</p>
												</div>
											)}

											{request.status === 'pending' && (
												<div className='mt-4'>
													<button
														onClick={() =>
															handleRequestAction(request.id, 'cancel')
														}
														className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-100'
													>
														Anuluj prośbę
													</button>
												</div>
											)}

											{request.status === 'accepted' && (
												<div className='mt-4 p-3 bg-green-50 border border-green-200 rounded'>
													<p className='text-sm text-green-800'>
														Twoja prośba została zaakceptowana! Skontaktuj się z
														właścicielem w celu ustalenia szczegółów wymiany.
													</p>
												</div>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default ExchangeRequests;
