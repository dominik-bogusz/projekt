import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			// Aliasuj brakujący moduł do lokalnego pliku
			'tailwindcss/version.js': path.resolve(
				__dirname,
				'./tailwindcss-version-shim.js'
			),
		},
	},
	// Wyłącz nakładkę błędów HMR dla tego konkretnego błędu
	server: {
		hmr: {
			overlay: false,
		},
	},
	optimizeDeps: {
		exclude: ['tailwindcss/version.js'],
	},
	build: {
		commonjsOptions: {
			exclude: ['tailwindcss/version.js'],
		},
	},
});
