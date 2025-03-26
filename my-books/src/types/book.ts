export interface Book {
	id: string;
	title: string;
	authors?: string[];
	description?: string;
	publishedDate?: string;
	pageCount?: number;
	categories?: string[];
	imageLinks?: {
		thumbnail?: string;
		smallThumbnail?: string;
	};
	language?: string;
	averageRating?: number;
	publisher?: string;
	isCustom?: boolean; // Oznaczenie czy książka została dodana przez użytkownika
}

export interface GoogleBookResponse {
	items: {
		id: string;
		volumeInfo: {
			title: string;
			authors?: string[];
			description?: string;
			publishedDate?: string;
			pageCount?: number;
			categories?: string[];
			imageLinks?: {
				thumbnail?: string;
				smallThumbnail?: string;
			};
			language?: string;
			averageRating?: number;
			publisher?: string;
		};
	}[];
	totalItems: number;
}
