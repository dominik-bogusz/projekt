import React from 'react';
import { Link } from 'react-router-dom';
import {
	HiOutlineHome,
	HiOutlineBookOpen,
	HiOutlineSearch,
	HiOutlineUserGroup,
	HiOutlineSwitchHorizontal,
} from 'react-icons/hi';
import { BsFacebook, BsInstagram, BsTwitter } from 'react-icons/bs';

const Footer: React.FC = () => {
	return (
		<footer className='bg-white'>
			<div className='mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8'>
				<div className='md:flex md:justify-between'>
					<div className='mb-6 md:mb-0'>
						<Link to='/' className='flex items-center'>
							<img
								src='/book-logo.svg'
								className='h-8 mr-3'
								alt='My Books Logo'
							/>
							<span className='self-center text-2xl font-semibold whitespace-nowrap'>
								My Books
							</span>
						</Link>
						<p className='mt-4 max-w-xs text-gray-500'>
							Twoja osobista biblioteka. Zarządzaj, dziel się i odkrywaj nowe
							książki razem z innymi czytelnikami.
						</p>
					</div>
					<div className='grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3'>
						<div>
							<h2 className='mb-6 text-sm font-semibold text-gray-900 uppercase'>
								Nawigacja
							</h2>
							<ul className='text-gray-600'>
								<li className='mb-4'>
									<Link to='/' className='flex items-center hover:underline'>
										<HiOutlineHome className='mr-2' />
										<span>Strona główna</span>
									</Link>
								</li>
								<li className='mb-4'>
									<Link
										to='/search'
										className='flex items-center hover:underline'
									>
										<HiOutlineSearch className='mr-2' />
										<span>Wyszukaj</span>
									</Link>
								</li>
								<li>
									<Link
										to='/my-books'
										className='flex items-center hover:underline'
									>
										<HiOutlineBookOpen className='mr-2' />
										<span>Moje książki</span>
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h2 className='mb-6 text-sm font-semibold text-gray-900 uppercase'>
								Społeczność
							</h2>
							<ul className='text-gray-600'>
								<li className='mb-4'>
									<Link
										to='/community'
										className='flex items-center hover:underline'
									>
										<HiOutlineUserGroup className='mr-2' />
										<span>Czytelnicy</span>
									</Link>
								</li>
								<li>
									<Link
										to='/exchanges'
										className='flex items-center hover:underline'
									>
										<HiOutlineSwitchHorizontal className='mr-2' />
										<span>Wymiana książek</span>
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h2 className='mb-6 text-sm font-semibold text-gray-900 uppercase'>
								O nas
							</h2>
							<ul className='text-gray-600'>
								<li className='mb-4'>
									<Link to='#' className='hover:underline'>
										O projekcie
									</Link>
								</li>
								<li className='mb-4'>
									<Link to='#' className='hover:underline'>
										Regulamin
									</Link>
								</li>
								<li>
									<Link to='#' className='hover:underline'>
										Polityka prywatności
									</Link>
								</li>
							</ul>
						</div>
					</div>
				</div>
				<hr className='my-6 border-gray-200 sm:mx-auto lg:my-8' />
				<div className='sm:flex sm:items-center sm:justify-between'>
					<span className='text-sm text-gray-500 sm:text-center'>
						© {new Date().getFullYear()}{' '}
						<a href='#' className='hover:underline'>
							My Books™
						</a>
						. Wszelkie prawa zastrzeżone.
					</span>
					<div className='flex mt-4 space-x-6 sm:justify-center sm:mt-0'>
						<a href='#' className='text-gray-500 hover:text-gray-900'>
							<BsFacebook className='w-5 h-5' />
							<span className='sr-only'>Facebook</span>
						</a>
						<a href='#' className='text-gray-500 hover:text-gray-900'>
							<BsInstagram className='w-5 h-5' />
							<span className='sr-only'>Instagram</span>
						</a>
						<a href='#' className='text-gray-500 hover:text-gray-900'>
							<BsTwitter className='w-5 h-5' />
							<span className='sr-only'>Twitter</span>
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
