export interface Notification {
	id: string;
	user_id: string;
	type:
		| 'exchange_request'
		| 'exchange_response'
		| 'review_like'
		| 'review_comment'
		| 'follow'
		| 'message';
	content: string;
	related_id?: string;
	is_read: boolean;
	created_at: string;
}

export interface Message {
	id: string;
	sender_id: string;
	recipient_id: string;
	content: string;
	is_read: boolean;
	created_at: string;
	sender?: {
		id: string;
		display_name?: string;
		avatar_url?: string;
	};
}
