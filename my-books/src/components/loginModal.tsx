// src/components/LoginModal.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Modal, TextInput, Label, Button, Alert } from 'flowbite-react';
import { HiMail, HiLockClosed, HiExclamation } from 'react-icons/hi';

interface LoginModalProps {
	onClose: () => void;
	onSuccess?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSuccess }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showRegister, setShowRegister] = useState(false);

	const { signIn, signUp } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			if (showRegister) {
				// Rejestracja
				const { error } = await signUp(email, password);
				if (error) throw error;
				alert('Sprawdź swój email, aby potwierdzić rejestrację!');
				onClose();
			} else {
				// Logowanie
				const { error } = await signIn(email, password);
				if (error) throw error;

				if (onSuccess) {
					onSuccess();
				}
				onClose();
			}
		} catch (err) {
			console.error('Błąd autoryzacji:', err);
			setError(
				showRegister
					? 'Błąd podczas rejestracji. Spróbuj ponownie.'
					: 'Nieprawidłowy email lub hasło.'
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Modal show={true} onClose={onClose} popup size='md'>
			<Modal.Header />
			<Modal.Body>
				<div className='space-y-6'>
					<h3 className='text-xl font-medium text-gray-900 dark:text-white'>
						{showRegister ? 'Zarejestruj się' : 'Zaloguj się'}
					</h3>

					{error && (
						<Alert color='failure' icon={HiExclamation}>
							{error}
						</Alert>
					)}

					<form onSubmit={handleSubmit} className='space-y-6'>
						<div>
							<div className='mb-2 block'>
								<Label htmlFor='email' value='E-mail' />
							</div>
							<TextInput
								id='email'
								type='email'
								icon={HiMail}
								placeholder='name@example.com'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>

						<div>
							<div className='mb-2 block'>
								<Label htmlFor='password' value='Hasło' />
							</div>
							<TextInput
								id='password'
								type='password'
								icon={HiLockClosed}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>

						<div className='w-full'>
							<Button type='submit' disabled={isLoading}>
								{isLoading
									? showRegister
										? 'Rejestrowanie...'
										: 'Logowanie...'
									: showRegister
									? 'Zarejestruj się'
									: 'Zaloguj się'}
							</Button>
						</div>
					</form>

					<div className='text-sm font-medium text-gray-500 dark:text-gray-300'>
						{showRegister ? (
							<>
								Masz już konto?{' '}
								<button
									onClick={() => setShowRegister(false)}
									className='text-blue-700 hover:underline dark:text-blue-500'
								>
									Zaloguj się
								</button>
							</>
						) : (
							<>
								Nie masz konta?{' '}
								<button
									onClick={() => setShowRegister(true)}
									className='text-blue-700 hover:underline dark:text-blue-500'
								>
									Zarejestruj się
								</button>
							</>
						)}
					</div>
				</div>
			</Modal.Body>
		</Modal>
	);
};

export default LoginModal;
