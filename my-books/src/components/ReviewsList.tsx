import React from 'react';
import { Review, UserProfile } from '../types/review';
import RatingStars from './RatingStars';
import { Card, Avatar } from 'flowbite-react';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

interface ReviewsListProps {
	reviews: (Review & { user: UserProfile })[];
	currentUserId?: string;
	onEditReview?: (review: Review) => void;
}

const ReviewsList: React.FC<ReviewsListProps> = ({
	reviews,
	currentUserId,
	onEditReview,
}) => {
	if (reviews.length === 0) {
		return (
			<div className='text-center py-8 text-gray-500'>
				Ta książka nie ma jeszcze recenzji. Bądź pierwszą osobą, która ją oceni!
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			{reviews.map((review) => (
				<Card key={review.id}>
					<div className='flex justify-between items-start'>
						<div className='flex items-start'>
							<Avatar
								img={review.user.avatar_url || 'https://via.placeholder.com/40'}
								rounded
								size='md'
								className='mr-3'
							/>
							<div>
								<div className='font-medium'>
									{review.user.display_name || review.user.email}
								</div>
								<div className='text-sm text-gray-500'>
									{formatDistanceToNow(new Date(review.created_at), {
										addSuffix: true,
										locale: pl,
									})}
								</div>
								<div className='mt-1'>
									<RatingStars
										initialRating={review.rating}
										readOnly
										size='sm'
									/>
								</div>
							</div>
						</div>

						{currentUserId === review.user_id && onEditReview && (
							<button
								onClick={() => onEditReview(review)}
								className='text-blue-600 hover:text-blue-800 text-sm'
							>
								Edytuj
							</button>
						)}
					</div>

					<div className='mt-3'>
						<p className='text-gray-800 whitespace-pre-line'>
							{review.content}
						</p>
					</div>
				</Card>
			))}
		</div>
	);
};

export default ReviewsList;
