import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';
import MyBooks from './pages/MyBooks';
import AddBook from './pages/AddBook';
import BookDetail from './pages/BookDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';

const queryClient = new QueryClient();

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
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
								<Route path='/login' element={<Login />} />
								<Route path='/register' element={<Register />} />
								<Route path='*' element={<Navigate to='/' replace />} />
							</Routes>
						</main>
						<footer className='bg-gray-100 p-4 text-center text-gray-600'>
							&copy; {new Date().getFullYear()} My Books - Twoja osobista
							biblioteka
						</footer>
					</div>
				</BrowserRouter>
			</AuthProvider>
		</QueryClientProvider>
	);
}

export default App;
