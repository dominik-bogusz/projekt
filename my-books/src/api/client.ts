// src/api/client.ts
import { supabase } from './supabase';
import { Book } from '../types/book';
import { UserProfile } from '../types/profile';
import { Review } from '../types/review';

/**
 * Centralized API client for books
 */
export const bookClient = {
	/**
	 * Get all books for a user
	 */
	getBooks: async (userId: string): Promise<Book[]> => {
		const { data, error } = await supabase
			.from('books')
			.select('*')
			.eq('user_id', userId);

		if (error) throw error;

		return data.map(
			(item): Book => ({
				id: item.google_books_id || item.id,
				title: item.title,
				authors: item.authors,
				description: item.description,
				publishedDate: item.published_date,
				imageLinks: item.thumbnail ? { thumbnail: item.thumbnail } : undefined,
				publisher: item.publisher,
				isCustom: item.is_custom,
			})
		);
	},

	/**
	 * Save a book to user's library
	 */
	saveBook: async (book: Book, userId: string): Promise<boolean> => {
		// Check if book already exists
		const { data: existingBook } = await supabase
			.from('books')
			.select('id')
			.eq('user_id', userId)
			.or(`google_books_id.eq.${book.id},id.eq.${book.id}`)
			.maybeSingle();

		if (existingBook) return false;

		const { error } = await supabase.from('books').insert([
			{
				google_books_id: book.id,
				title: book.title,
				authors: book.authors,
				description: book.description,
				published_date: book.publishedDate,
				thumbnail: book.imageLinks?.thumbnail,
				publisher: book.publisher,
				user_id: userId,
			},
		]);

		if (error) throw error;
		return true;
	},

	/**
	 * Remove a book from user's library
	 */
	removeBook: async (bookId: string, userId: string): Promise<boolean> => {
		// Get the database ID first
		const { data: bookData, error: findError } = await supabase
			.from('books')
			.select('id')
			.eq('user_id', userId)
			.or(`google_books_id.eq.${bookId},id.eq.${bookId}`)
			.single();

		if (findError) throw findError;
		if (!bookData) return false;

		const dbBookId = bookData.id;

		// Delete related data
		await supabase
			.from('reading_status')
			.delete()
			.eq('user_id', userId)
			.eq('book_id', dbBookId);

		await supabase
			.from('reviews')
			.delete()
			.eq('user_id', userId)
			.eq('book_id', dbBookId);

		await supabase.from('book_shelf_items').delete().eq('book_id', dbBookId);

		// Delete the book
		const { error: deleteError } = await supabase
			.from('books')
			.delete()
			.eq('id', dbBookId)
			.eq('user_id', userId);

		if (deleteError) throw deleteError;
		return true;
	},

	/**
	 * Get book by ID
	 */
	getBookById: async (bookId: string): Promise<Book | null> => {
		if (bookId.startsWith('custom_')) {
			const { data, error } = await supabase
				.from('books')
				.select('*')
				.eq('id', bookId)
				.single();

			if (error) throw error;

			return {
				id: data.id,
				title: data.title,
				authors: data.authors,
				description: data.description,
				publishedDate: data.published_date,
				imageLinks: data.thumbnail ? { thumbnail: data.thumbnail } : undefined,
				publisher: data.publisher,
				isCustom: data.is_custom,
			};
		}

		// Non-custom book, use Google Books API
		return null; // This would be implemented with googleBooks.getBookById
	},
};

/**
 * Centralized API client for user operations
 */
export const userClient = {
	/**
	 * Get user profile
	 */
	getProfile: async (userId: string): Promise<UserProfile | null> => {
		const { data, error } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', userId)
			.maybeSingle();

		if (error && error.code !== 'PGRST116') throw error;
		return data;
	},

	/**
	 * Create or update a user profile
	 */
	upsertProfile: async (
		profile: Partial<UserProfile>
	): Promise<UserProfile> => {
		const { data, error } = await supabase
			.from('profiles')
			.upsert([profile])
			.select('*')
			.single();

		if (error) throw error;
		return data;
	},

	/**
	 * Check if a user is following another user
	 */
	isFollowing: async (
		followerId: string,
		followingId: string
	): Promise<boolean> => {
		const { data } = await supabase
			.from('followers')
			.select('id')
			.eq('follower_id', followerId)
			.eq('following_id', followingId)
			.maybeSingle();

		return !!data;
	},

	/**
	 * Follow a user
	 */
	followUser: async (
		followerId: string,
		followingId: string
	): Promise<void> => {
		const { error } = await supabase.from('followers').insert([
			{
				follower_id: followerId,
				following_id: followingId,
			},
		]);

		if (error) throw error;
	},

	/**
	 * Unfollow a user
	 */
	unfollowUser: async (
		followerId: string,
		followingId: string
	): Promise<void> => {
		const { error } = await supabase
			.from('followers')
			.delete()
			.eq('follower_id', followerId)
			.eq('following_id', followingId);

		if (error) throw error;
	},
};

/**
 * Centralized API client for reviews
 */
export const reviewClient = {
	/**
	 * Get reviews for a book
	 */
	getBookReviews: async (bookId: string): Promise<Review[]> => {
		const { data, error } = await supabase
			.from('reviews')
			.select(
				`
        *,
        user:profiles(id, email, display_name, avatar_url)
      `
			)
			.eq('book_id', bookId)
			.order('created_at', { ascending: false });

		if (error) throw error;
		return data || [];
	},

	/**
	 * Add or update a review
	 */
	saveReview: async (
		bookId: string,
		userId: string,
		rating: number,
		content: string,
		existingReviewId?: string
	): Promise<void> => {
		if (existingReviewId) {
			const { error } = await supabase
				.from('reviews')
				.update({
					rating,
					content,
					updated_at: new Date().toISOString(),
				})
				.eq('id', existingReviewId);

			if (error) throw error;
		} else {
			const { error } = await supabase.from('reviews').insert([
				{
					user_id: userId,
					book_id: bookId,
					rating,
					content,
				},
			]);

			if (error) throw error;
		}
	},
};
