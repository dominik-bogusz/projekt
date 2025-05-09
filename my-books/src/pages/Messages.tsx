import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabase';
import { Message } from '../types/notification';
import { UserProfile } from '../types/profile';
import { HiPaperAirplane } from 'react-icons/hi';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

const MessagesPage: React.FC = () => {
	const [conversations, setConversations] = useState<UserProfile[]>([]);
	const [messages, setMessages] = useState<Message[]>([]);
	const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
	const [newMessage, setNewMessage] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const messagesEndRef = useRef<null | HTMLDivElement>(null);
	const { user } = useAuth();

	useEffect(() => {
		if (!user) return;

		const fetchConversations = async () => {
			setIsLoading(true);
			try {
				const { data: sentMessages, error: sentError } = await supabase
					.from('messages')
					.select('recipient_id')
					.eq('sender_id', user.id)
					.order('created_at', { ascending: false });

				const { data: receivedMessages, error: receivedError } = await supabase
					.from('messages')
					.select('sender_id')
					.eq('recipient_id', user.id)
					.order('created_at', { ascending: false });

				if (sentError || receivedError) throw sentError || receivedError;

				const sentToIds = sentMessages?.map((m) => m.recipient_id) || [];
				const receivedFromIds = receivedMessages?.map((m) => m.sender_id) || [];
				const uniqueUserIds = [...new Set([...sentToIds, ...receivedFromIds])];

				if (uniqueUserIds.length === 0) {
					setIsLoading(false);
					return;
				}

				const { data: profiles, error: profilesError } = await supabase
					.from('profiles')
					.select('*')
					.in('id', uniqueUserIds);

				if (profilesError) throw profilesError;

				setConversations(profiles || []);
			} catch (error) {
				console.error('Error fetching conversations:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchConversations();
	}, [user]);

	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [messages]);

	const fetchMessages = async (otherUserId: string) => {
		if (!user) return;

		setIsLoading(true);
		try {
			const { data, error } = await supabase
				.from('messages')
				.select(
					`
          *,
          sender:profiles!sender_id(id, display_name, avatar_url)
        `
				)
				.or(
					`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`
				)
				.order('created_at', { ascending: true });

			if (error) throw error;

			setMessages(data || []);

			await supabase
				.from('messages')
				.update({ is_read: true })
				.eq('recipient_id', user.id)
				.eq('sender_id', otherUserId)
				.eq('is_read', false);
		} catch (error) {
			console.error('Error fetching messages:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSelectUser = (selectedProfile: UserProfile) => {
		setSelectedUser(selectedProfile);
		fetchMessages(selectedProfile.id);
	};

	const handleSendMessage = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user || !selectedUser || !newMessage.trim()) return;

		try {
			const { error } = await supabase.from('messages').insert([
				{
					sender_id: user.id,
					recipient_id: selectedUser.id,
					content: newMessage.trim(),
				},
			]);

			if (error) throw error;

			await supabase.from('notifications').insert([
				{
					user_id: selectedUser.id,
					type: 'message',
					content: `Otrzymałeś nową wiadomość od ${user.email}`,
					related_id: user.id,
					is_read: false,
				},
			]);

			setNewMessage('');
			fetchMessages(selectedUser.id);
		} catch (error) {
			console.error('Error sending message:', error);
		}
	};

	if (!user) {
		return (
			<div className='max-w-6xl mx-auto px-4 py-8'>
				<div className='bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4'>
					<p>Musisz się zalogować, aby zobaczyć wiadomości.</p>
				</div>
			</div>
		);
	}

	return (
		<div className='max-w-6xl mx-auto px-4 py-8'>
			<h1 className='text-3xl font-bold mb-6'>Wiadomości</h1>

			<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
				<div className='md:col-span-1'>
					<div className='bg-white border border-gray-200 rounded-lg shadow h-[600px] overflow-hidden flex flex-col'>
						<div className='overflow-y-auto h-full'>
							<div className='p-4 border-b'>
								<h2 className='text-xl font-bold'>Konwersacje</h2>
							</div>

							{isLoading && conversations.length === 0 ? (
								<div className='flex justify-center py-8'>
									<div
										className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]'
										role='status'
									>
										<span className='!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]'>
											Ładowanie...
										</span>
									</div>
								</div>
							) : conversations.length === 0 ? (
								<div className='text-center py-8 text-gray-500'>
									Brak konwersacji
								</div>
							) : (
								<div className='space-y-1'>
									{conversations.map((profile) => (
										<button
											key={profile.id}
											onClick={() => handleSelectUser(profile)}
											className={`w-full flex items-center p-3 rounded hover:bg-gray-100 text-left ${
												selectedUser?.id === profile.id ? 'bg-blue-50' : ''
											}`}
										>
											<div className='h-10 w-10 rounded-full overflow-hidden mr-3'>
												<img
													src={
														profile.avatar_url ||
														'https://via.placeholder.com/40'
													}
													alt={profile.display_name || 'User'}
													className='h-full w-full object-cover'
												/>
											</div>
											<div>
												<div className='font-medium'>
													{profile.display_name || 'Użytkownik'}
												</div>
											</div>
										</button>
									))}
								</div>
							)}
						</div>
					</div>
				</div>

				<div className='md:col-span-2'>
					<div className='bg-white border border-gray-200 rounded-lg shadow h-[600px] flex flex-col'>
						{selectedUser ? (
							<>
								<div className='flex items-center p-3 border-b'>
									<div className='h-10 w-10 rounded-full overflow-hidden mr-3'>
										<img
											src={
												selectedUser.avatar_url ||
												'https://via.placeholder.com/40'
											}
											alt={selectedUser.display_name || 'User'}
											className='h-full w-full object-cover'
										/>
									</div>
									<div className='font-medium'>
										{selectedUser.display_name || 'Użytkownik'}
									</div>
								</div>

								<div className='flex-grow overflow-y-auto p-4'>
									{isLoading ? (
										<div className='flex justify-center items-center h-full'>
											<div
												className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]'
												role='status'
											>
												<span className='!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]'>
													Ładowanie...
												</span>
											</div>
										</div>
									) : messages.length === 0 ? (
										<div className='text-center py-8 text-gray-500'>
											Rozpocznij konwersację
										</div>
									) : (
										<div className='space-y-4'>
											{messages.map((message) => (
												<div
													key={message.id}
													className={`flex ${
														message.sender_id === user.id
															? 'justify-end'
															: 'justify-start'
													}`}
												>
													<div
														className={`max-w-[70%] p-3 rounded-lg ${
															message.sender_id === user.id
																? 'bg-blue-500 text-white rounded-br-none'
																: 'bg-gray-200 rounded-bl-none'
														}`}
													>
														<p>{message.content}</p>
														<p
															className={`text-xs mt-1 ${
																message.sender_id === user.id
																	? 'text-blue-100'
																	: 'text-gray-500'
															}`}
														>
															{formatDistanceToNow(
																new Date(message.created_at),
																{
																	addSuffix: true,
																	locale: pl,
																}
															)}
														</p>
													</div>
												</div>
											))}
											<div ref={messagesEndRef} />
										</div>
									)}
								</div>

								<form
									onSubmit={handleSendMessage}
									className='p-3 border-t mt-auto'
								>
									<div className='flex gap-2'>
										<input
											type='text'
											value={newMessage}
											onChange={(e) => setNewMessage(e.target.value)}
											placeholder='Wpisz wiadomość...'
											className='flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
										/>
										<button
											type='submit'
											disabled={!newMessage.trim()}
											className='inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 disabled:bg-blue-400'
										>
											<HiPaperAirplane className='mr-2' />
											Wyślij
										</button>
									</div>
								</form>
							</>
						) : (
							<div className='flex items-center justify-center h-full text-gray-500'>
								Wybierz konwersację z listy po lewej stronie
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default MessagesPage;
