import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabase';
import { Card, Spinner } from 'flowbite-react';

const ReadingStats: React.FC = () => {
	const [stats, setStats] = useState<any>({
		totalBooks: 0,
		booksRead: 0,
		currentlyReading: 0,
		wantToRead: 0,
		pagesRead: 0,
		genreDistribution: {},
		readingHistory: [],
	});
	const [isLoading, setIsLoading] = useState(true);
	const { user } = useAuth();

	useEffect(() => {
		if (!user) return;

		const fetchStats = async () => {
			setIsLoading(true);
			try {
				// Fetch total books in library
				const { data: booksData, error: booksError } = await supabase
					.from('books')
					.select('*')
					.eq('user_id', user.id);

				if (booksError) throw booksError;

				// Fetch reading status
				const { data: statusData, error: statusError } = await supabase
					.from('reading_status')
					.select('*')
					.eq('user_id', user.id);

				if (statusError) throw statusError;

				// Calculate stats
				const totalBooks = booksData?.length || 0;
				const booksRead =
					statusData?.filter((s) => s.status === 'read').length || 0;
				const currentlyReading =
					statusData?.filter((s) => s.status === 'currently_reading').length ||
					0;
				const wantToRead =
					statusData?.filter((s) => s.status === 'want_to_read').length || 0;

				// Calculate pages read (if page count data is available)
				let pagesRead = 0;
				const readBookIds =
					statusData
						?.filter((s) => s.status === 'read')
						.map((s) => s.book_id) || [];

				const readBooks =
					booksData?.filter((b) => readBookIds.includes(b.id)) || [];
				pagesRead = readBooks.reduce(
					(total, book) => total + (book.page_count || 0),
					0
				);

				// Genre distribution
				const genres: Record<string, number> = {};
				booksData?.forEach((book) => {
					if (book.categories) {
						book.categories.forEach((category: string) => {
							genres[category] = (genres[category] || 0) + 1;
						});
					}
				});

				// Reading history (books completed by month)
				const readingHistory = [];
				// Logic for reading history by month would go here

				setStats({
					totalBooks,
					booksRead,
					currentlyReading,
					wantToRead,
					pagesRead,
					genreDistribution: genres,
					readingHistory,
				});
			} catch (error) {
				console.error('Error fetching reading stats:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchStats();
	}, [user]);

	if (!user) {
		return (
			<div className='max-w-6xl mx-auto px-4 py-8'>
				<div className='bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4'>
					<p>Musisz się zalogować, aby zobaczyć statystyki czytania.</p>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className='max-w-6xl mx-auto px-4 py-8 flex justify-center'>
				<Spinner size='xl' />
			</div>
		);
	}

	return (
		<div className='max-w-6xl mx-auto px-4 py-8'>
			<h1 className='text-3xl font-bold mb-6'>Statystyki czytania</h1>

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
				<Card className='text-center'>
					<h5 className='text-2xl font-bold tracking-tight text-gray-900'>
						{stats.totalBooks}
					</h5>
					<p className='font-normal text-gray-700'>Wszystkich książek</p>
				</Card>

				<Card className='text-center'>
					<h5 className='text-2xl font-bold tracking-tight text-gray-900'>
						{stats.booksRead}
					</h5>
					<p className='font-normal text-gray-700'>Przeczytanych</p>
				</Card>

				<Card className='text-center'>
					<h5 className='text-2xl font-bold tracking-tight text-gray-900'>
						{stats.currentlyReading}
					</h5>
					<p className='font-normal text-gray-700'>W trakcie czytania</p>
				</Card>

				<Card className='text-center'>
					<h5 className='text-2xl font-bold tracking-tight text-gray-900'>
						{stats.wantToRead}
					</h5>
					<p className='font-normal text-gray-700'>Do przeczytania</p>
				</Card>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				<Card>
					<h5 className='text-xl font-bold mb-4'>Strony przeczytane</h5>
					<div className='flex items-center justify-center'>
						<div className='text-center'>
							<div className='text-5xl font-bold text-blue-600'>
								{stats.pagesRead}
							</div>
							<div className='text-gray-500 mt-2'>stron</div>
						</div>
					</div>
				</Card>

				<Card>
					<h5 className='text-xl font-bold mb-4'>Ulubione gatunki</h5>
					{Object.keys(stats.genreDistribution).length === 0 ? (
						<p className='text-center text-gray-500'>Brak danych o gatunkach</p>
					) : (
						<div className='space-y-4'>
							{Object.entries(stats.genreDistribution)
								.sort((a, b) => (b[1] as number) - (a[1] as number))
								.slice(0, 5)
								.map(([genre, count]) => (
									<div key={genre}>
										<div className='flex justify-between mb-1'>
											<span>{genre}</span>
											<span>{count} książek</span>
										</div>
										<div className='w-full bg-gray-200 rounded-full h-2.5'>
											<div
												className='bg-blue-600 h-2.5 rounded-full'
												style={{
													width: `${Math.min(
														100,
														((count as number) / stats.totalBooks) * 100
													)}%`,
												}}
											></div>
										</div>
									</div>
								))}
						</div>
					)}
				</Card>
			</div>
		</div>
	);
};

export default ReadingStats;
