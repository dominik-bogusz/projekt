import React, {
	createContext,
	useState,
	useEffect,
	useContext,
	ReactNode,
} from 'react';
import { supabase } from '../api/supabase';
import { useAuth } from './AuthContext';
import { Notification } from '../types/notification';

interface NotificationContextProps {
	notifications: Notification[];
	unreadCount: number;
	markAsRead: (notificationId: string) => Promise<void>;
	markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextProps | null>(
	null
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const { user } = useAuth();

	const fetchNotifications = async () => {
		if (!user) {
			setNotifications([]);
			setUnreadCount(0);
			return;
		}

		try {
			const { data, error } = await supabase
				.from('notifications')
				.select('*')
				.eq('user_id', user.id)
				.order('created_at', { ascending: false })
				.limit(20);

			if (error) throw error;

			setNotifications(data || []);
			setUnreadCount(data?.filter((n) => !n.is_read).length || 0);
		} catch (error) {
			console.error('Error fetching notifications:', error);
		}
	};

	useEffect(() => {
		fetchNotifications();

		// Subscribe to new notifications
		if (user) {
			const subscription = supabase
				.channel('notification_changes')
				.on(
					'postgres_changes',
					{
						event: '*',
						schema: 'public',
						table: 'notifications',
						filter: `user_id=eq.${user.id}`,
					},
					fetchNotifications
				)
				.subscribe();

			return () => {
				subscription.unsubscribe();
			};
		}
	}, [user]);

	const markAsRead = async (notificationId: string) => {
		if (!user) return;

		try {
			const { error } = await supabase
				.from('notifications')
				.update({ is_read: true })
				.eq('id', notificationId)
				.eq('user_id', user.id);

			if (error) throw error;

			// Update local state
			setNotifications((prev) =>
				prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
			);
			setUnreadCount((prev) => Math.max(0, prev - 1));
		} catch (error) {
			console.error('Error marking notification as read:', error);
		}
	};

	const markAllAsRead = async () => {
		if (!user) return;

		try {
			const { error } = await supabase
				.from('notifications')
				.update({ is_read: true })
				.eq('user_id', user.id)
				.eq('is_read', false);

			if (error) throw error;

			// Update local state
			setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
			setUnreadCount(0);
		} catch (error) {
			console.error('Error marking all notifications as read:', error);
		}
	};

	return (
		<NotificationContext.Provider
			value={{ notifications, unreadCount, markAsRead, markAllAsRead }}
		>
			{children}
		</NotificationContext.Provider>
	);
};

export const useNotifications = () => {
	const context = useContext(NotificationContext);
	if (!context) {
		throw new Error(
			'useNotifications must be used within a NotificationProvider'
		);
	}
	return context;
};
