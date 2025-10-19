// Advanced animations and effects
class PortfolioAnimations {
    constructor() {
        this.init();
    }

    init() {
        this.setupParallax();
        this.setupMouseEffects();
        this.setupPageTransitions();
    }

    setupParallax() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax');
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    setupMouseEffects() {
        document.addEventListener('mousemove', (e) => {
            const cursor = document.querySelector('.custom-cursor');
            if (cursor) {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            }
        });

        // Add custom cursor if needed
        this.createCustomCursor();
    }

    createCustomCursor() {
        if (window.innerWidth > 768) {
            const cursor = document.createElement('div');
            cursor.className = 'custom-cursor';
            document.body.appendChild(cursor);

            const styles = document.createElement('style');
            styles.textContent = `
                .custom-cursor {
                    position: fixed;
                    width: 20px;
                    height: 20px;
                    background: var(--primary-color);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 10000;
                    mix-blend-mode: difference;
                    transition: transform 0.2s ease;
                }
                .custom-cursor.hover {
                    transform: scale(1.5);
                }
            `;
            document.head.appendChild(styles);

            // Add hover effects
            const hoverElements = document.querySelectorAll('a, button, .hover-effect');
            hoverElements.forEach(el => {
                el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
                el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
            });
        }
    }

    setupPageTransitions() {
        // Add page transition styles
        const styles = document.createElement('style');
        styles.textContent = `
            .page-transition {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: var(--gradient);
                z-index: 10000;
                transform: scaleY(0);
                transform-origin: bottom;
                transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .page-transition.active {
                transform: scaleY(1);
                transform-origin: top;
            }
        `;
        document.head.appendChild(styles);
    }

    pageTransition(url) {
        const transition = document.createElement('div');
        transition.className = 'page-transition';
        document.body.appendChild(transition);

        setTimeout(() => {
            transition.classList.add('active');
            setTimeout(() => {
                window.location.href = url;
            }, 600);
        }, 50);
    }
}

// Initialize animations
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioAnimations = new PortfolioAnimations();
});