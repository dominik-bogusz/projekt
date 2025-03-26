/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./index.html',
		'./src/**/*.{js,ts,jsx,tsx}',
		// Dodajemy zawartość z Flowbite
		'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
	],
	theme: {
		extend: {},
	},
	plugins: [
		// Dodajemy plugin Flowbite
		require('flowbite/plugin'),
	],
};
