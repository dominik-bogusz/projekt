import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { useAuth } from '../context/AuthContext';
import { BookShelf } from '../types/profile';
import { Book } from '../types/book';
import BookList from '../components/BookList';
import { HiPlus, HiPencilAlt, HiTrash, HiCollection } from 'react-icons/hi';

const BookShelves: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { user } = useAuth();

	const [shelves, setShelves] = useState<BookShelf[]>([]);
	const [currentShelf, setCurrentShelf] = useState<BookShelf | null>(null);
	const [books, setBooks] = useState<Book[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [showEditForm, setShowEditForm] = useState(false);
	const [newShelfName, setNewShelfName] = useState('');
	const [newShelfDescription, setNewShelfDescription] = useState('');
	const [isPublic, setIsPublic] = useState(true);

	useEffect(() => {
		if (!user) {
			navigate('/login');
			return;
		}

		const fetchShelves = async () => {
			try {
				const { data, error } = await supabase
					.from('book_shelves')
					.select('*')
					.eq('user_id', user.id)
					.order('created_at', { ascending: false });

				if (error) throw error;
				setShelves(data || []);

				if (id) {
					fetchShelfBooks(id);
				} else {
					setIsLoading(false);
				}
			} catch (error) {
				console.error('Błąd podczas pobierania półek:', error);
				setIsLoading(false);
			}
		};

		fetchShelves();
	}, [user, id, navigate]);

	const fetchShelfBooks = async (shelfId: string) => {
		setIsLoading(true);
		try {
			// Najpierw pobierz informacje o półce
			const { data: shelfData, error: shelfError } = await supabase
				.from('book_shelves')
				.select('*')
				.eq('id', shelfId)
				.single();

			if (shelfError) throw shelfError;
			setCurrentShelf(shelfData);

			// Sprawdź, czy użytkownik ma dostęp do tej półki
			if (shelfData.user_id !== user?.id && !shelfData.is_public) {
				navigate('/shelves');
				return;
			}

			// Pobierz powiązania książek z tą półką
			const { data: bookShelfItems, error: itemsError } = await supabase
				.from('book_shelf_items')
				.select('book_id')
				.eq('shelf_id', shelfId);

			if (itemsError) throw itemsError;

			if (!bookShelfItems || bookShelfItems.length === 0) {
				setBooks([]);
				setIsLoading(false);
				return;
			}

			// Pobierz książki na podstawie ich ID
			const bookIds = bookShelfItems.map((item) => item.book_id);
			const { data: booksData, error: booksError } = await supabase
				.from('books')
				.select('*')
				.in('id', bookIds);

			if (booksError) throw booksError;

			const formattedBooks: Book[] = (booksData || []).map((item) => ({
				id: item.google_books_id || item.id,
				title: item.title,
				authors: item.authors,
				description: item.description,
				publishedDate: item.published_date,
				imageLinks: item.thumbnail ? { thumbnail: item.thumbnail } : undefined,
				publisher: item.publisher,
				isCustom: item.is_custom,
			}));

			setBooks(formattedBooks);
		} catch (error) {
			console.error('Błąd podczas pobierania książek z półki:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCreateShelf = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user || !newShelfName.trim()) return;

		try {
			const { data, error } = await supabase
				.from('book_shelves')
				.insert([
					{
						user_id: user.id,
						name: newShelfName.trim(),
						description: newShelfDescription.trim() || null,
						is_public: isPublic,
					},
				])
				.select();

			if (error) throw error;

			// Dodajemy nowo utworzoną półkę do listy
			if (data && data.length > 0) {
				setShelves([data[0], ...shelves]);
				setShowCreateForm(false);
				setNewShelfName('');
				setNewShelfDescription('');
				setIsPublic(true);
			}
		} catch (error) {
			console.error('Błąd podczas tworzenia półki:', error);
		}
	};

	const handleEditShelf = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user || !currentShelf || !newShelfName.trim()) return;

		try {
			const { error } = await supabase
				.from('book_shelves')
				.update({
					name: newShelfName.trim(),
					description: newShelfDescription.trim() || null,
					is_public: isPublic,
				})
				.eq('id', currentShelf.id)
				.eq('user_id', user.id);

			if (error) throw error;

			// Aktualizujemy półkę w lokalnym stanie
			setShelves(
				shelves.map((shelf) =>
					shelf.id === currentShelf.id
						? {
								...shelf,
								name: newShelfName.trim(),
								description: newShelfDescription.trim() || null,
								is_public: isPublic,
						  }
						: shelf
				)
			);

			setCurrentShelf({
				...currentShelf,
				name: newShelfName.trim(),
				description: newShelfDescription.trim() || null,
				is_public: isPublic,
			});

			setShowEditForm(false);
		} catch (error) {
			console.error('Błąd podczas edycji półki:', error);
		}
	};

	const handleDeleteShelf = async (shelfId: string) => {
		if (
			!user ||
			!confirm(
				'Czy na pewno chcesz usunąć tę półkę? Tej operacji nie można cofnąć.'
			)
		)
			return;

		try {
			const { error } = await supabase
				.from('book_shelves')
				.delete()
				.eq('id', shelfId)
				.eq('user_id', user.id);

			if (error) throw error;

			// Usuwamy półkę z lokalnego stanu
			setShelves(shelves.filter((shelf) => shelf.id !== shelfId));

			// Jeśli usunęliśmy aktualnie wyświetlaną półkę, przekieruj do listy półek
			if (id === shelfId) {
				navigate('/shelves');
			}
		} catch (error) {
			console.error('Błąd podczas usuwania półki:', error);
		}
	};

	// Rozpocznij edycję półki
	const startEditShelf = () => {
		if (!currentShelf) return;

		setNewShelfName(currentShelf.name);
		setNewShelfDescription(currentShelf.description || '');
		setIsPublic(currentShelf.is_public);
		setShowEditForm(true);
	};

	// Formularz tworzenia lub edycji półki
	const renderShelfForm = (isEdit: boolean) => {
		return (
			<div className='bg-white p-6 rounded-lg shadow mb-6'>
				<h2 className='text-xl font-bold mb-4'>
					{isEdit ? 'Edytuj półkę' : 'Utwórz nową półkę'}
				</h2>
				<form onSubmit={isEdit ? handleEditShelf : handleCreateShelf}>
					<div className='mb-4'>
						<label
							htmlFor='shelfName'
							className='block text-gray-700 font-medium mb-2'
						>
							Nazwa półki*
						</label>
						<input
							type='text'
							id='shelfName'
							value={newShelfName}
							onChange={(e) => setNewShelfName(e.target.value)}
							className='w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
							required
						/>
					</div>

					<div className='mb-4'>
						<label
							htmlFor='shelfDescription'
							className='block text-gray-700 font-medium mb-2'
						>
							Opis (opcjonalny)
						</label>
						<textarea
							id='shelfDescription'
							value={newShelfDescription}
							onChange={(e) => setNewShelfDescription(e.target.value)}
							className='w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
							rows={3}
						/>
					</div>

					<div className='mb-6 flex items-center'>
						<input
							type='checkbox'
							id='isPublic'
							checked={isPublic}
							onChange={(e) => setIsPublic(e.target.checked)}
							className='mr-2'
						/>
						<label htmlFor='isPublic' className='text-gray-700'>
							Półka publiczna (widoczna dla innych użytkowników)
						</label>
					</div>

					<div className='flex gap-2'>
						<button
							type='submit'
							className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
						>
							{isEdit ? 'Zapisz zmiany' : 'Utwórz półkę'}
						</button>
						<button
							type='button'
							onClick={() =>
								isEdit ? setShowEditForm(false) : setShowCreateForm(false)
							}
							className='px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300'
						>
							Anuluj
						</button>
					</div>
				</form>
			</div>
		);
	};

	return (
		<div className='max-w-6xl mx-auto px-4 py-8'>
			{!user ? (
				<div className='bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4'>
					<p>Musisz się zalogować, aby zobaczyć półki z książkami.</p>
				</div>
			) : id && currentShelf ? (
				// Widok pojedynczej półki
				<>
					<div className='flex justify-between items-center mb-6'>
						<div>
							<h1 className='text-3xl font-bold'>{currentShelf.name}</h1>
							{currentShelf.description && (
								<p className='text-gray-600 mt-2'>{currentShelf.description}</p>
							)}
						</div>

						{user?.id === currentShelf.user_id && (
							<div className='flex gap-2'>
								<button
									onClick={startEditShelf}
									className='inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200'
								>
									<HiPencilAlt className='mr-1' /> Edytuj
								</button>
								<button
									onClick={() => handleDeleteShelf(currentShelf.id)}
									className='inline-flex items-center px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200'
								>
									<HiTrash className='mr-1' /> Usuń
								</button>
							</div>
						)}
					</div>

					{showEditForm && renderShelfForm(true)}

					<BookList books={books} isLoading={isLoading} />
				</>
			) : (
				// Widok listy półek
				<>
					<div className='flex justify-between items-center mb-6'>
						<h1 className='text-3xl font-bold'>Moje półki</h1>

						{!showCreateForm && (
							<button
								onClick={() => setShowCreateForm(true)}
								className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
							>
								<HiPlus className='mr-1' /> Nowa półka
							</button>
						)}
					</div>

					{showCreateForm && renderShelfForm(false)}

					{isLoading ? (
						<div className='flex justify-center py-8'>
							<div className='animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500'></div>
						</div>
					) : shelves.length === 0 ? (
						<div className='bg-white p-8 rounded-lg shadow text-center'>
							<HiCollection className='mx-auto h-16 w-16 text-gray-400 mb-4' />
							<h3 className='text-xl font-medium text-gray-900 mb-2'>
								Brak półek
							</h3>
							<p className='text-gray-500 mb-6'>
								Utwórz swoją pierwszą półkę, aby zorganizować swoje książki.
							</p>
							{!showCreateForm && (
								<button
									onClick={() => setShowCreateForm(true)}
									className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
								>
									<HiPlus className='mr-1' /> Utwórz półkę
								</button>
							)}
						</div>
					) : (
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
							{shelves.map((shelf) => (
								<div
									key={shelf.id}
									className='bg-white border border-gray-200 rounded-lg shadow p-6'
								>
									<div className='flex justify-between items-start'>
										<h5 className='text-xl font-bold tracking-tight text-gray-900'>
											{shelf.name}
										</h5>
										<div className='flex'>
											<button
												onClick={() => {
													setCurrentShelf(shelf);
													setNewShelfName(shelf.name);
													setNewShelfDescription(shelf.description || '');
													setIsPublic(shelf.is_public);
													setShowEditForm(true);
												}}
												className='text-gray-500 hover:text-gray-700 mr-2'
											>
												<HiPencilAlt />
											</button>
											<button
												onClick={() => handleDeleteShelf(shelf.id)}
												className='text-red-500 hover:text-red-700'
											>
												<HiTrash />
											</button>
										</div>
									</div>

									{shelf.description && (
										<p className='font-normal text-gray-700 mb-4 mt-2'>
											{shelf.description}
										</p>
									)}

									{!shelf.is_public && (
										<span className='bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded mb-3 inline-block'>
											Prywatna
										</span>
									)}

									<button
										onClick={() => navigate(`/shelves/${shelf.id}`)}
										className='inline-flex items-center text-blue-600 hover:underline mt-2'
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
											/>
										</svg>
									</button>
								</div>
							))}
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default BookShelves;
