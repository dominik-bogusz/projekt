import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import {
	Navbar as FlowbiteNavbar,
	Dropdown,
	Avatar,
	Button,
} from 'flowbite-react';

const Navbar = () => {
	const [showLoginModal, setShowLoginModal] = useState(false);
	const { user, signOut } = useAuth();
	const navigate = useNavigate();

	const handleSignOut = async () => {
		await signOut();
	};

	return (
		<>
			<FlowbiteNavbar fluid className='shadow-md'>
				<FlowbiteNavbar.Brand href='/'>
					<span className='self-center whitespace-nowrap text-xl font-semibold dark:text-white'>
						My Books
					</span>
				</FlowbiteNavbar.Brand>

				<div className='flex md:order-2'>
					{user ? (
						<Dropdown
							arrowIcon={false}
							inline
							label={<Avatar alt='User settings' rounded />}
						>
							<Dropdown.Header>
								<span className='block text-sm'>{user.email}</span>
							</Dropdown.Header>
							<Dropdown.Item onClick={() => navigate('/my-books')}>
								Moja biblioteka
							</Dropdown.Item>
							<Dropdown.Item onClick={() => navigate('/add-book')}>
								Dodaj książkę
							</Dropdown.Item>
							<Dropdown.Divider />
							<Dropdown.Item onClick={handleSignOut}>Wyloguj</Dropdown.Item>
						</Dropdown>
					) : (
						<Button onClick={() => setShowLoginModal(true)}>Zaloguj się</Button>
					)}
					<FlowbiteNavbar.Toggle />
				</div>

				<FlowbiteNavbar.Collapse>
					<FlowbiteNavbar.Link
						href='/'
						active={window.location.pathname === '/'}
					>
						Strona główna
					</FlowbiteNavbar.Link>
					<FlowbiteNavbar.Link
						href='/search'
						active={window.location.pathname === '/search'}
					>
						Wyszukaj
					</FlowbiteNavbar.Link>
					{user && (
						<>
							<FlowbiteNavbar.Link
								href='/my-books'
								active={window.location.pathname === '/my-books'}
							>
								Moje książki
							</FlowbiteNavbar.Link>
							<FlowbiteNavbar.Link
								href='/add-book'
								active={window.location.pathname === '/add-book'}
							>
								Dodaj książkę
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
