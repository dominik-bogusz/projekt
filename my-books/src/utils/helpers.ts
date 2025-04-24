// src/utils/helpers.ts
import { supabase } from '../api/supabase';
import { Book } from '../types/book';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Displays a toast notification
 */
export const showToast = (
	message: string,
	type: ToastType = 'success',
	duration: number = 3000
) => {
	const toast = document.createElement('div');

	const bgColor =
		type === 'success'
			? 'bg-green-500'
			: type === 'warning'
			? 'bg-yellow-500'
			: type === 'error'
			? 'bg-red-500'
			: 'bg-blue-500';

	toast.className = `fixed bottom-4 right-4 ${bgColor} text-white px-4 py-2 rounded shadow-lg z-50`;
	toast.textContent = message;
	document.body.appendChild(toast);

	setTimeout(() => {
		toast.classList.add('opacity-0', 'transition-opacity', 'duration-500');
		setTimeout(() => {
			document.body.removeChild(toast);
		}, 500);
	}, duration);
};

/**
 * Gets a proper image URL for a book cover
 */
export const getBookCoverUrl = (book: Book): string => {
	const defaultCover = 'https://via.placeholder.com/128x192?text=Brak+Okładki';

	// If no image links or thumbnail, return default image
	if (!book.imageLinks?.thumbnail && !book.thumbnail) {
		return defaultCover;
	}

	// First try to use the thumbnail from imageLinks (Google Books API)
	if (book.imageLinks?.thumbnail) {
		return book.imageLinks.thumbnail;
	}

	// If we have a thumbnail from our database
	if (book.thumbnail) {
		// Check if it's a full URL (starts with http or https)
		if (book.thumbnail.startsWith('http')) {
			return book.thumbnail;
		}

		// Check if it's a Supabase storage URL (contains a path structure)
		if (book.thumbnail.includes('/')) {
			// It's a relative path, get the public URL
			const { publicUrl } = supabase.storage
				.from('book-covers')
				.getPublicUrl(book.thumbnail);

			return publicUrl;
		}

		// Otherwise, it might be just the filename, construct the full path
		const { publicUrl } = supabase.storage
			.from('book-covers')
			.getPublicUrl(book.thumbnail);

		return publicUrl;
	}

	return defaultCover;
};

/**
 * Format date to a readable format
 */
export const formatDate = (dateString: string): string => {
	if (!dateString) return '';

	const date = new Date(dateString);
	return date.toLocaleDateString('pl-PL', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
	if (!text) return '';
	if (text.length <= maxLength) return text;

	return text.slice(0, maxLength) + '...';
};
