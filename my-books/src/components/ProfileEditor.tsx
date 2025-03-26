import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabase';
import { UserProfile } from '../types/profile';

interface ProfileEditorProps {
	profile: Partial<UserProfile>;
	onProfileUpdated: (profile: UserProfile) => void;
}

const BOOK_GENRES = [
	'Fantasy',
	'Science Fiction',
	'Thriller',
	'Horror',
	'Kryminał',
	'Romans',
	'Literatura piękna',
	'Historia',
	'Biografia',
	'Poradniki',
	'Non-fiction',
	'Dla dzieci',
	'Komiks',
	'Klasyka',
	'Poezja',
];

const ProfileEditor: React.FC<ProfileEditorProps> = ({
	profile,
	onProfileUpdated,
}) => {
	const [formData, setFormData] = useState({
		display_name: profile.display_name || '',
		bio: profile.bio || '',
		location: profile.location || '',
		website: profile.website || '',
		favorite_genres: profile.favorite_genres || [],
		is_public: profile.is_public !== false,
	});

	const [selectedGenres, setSelectedGenres] = useState<string[]>(
		profile.favorite_genres || []
	);

	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | null>(
		profile.avatar_url || null
	);

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { user } = useAuth();

	const handleInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value;

		if (!selectedGenres.includes(value) && value !== '') {
			setSelectedGenres([...selectedGenres, value]);
		}
	};

	const removeGenre = (genre: string) => {
		setSelectedGenres(selectedGenres.filter((g) => g !== genre));
	};

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;

		if (file) {
			setAvatarFile(file);

			// Create preview
			const reader = new FileReader();
			reader.onloadend = () => {
				setAvatarPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!user) return;

		setIsLoading(true);
		setError(null);

		try {
			let avatarUrl = profile.avatar_url;

			// Upload avatar if changed
			if (avatarFile) {
				const fileExt = avatarFile.name.split('.').pop();
				const filePath = `avatars/${user.id}/${Date.now()}.${fileExt}`;

				const { error: uploadError } = await supabase.storage
					.from('profiles')
					.upload(filePath, avatarFile);

				if (uploadError) throw uploadError;

				const { data: urlData } = supabase.storage
					.from('profiles')
					.getPublicUrl(filePath);

				avatarUrl = urlData.publicUrl;
			}

			// Update profile
			const { data, error } = await supabase
				.from('profiles')
				.upsert({
					id: profile.id || user.id,
					user_id: user.id,
					display_name: formData.display_name || null,
					bio: formData.bio || null,
					location: formData.location || null,
					website: formData.website || null,
					avatar_url: avatarUrl,
					favorite_genres: selectedGenres.length ? selectedGenres : null,
					is_public: formData.is_public,
				})
				.select('*')
				.single();

			if (error) throw error;

			if (data && onProfileUpdated) {
				onProfileUpdated(data);
			}
		} catch (err) {
			console.error('Error updating profile:', err);
			setError('Wystąpił błąd podczas aktualizacji profilu. Spróbuj ponownie.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className='space-y-6'>
			{error && (
				<div className='p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg'>
					{error}
				</div>
			)}

			<div>
				<div className='flex items-center mb-4'>
					<div className='mr-6'>
						<div className='relative w-24 h-24 overflow-hidden rounded-full bg-gray-100'>
							{avatarPreview ? (
								<img
									src={avatarPreview}
									alt='Avatar preview'
									className='w-full h-full object-cover'
								/>
							) : (
								<div className='flex items-center justify-center w-full h-full text-gray-400'>
									<svg
										className='w-12 h-12'
										fill='currentColor'
										viewBox='0 0 20 20'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path
											fillRule='evenodd'
											d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
											clipRule='evenodd'
										></path>
									</svg>
								</div>
							)}
						</div>
					</div>

					<div className='flex-1'>
						<label
							htmlFor='avatar'
							className='block text-sm font-medium text-gray-700'
						>
							Zdjęcie profilowe
						</label>
						<input
							id='avatar'
							type='file'
							onChange={handleAvatarChange}
							accept='image/png, image/jpeg, image/gif'
							className='mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
						/>
						<p className='mt-1 text-sm text-gray-500'>
							PNG, JPG lub GIF (max. 2MB)
						</p>
					</div>
				</div>
			</div>

			<div>
				<label
					htmlFor='display_name'
					className='block text-sm font-medium text-gray-700 mb-1'
				>
					Nazwa wyświetlana
				</label>
				<input
					id='display_name'
					name='display_name'
					type='text'
					value={formData.display_name}
					onChange={handleInputChange}
					placeholder='Jak chcesz być widoczny/a dla innych'
					className='shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border'
				/>
			</div>

			<div>
				<label
					htmlFor='bio'
					className='block text-sm font-medium text-gray-700 mb-1'
				>
					O mnie
				</label>
				<textarea
					id='bio'
					name='bio'
					value={formData.bio}
					onChange={handleInputChange}
					placeholder='Kilka słów o sobie i swoich czytelniczych zainteresowaniach'
					rows={4}
					className='shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border'
				/>
			</div>

			<div>
				<label
					htmlFor='location'
					className='block text-sm font-medium text-gray-700 mb-1'
				>
					Lokalizacja
				</label>
				<input
					id='location'
					name='location'
					type='text'
					value={formData.location}
					onChange={handleInputChange}
					placeholder='Np. Warszawa, Kraków'
					className='shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border'
				/>
			</div>

			<div>
				<label
					htmlFor='website'
					className='block text-sm font-medium text-gray-700 mb-1'
				>
					Strona internetowa
				</label>
				<input
					id='website'
					name='website'
					type='text'
					value={formData.website}
					onChange={handleInputChange}
					placeholder='https://twoja-strona.pl'
					className='shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border'
				/>
			</div>

			<div>
				<label className='block text-sm font-medium text-gray-700 mb-2'>
					Ulubione gatunki
				</label>

				<div className='flex flex-wrap gap-2 mb-2'>
					{selectedGenres.map((genre) => (
						<span
							key={genre}
							className='bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center'
						>
							{genre}
							<button
								type='button'
								onClick={() => removeGenre(genre)}
								className='ml-1 text-blue-600 hover:text-blue-800'
							>
								&times;
							</button>
						</span>
					))}
				</div>

				<select
					onChange={handleGenreChange}
					value=''
					className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
				>
					<option value=''>Wybierz gatunek</option>
					{BOOK_GENRES.filter((genre) => !selectedGenres.includes(genre)).map(
						(genre) => (
							<option key={genre} value={genre}>
								{genre}
							</option>
						)
					)}
				</select>
			</div>

			<div className='flex items-center gap-2'>
				<label className='inline-flex items-center cursor-pointer'>
					<input
						type='checkbox'
						checked={formData.is_public}
						onChange={() =>
							setFormData((prev) => ({ ...prev, is_public: !prev.is_public }))
						}
						className='sr-only peer'
					/>
					<div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
					<span className='ms-3 text-sm font-medium text-gray-900'>
						Profil publiczny (widoczny dla innych użytkowników)
					</span>
				</label>
			</div>

			<button
				type='submit'
				disabled={isLoading}
				className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300'
			>
				{isLoading ? 'Zapisywanie...' : 'Zapisz zmiany'}
			</button>
		</form>
	);
};

export default ProfileEditor;
