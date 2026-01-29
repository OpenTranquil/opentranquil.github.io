document.addEventListener('DOMContentLoaded', () => {
	// Smooth scrolling for anchor links
	document.querySelectorAll('a[href^="#"]').forEach(anchor => {
		anchor.addEventListener('click', function (e) {
			e.preventDefault();
			const target = document.querySelector(this.getAttribute('href'));
			if (target) {
				target.scrollIntoView({
					behavior: 'smooth'
				});
			}
		});
	});

	// Scroll Reveal Observer
	const revealOptions = {
		threshold: 0.15,
		rootMargin: "0px 0px -50px 0px"
	};

	const revealObserver = new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				entry.target.classList.add('active');
			}
		});
	}, revealOptions);

	document.querySelectorAll('.section-reveal').forEach(section => {
		revealObserver.observe(section);
	});

	// Mouse Glow Effect
	const cards = document.querySelectorAll('.glow-card');

	// Add mousemove listener to container to avoid too many listeners
	document.addEventListener('mousemove', (e) => {
		cards.forEach(card => {
			const rect = card.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			// Only update if near/inside (optimization)
			// But for CSS opacity transition to work smoothly we generally just update
			card.style.setProperty('--x', `${x}px`);
			card.style.setProperty('--y', `${y}px`);
		});
	});
});
