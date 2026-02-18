document.addEventListener('DOMContentLoaded', () => {
	const themeToggle = document.getElementById('theme-toggle');
	const body = document.body;

	const savedTheme = localStorage.getItem('theme');
	if (savedTheme) {
			body.setAttribute('data-theme', savedTheme);
	}

	themeToggle.addEventListener('click', () => {
			const currentTheme = body.getAttribute('data-theme');
			const newTheme = currentTheme === 'light' ? 'dark' : 'light';
			body.setAttribute('data-theme', newTheme);
			localStorage.setItem('theme', newTheme);
	});
});
