import React from 'react';
import AddBookForm from '../components/AddBookForm';

const AddBook: React.FC = () => {
	return (
		<div className='max-w-6xl mx-auto px-4 py-6'>
			<h1 className='text-3xl font-bold mb-6'>Dodaj książkę</h1>

			<div className='bg-blue-50 p-4 rounded-lg mb-8'>
				<p className='text-blue-700'>
					Możesz dodać własną książkę do swojej biblioteki wypełniając poniższy
					formularz. Możesz także wyszukać książkę w Google Books i zapisać ją
					stamtąd.
				</p>
			</div>

			<AddBookForm />
		</div>
	);
};

export default AddBook;
