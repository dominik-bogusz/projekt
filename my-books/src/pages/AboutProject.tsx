import React from 'react';

const AboutProject: React.FC = () => {
	return (
		<div className='max-w-4xl mx-auto px-4 py-8'>
			<h1 className='text-3xl font-bold mb-6'>O projekcie</h1>

			<div className='bg-white rounded-lg shadow-md p-6'>
				<p className='text-gray-700 mb-4'>
					Celem pracy dyplomowej jest stworzenie webowej aplikacji, która
					pozwoli użytkownikom na przeglądanie dostępnych książek, dodawanie
					własnych pozycji do swojej biblioteki, wymianę książek między sobą
					oraz ocenianie i recenzowanie przeczytanych tytułów.
				</p>

				<p className='text-gray-700 mb-4'>
					Aplikacja ma na celu ułatwienie dostępu do literatury, promowanie
					społeczności czytelników oraz umożliwienie dzielenia się opiniami na
					temat książek.
				</p>

				<p className='text-gray-700 mb-4'>
					Projekt obejmuje zaprojektowanie intuicyjnego interfejsu użytkownika
					oraz implementację funkcjonalności wspierających wymianę i ocenianie
					książek. Praca jest realizowana samodzielnie.
				</p>

				<div className='mt-6 border-t pt-4 border-gray-200'>
					<h2 className='text-xl font-semibold mb-3'>
						Główne funkcjonalności:
					</h2>
					<ul className='list-disc pl-5 space-y-2 text-gray-700'>
						<li>Przeglądanie dostępnych książek</li>
						<li>Dodawanie własnych pozycji do biblioteki</li>
						<li>Wymiana książek z innymi użytkownikami</li>
						<li>Ocenianie i recenzowanie przeczytanych tytułów</li>
						<li>Budowanie społeczności czytelników</li>
					</ul>
				</div>
			</div>
		</div>
	);
};

export default AboutProject;
