// src/hooks/useToast.ts
import { useCallback } from 'react';
import { ToastType } from '../utils/helpers';

interface UseToastReturn {
	toast: (message: string, type?: ToastType, duration?: number) => void;
	success: (message: string, duration?: number) => void;
	error: (message: string, duration?: number) => void;
	warning: (message: string, duration?: number) => void;
	info: (message: string, duration?: number) => void;
}

/**
 * Hook for displaying toast notifications
 */
const useToast = (): UseToastReturn => {
	const show = useCallback(
		(message: string, type: ToastType = 'success', duration: number = 3000) => {
			const toast = document.createElement('div');

			const bgColor =
				type === 'success'
					? 'bg-green-500'
					: type === 'warning'
					? 'bg-yellow-500'
					: type === 'error'
					? 'bg-red-500'
					: 'bg-blue-500';

			toast.className = `fixed bottom-4 right-4 ${bgColor} text-white px-4 py-2 rounded shadow-lg z-50`;
			toast.textContent = message;
			document.body.appendChild(toast);

			setTimeout(() => {
				toast.classList.add('opacity-0', 'transition-opacity', 'duration-500');
				setTimeout(() => {
					document.body.removeChild(toast);
				}, 500);
			}, duration);
		},
		[]
	);

	const success = useCallback(
		(message: string, duration?: number) => {
			show(message, 'success', duration);
		},
		[show]
	);

	const error = useCallback(
		(message: string, duration?: number) => {
			show(message, 'error', duration);
		},
		[show]
	);

	const warning = useCallback(
		(message: string, duration?: number) => {
			show(message, 'warning', duration);
		},
		[show]
	);

	const info = useCallback(
		(message: string, duration?: number) => {
			show(message, 'info', duration);
		},
		[show]
	);

	return {
		toast: show,
		success,
		error,
		warning,
		info,
	};
};

export default useToast;
