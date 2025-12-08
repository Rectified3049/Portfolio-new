// main.js - Enhanced with AOS animations
document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS with optimized settings
    AOS.init({
        duration: 1000,
        easing: 'ease-out-cubic',
        once: true,
        offset: 120,
        delay: 0,
        mirror: false,
        anchorPlacement: 'top-bottom',
        disable: function() {
            // Disable on very small screens if needed
            return window.innerWidth < 768 ? 'mobile' : false;
        }
    });

    
    // Refresh AOS on dynamic content changes
    window.addEventListener('load', () => {
        AOS.refresh();
    });

    // preloader
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
                // Refresh AOS after preloader is removed
                AOS.refresh();
            }, 300);
        }, 600);
    }

    // theme toggle with ARIA
    const root = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    function updateThemeAria() {
        if (!themeToggle) return;
        const isDark = root.getAttribute('data-theme') === 'dark';
        themeToggle.setAttribute('aria-pressed', String(isDark));
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-moon', 'fa-sun');
            icon.classList.add(isDark ? 'fa-sun' : 'fa-moon');
        }
    }
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = root.getAttribute('data-theme');
            root.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
            updateThemeAria();
        });
        updateThemeAria();
    }

    // menu toggle for mobile with ARIA
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks?.classList.toggle('active');
            const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', String(!expanded));
        });
    }

    // Smooth scroll for nav links and close mobile menu on selection
    const navAnchors = document.querySelectorAll('.nav-links a');
    const navEl = document.querySelector('nav');
    function getNavHeight() {
        return navEl ? Math.ceil(navEl.getBoundingClientRect().height) : 80;
    }
    function updateNavOffsetCSS() {
        const h = getNavHeight();
        document.documentElement.style.setProperty('--nav-offset', `${h}px`);
    }
    // set initial CSS var
    updateNavOffsetCSS();
    navAnchors.forEach(a => {
        a.addEventListener('click', (e) => {
            const href = a.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const navHeight = getNavHeight();
                    const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
                    window.scrollTo({ top, behavior: 'smooth' });
                }

                // update active state immediately
                navAnchors.forEach(x => x.classList.remove('active'));
                a.classList.add('active');

                // close mobile nav if open
                if (navLinks?.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    menuToggle?.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });

    // typing text
    const typingText = document.getElementById('typingText');
    const phrases = ['I build fast, responsive UIs.', 'I design mobile experiences.', 'I craft accessible components.'];
    let pi = 0, ci = 0;
    function type() {
        if (!typingText) return;
        const text = phrases[pi];
        typingText.textContent = text.slice(0, ci++);
        if (ci > text.length) {
            ci = 0; 
            pi = (pi + 1) % phrases.length;
            setTimeout(type, 1200);
        } else setTimeout(type, 60);
    }
    type();

    // Active nav link highlighting when sections enter viewport (accounts for fixed nav)
    let sectionObserver = null;
    function initSectionObserver() {
        if (!('IntersectionObserver' in window)) return;
        if (sectionObserver) sectionObserver.disconnect();
        const navHeight = getNavHeight();
        updateNavOffsetCSS();
        const rootMargin = `-${navHeight + 8}px 0px -${navHeight + 8}px 0px`;
        sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navAnchors.forEach(a => {
                        if (a.getAttribute('href') === `#${id}`) {
                            navAnchors.forEach(x => x.classList.remove('active'));
                            a.classList.add('active');
                        }
                    });
                }
            });
        }, { threshold: 0.25, rootMargin });
        
        const sections = document.querySelectorAll('section');
        sections.forEach(s => sectionObserver.observe(s));
    }

    initSectionObserver();

    // Re-init observer on resize (debounced)
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            initSectionObserver();
            AOS.refresh();
        }, 150);
    });

    // Ensure a default active link (home) if none is set
    if (!document.querySelector('.nav-links a.active')) {
        const first = document.querySelector('.nav-links a[href="#home"]');
        if (first) first.classList.add('active');
    }

    // Skill progress animate - Enhanced with AOS trigger
    const animateSkillBars = () => {
        document.querySelectorAll('.skill-progress').forEach(el => {
            const p = el.getAttribute('data-progress');
            if (p && !el.classList.contains('animated')) {
                el.style.width = '0%';
                // Use requestAnimationFrame for smooth animation
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        el.style.width = p + '%';
                        el.classList.add('animated');
                    }, 100);
                });
            }
        });
    };

    // Trigger skill bar animation when skills section is in view
    const skillsSection = document.getElementById('skills');
    if (skillsSection && 'IntersectionObserver' in window) {
        const skillsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateSkillBars();
                    skillsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        skillsObserver.observe(skillsSection);
    } else {
        // Fallback for browsers without IntersectionObserver
        animateSkillBars();
    }

    // Project filter - initialize with 'web' category visible by default
    const projectCards = document.querySelectorAll('.project-card');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // Show only web cards on initial page load
    projectCards.forEach(card => {
        if (card.getAttribute('data-category') === 'web') {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');
            
            projectCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = '';
                    // Re-trigger AOS animation for filtered cards
                    card.classList.add('aos-animate');
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Refresh AOS after filtering
            setTimeout(() => {
                AOS.refresh();
            }, 50);
        });
    });

    // Scroll top button
    const scrollTop = document.getElementById('scrollTop');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            scrollTop?.classList.add('visible');
        } else {
            scrollTop?.classList.remove('visible');
        }
    });
    
    scrollTop?.addEventListener('click', () => {
        window.scrollTo({top: 0, behavior: 'smooth'});
    });

    // Add smooth hover effects to interactive elements (non-conflicting with AOS)
    const addHoverEffects = () => {
        const interactiveElements = document.querySelectorAll('.btn, .project-card, .service-card, .skill-category, .contact-item');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', function() {
                if (!this.classList.contains('aos-animate')) return; // Only apply after AOS animation
                const currentTransform = window.getComputedStyle(this).transform;
                if (currentTransform === 'none') {
                    this.style.transform = 'translateY(-5px) scale(1.02)';
                }
            });
            el.addEventListener('mouseleave', function() {
                this.style.transform = '';
            });
        });
    };
    // Delay hover effects until after page load
    setTimeout(addHoverEffects, 1000);

    // Parallax effect for hero section (subtle)
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            const heroHeight = hero.offsetHeight;
            if (scrolled < heroHeight) {
                hero.style.transform = `translateY(${scrolled * 0.3}px)`;
                hero.style.opacity = 1 - (scrolled / heroHeight) * 0.5;
            }
        });
    }

    // Add stagger effect to project tags
    const addTagStagger = () => {
        document.querySelectorAll('.project-card').forEach((card, index) => {
            const tags = card.querySelectorAll('.tag');
            tags.forEach((tag, tagIndex) => {
                tag.style.animationDelay = `${(index * 0.1) + (tagIndex * 0.05)}s`;
            });
        });
    };
    addTagStagger();

    // Enhanced form submission with visual feedback
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('.btn-primary');
            if (submitBtn) {
                submitBtn.textContent = 'Sending...';
                submitBtn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    submitBtn.style.transform = '';
                }, 200);
            }
        });
    }

    // Add micro-interactions to social links
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) rotate(5deg) scale(1.1)';
        });
        link.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });

    // Enhanced smooth reveal for contact items (works with AOS)
    const revealContactItems = () => {
        const contactSection = document.getElementById('contact');
        if (contactSection && 'IntersectionObserver' in window) {
            const contactObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const contactItems = entry.target.querySelectorAll('.contact-item');
                        contactItems.forEach((item, index) => {
                            setTimeout(() => {
                                item.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                                item.style.opacity = '1';
                                item.style.transform = 'translateX(0)';
                            }, index * 100);
                        });
                        contactObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });
            contactObserver.observe(contactSection);
        }
    };
    revealContactItems();

    // Add pulse animation to CTA buttons (reduced frequency to not conflict with AOS)
    const pulseCTAButtons = () => {
        const ctaButtons = document.querySelectorAll('.cta-buttons .btn');
        ctaButtons.forEach(btn => {
            setInterval(() => {
                btn.style.animation = 'pulse 0.6s ease';
                setTimeout(() => {
                    btn.style.animation = '';
                }, 600);
            }, 8000); // Increased from 5000 to 8000 to be less frequent
        });
    };
    // Delay pulse animation until after initial AOS animations complete
    setTimeout(pulseCTAButtons, 2000);

    // Cursor trail effect (optional - can be removed if too much)
    let cursorTrail = [];
    document.addEventListener('mousemove', (e) => {
        if (window.innerWidth > 768) { // Only on desktop
            const trail = document.createElement('div');
            trail.className = 'cursor-trail';
            trail.style.left = e.pageX + 'px';
            trail.style.top = e.pageY + 'px';
            document.body.appendChild(trail);
            
            setTimeout(() => {
                trail.remove();
            }, 500);
        }
    });

    console.log('🎨 Portfolio loaded with AOS animations!');
});


// / Initialize AOS animations
        AOS.init({
            duration: 1000,
            once: true,
            mirror: false
        });

        // Parallax tilt effect on glass card
        const mockup = document.querySelector('.hero-mockup');
        
        if (mockup && window.innerWidth > 768) {
            document.addEventListener('mousemove', (e) => {
                const { clientX, clientY } = e;
                const { innerWidth, innerHeight } = window;
                
                const xPos = (clientX / innerWidth - 0.5) * 2;
                const yPos = (clientY / innerHeight - 0.5) * 2;
                
                mockup.style.transform = `
                    translateY(-20px) 
                    rotateY(${xPos * 3}deg) 
                    rotateX(${-yPos * 3}deg)
                `;
            });

            // Reset on mouse leave
            document.addEventListener('mouseleave', () => {
                mockup.style.transform = 'translateY(0) rotateY(0) rotateX(0)';
            });
        }