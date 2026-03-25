/**
 * Official Evermor Landing Page Interactions
 */

// 0. Pre-loader Engine
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (loader) {
        // Enforce a minimum display time of 500ms so the user sees the cool animation
        setTimeout(() => {
            loader.classList.add('fade-out');
            setTimeout(() => {
                loader.style.display = 'none';
            }, 800); // Matches CSS transition duration
        }, 500);
    }
});

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

    // 1b. Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');

    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            mobileNav.classList.toggle('active');
            document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
        });

        // Close mobile nav when a link is clicked
        mobileNav.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                mobileNav.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

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
    // TODO: Paste your deployed Google Apps Script Web App URL below
    const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';

    if (ctaForm) {
        ctaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = ctaForm.querySelector('button[type="submit"]');
            const emailInput = ctaForm.querySelector('input[type="email"]');
            const originalText = btn.textContent;

            if (!emailInput || !emailInput.value) return;

            btn.textContent = 'Enrolling...';
            btn.disabled = true;
            btn.style.opacity = '0.7';

            const formData = new FormData();
            formData.append('email', emailInput.value);

            fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Bypasses CORS issues
                body: formData
            })
                .then(() => {
                    btn.textContent = 'Welcome to the Archive';
                    btn.style.backgroundColor = '#A7FFEB';
                    btn.style.color = '#0A0F12';
                    emailInput.value = ''; // clear the input

                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.disabled = false;
                        btn.style.opacity = '1';
                        btn.style.backgroundColor = '';
                        btn.style.color = '';
                    }, 3000);
                })
                .catch(error => {
                    console.error('Waitlist Submission Error:', error);
                    btn.textContent = 'Error. Try Again.';
                    btn.style.backgroundColor = '#ff5252';
                    btn.style.color = '#fff';

                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.disabled = false;
                        btn.style.opacity = '1';
                        btn.style.backgroundColor = '';
                        btn.style.color = '';
                    }, 3000);
                });
        });
    }

    // 4. Advanced 3D Tilt Effect using Vanilla-Tilt
    VanillaTilt.init(document.querySelectorAll(".bento-card, .tier-card, .experience-card"), {
        max: 5,
        speed: 400,
        glare: true,
        "max-glare": 0.05,
        scale: 1.02
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

    // 6. Magnetic Buttons Enhancement
    const magneticBtns = document.querySelectorAll('.btn-magnetic');
    magneticBtns.forEach(btn => {
        btn.classList.add('magnetic');
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

    // 7. Custom WebGL-style Cursor (desktop only — disabled on touch/mobile)
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 1024);

    if (!isTouchDevice) {
        const cursorDot = document.createElement('div');
        cursorDot.classList.add('cursor-dot');
        document.body.appendChild(cursorDot);

        const cursorOutline = document.createElement('div');
        cursorOutline.classList.add('cursor-outline');
        document.body.appendChild(cursorOutline);

        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            // Slight delay on the outline for smoothness
            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: "forwards" });
        });

        // Hover State for Cursor
        const hoverElements = document.querySelectorAll('a, button, input, .bento-card');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => document.documentElement.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.documentElement.classList.remove('cursor-hover'));
        });
    }

    // 8. Immersive Digital Dust (tsParticles)
    if (typeof tsParticles !== 'undefined') {
        tsParticles.load("tsparticles", {
            fpsLimit: 60,
            particles: {
                color: { value: "#00E5FF" },
                links: { enable: false },
                move: {
                    enable: true,
                    speed: 0.6,
                    direction: "top",
                    random: true,
                    straight: false,
                    outModes: { default: "out" }
                },
                number: {
                    density: { enable: true, area: 800 },
                    value: 100
                },
                opacity: {
                    value: { min: 0.1, max: 0.8 },
                    animation: { enable: true, speed: 1, minimumValue: 0.1 }
                },
                size: {
                    value: { min: 1, max: 3 },
                    animation: { enable: true, speed: 2, minimumValue: 0.5 }
                }
            },
            interactivity: {
                events: {
                    onHover: { enable: true, mode: "slow" },
                    resize: true
                },
                modes: {
                    slow: { radius: 100, factor: 3 }
                }
            },
            detectRetina: true
        });
    }
    // 9. FAQ Accordion Toggle
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                // Close all other items
                faqItems.forEach(other => other.classList.remove('active'));
                // Toggle current item
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });

    // 10. Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

});
