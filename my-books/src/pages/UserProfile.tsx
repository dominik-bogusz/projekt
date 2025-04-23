// src/pages/UserProfile.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { useAuth } from '../context/AuthContext';
import { UserProfile, BookShelf } from '../types/profile';
import { Book } from '../types/book';
import {
	HiOutlineUsers,
	HiOutlineBookOpen,
	HiOutlinePencil,
} from 'react-icons/hi';
import ProfileEditor from '../components/ProfileEditor';
import BookList from '../components/BookList';

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
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	const { user } = useAuth();

	useEffect(() => {
		if (!id) return;

		const fetchProfile = async () => {
			setIsLoading(true);
			setError(null);

			try {
				// Sprawdź, czy to profil aktualnego użytkownika
				if (user && user.id === id) {
					// Jeśli tak, to najpierw sprawdź, czy istnieje profil w bazie
					const { data: profileData, error: profileError } = await supabase
						.from('profiles')
						.select('*')
						.eq('id', id)
						.maybeSingle();

					if (profileError && profileError.code !== 'PGRST116') {
						throw profileError;
					}

					// Jeśli nie istnieje profil, utwórz go
					if (!profileData) {
						const { data: newProfile, error: createError } = await supabase
							.from('profiles')
							.insert([
								{
									id: user.id,
									user_id: user.id,
									display_name: user.email?.split('@')[0] || 'Użytkownik',
									email: user.email,
									is_public: true,
								},
							])
							.select('*')
							.single();

						if (createError) throw createError;

						setProfile(newProfile);
						setIsOwnProfile(true);
					} else {
						setProfile(profileData);
						setIsOwnProfile(true);
					}
				} else {
					// Fetch profile dla innego użytkownika
					const { data: profileData, error: profileError } = await supabase
						.from('profiles')
						.select('*')
						.eq('id', id)
						.single();

					if (profileError) {
						throw profileError;
					}

					if (profileData) {
						setProfile(profileData);
						setIsOwnProfile(user?.id === profileData.id);

						// If private profile, check if current user is the owner
						if (!profileData.is_public && user?.id !== profileData.id) {
							setError('Ten profil jest prywatny.');
							setIsLoading(false);
							return;
						}
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
				setError('Nie udało się załadować profilu. Spróbuj ponownie później.');
			} finally {
				setIsLoading(false);
			}
		};

		fetchProfile();
	}, [id, user, navigate]);

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
				<div
					className='inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]'
					role='status'
				>
					<span className='!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]'>
						Ładowanie...
					</span>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='max-w-6xl mx-auto px-4 py-12'>
				<div className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4'>
					<p>{error}</p>
				</div>
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
			<div className='bg-white rounded-lg shadow overflow-hidden mb-8'>
				<div className='p-6'>
					<div className='flex flex-col md:flex-row'>
						<div className='md:w-1/4 mb-6 md:mb-0 flex flex-col items-center'>
							<div className='h-32 w-32 rounded-full overflow-hidden mb-4'>
								<img
									src={profile.avatar_url || 'https://via.placeholder.com/150'}
									alt={`${profile.display_name || 'User'} avatar`}
									className='h-full w-full object-cover'
								/>
							</div>

							<div className='text-center'>
								<h2 className='text-2xl font-bold'>
									{profile.display_name || profile.email?.split('@')[0] || 'Użytkownik'}
								</h2>

								{profile.location && (
									<p className='text-gray-600 mt-1'>{profile.location}</p>
								)}

								{profile.website && (
									
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
								<button
									className={`mt-4 px-4 py-2 rounded-lg ${
										isFollowing
											? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
											: 'bg-blue-600 text-white hover:bg-blue-700'
									}`}
									onClick={handleFollowToggle}
								>
									{isFollowing ? 'Obserwujesz' : 'Obserwuj'}
								</button>
							)}

							{isOwnProfile && !isEditing && (
								<button
									className='mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50'
									onClick={() => setIsEditing(true)}
								>
									<HiOutlinePencil className='mr-2' />
									Edytuj profil
								</button>
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
				</div>
			</div>

			{!isEditing && (
				<div>
					<div className='border-b border-gray-200 mb-6'>
						<ul className='flex flex-wrap -mb-px text-sm font-medium text-center'>
							<li className='mr-2'>
								<button
									onClick={() => setActiveTab('books')}
									className={`inline-flex items-center p-4 rounded-t-lg border-b-2 ${
										activeTab === 'books'
											? 'text-blue-600 border-blue-600'
											: 'border-transparent hover:text-gray-600 hover:border-gray-300'
									}`}
								>
									<HiOutlineBookOpen className='w-5 h-5 mr-2' />
									<span>Biblioteka</span>
								</button>
							</li>
							<li className='mr-2'>
								<button
									onClick={() => setActiveTab('shelves')}
									className={`inline-flex items-center p-4 rounded-t-lg border-b-2 ${
										activeTab === 'shelves'
											? 'text-blue-600 border-blue-600'
											: 'border-transparent hover:text-gray-600 hover:border-gray-300'
									}`}
								>
									<span>Półki</span>
								</button>
							</li>
							<li className='mr-2'>
								<button
									onClick={() => setActiveTab('social')}
									className={`inline-flex items-center p-4 rounded-t-lg border-b-2 ${
										activeTab === 'social'
											? 'text-blue-600 border-blue-600'
											: 'border-transparent hover:text-gray-600 hover:border-gray-300'
									}`}
								>
									<HiOutlineUsers className='w-5 h-5 mr-2' />
									<span>Społeczność</span>
								</button>
							</li>
						</ul>
					</div>

					{activeTab === 'books' && (
						<>
							{books.length === 0 ? (
								<div className='text-center py-12 text-gray-500'>
									Biblioteka jest pusta
								</div>
							) : (
								<BookList books={books} />
							)}
						</>
					)}

					{activeTab === 'shelves' && (
						<>
							{shelves.length === 0 ? (
								<div className='text-center py-12 text-gray-500'>
									Brak publicznych półek
								</div>
							) : (
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4'>
									{shelves.map((shelf) => (
										<div
											key={shelf.id}
											className='bg-white border border-gray-200 rounded-lg shadow p-6'
										>
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
										</div>
									))}
								</div>
							)}
						</>
					)}

					{activeTab === 'social' && (
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
					)}
				</div>
			)}
		</div>
	);
};

export default UserProfilePage;