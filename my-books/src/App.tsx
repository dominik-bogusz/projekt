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
import AllNotifications from './pages/AllNotifications.tsx';
import ReadingStats from './pages/ReadingStats';
import BookShelves from './pages/BookShelves';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';

const queryClient = new QueryClient();

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<NotificationProvider>
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
									<Route path='/notifications' element={<AllNotifications />} />
									<Route path='/statistics' element={<ReadingStats />} />
									<Route path='/shelves' element={<BookShelves />} />
									<Route path='/shelves/:id' element={<BookShelves />} />
									<Route path='*' element={<Navigate to='/' replace />} />
								</Routes>
							</main>
							<Footer />
						</div>
					</BrowserRouter>
				</NotificationProvider>
			</AuthProvider>
		</QueryClientProvider>
	);
}

export default App;
