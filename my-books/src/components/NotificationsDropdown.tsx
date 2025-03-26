import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { HiBell } from 'react-icons/hi';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Notification } from '../types/notification';

const NotificationsDropdown: React.FC = () => {
	const { notifications, unreadCount, markAsRead, markAllAsRead } =
		useNotifications();
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

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

	const handleNotificationClick = (notificationId: string, path: string) => {
		if (!notifications.find((n) => n.id === notificationId)?.is_read) {
			markAsRead(notificationId);
		}
		setIsOpen(false);
		navigate(path);
	};

	return (
		<div className='relative' ref={dropdownRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='relative p-2 text-gray-600 rounded-full hover:bg-gray-100'
			>
				<HiBell className='text-2xl' />
				{unreadCount > 0 && (
					<span className='absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full'>
						{unreadCount > 9 ? '9+' : unreadCount}
					</span>
				)}
			</button>

			{isOpen && (
				<div className='absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 overflow-hidden'>
					<div className='px-4 py-3 border-b border-gray-200 flex justify-between items-center'>
						<h3 className='text-sm font-medium'>Powiadomienia</h3>
						{unreadCount > 0 && (
							<button
								onClick={() => markAllAsRead()}
								className='text-xs text-blue-600 hover:text-blue-800'
							>
								Oznacz wszystkie jako przeczytane
							</button>
						)}
					</div>

					<div className='max-h-96 overflow-y-auto'>
						{notifications.length === 0 ? (
							<div className='py-4 px-5 text-sm text-gray-500 text-center'>
								Brak powiadomień
							</div>
						) : (
							notifications.map((notification) => (
								<div
									key={notification.id}
									onClick={() =>
										handleNotificationClick(
											notification.id,
											getNotificationLink(notification)
										)
									}
									className={`flex px-4 py-3 hover:bg-gray-100 cursor-pointer ${
										!notification.is_read ? 'bg-blue-50' : ''
									}`}
								>
									<div className='w-full'>
										<div className='text-sm mb-1.5'>{notification.content}</div>
										<div className='text-xs text-gray-500'>
											{formatDistanceToNow(new Date(notification.created_at), {
												addSuffix: true,
												locale: pl,
											})}
										</div>
									</div>
									{!notification.is_read && (
										<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2'>
											Nowe
										</span>
									)}
								</div>
							))
						)}
					</div>

					<div className='py-2 px-4 border-t border-gray-200'>
						<Link
							to='/notifications'
							className='text-sm text-blue-600 hover:text-blue-800'
							onClick={() => setIsOpen(false)}
						>
							Zobacz wszystkie powiadomienia
						</Link>
					</div>
				</div>
			)}
		</div>
	);
};

export default NotificationsDropdown;
