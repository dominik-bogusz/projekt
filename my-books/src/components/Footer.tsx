import React from 'react';
import { Link } from 'react-router-dom';
import { Footer as FlowbiteFooter } from 'flowbite-react';
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
		<FlowbiteFooter container className='rounded-none shadow-none'>
			<div className='w-full'>
				<div className='grid w-full justify-between sm:flex sm:justify-between md:flex md:grid-cols-1'>
					<div className='mb-6 sm:mb-0'>
						<FlowbiteFooter.Brand
							href='/'
							src='/book-logo.svg'
							alt='My Books Logo'
							name='My Books'
						/>
						<p className='mt-4 max-w-xs text-gray-500'>
							Twoja osobista biblioteka. Zarządzaj, dziel się i odkrywaj nowe
							książki razem z innymi czytelnikami.
						</p>
					</div>
					<div className='grid grid-cols-2 gap-8 sm:mt-4 sm:grid-cols-3 sm:gap-6'>
						<div>
							<FlowbiteFooter.Title title='Nawigacja' />
							<FlowbiteFooter.LinkGroup col>
								<FlowbiteFooter.Link href='/' icon={HiOutlineHome}>
									Strona główna
								</FlowbiteFooter.Link>
								<FlowbiteFooter.Link href='/search' icon={HiOutlineSearch}>
									Wyszukaj
								</FlowbiteFooter.Link>
								<FlowbiteFooter.Link href='/my-books' icon={HiOutlineBookOpen}>
									Moje książki
								</FlowbiteFooter.Link>
							</FlowbiteFooter.LinkGroup>
						</div>
						<div>
							<FlowbiteFooter.Title title='Społeczność' />
							<FlowbiteFooter.LinkGroup col>
								<FlowbiteFooter.Link
									href='/community'
									icon={HiOutlineUserGroup}
								>
									Czytelnicy
								</FlowbiteFooter.Link>
								<FlowbiteFooter.Link
									href='/exchanges'
									icon={HiOutlineSwitchHorizontal}
								>
									Wymiana książek
								</FlowbiteFooter.Link>
							</FlowbiteFooter.LinkGroup>
						</div>
						<div>
							<FlowbiteFooter.Title title='O nas' />
							<FlowbiteFooter.LinkGroup col>
								<FlowbiteFooter.Link href='#'>O projekcie</FlowbiteFooter.Link>
								<FlowbiteFooter.Link href='#'>Regulamin</FlowbiteFooter.Link>
								<FlowbiteFooter.Link href='#'>
									Polityka prywatności
								</FlowbiteFooter.Link>
							</FlowbiteFooter.LinkGroup>
						</div>
					</div>
				</div>
				<FlowbiteFooter.Divider />
				<div className='w-full sm:flex sm:items-center sm:justify-between'>
					<FlowbiteFooter.Copyright
						by='My Books™'
						href='#'
						year={new Date().getFullYear()}
					/>
					<div className='mt-4 flex space-x-6 sm:mt-0 sm:justify-center'>
						<FlowbiteFooter.Icon href='#' icon={BsFacebook} />
						<FlowbiteFooter.Icon href='#' icon={BsInstagram} />
						<FlowbiteFooter.Icon href='#' icon={BsTwitter} />
					</div>
				</div>
			</div>
		</FlowbiteFooter>
	);
};

export default Footer;
