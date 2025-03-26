import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AuthError extends Error {
	message: string;
}

const Register: React.FC = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
	const { signUp } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (password !== confirmPassword) {
			setError('Hasła nie są identyczne');
			return;
		}

		if (password.length < 6) {
			setError('Hasło musi mieć co najmniej 6 znaków');
			return;
		}

		setIsLoading(true);

		try {
			const { error } = await signUp(email, password);

			if (error) throw error;

			alert('Sprawdź swoją skrzynkę e-mail, aby potwierdzić rejestrację!');
			navigate('/login');
		} catch (err) {
			const error = err as AuthError;
			console.error('Registration error:', error);
			setError(error.message || 'Wystąpił błąd podczas rejestracji');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='max-w-md mx-auto px-4 py-12'>
			<h1 className='text-3xl font-bold mb-6 text-center'>Zarejestruj się</h1>

			{error && (
				<div className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6'>
					<p>{error}</p>
				</div>
			)}

			<div className='bg-white p-6 rounded-lg shadow-md'>
				<form onSubmit={handleSubmit}>
					<div className='mb-4'>
						<label
							htmlFor='email'
							className='block text-gray-700 font-medium mb-2'
						>
							E-mail
						</label>
						<input
							type='email'
							id='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className='w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
							required
						/>
					</div>

					<div className='mb-4'>
						<label
							htmlFor='password'
							className='block text-gray-700 font-medium mb-2'
						>
							Hasło
						</label>
						<input
							type='password'
							id='password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className='w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
							required
						/>
					</div>

					<div className='mb-6'>
						<label
							htmlFor='confirmPassword'
							className='block text-gray-700 font-medium mb-2'
						>
							Potwierdź hasło
						</label>
						<input
							type='password'
							id='confirmPassword'
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							className='w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
							required
						/>
					</div>

					<button
						type='submit'
						disabled={isLoading}
						className='w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300'
					>
						{isLoading ? 'Rejestracja...' : 'Zarejestruj się'}
					</button>
				</form>

				<div className='mt-4 text-center'>
					<p>
						Masz już konto?{' '}
						<Link to='/login' className='text-blue-600 hover:underline'>
							Zaloguj się
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default Register;
