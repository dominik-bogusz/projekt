import React from 'react';
import { Link } from 'react-router-dom';
import { UserProfile } from '../types/profile';
import { Card, Avatar, Button } from 'flowbite-react';
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
				// Unfollow
				const { error } = await supabase
					.from('followers')
					.delete()
					.eq('follower_id', currentUser.id)
					.eq('following_id', user.id);

				if (error) throw error;
			} else {
				// Follow
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

	return (
		<Card className='overflow-hidden'>
			<div className='flex items-center space-x-4'>
				<Avatar
					img={user.avatar_url || 'https://via.placeholder.com/100?text=Avatar'}
					size='lg'
					rounded
				/>
				<div className='flex-1'>
					<Link
						to={`/users/${user.id}`}
						className='text-lg font-medium hover:text-blue-600'
					>
						{user.display_name || 'Użytkownik'}
					</Link>
					{user.location && (
						<p className='text-sm text-gray-500'>{user.location}</p>
					)}
				</div>

				{currentUser && currentUser.id !== user.id && (
					<Button
						size='sm'
						color={isFollowing ? 'light' : 'blue'}
						onClick={handleFollowToggle}
					>
						{isFollowing ? 'Obserwujesz' : 'Obserwuj'}
					</Button>
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
						{user.favorite_genres.map((genre, index) => (
							<span
								key={index}
								className='bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded'
							>
								{genre}
							</span>
						))}
					</div>
				</div>
			)}
		</Card>
	);
};

export default UserCard;
