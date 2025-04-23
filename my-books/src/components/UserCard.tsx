import React from 'react';
import { Link } from 'react-router-dom';
import { UserProfile } from '../types/profile';
import { supabase } from '../api/supabase';
import { useAuth } from '../context/AuthContext';

interface UserCardProps {
	user: UserProfile;
	isFollowing?: boolean;
	onFollowToggle?: () => void;
}

const UserCard: React.FC<UserCardProps> = ({
	user,
	isFollowing,
	onFollowToggle,
}) => {
	const { user: currentUser } = useAuth();

	const handleFollowToggle = async () => {
		if (!currentUser) return;

		try {
			if (isFollowing) {
				const { error } = await supabase
					.from('followers')
					.delete()
					.eq('follower_id', currentUser.id)
					.eq('following_id', user.id);

				if (error) throw error;
			} else {
				const { error } = await supabase.from('followers').insert([
					{
						follower_id: currentUser.id,
						following_id: user.id,
					},
				]);

				if (error) throw error;
			}

			if (onFollowToggle) {
				onFollowToggle();
			}
		} catch (error) {
			console.error('Error toggling follow status:', error);
		}
	};

	const displayName =
		user.display_name ||
		(user.email && user.email.split('@')[0]) ||
		'Użytkownik';

	return (
		<div className='bg-white rounded-lg shadow overflow-hidden'>
			<div className='p-5'>
				<div className='flex items-center space-x-4'>
					<img
						src={
							user.avatar_url || 'https://via.placeholder.com/100?text=Avatar'
						}
						alt={`${displayName} profile`}
						className='w-16 h-16 rounded-full object-cover'
					/>
					<div className='flex-1'>
						<Link
							to={`/users/${user.id}`}
							className='text-lg font-medium hover:text-blue-600'
						>
							{displayName}
						</Link>
						{user.location && (
							<p className='text-sm text-gray-500'>{user.location}</p>
						)}
					</div>

					{currentUser && currentUser.id !== user.id && (
						<button
							className={`px-4 py-2 text-sm font-medium rounded-lg ${
								isFollowing
									? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
									: 'bg-blue-600 text-white hover:bg-blue-700'
							}`}
							onClick={handleFollowToggle}
						>
							{isFollowing ? 'Obserwujesz' : 'Obserwuj'}
						</button>
					)}
				</div>

				{user.bio && (
					<div className='mt-3'>
						<p className='text-sm text-gray-700 line-clamp-2'>{user.bio}</p>
					</div>
				)}

				{user.favorite_genres && user.favorite_genres.length > 0 && (
					<div className='mt-3'>
						<div className='flex flex-wrap gap-1'>
							{user.favorite_genres.slice(0, 3).map((genre, index) => (
								<span
									key={index}
									className='bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded'
								>
									{genre}
								</span>
							))}
							{user.favorite_genres.length > 3 && (
								<span className='text-xs text-gray-500'>
									+{user.favorite_genres.length - 3} więcej
								</span>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default UserCard;
