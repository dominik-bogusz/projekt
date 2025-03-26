import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { HiBell, HiOutlineCheck } from 'react-icons/hi';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

const NotificationsDropdown: React.FC = () => {
	const { notifications, unreadCount, markAsRead, markAllAsRead } =
		useNotifications();
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

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

	const getNotificationLink = (notification: any) => {
		switch (notification.type) {
			case 'exchange_request':
			case 'exchange_response':
				return '/exchanges';
			case 'follow':
				return `/users/${notification.related_id}`;
			case 'review_like':
			case 'review_comment':
				return `/books/${notification.related_id}/reviews`;
			case 'message':
				return '/messages';
			default:
				return '#';
		}
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
								<Link
									key={notification.id}
									to={getNotificationLink(notification)}
									onClick={() =>
										!notification.is_read && markAsRead(notification.id)
									}
									className={`flex px-4 py-3 hover:bg-gray-100 ${
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
								</Link>
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
