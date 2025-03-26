import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import NotificationsDropdown from './NotificationsDropdown';
import {
	Navbar as FlowbiteNavbar,
	Dropdown,
	Avatar,
	Button,
	Badge,
} from 'flowbite-react';
import {
	HiOutlineHome,
	HiOutlineSearch,
	HiOutlineBookOpen,
	HiOutlinePlusCircle,
	HiOutlineChatAlt,
	HiOutlineSwitchHorizontal,
	HiOutlineUserGroup,
	HiOutlineChartBar,
} from 'react-icons/hi';
import { useNotifications } from '../context/NotificationContext';

const Navbar = () => {
	const [showLoginModal, setShowLoginModal] = useState(false);
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

	return (
		<>
			<FlowbiteNavbar fluid className='shadow-md bg-white'>
				<FlowbiteNavbar.Brand as={Link} to='/'>
					<img src='/book-logo.svg' className='mr-3 h-8' alt='My Books Logo' />
					<span className='self-center whitespace-nowrap text-xl font-semibold dark:text-white'>
						My Books
					</span>
				</FlowbiteNavbar.Brand>

				<div className='flex md:order-2 items-center'>
					{user ? (
						<>
							<div className='mr-4'>
								<NotificationsDropdown />
							</div>

							<Dropdown
								arrowIcon={false}
								inline
								label={
									<Avatar
										alt='User settings'
										img={user.user_metadata?.avatar_url}
										rounded
									/>
								}
							>
								<Dropdown.Header>
									<span className='block text-sm font-medium truncate max-w-[200px]'>
										{user.email}
									</span>
								</Dropdown.Header>
								<Dropdown.Item
									icon={HiOutlineUserGroup}
									onClick={() => navigate(`/users/${user.id}`)}
								>
									Mój profil
								</Dropdown.Item>
								<Dropdown.Item
									icon={HiOutlineBookOpen}
									onClick={() => navigate('/my-books')}
								>
									Moja biblioteka
								</Dropdown.Item>
								<Dropdown.Item
									icon={HiOutlineSwitchHorizontal}
									onClick={() => navigate('/exchanges')}
								>
									Wymiana książek
									{unreadCount > 0 && (
										<Badge color='red' className='ml-2'>
											{unreadCount}
										</Badge>
									)}
								</Dropdown.Item>
								<Dropdown.Item
									icon={HiOutlineChatAlt}
									onClick={() => navigate('/messages')}
								>
									Wiadomości
								</Dropdown.Item>
								<Dropdown.Item
									icon={HiOutlineChartBar}
									onClick={() => navigate('/statistics')}
								>
									Statystyki czytania
								</Dropdown.Item>
								<Dropdown.Divider />
								<Dropdown.Item onClick={handleSignOut}>Wyloguj</Dropdown.Item>
							</Dropdown>
						</>
					) : (
						<div className='flex gap-2'>
							<Button
								color='light'
								onClick={() => navigate('/register')}
								className='hidden md:block'
							>
								Zarejestruj się
							</Button>
							<Button onClick={() => setShowLoginModal(true)}>
								Zaloguj się
							</Button>
						</div>
					)}
					<FlowbiteNavbar.Toggle className='ml-3' />
				</div>

				<FlowbiteNavbar.Collapse>
					<FlowbiteNavbar.Link
						as={Link}
						to='/'
						active={isActive('/')}
						icon={HiOutlineHome}
					>
						Strona główna
					</FlowbiteNavbar.Link>
					<FlowbiteNavbar.Link
						as={Link}
						to='/search'
						active={isActive('/search')}
						icon={HiOutlineSearch}
					>
						Wyszukaj
					</FlowbiteNavbar.Link>
					{user && (
						<>
							<FlowbiteNavbar.Link
								as={Link}
								to='/my-books'
								active={isActive('/my-books')}
								icon={HiOutlineBookOpen}
							>
								Moje książki
							</FlowbiteNavbar.Link>
							<FlowbiteNavbar.Link
								as={Link}
								to='/add-book'
								active={isActive('/add-book')}
								icon={HiOutlinePlusCircle}
							>
								Dodaj książkę
							</FlowbiteNavbar.Link>
							<FlowbiteNavbar.Link
								as={Link}
								to='/community'
								active={isActive('/community')}
								icon={HiOutlineUserGroup}
							>
								Społeczność
							</FlowbiteNavbar.Link>
						</>
					)}
				</FlowbiteNavbar.Collapse>
			</FlowbiteNavbar>

			{showLoginModal && (
				<LoginModal onClose={() => setShowLoginModal(false)} />
			)}
		</>
	);
};

export default Navbar;
