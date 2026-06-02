document.addEventListener('DOMContentLoaded', () => {
    // ACCORDION LOGIC
    const accordionItems = document.querySelectorAll('.accordion-item');

    accordionItems.forEach(item => {
        const trigger = item.querySelector('.accordion-trigger');
        const icon = item.querySelector('.accordion-icon');

        if (trigger) {
            trigger.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                // Collapse all
                accordionItems.forEach(i => {
                    i.classList.remove('active');
                    const iIcon = i.querySelector('.accordion-icon');
                    if (iIcon) iIcon.textContent = '+';
                });

                // Open clicked one if it was closed
                if (!isActive) {
                    item.classList.add('active');
                    if (icon) icon.textContent = '-';
                }
            });
        }
    });

    // SCROLL PARALLAX LOGIC
    const parallaxElements = [
        { containerSelector: '.founder-card', imgSelector: '.founder-img', factor: 45 },
        { containerSelector: '.ncard', imgSelector: '.ncard-img', factor: 35 }
    ];

    function handleParallax() {
        const viewHeight = window.innerHeight;
        parallaxElements.forEach(({ containerSelector, imgSelector, factor }) => {
            const containers = document.querySelectorAll(containerSelector);
            containers.forEach(container => {
                const img = container.querySelector(imgSelector);
                if (!img) return;
                const rect = container.getBoundingClientRect();
                if (rect.top < viewHeight && rect.bottom > 0) {
                    const relativeY = (rect.top + rect.height / 2) / viewHeight - 0.5; // -0.5 to 0.5
                    const translateVal = relativeY * factor;
                    img.style.transform = `translateY(${translateVal}px)`;
                }
            });
        });
    }

    window.addEventListener('scroll', handleParallax);
    // Trigger once on load
    handleParallax();
});
