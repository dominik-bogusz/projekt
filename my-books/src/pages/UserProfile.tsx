import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { useAuth } from '../context/AuthContext';
import { UserProfile, BookShelf } from '../types/profile';
import { Book } from '../types/book';
import { Tabs, Avatar, Button, Spinner, Card } from 'flowbite-react';
import ProfileEditor from '../components/ProfileEditor';
import BookList from '../components/BookList';
import {
	HiOutlineUsers,
	HiOutlineBookOpen,
	HiOutlinePencil,
} from 'react-icons/hi';

const UserProfilePage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [shelves, setShelves] = useState<BookShelf[]>([]);
	const [books, setBooks] = useState<Book[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isOwnProfile, setIsOwnProfile] = useState(false);
	const [isFollowing, setIsFollowing] = useState(false);
	const [followersCount, setFollowersCount] = useState(0);
	const [followingCount, setFollowingCount] = useState(0);
	const [activeTab, setActiveTab] = useState('books');
	const [isEditing, setIsEditing] = useState(false);

	const { user } = useAuth();

	useEffect(() => {
		if (!id) return;

		const fetchProfile = async () => {
			setIsLoading(true);

			try {
				// Fetch profile
				const { data: profileData, error: profileError } = await supabase
					.from('profiles')
					.select('*')
					.eq('id', id)
					.single();

				if (profileError) throw profileError;

				if (profileData) {
					setProfile(profileData);
					setIsOwnProfile(user?.id === profileData.id);

					// If private profile, check if current user is the owner
					if (!profileData.is_public && user?.id !== profileData.id) {
						// Redirect or show access denied
						return;
					}
				}

				// Fetch books
				const { data: booksData, error: booksError } = await supabase
					.from('books')
					.select('*')
					.eq('user_id', id);

				if (booksError) throw booksError;

				const formattedBooks: Book[] = (booksData || []).map((item) => ({
					id: item.google_books_id || item.id,
					title: item.title,
					authors: item.authors,
					description: item.description,
					publishedDate: item.published_date,
					imageLinks: item.thumbnail
						? { thumbnail: item.thumbnail }
						: undefined,
					publisher: item.publisher,
					isCustom: item.is_custom,
				}));

				setBooks(formattedBooks);

				// Fetch shelves
				const { data: shelvesData, error: shelvesError } = await supabase
					.from('book_shelves')
					.select('*')
					.eq('user_id', id)
					.eq('is_public', true);

				if (shelvesError) throw shelvesError;

				setShelves(shelvesData || []);

				// Fetch follow status if user is logged in
				if (user) {
					const { data: followData } = await supabase
						.from('followers')
						.select('id')
						.eq('follower_id', user.id)
						.eq('following_id', id)
						.maybeSingle();

					setIsFollowing(!!followData);
				}

				// Fetch followers count
				const { data: followersData, error: followersError } = await supabase
					.from('followers')
					.select('id', { count: 'exact' })
					.eq('following_id', id);

				if (followersError) throw followersError;

				setFollowersCount(followersData?.length || 0);

				// Fetch following count
				const { data: followingData, error: followingError } = await supabase
					.from('followers')
					.select('id', { count: 'exact' })
					.eq('follower_id', id);

				if (followingError) throw followingError;

				setFollowingCount(followingData?.length || 0);
			} catch (error) {
				console.error('Error fetching profile:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchProfile();
	}, [id, user]);

	const handleFollowToggle = async () => {
		if (!user || !profile) return;

		try {
			if (isFollowing) {
				// Unfollow
				await supabase
					.from('followers')
					.delete()
					.eq('follower_id', user.id)
					.eq('following_id', profile.id);

				setFollowersCount((prev) => prev - 1);
			} else {
				// Follow
				await supabase.from('followers').insert([
					{
						follower_id: user.id,
						following_id: profile.id,
					},
				]);

				setFollowersCount((prev) => prev + 1);
			}

			setIsFollowing(!isFollowing);
		} catch (error) {
			console.error('Error toggling follow status:', error);
		}
	};

	const handleProfileUpdate = (updatedProfile: UserProfile) => {
		setProfile(updatedProfile);
		setIsEditing(false);
	};

	if (isLoading) {
		return (
			<div className='flex justify-center items-center h-64'>
				<Spinner size='xl' />
			</div>
		);
	}

	if (!profile) {
		return (
			<div className='max-w-6xl mx-auto px-4 py-12'>
				<div className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4'>
					<p>Profil nie został znaleziony.</p>
				</div>
			</div>
		);
	}

	return (
		<div className='max-w-6xl mx-auto px-4 py-8'>
			<Card className='mb-8'>
				<div className='flex flex-col md:flex-row'>
					<div className='md:w-1/4 mb-6 md:mb-0 flex flex-col items-center'>
						<Avatar
							img={profile.avatar_url || 'https://via.placeholder.com/150'}
							size='xl'
							rounded
							className='mb-4'
						/>

						<div className='text-center'>
							<h2 className='text-2xl font-bold'>
								{profile.display_name || 'Użytkownik'}
							</h2>

							{profile.location && (
								<p className='text-gray-600 mt-1'>{profile.location}</p>
							)}

							{profile.website && (
								<a
									href={
										profile.website.startsWith('http')
											? profile.website
											: `https://${profile.website}`
									}
									target='_blank'
									rel='noopener noreferrer'
									className='text-blue-600 hover:underline mt-1 block'
								>
									{profile.website}
								</a>
							)}
						</div>

						<div className='flex space-x-4 mt-4'>
							<div className='text-center'>
								<div className='text-xl font-bold'>{books.length}</div>
								<div className='text-gray-500'>Książki</div>
							</div>

							<div className='text-center'>
								<div className='text-xl font-bold'>{followersCount}</div>
								<div className='text-gray-500'>Obserwujący</div>
							</div>

							<div className='text-center'>
								<div className='text-xl font-bold'>{followingCount}</div>
								<div className='text-gray-500'>Obserwuje</div>
							</div>
						</div>

						{!isOwnProfile && user && (
							<Button
								color={isFollowing ? 'light' : 'blue'}
								className='mt-4'
								onClick={handleFollowToggle}
							>
								{isFollowing ? 'Obserwujesz' : 'Obserwuj'}
							</Button>
						)}

						{isOwnProfile && !isEditing && (
							<Button
								color='light'
								className='mt-4'
								onClick={() => setIsEditing(true)}
							>
								<HiOutlinePencil className='mr-2' />
								Edytuj profil
							</Button>
						)}
					</div>

					<div className='md:w-3/4 md:pl-8'>
						{isEditing ? (
							<ProfileEditor
								profile={profile}
								onProfileUpdated={handleProfileUpdate}
							/>
						) : (
							<>
								{profile.bio && (
									<div className='mb-6'>
										<h3 className='text-lg font-semibold mb-2'>O mnie</h3>
										<p className='text-gray-700 whitespace-pre-line'>
											{profile.bio}
										</p>
									</div>
								)}

								{profile.favorite_genres &&
									profile.favorite_genres.length > 0 && (
										<div className='mb-6'>
											<h3 className='text-lg font-semibold mb-2'>
												Ulubione gatunki
											</h3>
											<div className='flex flex-wrap gap-2'>
												{profile.favorite_genres.map((genre, index) => (
													<span
														key={index}
														className='bg-blue-100 text-blue-800 text-sm px-2.5 py-0.5 rounded'
													>
														{genre}
													</span>
												))}
											</div>
										</div>
									)}
							</>
						)}
					</div>
				</div>
			</Card>

			{!isEditing && (
				<Tabs style='underline' onActiveTabChange={(tab) => setActiveTab(tab)}>
					<Tabs.Item
						title='Biblioteka'
						icon={HiOutlineBookOpen}
						active={activeTab === 'books'}
					>
						{books.length === 0 ? (
							<div className='text-center py-12 text-gray-500'>
								Biblioteka jest pusta
							</div>
						) : (
							<BookList books={books} />
						)}
					</Tabs.Item>

					<Tabs.Item title='Półki' active={activeTab === 'shelves'}>
						{shelves.length === 0 ? (
							<div className='text-center py-12 text-gray-500'>
								Brak publicznych półek
							</div>
						) : (
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4'>
								{shelves.map((shelf) => (
									<Card key={shelf.id}>
										<h5 className='text-xl font-bold tracking-tight text-gray-900'>
											{shelf.name}
										</h5>
										{shelf.description && (
											<p className='font-normal text-gray-700 mb-4'>
												{shelf.description}
											</p>
										)}
										<Link
											to={`/shelves/${shelf.id}`}
											className='inline-flex items-center text-blue-600 hover:underline'
										>
											Zobacz książki
											<svg
												className='w-5 h-5 ml-1'
												fill='currentColor'
												viewBox='0 0 20 20'
												xmlns='http://www.w3.org/2000/svg'
											>
												<path
													fillRule='evenodd'
													d='M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z'
													clipRule='evenodd'
												></path>
											</svg>
										</Link>
									</Card>
								))}
							</div>
						)}
					</Tabs.Item>

					<Tabs.Item
						title='Społeczność'
						icon={HiOutlineUsers}
						active={activeTab === 'social'}
					>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-4'>
							<div>
								<h3 className='text-xl font-bold mb-4'>
									Obserwujący ({followersCount})
								</h3>
								<div id='followers-container' className='space-y-4'>
									{/* Followers will be loaded dynamically */}
								</div>
							</div>

							<div>
								<h3 className='text-xl font-bold mb-4'>
									Obserwowani ({followingCount})
								</h3>
								<div id='following-container' className='space-y-4'>
									{/* Following will be loaded dynamically */}
								</div>
							</div>
						</div>
					</Tabs.Item>
				</Tabs>
			)}
		</div>
	);
};

export default UserProfilePage;
