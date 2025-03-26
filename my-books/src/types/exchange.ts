export interface ExchangeRequest {
	id: string;
	requester_id: string;
	book_id: string;
	owner_id: string;
	status: 'pending' | 'accepted' | 'rejected' | 'completed';
	message?: string;
	created_at: string;
	updated_at: string;
}
