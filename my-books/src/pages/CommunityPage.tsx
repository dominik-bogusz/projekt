// src/pages/CommunityPage.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types/profile';
import UserCard from '../components/UserCard';
import { HiSearch } from 'react-icons/hi';

const CommunityPage: React.FC = () => {
	const [users, setUsers] = useState<UserProfile[]>([]);
	const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const { user } = useAuth();

	useEffect(() => {
		const fetchUsers = async () => {
			setIsLoading(true);

			try {
				// Fetch public profiles
				const { data: profiles, error } = await supabase
					.from('profiles')
					.select('*')
					.eq('is_public', true)
					.order('created_at', { ascending: false });

				if (error) throw error;

				// Upewnij się, że każdy profil ma wyświetlaną nazwę
				const processedProfiles = (profiles || []).map((profile) => ({
					...profile,
					display_name:
						profile.display_name ||
						profile.email?.split('@')[0] ||
						'Użytkownik',
				}));

				setUsers(processedProfiles);

				// If user is logged in, fetch following status
				if (user) {
					const { data: following, error: followingError } = await supabase
						.from('followers')
						.select('following_id')
						.eq('follower_id', user.id);

					if (followingError) throw followingError;

					const followingObj: Record<string, boolean> = {};
					following?.forEach((f) => {
						followingObj[f.following_id] = true;
					});

					setFollowingMap(followingObj);
				}
			} catch (error) {
				console.error('Error fetching users:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchUsers();
	}, [user]);

	const handleFollowToggle = async () => {
		// Refresh following status
		if (user) {
			const { data, error } = await supabase
				.from('followers')
				.select('following_id')
				.eq('follower_id', user.id);

			if (error) {
				console.error('Error fetching following status:', error);
				return;
			}

			const followingObj: Record<string, boolean> = {};
			data?.forEach((f) => {
				followingObj[f.following_id] = true;
			});

			setFollowingMap(followingObj);
		}
	};

	const filteredUsers = searchQuery
		? users.filter(
				(u) =>
					(u.display_name &&
						u.display_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
					(u.email &&
						u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
					(u.bio && u.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
					(u.location &&
						u.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
					(u.favorite_genres &&
						u.favorite_genres.some((g) =>
							g.toLowerCase().includes(searchQuery.toLowerCase())
						))
		  )
		: users;

	return (
		<div className='max-w-6xl mx-auto px-4 py-8'>
			<h1 className='text-3xl font-bold mb-6'>Społeczność czytelników</h1>

			<div className='mb-8'>
				<div className='relative'>
					<div className='absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none'>
						<HiSearch className='w-5 h-5 text-gray-500' />
					</div>
					<input
						type='text'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5'
						placeholder='Wyszukaj użytkowników...'
					/>
				</div>
			</div>

			{isLoading ? (
				<div className='flex justify-center py-12'>
					<div
						className='inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]'
						role='status'
					>
						<span className='!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]'>
							Ładowanie...
						</span>
					</div>
				</div>
			) : filteredUsers.length === 0 ? (
				<div className='text-center py-12 text-gray-500'>
					{searchQuery
						? `Nie znaleziono użytkowników pasujących do zapytania "${searchQuery}"`
						: 'Nie znaleziono użytkowników'}
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{filteredUsers.map((userProfile) => (
						<UserCard
							key={userProfile.id}
							user={userProfile}
							isFollowing={followingMap[userProfile.id] || false}
							onFollowToggle={handleFollowToggle}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default CommunityPage;
