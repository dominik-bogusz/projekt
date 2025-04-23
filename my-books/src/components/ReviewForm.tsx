import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabase';
import { Book } from '../types/book';
import RatingStars from './RatingStars';
import { HiInformationCircle } from 'react-icons/hi';

interface ReviewFormProps {
	book: Book;
	onReviewSubmitted?: () => void;
	existingReview?: {
		id: string;
		rating: number;
		content: string;
	};
}

const ReviewForm: React.FC<ReviewFormProps> = ({
	book,
	onReviewSubmitted,
	existingReview,
}) => {
	const [rating, setRating] = useState(existingReview?.rating || 0);
	const [content, setContent] = useState(existingReview?.content || '');
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const { user } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!user) {
			setError('Musisz być zalogowany, aby dodać recenzję.');
			return;
		}

		if (rating === 0) {
			setError('Musisz wybrać ocenę.');
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			if (existingReview) {
				const { error } = await supabase
					.from('reviews')
					.update({
						rating,
						content,
						updated_at: new Date().toISOString(),
					})
					.eq('id', existingReview.id);

				if (error) throw error;
			} else {
				const { error } = await supabase.from('reviews').insert([
					{
						user_id: user.id,
						book_id: book.id,
						rating,
						content,
					},
				]);

				if (error) throw error;
			}

			const { data: reviews } = await supabase
				.from('reviews')
				.select('rating')
				.eq('book_id', book.id);

			if (reviews && reviews.length > 0) {
				const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
				const avgRating = totalRating / reviews.length;

				await supabase
					.from('books')
					.update({ average_rating: avgRating })
					.eq('id', book.id);
			}

			setContent('');
			setRating(0);

			if (onReviewSubmitted) {
				onReviewSubmitted();
			}
		} catch (err) {
			console.error('Błąd podczas dodawania recenzji:', err);
			setError('Wystąpił błąd podczas zapisywania recenzji. Spróbuj ponownie.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='bg-white p-6 rounded-lg shadow-sm'>
			<h3 className='text-xl font-bold mb-4'>
				{existingReview ? 'Edytuj swoją recenzję' : 'Dodaj recenzję'}
			</h3>

			{error && (
				<div className='p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg flex'>
					<HiInformationCircle className='flex-shrink-0 mr-3 w-5 h-5' />
					<span>{error}</span>
				</div>
			)}

			<form onSubmit={handleSubmit}>
				<div className='mb-4'>
					<label className='block text-gray-700 mb-2'>Twoja ocena</label>
					<RatingStars initialRating={rating} onChange={setRating} size='lg' />
				</div>

				<div className='mb-4'>
					<label htmlFor='review' className='block text-gray-700 mb-2'>
						Twoja recenzja
					</label>
					<textarea
						id='review'
						className='w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
						value={content}
						onChange={(e) => setContent(e.target.value)}
						placeholder='Podziel się swoimi przemyśleniami na temat tej książki...'
						rows={6}
						required
					/>
				</div>

				<button
					type='submit'
					disabled={isLoading}
					className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300'
				>
					{isLoading
						? 'Zapisywanie...'
						: existingReview
						? 'Zaktualizuj recenzję'
						: 'Dodaj recenzję'}
				</button>
			</form>
		</div>
	);
};

export default ReviewForm;
