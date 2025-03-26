import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';
import MyBooks from './pages/MyBooks';
import AddBook from './pages/AddBook';
import BookDetail from './pages/BookDetail';
import BookReviews from './pages/BookReviews';
import Login from './pages/Login';
import Register from './pages/Register';
import UserProfile from './pages/UserProfile';
import CommunityPage from './pages/CommunityPage';
import ExchangeRequests from './pages/ExchangeRequests';
import Messages from './pages/Messages';
import AllNotifications from './pages/AllNotifications';
import ReadingStats from './pages/ReadingStats';
import BookShelves from './pages/BookShelves';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Flowbite } from 'flowbite-react';
import './index.css';

// Niestandardowy motyw dla Flowbite
const flowbiteTheme = {
	// Kolorystyka aplikacji dostosowana do książek i czytelnictwa
	colors: {
		primary: {
			50: '#f0f9ff',
			100: '#e0f2fe',
			200: '#bae6fd',
			300: '#7dd3fc',
			400: '#38bdf8',
			500: '#0ea5e9',
			600: '#0284c7',
			700: '#0369a1',
			800: '#075985',
			900: '#0c4a6e',
		},
		// Dodatkowy kolor dla wyróżnienia funkcji wymiany książek
		exchange: {
			50: '#fdf2f8',
			100: '#fce7f3',
			200: '#fbcfe8',
			300: '#f9a8d4',
			400: '#f472b6',
			500: '#ec4899',
			600: '#db2777',
			700: '#be185d',
			800: '#9d174d',
			900: '#831843',
		},
	},
	button: {
		color: {
			primary: 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-300',
			exchange:
				'bg-exchange-600 hover:bg-exchange-700 focus:ring-exchange-300 text-white',
		},
	},
	modal: {
		root: {
			base: 'fixed top-0 right-0 left-0 z-50 h-modal h-screen overflow-y-auto overflow-x-hidden md:inset-0 md:h-full',
			show: {
				on: 'flex bg-gray-900 bg-opacity-50 dark:bg-opacity-80',
				off: 'hidden',
			},
		},
	},
};

const queryClient = new QueryClient();

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<NotificationProvider>
					<Flowbite theme={{ theme: flowbiteTheme }}>
						<BrowserRouter>
							<div className='min-h-screen flex flex-col'>
								<Navbar />
								<main className='flex-grow p-4'>
									<Routes>
										<Route path='/' element={<Home />} />
										<Route path='/search' element={<Search />} />
										<Route path='/my-books' element={<MyBooks />} />
										<Route path='/add-book' element={<AddBook />} />
										<Route path='/book/:id' element={<BookDetail />} />
										<Route path='/book/:id/reviews' element={<BookReviews />} />
										<Route path='/login' element={<Login />} />
										<Route path='/register' element={<Register />} />
										<Route path='/users/:id' element={<UserProfile />} />
										<Route path='/community' element={<CommunityPage />} />
										<Route path='/exchanges' element={<ExchangeRequests />} />
										<Route path='/messages' element={<Messages />} />
										<Route
											path='/notifications'
											element={<AllNotifications />}
										/>
										<Route path='/statistics' element={<ReadingStats />} />
										<Route path='/shelves' element={<BookShelves />} />
										<Route path='/shelves/:id' element={<BookShelves />} />
										<Route path='*' element={<Navigate to='/' replace />} />
									</Routes>
								</main>
								<Footer />
							</div>
						</BrowserRouter>
					</Flowbite>
				</NotificationProvider>
			</AuthProvider>
		</QueryClientProvider>
	);
}

export default App;
