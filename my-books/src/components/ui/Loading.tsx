// src/components/ui/Loading.tsx
import React from 'react';

interface LoadingProps {
	size?: 'sm' | 'md' | 'lg';
	fullScreen?: boolean;
	text?: string;
}

const Loading: React.FC<LoadingProps> = ({
	size = 'md',
	fullScreen = false,
	text,
}) => {
	const sizeClass = {
		sm: 'h-4 w-4',
		md: 'h-8 w-8',
		lg: 'h-12 w-12',
	}[size];

	const spinner = (
		<div
			className={`inline-block ${sizeClass} animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]`}
			role='status'
		>
			<span className='!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]'>
				{text || 'Ładowanie...'}
			</span>
		</div>
	);

	if (fullScreen) {
		return (
			<div className='fixed inset-0 bg-white bg-opacity-75 flex flex-col items-center justify-center z-50'>
				{spinner}
				{text && <p className='mt-4 text-gray-700'>{text}</p>}
			</div>
		);
	}

	return (
		<div className='flex flex-col items-center justify-center py-6'>
			{spinner}
			{text && <p className='mt-2 text-gray-500'>{text}</p>}
		</div>
	);
};

export default Loading;
