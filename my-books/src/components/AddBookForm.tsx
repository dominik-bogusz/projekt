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
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;

		if (file) {
			// Validate file size (max 2MB)
			if (file.size > 2 * 1024 * 1024) {
				setError('Plik jest zbyt duży. Maksymalny rozmiar to 2MB.');
				return;
			}

			// Validate file type
			if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
				setError('Dozwolone są tylko pliki w formacie JPEG, PNG lub GIF.');
				return;
			}

			setFormData((prev) => ({ ...prev, coverImage: file }));

			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		} else {
			setFormData((prev) => ({ ...prev, coverImage: null }));
			setImagePreview(null);
		}
	};

	// Toast notification function
	const showToast = (
		message: string,
		type: 'success' | 'error' = 'success'
	) => {
		const toast = document.createElement('div');
		toast.className = `fixed bottom-4 right-4 ${
			type === 'success' ? 'bg-green-500' : 'bg-red-500'
		} text-white px-4 py-2 rounded shadow-lg z-50`;
		toast.textContent = message;
		document.body.appendChild(toast);

		setTimeout(() => {
			toast.classList.add('opacity-0', 'transition-opacity', 'duration-500');
			setTimeout(() => {
				document.body.removeChild(toast);
			}, 500);
		}, 3000);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);
		setSuccessMessage(null);

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
				// Create a unique filename to avoid collisions
				const fileExt = formData.coverImage.name.split('.').pop();
				const filename = `${Date.now()}-${Math.random()
					.toString(36)
					.substring(2, 15)}.${fileExt}`;

				const { error: uploadError, data } = await supabase.storage
					.from('book-covers')
					.upload(filename, formData.coverImage);

				if (uploadError) {
					console.error('Upload error:', uploadError);
					throw new Error(
						'Błąd podczas przesyłania obrazu: ' + uploadError.message
					);
				}

				if (!data) {
					throw new Error('Brak danych po przesłaniu pliku');
				}

				const { data: urlData } = supabase.storage
					.from('book-covers')
					.getPublicUrl(filename);

				if (!urlData) {
					throw new Error('Nie można uzyskać publicznego URL dla pliku');
				}

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

			setSuccessMessage('Książka została dodana do twojej biblioteki!');
			showToast('Książka została dodana do twojej biblioteki!', 'success');

			// Reset form after successful submission
			setFormData({
				title: '',
				authors: '',
				description: '',
				publishedDate: '',
				publisher: '',
				coverImage: null,
			});
			setImagePreview(null);

			// Navigate after a short delay so the user can see the success message
			setTimeout(() => {
				navigate('/my-books');
			}, 1500);
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

			{successMessage && (
				<div className='bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6'>
					<p>{successMessage}</p>
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

				<div className='flex flex-col md:flex-row md:items-center'>
					<div className='md:w-1/2 mb-4 md:mb-0'>
						<input
							type='file'
							id='coverImage'
							onChange={handleFileChange}
							accept='image/jpeg, image/png, image/gif'
							className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
						/>
						<p className='mt-1 text-sm text-gray-500'>
							PNG, JPG lub GIF (max. 2MB)
						</p>
					</div>

					{imagePreview && (
						<div className='md:w-1/2 flex justify-center'>
							<div className='relative'>
								<img
									src={imagePreview}
									alt='Podgląd okładki'
									className='w-32 h-48 object-cover border rounded'
								/>
								<button
									type='button'
									onClick={() => {
										setFormData((prev) => ({ ...prev, coverImage: null }));
										setImagePreview(null);
									}}
									className='absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center -mt-2 -mr-2 hover:bg-red-600'
								>
									✕
								</button>
							</div>
						</div>
					)}
				</div>
			</div>

			<div className='flex justify-end'>
				<button
					type='submit'
					disabled={isLoading}
					className='bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300 flex items-center'
				>
					{isLoading ? (
						<>
							<svg
								className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
								xmlns='http://www.w3.org/2000/svg'
								fill='none'
								viewBox='0 0 24 24'
							>
								<circle
									className='opacity-25'
									cx='12'
									cy='12'
									r='10'
									stroke='currentColor'
									strokeWidth='4'
								></circle>
								<path
									className='opacity-75'
									fill='currentColor'
									d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
								></path>
							</svg>
							Dodawanie...
						</>
					) : (
						'Dodaj książkę'
					)}
				</button>
			</div>
		</form>
	);
};

export default AddBookForm;
