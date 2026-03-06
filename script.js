/* ── Cinematic Intro: Black → letters slide up → scatter → overlay wipes ── */
(function () {
    const overlay = document.createElement('div');
    overlay.id = 'intro-overlay';

    // Split each word into individual letter spans
    function makeLetters(word, cls) {
        return [...word].map((ch, i) =>
            `<span class="il ${cls}" style="--i:${i}" data-ch="${ch}">${ch}</span>`
        ).join('');
    }

    overlay.innerHTML = `
      <div class="intro-words">
        <div class="intro-line">${makeLetters('Face', 'il-face')}</div>
        <div class="intro-line">${makeLetters('Recognition', 'il-rec')}</div>
      </div>
    `;
    document.body.prepend(overlay);
    document.body.style.overflow = 'hidden';

    const letters = overlay.querySelectorAll('.il');

    // Step 1 — slide letters up, staggered per letter
    setTimeout(() => {
        letters.forEach((l, i) => {
            setTimeout(() => l.classList.add('il-visible'), i * 55);
        });
    }, 300);

    // Step 2 — full radial burst: letters scatter across the whole screen
    setTimeout(() => {
        letters.forEach(l => {
            const angle = Math.random() * Math.PI * 2;
            const dist = 300 + Math.random() * 400;
            const rx = Math.cos(angle) * dist;
            const ry = Math.sin(angle) * dist;
            const rot = (Math.random() - 0.5) * 540;
            l.style.setProperty('--rx', rx + 'px');
            l.style.setProperty('--ry', ry + 'px');
            l.style.setProperty('--rot', rot + 'deg');
            l.classList.add('il-scatter');
        });
    }, 1600);

    // Step 3 — wipe overlay up to reveal site
    setTimeout(() => {
        overlay.classList.add('intro-slide-up');
        setTimeout(() => {
            overlay.remove();
            document.body.style.overflow = '';
            document.querySelectorAll('.hero-reveal').forEach((el, i) => {
                setTimeout(() => el.classList.add('revealed'), i * 130);
            });
        }, 750);
    }, 2050);
})();


/* ── Active nav + smooth scroll (IntersectionObserver for snap) ── */
(function () {
    const sectionIds = ['hero', 'features', 'how-it-works', 'tech', 'code', 'about'];
    const navLinks = document.querySelectorAll('.nav-links a');

    // Smooth scroll on click
    navLinks.forEach(a => {
        a.addEventListener('click', function (e) {
            const id = this.getAttribute('href').slice(1);
            const target = document.getElementById(id);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // UseIntersectionObserver — works correctly with CSS scroll-snap
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(a => {
                    a.classList.toggle('active', a.getAttribute('href') === '#' + id);
                });
            }
        });
    }, { threshold: 0.5 }); // fire when 50% of section is visible

    sectionIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
    });
})();



/* ── Colorful Confetti Particles (Antigravity style) ──────── */
(function () {
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let W, H;

    const COLORS = ['#4285f4', '#ea4335', '#34a853', '#fbbc04', '#7c3aed', '#4285f4', '#34a853'];
    const NUM = 90;
    let particles = [];

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function rand(a, b) { return Math.random() * (b - a) + a; }

    function makeParticle() {
        return {
            x: rand(0, W),
            y: rand(0, H),
            vx: rand(-0.15, 0.15),
            vy: rand(-0.2, -0.05),   // drift upward slowly
            r: rand(1.5, 3.5),
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            alpha: rand(0.35, 0.75),
        };
    }

    for (let i = 0; i < NUM; i++) particles.push(makeParticle());

    function draw() {
        ctx.clearRect(0, 0, W, H);
        for (const p of particles) {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            p.x += p.vx;
            p.y += p.vy;

            // wrap around
            if (p.y < -10) p.y = H + 10;
            if (p.x < -10) p.x = W + 10;
            if (p.x > W + 10) p.x = -10;
        }
        requestAnimationFrame(draw);
    }
    draw();
})();
(function () {
    // Create the HUD element
    const hud = document.createElement('div');
    hud.id = 'fps-hud';
    hud.innerHTML = `
    <span class="fps-label">FPS</span>
    <span class="fps-value" id="fps-value">--</span>
    <div class="fps-bar-wrap"><div class="fps-bar" id="fps-bar"></div></div>
  `;
    document.body.appendChild(hud);

    let frames = 0;
    let lastTime = performance.now();

    function countFPS() {
        frames++;
        const now = performance.now();
        const delta = now - lastTime;

        if (delta >= 500) { // update every 500 ms
            const fps = Math.round((frames / delta) * 1000);
            frames = 0;
            lastTime = now;

            const fpsEl = document.getElementById('fps-value');
            const barEl = document.getElementById('fps-bar');

            if (fpsEl) {
                fpsEl.textContent = fps;
                // Color-code: green ≥55, yellow ≥30, red <30
                fpsEl.className = 'fps-value ' + (fps >= 55 ? 'fps-good' : fps >= 30 ? 'fps-ok' : 'fps-bad');
            }
            if (barEl) {
                const pct = Math.min(fps / 60, 1) * 100;
                barEl.style.width = pct + '%';
                barEl.style.background = fps >= 55
                    ? 'linear-gradient(90deg, #2de8c0, #4f8ef7)'
                    : fps >= 30
                        ? 'linear-gradient(90deg, #febc2e, #f78c6c)'
                        : 'linear-gradient(90deg, #ff5f57, #f78c6c)';
            }

            // Also keep the hero stat in sync
            const heroFps = document.querySelector('.stat-num[data-count="60"]');
            if (heroFps) heroFps.textContent = fps;
        }

        requestAnimationFrame(countFPS);
    }
    requestAnimationFrame(countFPS);
})();


/* ── Particle / Neural Network Background ──────────────────── */
(function () {
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let W, H, particles = [], animId;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const NUM = 55;

    function rand(a, b) { return Math.random() * (b - a) + a; }

    for (let i = 0; i < NUM; i++) {
        particles.push({
            x: rand(0, window.innerWidth),
            y: rand(0, window.innerHeight),
            vx: rand(-0.3, 0.3),
            vy: rand(-0.3, 0.3),
            r: rand(1.5, 3.5),
        });
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 160) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(79, 142, 247, ${0.15 * (1 - dist / 160)})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }

        // Draw particles
        for (const p of particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(79, 142, 247, 0.35)';
            ctx.fill();

            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;
        }

        animId = requestAnimationFrame(draw);
    }
    draw();
})();


/* ── Navbar scroll effect ──────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
});


/* ── Animated stat counters ────────────────────────────────── */
function animateCount(el) {
    const target = parseInt(el.getAttribute('data-count'));
    const duration = 1500;
    const start = performance.now();
    function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
    }
    requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.stat-num').forEach(animateCount);
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsEl = document.querySelector('.hero-stats');
if (statsEl) statsObserver.observe(statsEl);


/* ── Scroll-reveal for feature/tech cards ──────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.feature-card, .tech-card, .step-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    revealObserver.observe(el);
});


/* ── Smooth active nav highlight ───────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(link => {
                link.style.color = link.getAttribute('href') === `#${entry.target.id}`
                    ? '#4f8ef7'
                    : '';
            });
        }
    });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => navObserver.observe(s));


/* ── Face box scan pulse on hover ──────────────────────────── */
const faceBox = document.querySelector('.face-box');
if (faceBox) {
    faceBox.addEventListener('mouseenter', () => {
        faceBox.querySelectorAll('.corner').forEach(c => {
            c.style.borderColor = '#f78c6c';
            c.style.transition = 'border-color 0.3s';
        });
    });
    faceBox.addEventListener('mouseleave', () => {
        faceBox.querySelectorAll('.corner').forEach(c => {
            c.style.borderColor = '';
        });
    });
}
