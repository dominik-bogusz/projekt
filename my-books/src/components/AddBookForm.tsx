import React, { useState } from 'react';
import { supabase } from '../api/supabase';
import { useNavigate } from 'react-router-dom';

interface FormData {
	title: string;
	authors: string;
	description: string;
	publishedDate: string;
	publisher: string;
	coverImage: File | null;
}

const AddBookForm: React.FC = () => {
	const navigate = useNavigate();
	const [formData, setFormData] = useState<FormData>({
		title: '',
		authors: '',
		description: '',
		publishedDate: '',
		publisher: '',
		coverImage: null,
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		setFormData((prev) => ({ ...prev, coverImage: file }));

		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		} else {
			setImagePreview(null);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				setError('Musisz się zalogować, aby dodać książkę');
				return;
			}

			let coverUrl = null;

			if (formData.coverImage) {
				const filename = `${Date.now()}-${formData.coverImage.name}`;

				const { error: uploadError } = await supabase.storage
					.from('book-covers')
					.upload(filename, formData.coverImage);

				if (uploadError) throw uploadError;

				const { data: urlData } = supabase.storage
					.from('book-covers')
					.getPublicUrl(filename);

				coverUrl = urlData.publicUrl;
			}

			const { error: insertError } = await supabase.from('books').insert([
				{
					title: formData.title,
					authors: formData.authors.split(',').map((author) => author.trim()),
					description: formData.description,
					published_date: formData.publishedDate,
					publisher: formData.publisher,
					thumbnail: coverUrl,
					user_id: session.user.id,
					is_custom: true,
				},
			]);

			if (insertError) throw insertError;

			alert('Książka została dodana do twojej biblioteki!');
			navigate('/my-books');
		} catch (error) {
			console.error('Błąd dodawania książki:', error);
			setError('Wystąpił błąd podczas dodawania książki. Spróbuj ponownie.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md'
		>
			<h2 className='text-2xl font-bold mb-6'>Dodaj własną książkę</h2>

			{error && (
				<div className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6'>
					<p>{error}</p>
				</div>
			)}

			<div className='mb-4'>
				<label htmlFor='title' className='block text-gray-700 font-medium mb-2'>
					Tytuł*
				</label>
				<input
					required
					type='text'
					id='title'
					name='title'
					value={formData.title}
					onChange={handleInputChange}
					className='w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
				/>
			</div>

			<div className='mb-4'>
				<label
					htmlFor='authors'
					className='block text-gray-700 font-medium mb-2'
				>
					Autorzy* (rozdziel przecinkami)
				</label>
				<input
					required
					type='text'
					id='authors'
					name='authors'
					value={formData.authors}
					onChange={handleInputChange}
					placeholder='Jan Kowalski, Anna Nowak'
					className='w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
				/>
			</div>

			<div className='mb-4'>
				<label
					htmlFor='description'
					className='block text-gray-700 font-medium mb-2'
				>
					Opis
				</label>
				<textarea
					id='description'
					name='description'
					value={formData.description}
					onChange={handleInputChange}
					rows={4}
					className='w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
				/>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
				<div>
					<label
						htmlFor='publishedDate'
						className='block text-gray-700 font-medium mb-2'
					>
						Data wydania
					</label>
					<input
						type='date'
						id='publishedDate'
						name='publishedDate'
						value={formData.publishedDate}
						onChange={handleInputChange}
						className='w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
					/>
				</div>

				<div>
					<label
						htmlFor='publisher'
						className='block text-gray-700 font-medium mb-2'
					>
						Wydawnictwo
					</label>
					<input
						type='text'
						id='publisher'
						name='publisher'
						value={formData.publisher}
						onChange={handleInputChange}
						className='w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
					/>
				</div>
			</div>

			<div className='mb-6'>
				<label
					htmlFor='coverImage'
					className='block text-gray-700 font-medium mb-2'
				>
					Okładka książki
				</label>

				<div className='flex items-center'>
					<input
						type='file'
						id='coverImage'
						onChange={handleFileChange}
						accept='image/jpeg, image/png, image/gif'
						className='hidden'
					/>
					<label
						htmlFor='coverImage'
						className='cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded'
					>
						Wybierz plik
					</label>
					<span className='ml-3 text-gray-600'>
						{formData.coverImage
							? formData.coverImage.name
							: 'Nie wybrano pliku'}
					</span>
				</div>

				{imagePreview && (
					<div className='mt-4'>
						<p className='text-gray-700 mb-2'>Podgląd:</p>
						<img
							src={imagePreview}
							alt='Podgląd okładki'
							className='w-32 h-48 object-cover border rounded'
						/>
					</div>
				)}
			</div>

			<div className='flex justify-end'>
				<button
					type='submit'
					disabled={isLoading}
					className='bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300'
				>
					{isLoading ? 'Dodawanie...' : 'Dodaj książkę'}
				</button>
			</div>
		</form>
	);
};

export default AddBookForm;
