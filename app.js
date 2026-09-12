/* ============================================================
   NASHO Health Center — Main Application JavaScript
   ============================================================ */

// ── Language State ──
let currentLang = 'rw'; // 'rw' = Kinyarwanda, 'en' = English

// ── Toggle Language ──
function toggleLanguage() {
    currentLang = currentLang === 'rw' ? 'en' : 'rw';
    document.getElementById('langLabel').textContent = currentLang === 'rw' ? 'EN' : 'RW';
    
    // Update all translatable elements
    document.querySelectorAll('[data-rw][data-en]').forEach(el => {
        const text = el.getAttribute(currentLang === 'rw' ? 'data-rw' : 'data-en');
        if (text) {
            // For elements with children (like buttons with icons), only update text nodes
            if (el.childElementCount === 0) {
                el.textContent = text;
            } else {
                // Check if it's a container with icon + text
                const textNodes = Array.from(el.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);
                if (textNodes.length > 0) {
                    textNodes[0].textContent = text;
                } else {
                    el.textContent = text;
                }
            }
        }
    });

    // Update select options
    document.querySelectorAll('select option[data-rw][data-en]').forEach(opt => {
        const text = opt.getAttribute(currentLang === 'rw' ? 'data-rw' : 'data-en');
        if (text) opt.textContent = text;
    });

    // Update placeholder attributes for inputs
    document.querySelectorAll('input[data-rw-placeholder][data-en-placeholder]').forEach(input => {
        input.placeholder = input.getAttribute(currentLang === 'rw' ? 'data-rw-placeholder' : 'data-en-placeholder');
    });
}

// ── Mobile Menu Toggle ──
function toggleMobileMenu() {
    const menu = document.getElementById('navMenu');
    const hamburger = document.getElementById('hamburger');
    menu.classList.toggle('active');
    
    // Animate hamburger
    const spans = hamburger.querySelectorAll('span');
    if (menu.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
    }
}

// Close mobile menu when clicking a link
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.navbar__link').forEach(link => {
        link.addEventListener('click', () => {
            const menu = document.getElementById('navMenu');
            const hamburger = document.getElementById('hamburger');
            if (menu.classList.contains('active')) {
                menu.classList.remove('active');
                const spans = hamburger.querySelectorAll('span');
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            }
        });
    });

    // Set minimum date for appointment to today
    const today = new Date().toISOString().split('T')[0];
    const appointDate = document.getElementById('appointDate');
    if (appointDate) {
        appointDate.min = today;
        appointDate.value = today;
    }
});

// ── Navbar Scroll Effect ──
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    const scrollY = window.pageYOffset;

    if (scrollY > 50) {
        navbar.classList.add('navbar--scrolled');
    } else {
        navbar.classList.remove('navbar--scrolled');
    }

    // Active section highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar__link');
    
    let currentSection = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + currentSection) {
            link.classList.add('active');
        }
    });

    lastScroll = scrollY;
});

// ── Stats Counter Animation ──
function animateCounters() {
    const counters = document.querySelectorAll('.stats__number');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000;
        const step = Math.ceil(target / (duration / 16));
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = current.toLocaleString();
        }, 16);
    });
}

// Use Intersection Observer for stats animation
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats');
if (statsSection) {
    statsObserver.observe(statsSection);
}

// ── Scroll Reveal Animation ──
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.addEventListener('DOMContentLoaded', () => {
    const revealElements = document.querySelectorAll('.service-card, .doctor-card, .contact__detail-item, .appointment__feature');
    revealElements.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${i * 0.08}s, transform 0.6s ease ${i * 0.08}s`;
        revealObserver.observe(el);
    });
});

// ── Appointment Form Handler ──
function handleAppointment(e) {

    // IMPORTANT:
    // Do NOT use e.preventDefault()
    // The form must be submitted to Google Apps Script.

    const form = e.target;
    const btn = document.getElementById('appointBtn');

    btn.disabled = true;

    const originalHTML = btn.innerHTML;

    btn.innerHTML = '<span class="btn__icon">⏳</span><span>' +
        (currentLang === 'rw' ? 'Ohereza...' : 'Sending...') +
        '</span>';

    // Allow normal HTML form submission
    // to Google Apps Script through hidden iframe.

    setTimeout(() => {

        // Show success modal
        const modal = document.getElementById('successModal');

        if (modal) {
            modal.classList.add('active');
        }

        // Reset form
        form.reset();

        // Put today's date back
        const today = new Date().toISOString().split('T')[0];
        const appointDate = document.getElementById('appointDate');

        if (appointDate) {
            appointDate.value = today;
        }

        // Restore button
        btn.disabled = false;
        btn.innerHTML = originalHTML;

    }, 1500);

    return true;
}

// ── Close Success Modal ──
function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('active');
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('successModal');
    if (e.target === modal) {
        closeSuccessModal();
    }
});

// ── Contact Form Handler ──
function handleContact(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    
    btn.disabled = true;
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<span>' + (currentLang === 'rw' ? 'Gutegereza...' : 'Sending...') + '</span>';

    setTimeout(() => {
        alert(currentLang === 'rw' 
            ? 'Ubutumwa bwawe bwoherejwe neza! Tuzagusubiza vuba.' 
            : 'Your message was sent successfully! We will respond shortly.');
        form.reset();
        btn.disabled = false;
        btn.innerHTML = originalHTML;
    }, 1200);
}

// ── Smooth Scroll for all anchor links ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
