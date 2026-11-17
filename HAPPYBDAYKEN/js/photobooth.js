document.addEventListener('DOMContentLoaded', () => {
    const $ = id => document.getElementById(id);
    const rand = arr => arr[Math.floor(Math.random() * arr.length)];

    const cards = Array.from(document.querySelectorAll('.pb-card'));
    if (!cards.length) return;

    const flash = $('pb-flash');
    const viewer = $('pb-viewer');
    const img = $('pb-img');
    const counter = $('pb-counter');
    const filterBtns = Array.from(document.querySelectorAll('.pb-filter[data-f]'));
    const srcs = cards.map(c => c.querySelector('img').getAttribute('src'));
    let current = 0;
    let audioCtx = null;

    /* ---------- SHUTTER SOUND (generated, no file needed) ---------- */
    function clickSound(when, volume) {
        const ctx = audioCtx;
        const len = Math.floor(ctx.sampleRate * 0.07);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const gain = ctx.createGain();
        gain.gain.value = volume;
        src.connect(gain);
        gain.connect(ctx.destination);
        src.start(ctx.currentTime + when);
    }

    function shutter() {
        try {
            audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') audioCtx.resume();
            clickSound(0, 0.45);
            clickSound(0.11, 0.3);
        } catch (e) { /* sound is optional */ }
    }

    /* ---------- FLASH ---------- */
    function doFlash() {
        flash.classList.remove('go');
        void flash.offsetWidth;
        flash.classList.add('go');
        shutter();
    }

    /* ---------- FLOATING EMOJI ---------- */
    function pop(x, y, emoji) {
        const h = document.createElement('span');
        h.className = 'pop-heart';
        h.textContent = emoji;
        h.style.left = x + 'px';
        h.style.top = y + 'px';
        h.style.setProperty('--dx', (Math.random() * 200 - 100) + 'px');
        h.style.setProperty('--dy', (-60 - Math.random() * 120) + 'px');
        document.body.appendChild(h);
        setTimeout(() => h.remove(), 950);
    }

    /* ---------- VIEWER ---------- */
    function develop() {
        img.classList.remove('develop');
        void img.offsetWidth;
        img.classList.add('develop');
    }

    function show(i, withDevelop) {
        current = (i + srcs.length) % srcs.length;
        img.src = srcs[current];
        counter.textContent = 'PHOTOBOOTH ' + (current + 1) + ' / ' + srcs.length;
        if (withDevelop) develop();
    }

    function setFilter(f) {
        img.dataset.f = f;
        filterBtns.forEach(b => b.classList.toggle('active', b.dataset.f === f));
    }

    function openViewer(i, x, y) {
        doFlash();
        for (let k = 0; k < 6; k++) pop(x, y, rand(['📸', '💛', '✨', '💖']));
        setTimeout(() => {
            setFilter('orig');
            show(i, true);
            viewer.classList.add('open');
        }, 260);
    }

    function closeViewer() {
        viewer.classList.remove('open');
    }

    cards.forEach((card, i) => {
        const open = e => {
            const r = card.getBoundingClientRect();
            openViewer(i, r.left + r.width / 2, r.top + r.height / 2);
        };
        card.addEventListener('click', open);
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
        });
    });

    $('pb-close').addEventListener('click', closeViewer);
    $('pb-prev').addEventListener('click', () => { doFlash(); show(current - 1, true); });
    $('pb-next').addEventListener('click', () => { doFlash(); show(current + 1, true); });

    viewer.addEventListener('click', e => {
        if (e.target === viewer) closeViewer();
    });

    filterBtns.forEach(b => b.addEventListener('click', () => setFilter(b.dataset.f)));

    $('pb-snap').addEventListener('click', e => {
        doFlash();
        develop();
        const r = e.currentTarget.getBoundingClientRect();
        for (let k = 0; k < 8; k++) pop(r.left + r.width / 2, r.top, rand(['📸', '💛', '✨', '💖', '🐥']));
    });

    /* swipe on mobile */
    let startX = 0;
    viewer.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    viewer.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 60) { doFlash(); show(dx < 0 ? current + 1 : current - 1, true); }
    });

    /* keyboard */
    document.addEventListener('keydown', e => {
        if (!viewer.classList.contains('open')) return;
        if (e.key === 'ArrowRight') { doFlash(); show(current + 1, true); }
        if (e.key === 'ArrowLeft') { doFlash(); show(current - 1, true); }
        if (e.key === 'Escape') closeViewer();
    });

    /* ---------- SHAKE THE BOARD ---------- */
    const shakeBtn = $('pb-shake');
    if (shakeBtn) {
        shakeBtn.addEventListener('click', () => {
            cards.forEach((card, i) => {
                const r = (Math.random() * 14 - 7).toFixed(1);
                card.style.setProperty('--r', r + 'deg');
                card.style.animation = 'pbDrop .8s cubic-bezier(.3, 1.3, .5, 1) ' + (i * 0.05) + 's backwards';
                setTimeout(() => { card.style.animation = ''; }, 800 + i * 50 + 60);
            });
        });
    }
});