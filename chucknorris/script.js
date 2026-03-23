/**
 * Evermor Landing Page Interactions
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Navbar Scroll Effect & Logo color switch
    const navbar = document.getElementById('navbar');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });

    // 2. Mobile Menu Toggle
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            mobileNav.classList.toggle('active');
            const isOpen = mobileNav.classList.contains('active');
            mobileMenuBtn.setAttribute('aria-expanded', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';

            if (mobileNav.classList.contains('active')) {
                navbar.classList.add('scrolled');
            } else {
                if (window.scrollY <= 50) {
                    navbar.classList.remove('scrolled');
                }
            }
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                mobileNav.classList.remove('active');
                document.body.style.overflow = '';

                if (window.scrollY <= 50) {
                    setTimeout(() => navbar.classList.remove('scrolled'), 100);
                }
            });
        });
    } // end mobile menu guard

    // 3. Scroll Reveal Animations (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal, .reveal-up, .reveal-slide-left, .reveal-slide-right');

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add('active');
            observer.unobserve(entry.target); // Only animate once
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // 4. Smooth Scrolling for anchor links (safeguard for non-supporting browsers)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            e.preventDefault();
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const navHeight = navbar.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 5. CTA Form Submit Handler
    const ctaForm = document.getElementById('cta-form');
    if (ctaForm) {
        ctaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = ctaForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = '✓ Redirecting...';
            btn.disabled = true;
            btn.style.opacity = '0.7';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
                btn.style.opacity = '';
            }, 2500);
        });
    }

    // 6. Progress Bar Entrance Animation
    const progressBar = document.querySelector('.progress-bar-fill');
    if (progressBar) {
        const targetWidth = progressBar.style.width || '43%';
        progressBar.style.width = '0%';

        const progressObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    progressBar.style.width = targetWidth;
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        progressObserver.observe(progressBar.closest('.funding-tracker'));
    }
});
