document.addEventListener('DOMContentLoaded', () => {
    // Add any specific functionality for how-it-works page
    const processSteps = document.querySelectorAll('.process-step');
    
    // Add animation when steps come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, { threshold: 0.5 });

    processSteps.forEach(step => observer.observe(step));
}); 