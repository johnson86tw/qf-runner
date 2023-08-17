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
					dark: '#016665',
					DEFAULT: '#00807E',
					light: '#65B1B1',
				},
			},
		},
	},
	plugins: [],
}
