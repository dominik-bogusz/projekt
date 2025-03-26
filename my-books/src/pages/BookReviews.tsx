import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { useAuth } from '../context/AuthContext';
import { Book } from '../types/book';
import { Review, UserProfile } from '../types/review';
import ReviewForm from '../components/ReviewForm';
import ReviewsList from '../components/ReviewsList';
import RatingStars from '../components/RatingStars';
import Tabs from '../components/Tabs';
import { getBookById } from '../api/googleBooks';

// Typ dla recenzji z dołączonym użytkownikiem
type ReviewWithUser = Review & { user: UserProfile };

// Zgodny z oczekiwaniami komponentu ReviewForm
interface ReviewFormData {
	id: string;
	rating: number;
	content: string;
}

const BookReviews: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const [book, setBook] = useState<Book | null>(null);
	const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
	const [userReview, setUserReview] = useState<ReviewFormData | undefined>(
		undefined
	);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { user } = useAuth();

	const fetchBookData = async () => {
		if (!id) return;

		try {
			// Check if this is a custom book
			if (id.startsWith('custom_')) {
				const { data, error } = await supabase
					.from('books')
					.select('*')
					.eq('id', id)
					.single();

				if (error) throw error;

				if (data) {
					setBook({
						id: data.id,
						title: data.title,
						authors: data.authors,
						description: data.description,
						publishedDate: data.published_date,
						imageLinks: data.thumbnail
							? { thumbnail: data.thumbnail }
							: undefined,
						publisher: data.publisher,
						averageRating: data.average_rating,
					});
					return;
				}
			}

			// If not custom, fetch from Google Books
			const bookData = await getBookById(id);
			const volumeInfo = bookData.volumeInfo;

			setBook({
				id: bookData.id,
				title: volumeInfo.title,
				authors: volumeInfo.authors,
				description: volumeInfo.description,
				publishedDate: volumeInfo.publishedDate,
				pageCount: volumeInfo.pageCount,
				categories: volumeInfo.categories,
				imageLinks: volumeInfo.imageLinks,
				language: volumeInfo.language,
				averageRating: volumeInfo.averageRating,
				publisher: volumeInfo.publisher,
			});
		} catch (err) {
			console.error('Error fetching book details:', err);
			setError('Nie udało się pobrać szczegółów książki.');
		}
	};

	const fetchReviews = async () => {
		if (!id) return;

		try {
			const { data, error } = await supabase
				.from('reviews')
				.select(
					`
          *,
          user:profiles(id, email, display_name, avatar_url)
        `
				)
				.eq('book_id', id)
				.order('created_at', { ascending: false });

			if (error) throw error;

			setReviews(data || []);

			// Sprawdź, czy użytkownik już dodał recenzję
			if (user) {
				const review = data?.find((review) => review.user_id === user.id);
				if (review) {
					// Mapujemy do struktury oczekiwanej przez ReviewForm
					setUserReview({
						id: review.id,
						rating: review.rating,
						content: review.content,
					});
				} else {
					setUserReview(undefined);
				}
			}
		} catch (err) {
			console.error('Error fetching reviews:', err);
			setError('Nie udało się pobrać recenzji.');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchBookData();
		fetchReviews();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id, user?.id]);

	const handleReviewSubmitted = () => {
		fetchReviews();
	};

	if (isLoading) {
		return (
			<div className='max-w-6xl mx-auto px-4 py-8 flex justify-center'>
				<div className='animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent'></div>
			</div>
		);
	}

	if (error || !book) {
		return (
			<div className='max-w-6xl mx-auto px-4 py-8'>
				<div className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4'>
					<p>{error || 'Nie znaleziono książki.'}</p>
				</div>
			</div>
		);
	}

	const defaultCover = 'https://via.placeholder.com/128x192?text=Brak+Okładki';

	return (
		<div className='max-w-6xl mx-auto px-4 py-8'>
			<div className='bg-white rounded-lg shadow-md p-6 mb-8'>
				<div className='md:flex'>
					<div className='md:w-1/4 mb-6 md:mb-0 flex justify-center'>
						<img
							src={book.imageLinks?.thumbnail || defaultCover}
							alt={book.title}
							className='w-40 h-56 object-cover rounded'
						/>
					</div>

					<div className='md:w-3/4 md:pl-8'>
						<h1 className='text-3xl font-bold mb-2'>{book.title}</h1>

						<p className='text-xl text-gray-600 mb-4'>
							{book.authors ? book.authors.join(', ') : 'Nieznany autor'}
						</p>

						<div className='flex items-center mb-6'>
							<div className='flex items-center'>
								<RatingStars initialRating={book.averageRating || 0} readOnly />
								<span className='ml-2 text-gray-600'>
									{book.averageRating
										? `${book.averageRating.toFixed(1)} / 5.0`
										: 'Brak ocen'}
								</span>
							</div>
							<span className='ml-3 text-gray-500'>
								({reviews.length}{' '}
								{reviews.length === 1
									? 'recenzja'
									: reviews.length >= 2 && reviews.length <= 4
									? 'recenzje'
									: 'recenzji'}
								)
							</span>
						</div>

						<div className='mb-4'>
							<p className='line-clamp-3 text-gray-700'>
								{book.description || 'Brak opisu.'}
							</p>
						</div>
					</div>
				</div>
			</div>

			<div className='bg-white rounded-lg shadow-md p-6'>
				<Tabs>
					<Tabs.Item title='Recenzje' active>
						{user && (
							<div className='mb-8'>
								<ReviewForm
									book={book}
									onReviewSubmitted={handleReviewSubmitted}
									existingReview={userReview}
								/>
							</div>
						)}

						<h3 className='text-2xl font-bold mb-6'>
							Recenzje czytelników ({reviews.length})
						</h3>

						<ReviewsList
							reviews={reviews}
							currentUserId={user?.id}
							onEditReview={(review) => {
								// Upewnij się, że przekazujesz obiekt zgodny z typem ReviewFormData
								setUserReview({
									id: review.id,
									rating: review.rating,
									content: review.content,
								});
							}}
						/>
					</Tabs.Item>

					<Tabs.Item title='Statystyki'>
						<div className='py-4'>
							<h3 className='text-xl font-bold mb-4'>Rozkład ocen</h3>

							{reviews.length === 0 ? (
								<p className='text-gray-500'>
									Brak danych do wyświetlenia statystyk.
								</p>
							) : (
								<div className='space-y-3'>
									{[5, 4, 3, 2, 1].map((rating) => {
										const count = reviews.filter(
											(r) => r.rating === rating
										).length;
										const percentage = (count / reviews.length) * 100;

										return (
											<div key={rating} className='flex items-center'>
												<div className='w-12 text-right mr-2'>{rating} ⭐</div>
												<div className='w-full bg-gray-200 rounded-full h-3'>
													<div
														className='bg-yellow-400 h-3 rounded-full'
														style={{ width: `${percentage}%` }}
													></div>
												</div>
												<div className='w-16 text-right ml-2'>
													{count} ({percentage.toFixed(0)}%)
												</div>
											</div>
										);
									})}
								</div>
							)}
						</div>
					</Tabs.Item>
				</Tabs>
			</div>
		</div>
	);
};

export default BookReviews;
