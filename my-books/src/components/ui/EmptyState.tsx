// src/components/ui/EmptyState.tsx
import React, { ReactNode } from 'react';

interface EmptyStateProps {
	icon?: ReactNode;
	title: string;
	message?: string;
	action?: ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
	icon,
	title,
	message,
	action,
}) => {
	return (
		<div className='text-center py-12 bg-white rounded-lg shadow'>
			{icon && <div className='flex justify-center mb-4'>{icon}</div>}
			<p className='text-xl text-gray-500'>{title}</p>
			{message && <p className='text-gray-400 mt-2'>{message}</p>}
			{action && <div className='mt-6'>{action}</div>}
		</div>
	);
};

export default EmptyState;
