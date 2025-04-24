// src/components/ui/Card.tsx
import React from 'react';

interface CardProps {
	children: React.ReactNode;
	className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
	return (
		<div
			className={`bg-white rounded-lg border border-gray-200 shadow-md ${className}`}
		>
			{children}
		</div>
	);
};

export const CardHeader: React.FC<CardProps> = ({
	children,
	className = '',
}) => {
	return <div className={`p-4 border-b ${className}`}>{children}</div>;
};

export const CardBody: React.FC<CardProps> = ({ children, className = '' }) => {
	return <div className={`p-6 ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<CardProps> = ({
	children,
	className = '',
}) => {
	return <div className={`p-4 border-t ${className}`}>{children}</div>;
};

export default Card;
