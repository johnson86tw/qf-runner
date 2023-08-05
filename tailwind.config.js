/** @type {import('tailwindcss').Config} */
const breakpoints = require('./breakpoints.json')

module.exports = {
	content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
	theme: {
		screens: breakpoints,
		extend: {},
	},
	plugins: [],
}
