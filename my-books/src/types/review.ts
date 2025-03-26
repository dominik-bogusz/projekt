export interface Review {
    id: string;
    user_id: string;
    book_id: string;
    rating: number;
    content: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface UserProfile {
    id: string;
    display_name?: string;
    email: string;
    avatar_url?: string;
    bio?: string;
  }