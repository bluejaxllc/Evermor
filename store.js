/**
 * Evermor Store — Interactions
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Category Filter
    const filterBtns = document.querySelectorAll('.filter-btn');
    const categories = document.querySelectorAll('.catalog-category');
    const productCards = document.querySelectorAll('.product-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;

            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (filter === 'all') {
                categories.forEach(cat => cat.classList.remove('hidden'));
                productCards.forEach(card => card.classList.remove('hidden'));
            } else {
                categories.forEach(cat => {
                    const catCards = cat.querySelectorAll(`[data-category="${filter}"]`);
                    if (catCards.length === 0) {
                        cat.classList.add('hidden');
                    } else {
                        cat.classList.remove('hidden');
                    }
                });

                productCards.forEach(card => {
                    if (card.dataset.category === filter) {
                        card.classList.remove('hidden');
                    } else {
                        card.classList.add('hidden');
                    }
                });
            }

            // Smooth scroll to top of catalog
            document.querySelector('.store-catalog').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });

    // 2. Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        }
    }, { passive: true });

    // 3. Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');

    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            mobileNav.classList.toggle('active');
            document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
        });

        mobileNav.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                mobileNav.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // 4. Product Card Click — show inquiry toast
    productCards.forEach(card => {
        const cta = card.querySelector('.product-cta');
        if (cta) {
            cta.addEventListener('click', () => {
                const productName = card.querySelector('.product-name')?.textContent || 'this product';
                showToast(`Thanks for your interest in "${productName}"! We'll be in touch when the store launches.`);
            });
        }
    });

    // 5. Toast Notification System
    function showToast(message) {
        // Remove any existing toast
        const existing = document.querySelector('.store-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'store-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">✓</span>
                <span class="toast-message">${message}</span>
            </div>
        `;
        document.body.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto-remove after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    }

    // Inject toast styles
    const toastStyles = document.createElement('style');
    toastStyles.textContent = `
        .store-toast {
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            z-index: 10000;
            opacity: 0;
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            pointer-events: none;
        }
        .store-toast.show {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
            pointer-events: auto;
        }
        .toast-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            background: rgba(10, 15, 18, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(0, 229, 255, 0.2);
            border-radius: 100px;
            padding: 1rem 2rem;
            color: #fff;
            font-family: 'Inter', sans-serif;
            font-size: 0.9rem;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 229, 255, 0.1);
            max-width: 90vw;
        }
        .toast-icon {
            background: rgba(0, 229, 255, 0.2);
            color: #00E5FF;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: bold;
            flex-shrink: 0;
        }
        .toast-message {
            color: rgba(255, 255, 255, 0.8);
            line-height: 1.4;
        }
    `;
    document.head.appendChild(toastStyles);

    // 6. Scroll reveal for product cards
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    productCards.forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${(i % 4) * 0.1}s`;
        observer.observe(card);
    });
});
