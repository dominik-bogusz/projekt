// src/hooks/useReviews.ts
import { useState, useCallback } from 'react';
import { reviewClient } from '../api/client';
import { Review } from '../types/review';
import { useAuth } from '../context/AuthContext';
import useToast from './useToast';

interface UseReviewsReturn {
	reviews: Review[];
	userReview: { id: string; rating: number; content: string } | undefined;
	isLoading: boolean;
	fetchReviews: (bookId: string) => Promise<void>;
	saveReview: (
		bookId: string,
		rating: number,
		content: string
	) => Promise<boolean>;
	setEditingReview: (review: Review) => void;
}

/**
 * Hook for managing book reviews
 */
const useReviews = (): UseReviewsReturn => {
	const [reviews, setReviews] = useState<Review[]>([]);
	const [userReview, setUserReview] = useState<
		{ id: string; rating: number; content: string } | undefined
	>(undefined);
	const [isLoading, setIsLoading] = useState(false);
	const { user } = useAuth();
	const toast = useToast();

	const fetchReviews = useCallback(
		async (bookId: string) => {
			setIsLoading(true);
			try {
				const fetchedReviews = await reviewClient.getBookReviews(bookId);
				setReviews(fetchedReviews);

				// Check if the current user has already reviewed this book
				if (user) {
					const review = fetchedReviews.find(
						(review) => review.user_id === user.id
					);
					if (review) {
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
				toast.error('Nie udało się pobrać recenzji.');
			} finally {
				setIsLoading(false);
			}
		},
		[user, toast]
	);

	const saveReview = useCallback(
		async (
			bookId: string,
			rating: number,
			content: string
		): Promise<boolean> => {
			if (!user) {
				toast.error('Musisz być zalogowany, aby dodać recenzję.');
				return false;
			}

			if (rating === 0) {
				toast.error('Musisz wybrać ocenę.');
				return false;
			}

			setIsLoading(true);
			try {
				await reviewClient.saveReview(
					bookId,
					user.id,
					rating,
					content,
					userReview?.id
				);

				toast.success(
					userReview
						? 'Recenzja została zaktualizowana!'
						: 'Recenzja została dodana!'
				);

				// Refresh reviews
				await fetchReviews(bookId);
				return true;
			} catch (err) {
				console.error('Błąd podczas zapisywania recenzji:', err);
				toast.error('Wystąpił błąd podczas zapisywania recenzji.');
				return false;
			} finally {
				setIsLoading(false);
			}
		},
		[user, userReview, fetchReviews, toast]
	);

	const setEditingReview = useCallback((review: Review) => {
		setUserReview({
			id: review.id,
			rating: review.rating,
			content: review.content,
		});
	}, []);

	return {
		reviews,
		userReview,
		isLoading,
		fetchReviews,
		saveReview,
		setEditingReview,
	};
};

export default useReviews;
