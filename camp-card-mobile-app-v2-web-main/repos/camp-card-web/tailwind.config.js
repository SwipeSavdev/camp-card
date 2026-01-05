/** @type {import('tailwindcss').Config} */
module.exports = {
 content: [
 './pages/**/*.{js,ts,jsx,tsx,mdx}',
 './components/**/*.{js,ts,jsx,tsx,mdx}',
 './app/**/*.{js,ts,jsx,tsx,mdx}',
 ],
 theme: {
 extend: {
 colors: {
 'bsa-red': '#CE1126',
 'bsa-blue': '#003F87',
 'bsa-gold': '#FFD700',
 },
 },
 },
 plugins: [],
};
