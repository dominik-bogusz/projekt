import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [showDropdown, setShowDropdown] = useState(false);
	const { user, signOut } = useAuth();
	const navigate = useNavigate();

	const handleSignOut = async () => {
		await signOut();
		navigate('/');
	};

	return (
		<nav className='bg-white border-gray-200 px-4 py-2.5 shadow-md'>
			<div className='flex flex-wrap justify-between items-center'>
				<Link to='/' className='flex items-center'>
					<span className='self-center text-xl font-semibold whitespace-nowrap'>
						My Books
					</span>
				</Link>

				<div className='flex items-center md:order-2'>
					{user ? (
						<div className='relative'>
							<button
								onClick={() => setShowDropdown(!showDropdown)}
								className='flex text-sm bg-gray-800 rounded-full md:mr-0 focus:ring-4 focus:ring-gray-300'
							>
								<div className='w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white'>
									{user.email?.charAt(0).toUpperCase()}
								</div>
							</button>

							{showDropdown && (
								<div className='absolute right-0 z-10 mt-2 w-48 bg-white rounded-lg shadow-lg py-1'>
									<div className='px-4 py-3 text-sm text-gray-900'>
										<div className='truncate'>{user.email}</div>
									</div>
									<Link
										to='/my-books'
										className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
									>
										Moja biblioteka
									</Link>
									<Link
										to='/add-book'
										className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
									>
										Dodaj książkę
									</Link>
									<div className='border-t border-gray-200'></div>
									<button
										onClick={handleSignOut}
										className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
									>
										Wyloguj
									</button>
								</div>
							)}
						</div>
					) : (
						<Link
							to='/login'
							className='text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5'
						>
							Zaloguj się
						</Link>
					)}

					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						type='button'
						className='inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200'
					>
						<svg
							className='w-6 h-6'
							fill='currentColor'
							viewBox='0 0 20 20'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								fillRule='evenodd'
								d='M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z'
								clipRule='evenodd'
							></path>
						</svg>
					</button>
				</div>

				<div
					className={`${
						isMenuOpen ? 'block' : 'hidden'
					} w-full md:block md:w-auto md:order-1`}
				>
					<ul className='flex flex-col mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium'>
						<li>
							<Link
								to='/'
								className={`block py-2 pr-4 pl-3 ${
									location.pathname === '/' ? 'text-blue-600' : 'text-gray-700'
								} border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:p-0`}
							>
								Strona główna
							</Link>
						</li>
						<li>
							<Link
								to='/search'
								className={`block py-2 pr-4 pl-3 ${
									location.pathname === '/search'
										? 'text-blue-600'
										: 'text-gray-700'
								} border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:p-0`}
							>
								Wyszukaj
							</Link>
						</li>
						{user && (
							<>
								<li>
									<Link
										to='/my-books'
										className={`block py-2 pr-4 pl-3 ${
											location.pathname === '/my-books'
												? 'text-blue-600'
												: 'text-gray-700'
										} border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:p-0`}
									>
										Moje książki
									</Link>
								</li>
								<li>
									<Link
										to='/add-book'
										className={`block py-2 pr-4 pl-3 ${
											location.pathname === '/add-book'
												? 'text-blue-600'
												: 'text-gray-700'
										} border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:p-0`}
									>
										Dodaj książkę
									</Link>
								</li>
							</>
						)}
					</ul>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
