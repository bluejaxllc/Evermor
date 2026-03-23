/**
 * Official Evermor Landing Page Interactions
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Navbar Scroll Effect
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });

    // 2. Scroll Reveal Animations (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-slide-left, .reveal-slide-right');

    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // 3. CTA Form Submit Handler
    const ctaForm = document.getElementById('cta-form');
    if (ctaForm) {
        ctaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = ctaForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = 'Enrolling...';
            btn.disabled = true;
            btn.style.opacity = '0.7';
            setTimeout(() => {
                btn.textContent = 'Welcome to the Archive';
                btn.style.backgroundColor = '#A7FFEB';
                btn.style.color = '#0A0F12';
            }, 1000);
        });
    }

    // 4. Advanced 3D Tilt Effect on Bento Cards
    const bentoCards = document.querySelectorAll('.bento-card');
    bentoCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
            card.style.transition = 'transform 0.5s ease-out, border-color 0.5s, box-shadow 0.5s';
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'border-color 0.5s, box-shadow 0.5s';
        });
    });

    // 5. Cursor-Following Glow Orb
    const cursorOrb = document.createElement('div');
    cursorOrb.classList.add('ambient-orb');
    cursorOrb.style.width = '600px';
    cursorOrb.style.height = '600px';
    cursorOrb.style.background = 'radial-gradient(circle, rgba(0, 229, 255, 0.05), transparent 70%)';
    cursorOrb.style.position = 'fixed';
    cursorOrb.style.pointerEvents = 'none';
    cursorOrb.style.zIndex = '0';
    cursorOrb.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(cursorOrb);

    window.addEventListener('mousemove', (e) => {
        cursorOrb.style.left = `${e.clientX}px`;
        cursorOrb.style.top = `${e.clientY}px`;
    });

    // 6. Magnetic Buttons
    const magneticBtns = document.querySelectorAll('.btn-magnetic');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = `translate(0px, 0px)`;
        });
    });

});
