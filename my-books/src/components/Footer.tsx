import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
	return (
		<footer className='bg-white border-t border-gray-200'>
			<div className='mx-auto w-full max-w-screen-xl p-4 py-6'>
				<div className='flex justify-center space-x-8'>
					<Link to='/' className='text-gray-600 hover:text-blue-600'>
						Strona główna
					</Link>
					<Link to='/about' className='text-gray-600 hover:text-blue-600'>
						O projekcie
					</Link>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
