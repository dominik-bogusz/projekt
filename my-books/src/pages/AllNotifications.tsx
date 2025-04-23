import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { useAuth } from '../context/AuthContext';
import { Notification } from '../types/notification';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

const AllNotifications: React.FC = () => {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const { user } = useAuth();

	useEffect(() => {
		const fetchNotifications = async () => {
			if (!user) {
				setIsLoading(false);
				return;
			}

			try {
				const { data, error } = await supabase
					.from('notifications')
					.select('*')
					.eq('user_id', user.id)
					.order('created_at', { ascending: false });

				if (error) throw error;
				setNotifications(data || []);
			} catch (error) {
				console.error('Błąd podczas pobierania powiadomień:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchNotifications();
	}, [user]);

	const markAllAsRead = async () => {
		if (!user) return;

		try {
			const { error } = await supabase
				.from('notifications')
				.update({ is_read: true })
				.eq('user_id', user.id)
				.eq('is_read', false);

			if (error) throw error;

			setNotifications(
				notifications.map((notification) => ({
					...notification,
					is_read: true,
				}))
			);
		} catch (error) {
			console.error(
				'Błąd podczas oznaczania powiadomień jako przeczytane:',
				error
			);
		}
	};

	const getNotificationLink = (notification: Notification) => {
		switch (notification.type) {
			case 'exchange_request':
			case 'exchange_response':
				return '/exchanges';
			case 'follow':
				return `/users/${notification.related_id}`;
			case 'review_like':
			case 'review_comment':
				return `/book/${notification.related_id}/reviews`;
			case 'message':
				return '/messages';
			default:
				return '#';
		}
	};

	if (!user) {
		return (
			<div className='max-w-6xl mx-auto px-4 py-8'>
				<div className='bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4'>
					<p>Musisz się zalogować, aby zobaczyć powiadomienia.</p>
				</div>
			</div>
		);
	}

	return (
		<div className='max-w-4xl mx-auto px-4 py-8'>
			<div className='flex justify-between items-center mb-6'>
				<h1 className='text-3xl font-bold'>Powiadomienia</h1>
				{notifications.some((n) => !n.is_read) && (
					<button
						onClick={markAllAsRead}
						className='text-sm text-blue-600 hover:text-blue-800'
					>
						Oznacz wszystkie jako przeczytane
					</button>
				)}
			</div>

			{isLoading ? (
				<div className='flex justify-center py-8'>
					<div className='animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500'></div>
				</div>
			) : notifications.length === 0 ? (
				<div className='bg-white shadow-md rounded-lg p-6 text-center'>
					<p className='text-gray-500'>Brak powiadomień</p>
				</div>
			) : (
				<div className='bg-white shadow-md rounded-lg overflow-hidden'>
					{notifications.map((notification) => (
						<Link
							key={notification.id}
							to={getNotificationLink(notification)}
							className={`block border-b last:border-b-0 p-4 hover:bg-gray-50 ${
								!notification.is_read ? 'bg-blue-50' : ''
							}`}
						>
							<div className='flex justify-between'>
								<p className='text-gray-800'>{notification.content}</p>
								{!notification.is_read && (
									<span className='bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full'>
										Nowe
									</span>
								)}
							</div>
							<p className='text-sm text-gray-500 mt-1'>
								{formatDistanceToNow(new Date(notification.created_at), {
									addSuffix: true,
									locale: pl,
								})}
							</p>
						</Link>
					))}
				</div>
			)}
		</div>
	);
};

export default AllNotifications;
