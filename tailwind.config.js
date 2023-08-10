/** @type {import('tailwindcss').Config} */
const breakpoints = require('./breakpoints.json')

module.exports = {
	content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
	theme: {
		screens: breakpoints,
		extend: {
			colors: {
				primary: {
					dark: '#586063',
					DEFAULT: '#ababab',
					light: '#edecea',
				},
				secondary: {
					dark: '#725848',
					DEFAULT: '#a88a79',
					light: '#e0d2bf',
				},
			},
		},
	},
	plugins: [],
}
