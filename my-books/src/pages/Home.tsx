import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
	const { user } = useAuth();

	return (
		<div className='max-w-6xl mx-auto px-4'>
			<div className='py-12 md:py-24 text-center'>
				<h1 className='text-4xl md:text-6xl font-bold mb-6'>
					Witaj w My Books
				</h1>
				<p className='text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto'>
					Twoja osobista biblioteka, która pozwala zarządzać Twoją kolekcją
					książek, odkrywać nowe pozycje i śledzić swoje czytelnicze postępy.
				</p>

				<div className='flex flex-col md:flex-row justify-center gap-4'>
					{!user ? (
						<>
							<Link
								to='/login'
								className='bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition'
							>
								Zaloguj się
							</Link>
							<Link
								to='/register'
								className='bg-white border border-blue-600 text-blue-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-50 transition'
							>
								Zarejestruj się
							</Link>
						</>
					) : (
						<>
							<Link
								to='/my-books'
								className='bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition'
							>
								Moja biblioteka
							</Link>
							<Link
								to='/search'
								className='bg-white border border-blue-600 text-blue-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-50 transition'
							>
								Wyszukaj książki
							</Link>
						</>
					)}
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-3 gap-8 py-12'>
				<div className='bg-white p-6 rounded-lg shadow-md'>
					<h2 className='text-xl font-bold mb-4'>Zarządzaj swoją kolekcją</h2>
					<p className='text-gray-600 mb-4'>
						Dodawaj książki, które przeczytałeś, czytasz obecnie lub planujesz
						przeczytać. Organizuj swoją bibliotekę według własnych preferencji.
					</p>
				</div>

				<div className='bg-white p-6 rounded-lg shadow-md'>
					<h2 className='text-xl font-bold mb-4'>Odkrywaj nowe tytuły</h2>
					<p className='text-gray-600 mb-4'>
						Wyszukuj książki z ogromnej bazy Google Books. Znajdź swoje ulubione
						tytuły lub odkryj nowe, fascynujące pozycje.
					</p>
				</div>

				<div className='bg-white p-6 rounded-lg shadow-md'>
					<h2 className='text-xl font-bold mb-4'>Śledź swoje postępy</h2>
					<p className='text-gray-600 mb-4'>
						Zapisuj swoje wrażenia, oceniaj przeczytane książki i śledź
						statystyki czytelnicze. Wszystko w jednym miejscu.
					</p>
				</div>
			</div>
		</div>
	);
};

export default Home;
