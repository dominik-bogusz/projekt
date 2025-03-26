import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import NotificationsDropdown from './NotificationsDropdown';
import {
	HiOutlineSearch,
	HiOutlineBookOpen,
	HiOutlinePlusCircle,
	HiOutlineUserGroup,
	HiMenu,
	HiX,
} from 'react-icons/hi';
import { useNotifications } from '../context/NotificationContext';

const Navbar = () => {
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { user, signOut } = useAuth();
	const { unreadCount } = useNotifications();
	const navigate = useNavigate();
	const location = useLocation();

	const handleSignOut = async () => {
		await signOut();
		navigate('/');
	};

	const isActive = (path: string) => {
		return location.pathname === path;
	};

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	const [showUserMenu, setShowUserMenu] = useState(false);

	return (
		<>
			<nav className='bg-white border-gray-200 shadow-md'>
				<div className='max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4'>
					<Link to='/' className='flex items-center space-x-3'>
						<img src='/book-logo.svg' className='h-8' alt='My Books Logo' />
						<span className='self-center text-xl font-semibold whitespace-nowrap'>
							My Books
						</span>
					</Link>

					<div className='flex items-center md:order-2 space-x-3'>
						{user ? (
							<>
								<div className='relative mr-2'>
									<NotificationsDropdown />
								</div>

								<div className='relative'>
									<button
										onClick={() => setShowUserMenu(!showUserMenu)}
										type='button'
										className='flex text-sm bg-gray-800 rounded-full md:me-0 focus:ring-4 focus:ring-gray-300'
									>
										<span className='sr-only'>Open user menu</span>
										<img
											className='w-8 h-8 rounded-full'
											src={
												user.user_metadata?.avatar_url ||
												'https://flowbite.com/docs/images/people/profile-picture-5.jpg'
											}
											alt='user photo'
										/>
									</button>

									{showUserMenu && (
										<div className='absolute right-0 mt-2 w-48 bg-white divide-y divide-gray-100 rounded-lg shadow z-50'>
											<div className='px-4 py-3 text-sm text-gray-900'>
												<div className='truncate'>{user.email}</div>
											</div>
											<ul className='py-2 text-sm text-gray-700'>
												<li>
													<button
														onClick={() => {
															navigate(`/users/${user.id}`);
															setShowUserMenu(false);
														}}
														className='w-full text-left px-4 py-2 hover:bg-gray-100'
													>
														Mój profil
													</button>
												</li>
												<li>
													<button
														onClick={() => {
															navigate('/my-books');
															setShowUserMenu(false);
														}}
														className='w-full text-left px-4 py-2 hover:bg-gray-100'
													>
														Moja biblioteka
													</button>
												</li>
												<li>
													<button
														onClick={() => {
															navigate('/exchanges');
															setShowUserMenu(false);
														}}
														className='w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center'
													>
														<span>Wymiana książek</span>
														{unreadCount > 0 && (
															<span className='ml-2 inline-flex items-center justify-center h-5 w-5 text-xs font-medium text-white bg-red-500 rounded-full'>
																{unreadCount}
															</span>
														)}
													</button>
												</li>
												<li>
													<button
														onClick={() => {
															navigate('/messages');
															setShowUserMenu(false);
														}}
														className='w-full text-left px-4 py-2 hover:bg-gray-100'
													>
														Wiadomości
													</button>
												</li>
												<li>
													<button
														onClick={() => {
															navigate('/statistics');
															setShowUserMenu(false);
														}}
														className='w-full text-left px-4 py-2 hover:bg-gray-100'
													>
														Statystyki czytania
													</button>
												</li>
											</ul>
											<div className='py-2'>
												<button
													onClick={() => {
														handleSignOut();
														setShowUserMenu(false);
													}}
													className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
												>
													Wyloguj
												</button>
											</div>
										</div>
									)}
								</div>
							</>
						) : (
							<div className='flex gap-2'>
								<button
									onClick={() => navigate('/register')}
									className='hidden md:block py-2 px-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200'
								>
									Zarejestruj się
								</button>
								<button
									onClick={() => setShowLoginModal(true)}
									className='py-2 px-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700'
								>
									Zaloguj się
								</button>
							</div>
						)}

						<button
							onClick={toggleMenu}
							className='md:hidden p-2 text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200'
						>
							{isMenuOpen ? (
								<HiX className='w-6 h-6' />
							) : (
								<HiMenu className='w-6 h-6' />
							)}
						</button>
					</div>

					<div
						className={`${
							isMenuOpen ? 'block' : 'hidden'
						} w-full md:block md:w-auto md:order-1`}
					>
						<ul className='flex flex-col p-4 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white'>
							<li>
								<Link
									to='/search'
									className={`block py-2 pl-3 pr-4 rounded md:p-0 ${
										isActive('/search')
											? 'text-blue-600'
											: 'text-gray-700 hover:text-blue-600'
									}`}
								>
									<div className='flex items-center'>
										<HiOutlineSearch className='mr-1' />
										<span>Wyszukaj</span>
									</div>
								</Link>
							</li>
							{user && (
								<>
									<li>
										<Link
											to='/my-books'
											className={`block py-2 pl-3 pr-4 rounded md:p-0 ${
												isActive('/my-books')
													? 'text-blue-600'
													: 'text-gray-700 hover:text-blue-600'
											}`}
										>
											<div className='flex items-center'>
												<HiOutlineBookOpen className='mr-1' />
												<span>Moje książki</span>
											</div>
										</Link>
									</li>
									<li>
										<Link
											to='/add-book'
											className={`block py-2 pl-3 pr-4 rounded md:p-0 ${
												isActive('/add-book')
													? 'text-blue-600'
													: 'text-gray-700 hover:text-blue-600'
											}`}
										>
											<div className='flex items-center'>
												<HiOutlinePlusCircle className='mr-1' />
												<span>Dodaj książkę</span>
											</div>
										</Link>
									</li>
									<li>
										<Link
											to='/community'
											className={`block py-2 pl-3 pr-4 rounded md:p-0 ${
												isActive('/community')
													? 'text-blue-600'
													: 'text-gray-700 hover:text-blue-600'
											}`}
										>
											<div className='flex items-center'>
												<HiOutlineUserGroup className='mr-1' />
												<span>Społeczność</span>
											</div>
										</Link>
									</li>
								</>
							)}
						</ul>
					</div>
				</div>
			</nav>

			{showLoginModal && (
				<LoginModal onClose={() => setShowLoginModal(false)} />
			)}
		</>
	);
};

export default Navbar;
