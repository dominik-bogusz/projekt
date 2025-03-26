import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabase';
import { ExchangeRequest } from '../types/exchange';
import { Book } from '../types/book';
import { Button, Card, Tabs, Badge } from 'flowbite-react';

const ExchangeRequests: React.FC = () => {
	const [incomingRequests, setIncomingRequests] = useState<
		(ExchangeRequest & { book: Book; requester: { email: string } })[]
	>([]);
	const [outgoingRequests, setOutgoingRequests] = useState<
		(ExchangeRequest & { book: Book; owner: { email: string } })[]
	>([]);
	const [isLoading, setIsLoading] = useState(true);
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
		let color = 'gray';

		switch (status) {
			case 'pending':
				color = 'warning';
				break;
			case 'accepted':
				color = 'success';
				break;
			case 'rejected':
				color = 'failure';
				break;
			case 'completed':
				color = 'info';
				break;
		}

		return (
			<Badge color={color as any}>
				{status === 'pending'
					? 'Oczekująca'
					: status === 'accepted'
					? 'Zaakceptowana'
					: status === 'rejected'
					? 'Odrzucona'
					: 'Ukończona'}
			</Badge>
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

			<Tabs>
				<Tabs.Item title='Przychodzące prośby' active>
					{incomingRequests.length === 0 ? (
						<div className='p-4 text-center text-gray-500'>
							Nie masz żadnych przychodzących próśb o wymianę.
						</div>
					) : (
						<div className='grid gap-4 mt-4'>
							{incomingRequests.map((request) => (
								<Card key={request.id}>
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
													<Button
														color='success'
														size='sm'
														onClick={() =>
															handleRequestAction(request.id, 'accept')
														}
													>
														Akceptuj
													</Button>
													<Button
														color='failure'
														size='sm'
														onClick={() =>
															handleRequestAction(request.id, 'reject')
														}
													>
														Odrzuć
													</Button>
												</div>
											)}
										</div>
									</div>
								</Card>
							))}
						</div>
					)}
				</Tabs.Item>

				<Tabs.Item title='Wysłane prośby'>
					{outgoingRequests.length === 0 ? (
						<div className='p-4 text-center text-gray-500'>
							Nie wysłałeś żadnych próśb o wymianę.
						</div>
					) : (
						<div className='grid gap-4 mt-4'>
							{outgoingRequests.map((request) => (
								<Card key={request.id}>
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
													<Button
														color='gray'
														size='sm'
														onClick={() =>
															handleRequestAction(request.id, 'cancel')
														}
													>
														Anuluj prośbę
													</Button>
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
								</Card>
							))}
						</div>
					)}
				</Tabs.Item>
			</Tabs>
		</div>
	);
};

export default ExchangeRequests;
