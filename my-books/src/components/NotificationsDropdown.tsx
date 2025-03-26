import React from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { Dropdown, Badge } from 'flowbite-react';
import { HiBell, HiOutlineCheck } from 'react-icons/hi';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

const NotificationsDropdown: React.FC = () => {
	const { notifications, unreadCount, markAsRead, markAllAsRead } =
		useNotifications();

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
		<div className='relative'>
			<Dropdown
				arrowIcon={false}
				inline
				label={
					<div className='relative'>
						<HiBell className='text-2xl' />
						{unreadCount > 0 && (
							<span className='absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full'>
								{unreadCount > 9 ? '9+' : unreadCount}
							</span>
						)}
					</div>
				}
			>
				<Dropdown.Header>
					<div className='flex justify-between items-center'>
						<span className='block text-sm font-medium'>Powiadomienia</span>
						{unreadCount > 0 && (
							<button
								onClick={() => markAllAsRead()}
								className='text-xs text-blue-600 hover:text-blue-800'
							>
								Oznacz wszystkie jako przeczytane
							</button>
						)}
					</div>
				</Dropdown.Header>

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
									<Badge color='blue' className='ml-2'>
										Nowe
									</Badge>
								)}
							</Link>
						))
					)}
				</div>

				<Dropdown.Divider />
				<Dropdown.Item as={Link} to='/notifications'>
					Zobacz wszystkie powiadomienia
				</Dropdown.Item>
			</Dropdown>
		</div>
	);
};

export default NotificationsDropdown;
