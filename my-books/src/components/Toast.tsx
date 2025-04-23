import React from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
	message: string;
	type?: ToastType;
	duration?: number;
	onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({
	message,
	type = 'success',
	duration = 3000,
	onClose,
}) => {
	React.useEffect(() => {
		const timer = setTimeout(() => {
			if (onClose) onClose();
		}, duration);

		return () => clearTimeout(timer);
	}, [duration, onClose]);

	const getBackgroundColor = () => {
		switch (type) {
			case 'success':
				return 'bg-green-500';
			case 'error':
				return 'bg-red-500';
			case 'warning':
				return 'bg-yellow-500';
			case 'info':
				return 'bg-blue-500';
			default:
				return 'bg-green-500';
		}
	};

	return (
		<div
			className={`fixed bottom-4 right-4 ${getBackgroundColor()} text-white px-4 py-2 rounded shadow-lg z-50 flex items-center justify-between`}
		>
			<span>{message}</span>
			<button onClick={onClose} className='ml-3 text-white hover:text-gray-200'>
				✕
			</button>
		</div>
	);
};

// Toast service for usage throughout the app
export const toast = {
	_container: null as HTMLDivElement | null,

	// Initialize the toast container
	init() {
		if (this._container) return;

		this._container = document.createElement('div');
		this._container.id = 'toast-container';
		document.body.appendChild(this._container);
	},

	// Show a toast notification
	show(message: string, type: ToastType = 'success', duration: number = 3000) {
		this.init();

		const toastId = `toast-${Date.now()}`;
		const toastElement = document.createElement('div');
		toastElement.id = toastId;

		if (this._container) {
			this._container.appendChild(toastElement);

			// Create a root and render the Toast component
			const root = document.createElement('div');
			root.className = 'toast-root';
			toastElement.appendChild(root);

			// Create the toast element dynamically
			const toast = document.createElement('div');
			toast.className = `${this._getBackgroundColor(
				type
			)} text-white px-4 py-2 rounded shadow-lg z-50 flex items-center justify-between mb-2 animate-fade-in`;

			const messageSpan = document.createElement('span');
			messageSpan.textContent = message;

			const closeButton = document.createElement('button');
			closeButton.textContent = '✕';
			closeButton.className = 'ml-3 text-white hover:text-gray-200';
			closeButton.onclick = () => this.close(toastId);

			toast.appendChild(messageSpan);
			toast.appendChild(closeButton);
			root.appendChild(toast);

			// Auto-close after duration
			setTimeout(() => {
				this.close(toastId);
			}, duration);
		}

		return toastId;
	},

	// Close a specific toast
	close(id: string) {
		const toastElement = document.getElementById(id);
		if (toastElement) {
			toastElement.classList.add('animate-fade-out');
			setTimeout(() => {
				if (toastElement.parentNode) {
					toastElement.parentNode.removeChild(toastElement);
				}
			}, 300); // Animation duration
		}
	},

	// Helper to get background color class
	_getBackgroundColor(type: ToastType): string {
		switch (type) {
			case 'success':
				return 'bg-green-500';
			case 'error':
				return 'bg-red-500';
			case 'warning':
				return 'bg-yellow-500';
			case 'info':
				return 'bg-blue-500';
			default:
				return 'bg-green-500';
		}
	},

	// Success toast shorthand
	success(message: string, duration: number = 3000) {
		return this.show(message, 'success', duration);
	},

	// Error toast shorthand
	error(message: string, duration: number = 3000) {
		return this.show(message, 'error', duration);
	},

	// Warning toast shorthand
	warning(message: string, duration: number = 3000) {
		return this.show(message, 'warning', duration);
	},

	// Info toast shorthand
	info(message: string, duration: number = 3000) {
		return this.show(message, 'info', duration);
	},
};

export default Toast;
