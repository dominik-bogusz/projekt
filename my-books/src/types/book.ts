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
	isCustom?: boolean;
	thumbnail?: string; // Added this property to support direct thumbnail URLs
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
