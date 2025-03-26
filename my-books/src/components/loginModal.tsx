import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

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
		<div className='fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4'>
			<div className='relative p-4 w-full max-w-md max-h-full'>
				<div className='relative bg-white rounded-lg shadow'>
					<div className='flex items-center justify-between p-4 md:p-5 border-b rounded-t'>
						<h3 className='text-xl font-semibold text-gray-900'>
							{showRegister ? 'Zarejestruj się' : 'Zaloguj się'}
						</h3>
						<button
							type='button'
							className='text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center'
							onClick={onClose}
						>
							<svg
								className='w-3 h-3'
								aria-hidden='true'
								xmlns='http://www.w3.org/2000/svg'
								fill='none'
								viewBox='0 0 14 14'
							>
								<path
									stroke='currentColor'
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth='2'
									d='m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6'
								/>
							</svg>
							<span className='sr-only'>Zamknij modal</span>
						</button>
					</div>

					{error && (
						<div
							className='p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50'
							role='alert'
						>
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className='p-4 md:p-5'>
						<div className='mb-4'>
							<label
								htmlFor='email'
								className='block mb-2 text-sm font-medium text-gray-900'
							>
								E-mail
							</label>
							<div className='relative'>
								<div className='absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none'>
									<svg
										className='w-4 h-4 text-gray-500'
										aria-hidden='true'
										xmlns='http://www.w3.org/2000/svg'
										fill='currentColor'
										viewBox='0 0 20 16'
									>
										<path d='m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z' />
										<path d='M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z' />
									</svg>
								</div>
								<input
									type='email'
									id='email'
									className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5'
									placeholder='name@example.com'
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
							</div>
						</div>

						<div className='mb-6'>
							<label
								htmlFor='password'
								className='block mb-2 text-sm font-medium text-gray-900'
							>
								Hasło
							</label>
							<div className='relative'>
								<div className='absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none'>
									<svg
										className='w-4 h-4 text-gray-500'
										aria-hidden='true'
										xmlns='http://www.w3.org/2000/svg'
										fill='currentColor'
										viewBox='0 0 16 20'
									>
										<path d='M14 7h-1.5V4.5a4.5 4.5 0 1 0-9 0V7H2a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Zm-5 8a1 1 0 1 1-2 0v-3a1 1 0 1 1 2 0v3Zm1.5-8h-5V4.5a2.5 2.5 0 1 1 5 0V7Z' />
									</svg>
								</div>
								<input
									type='password'
									id='password'
									className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5'
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
								/>
							</div>
						</div>

						<button
							type='submit'
							disabled={isLoading}
							className='w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-blue-400'
						>
							{isLoading
								? showRegister
									? 'Rejestrowanie...'
									: 'Logowanie...'
								: showRegister
								? 'Zarejestruj się'
								: 'Zaloguj się'}
						</button>

						<div className='text-sm font-medium text-gray-500 mt-4 text-center'>
							{showRegister ? (
								<>
									Masz już konto?{' '}
									<button
										type='button'
										onClick={() => setShowRegister(false)}
										className='text-blue-700 hover:underline'
									>
										Zaloguj się
									</button>
								</>
							) : (
								<>
									Nie masz konta?{' '}
									<button
										type='button'
										onClick={() => setShowRegister(true)}
										className='text-blue-700 hover:underline'
									>
										Zarejestruj się
									</button>
								</>
							)}
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default LoginModal;
