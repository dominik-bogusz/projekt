import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabase';
import { UserProfile } from '../types/profile';
import {
	Button,
	TextInput,
	Textarea,
	Toggle,
	FileInput,
	Select,
	Label,
} from 'flowbite-react';

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
						<Label htmlFor='avatar' value='Zdjęcie profilowe' />
						<FileInput
							id='avatar'
							onChange={handleAvatarChange}
							accept='image/png, image/jpeg, image/gif'
							helperText='PNG, JPG lub GIF (max. 2MB)'
						/>
					</div>
				</div>
			</div>

			<div>
				<Label htmlFor='display_name' value='Nazwa wyświetlana' />
				<TextInput
					id='display_name'
					name='display_name'
					value={formData.display_name}
					onChange={handleInputChange}
					placeholder='Jak chcesz być widoczny/a dla innych'
				/>
			</div>

			<div>
				<Label htmlFor='bio' value='O mnie' />
				<Textarea
					id='bio'
					name='bio'
					value={formData.bio}
					onChange={handleInputChange}
					placeholder='Kilka słów o sobie i swoich czytelniczych zainteresowaniach'
					rows={4}
				/>
			</div>

			<div>
				<Label htmlFor='location' value='Lokalizacja' />
				<TextInput
					id='location'
					name='location'
					value={formData.location}
					onChange={handleInputChange}
					placeholder='Np. Warszawa, Kraków'
				/>
			</div>

			<div>
				<Label htmlFor='website' value='Strona internetowa' />
				<TextInput
					id='website'
					name='website'
					value={formData.website}
					onChange={handleInputChange}
					placeholder='https://twoja-strona.pl'
				/>
			</div>

			<div>
				<label className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>
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

				<Select onChange={handleGenreChange} value=''>
					<option value=''>Wybierz gatunek</option>
					{BOOK_GENRES.filter((genre) => !selectedGenres.includes(genre)).map(
						(genre) => (
							<option key={genre} value={genre}>
								{genre}
							</option>
						)
					)}
				</Select>
			</div>

			<div className='flex items-center gap-2'>
				<Toggle
					id='is_public'
					checked={formData.is_public}
					onChange={() =>
						setFormData((prev) => ({ ...prev, is_public: !prev.is_public }))
					}
				/>
				<Label htmlFor='is_public'>
					Profil publiczny (widoczny dla innych użytkowników)
				</Label>
			</div>

			<Button type='submit' disabled={isLoading}>
				{isLoading ? 'Zapisywanie...' : 'Zapisz zmiany'}
			</Button>
		</form>
	);
};

export default ProfileEditor;
