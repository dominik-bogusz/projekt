import React, { useState } from 'react';
import { Rating } from 'flowbite-react';
import { HiStar } from 'react-icons/hi';

interface RatingStarsProps {
	initialRating?: number;
	readOnly?: boolean;
	onChange?: (rating: number) => void;
	size?: 'sm' | 'md' | 'lg';
}

const RatingStars: React.FC<RatingStarsProps> = ({
	initialRating = 0,
	readOnly = false,
	onChange,
	size = 'md',
}) => {
	const [rating, setRating] = useState(initialRating);
	const [hoverRating, setHoverRating] = useState(0);

	const sizeClass = {
		sm: 'text-lg',
		md: 'text-xl',
		lg: 'text-2xl',
	}[size];

	const handleRatingChange = (newRating: number) => {
		if (readOnly) return;

		setRating(newRating);
		if (onChange) onChange(newRating);
	};

	return (
		<div className='flex'>
			{[1, 2, 3, 4, 5].map((star) => (
				<button
					key={star}
					type='button'
					onClick={() => handleRatingChange(star)}
					onMouseEnter={() => !readOnly && setHoverRating(star)}
					onMouseLeave={() => !readOnly && setHoverRating(0)}
					className={`${
						readOnly ? 'cursor-default' : 'cursor-pointer'
					} focus:outline-none`}
					disabled={readOnly}
				>
					<HiStar
						className={`${sizeClass} ${
							(hoverRating || rating) >= star
								? 'text-yellow-400'
								: 'text-gray-300'
						}`}
					/>
				</button>
			))}
		</div>
	);
};

export default RatingStars;
