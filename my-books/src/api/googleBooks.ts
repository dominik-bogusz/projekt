import axios from 'axios';
import { GoogleBookResponse } from '../types/book';

const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY || '';

export const searchBooks = async (
	query: string,
	maxResults: number = 20,
	startIndex: number = 0,
	language: string = ''
): Promise<GoogleBookResponse> => {
	try {
		let url = `${BASE_URL}?q=${encodeURIComponent(
			query
		)}&maxResults=${maxResults}&startIndex=${startIndex}`;

		// Dodaj filtr języka jeśli podany
		if (language) {
			url += `&langRestrict=${language}`;
		}

		if (API_KEY) {
			url += `&key=${API_KEY}`;
		}

		const response = await axios.get(url);

		// Obsługa braku wyników
		if (!response.data.items) {
			return { items: [], totalItems: 0 };
		}

		// Zwróć prawidłową odpowiedź
		return {
			items: response.data.items || [],
			totalItems: response.data.totalItems || 0,
		};
	} catch (error) {
		console.error('Błąd podczas wyszukiwania książek:', error);
		// W przypadku błędu, zwróć pustą odpowiedź
		return { items: [], totalItems: 0 };
	}
};

export const getBookById = async (bookId: string) => {
	try {
		let url = `${BASE_URL}/${bookId}`;

		if (API_KEY) {
			url += `?key=${API_KEY}`;
		}

		const response = await axios.get(url);
		return response.data;
	} catch (error) {
		console.error('Błąd podczas pobierania szczegółów książki:', error);
		throw new Error('Nie udało się pobrać szczegółów książki');
	}
};
