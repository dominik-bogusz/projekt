// src/types/profile.ts (aktualizacja)
export interface UserProfile {
	id: string;
	user_id: string;
	display_name: string | null;
	avatar_url: string | null;
	bio: string | null;
	favorite_genres: string[] | null;
	location: string | null;
	website: string | null;
	created_at: string;
	is_public: boolean;
	email?: string | null; // Dodajemy pole email
}

export interface BookShelf {
	id: string;
	user_id: string;
	name: string;
	description: string | null;
	is_public: boolean;
	created_at: string;
}

export interface Follower {
	id: string;
	follower_id: string;
	following_id: string;
	created_at: string;
}
