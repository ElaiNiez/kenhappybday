document.addEventListener('DOMContentLoaded', () => {
    const $ = id => document.getElementById(id);
    const rand = arr => arr[Math.floor(Math.random() * arr.length)];
    const shuffle = arr => {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    };

    const audio = $('bgm');
    const enterScreen = $('enter-screen');
    const enterBtn = $('enter-btn');
    const musicBtn = $('music-btn');
    let heartsStarted = false;

    document.body.classList.add('locked');
    audio.volume = 0.6;

    /* ---------- ENTER + MUSIC ---------- */
    enterBtn.addEventListener('click', () => {
        enterScreen.classList.add('hide');
        document.body.classList.remove('locked');
        audio.play().then(() => musicBtn.classList.add('playing'))
            .catch(() => musicBtn.classList.add('muted'));
        setTimeout(() => burstConfetti(160), 600);
        startTyping();
        if (!heartsStarted) { heartsStarted = true; startHearts(); }
    });

    musicBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (audio.paused) {
            audio.play();
            musicBtn.classList.add('playing');
            musicBtn.classList.remove('muted');
        } else {
            audio.pause();
            musicBtn.classList.remove('playing');
            musicBtn.classList.add('muted');
        }
    });

    /* ---------- SCROLL PROGRESS ---------- */
    window.addEventListener('scroll', () => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        $('progress').style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    });

    /* ---------- TYPING EFFECT ---------- */
    function startTyping() {
        const el = $('typed');
        const text = el.dataset.text;
        let i = 0;
        setTimeout(function type() {
            if (i <= text.length) {
                el.textContent = text.slice(0, i++);
                setTimeout(type, 110);
            }
        }, 900);
    }

    /* ---------- FLOATING HEARTS ---------- */
    function startHearts() {
        const container = $('hearts');
        const symbols = ['💛', '💖', '💗', '✨', '🤍', '🐥'];
        setInterval(() => {
            const h = document.createElement('span');
            h.className = 'float-heart';
            h.textContent = rand(symbols);
            h.style.left = Math.random() * 100 + 'vw';
            h.style.fontSize = (14 + Math.random() * 22) + 'px';
            const dur = 7 + Math.random() * 6;
            h.style.animationDuration = dur + 's';
            container.appendChild(h);
            setTimeout(() => h.remove(), dur * 1000);
        }, 650);
    }

    /* ---------- SPARKLE TRAIL ---------- */
    let lastSpark = 0;
    function spark(x, y) {
        const s = document.createElement('span');
        s.className = 'spark';
        s.textContent = rand(['✦', '✧', '♥', '✨']);
        s.style.left = x + 'px';
        s.style.top = y + 'px';
        s.style.color = Math.random() > 0.5 ? '#f6c667' : '#ff7eb6';
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 900);
    }
    document.addEventListener('mousemove', e => {
        const now = Date.now();
        if (now - lastSpark > 45) { lastSpark = now; spark(e.clientX, e.clientY); }
    });
    document.addEventListener('touchmove', e => {
        const now = Date.now();
        if (now - lastSpark > 60) { lastSpark = now; spark(e.touches[0].clientX, e.touches[0].clientY); }
    }, { passive: true });

    /* ---------- CLICK HEART BURST ---------- */
    function popHeart(x, y, emoji) {
        const h = document.createElement('span');
        h.className = 'pop-heart';
        h.textContent = emoji;
        h.style.left = x + 'px';
        h.style.top = y + 'px';
        h.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px');
        h.style.setProperty('--dy', (-60 - Math.random() * 100) + 'px');
        document.body.appendChild(h);
        setTimeout(() => h.remove(), 950);
    }
    document.addEventListener('click', e => {
        if (e.target.closest('#chick')) return;
        for (let i = 0; i < 4; i++) popHeart(e.clientX, e.clientY, rand(['💛', '💖']));
    });

    /* ---------- CONFETTI ---------- */
    const canvas = $('confetti');
    const ctx = canvas.getContext('2d');
    let pieces = [];
    let animating = false;

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    function burstConfetti(count = 120) {
        const colors = ['#f6c667', '#ffe3a3', '#ff7eb6', '#ffc2dd', '#ffffff', '#e8a13a'];
        for (let i = 0; i < count; i++) {
            pieces.push({
                x: canvas.width / 2, y: canvas.height / 2,
                vx: (Math.random() - 0.5) * 18, vy: Math.random() * -16 - 4,
                size: 6 + Math.random() * 8, color: rand(colors),
                rot: Math.random() * 360, vr: (Math.random() - 0.5) * 14, life: 1
            });
        }
        if (!animating) { animating = true; requestAnimationFrame(drawConfetti); }
    }

    function drawConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(p => {
            p.x += p.vx; p.y += p.vy; p.vy += 0.4; p.vx *= 0.99;
            p.rot += p.vr; p.life -= 0.006;
            ctx.save();
            ctx.globalAlpha = Math.max(p.life, 0);
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            ctx.restore();
        });
        pieces = pieces.filter(p => p.life > 0 && p.y < canvas.height + 50);
        if (pieces.length) requestAnimationFrame(drawConfetti);
        else { animating = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
    }

    /* ---------- SCROLL REVEAL ---------- */
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
        });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    /* ---------- DAYS TOGETHER COUNTER ---------- */
    const since = new Date(document.querySelector('.counter').dataset.since);
    function updateCounter() {
        const s = Math.floor((Date.now() - since.getTime()) / 1000);
        $('c-days').textContent = Math.floor(s / 86400).toLocaleString();
        $('c-hours').textContent = Math.floor((s % 86400) / 3600);
        $('c-mins').textContent = Math.floor((s % 3600) / 60);
        $('c-secs').textContent = s % 60;
    }
    updateCounter();
    setInterval(updateCounter, 1000);

    /* ---------- FLIP CARDS ---------- */
    document.querySelectorAll('.flip').forEach(card => {
        card.addEventListener('click', () => card.classList.toggle('flipped'));
    });

    /* ---------- GALLERY: TILT + LIGHTBOX ---------- */
    const lightbox = $('lightbox');
    const lbImg = $('lb-img');
    const lbCount = $('lb-count');
    const photos = Array.from(document.querySelectorAll('.gallery-item img'));
    let current = 0;

    photos.forEach(img => {
        img.addEventListener('mousemove', e => {
            const r = img.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            img.style.transform = `perspective(700px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale(1.06)`;
        });
        img.addEventListener('mouseleave', () => { img.style.transform = ''; });
    });

    function showPhoto(i) {
        current = (i + photos.length) % photos.length;
        lbImg.style.animation = 'none';
        void lbImg.offsetWidth;
        lbImg.style.animation = '';
        lbImg.src = photos[current].src;
        lbCount.textContent = (current + 1) + ' / ' + photos.length;
    }

    photos.forEach((img, i) => img.addEventListener('click', () => {
        showPhoto(i);
        lightbox.classList.add('open');
    }));

    $('lb-close').addEventListener('click', () => lightbox.classList.remove('open'));
    $('lb-prev').addEventListener('click', () => showPhoto(current - 1));
    $('lb-next').addEventListener('click', () => showPhoto(current + 1));
    lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.classList.remove('open'); });

    let touchX = 0;
    lightbox.addEventListener('touchstart', e => touchX = e.touches[0].clientX);
    lightbox.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 50) showPhoto(dx < 0 ? current + 1 : current - 1);
    });

    /* ---------- MEMORY MATCH GAME ---------- */
    const mmGrid = $('mm-grid');
    let mmFirst = null, mmLock = false, mmMoves = 0, mmFound = 0, mmTotal = 0;

    function setupMemory() {
        const srcs = shuffle(photos.map(p => p.getAttribute('src'))).slice(0, 6);
        if (srcs.length < 2) { $('game-section').hidden = true; return; }

        mmTotal = srcs.length; mmMoves = 0; mmFound = 0; mmFirst = null; mmLock = false;
        $('mm-total').textContent = mmTotal;
        $('mm-moves').textContent = 0;
        $('mm-pairs').textContent = 0;
        $('mm-win').textContent = '';
        mmGrid.innerHTML = '';

        shuffle([...srcs, ...srcs]).forEach(src => {
            const card = document.createElement('button');
            card.className = 'mm-card';
            card.dataset.src = src;
            card.innerHTML = '<span class="mm-face mm-front">💛</span><span class="mm-face mm-back"><img src="' + src + '" alt=""></span>';
            card.addEventListener('click', () => flipCard(card));
            mmGrid.appendChild(card);
        });
    }

    function flipCard(card) {
        if (mmLock || card.classList.contains('flipped') || card.classList.contains('matched')) return;
        card.classList.add('flipped');

        if (!mmFirst) { mmFirst = card; return; }

        mmMoves++;
        $('mm-moves').textContent = mmMoves;

        if (mmFirst.dataset.src === card.dataset.src) {
            mmFirst.classList.add('matched');
            card.classList.add('matched');
            mmFirst = null;
            mmFound++;
            $('mm-pairs').textContent = mmFound;
            if (mmFound === mmTotal) {
                $('mm-win').textContent = 'You found every memory, chicKen! 💛';
                burstConfetti(220);
            }
        } else {
            mmLock = true;
            const a = mmFirst;
            mmFirst = null;
            setTimeout(() => {
                a.classList.remove('flipped');
                card.classList.remove('flipped');
                mmLock = false;
            }, 900);
        }
    }

    $('mm-restart').addEventListener('click', setupMemory);
    setupMemory();

    /* ---------- TAP THE CHICK ---------- */
    const chick = $('chick');
    const bubble = $('chick-bubble');
    const notes = Array.from(document.querySelectorAll('#notes-list li')).map(li => li.textContent.trim());
    let queue = [], opened = 0;

    chick.addEventListener('click', () => {
        if (!notes.length) return;
        if (!queue.length) queue = shuffle(notes);
        bubble.textContent = queue.pop();

        bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
        chick.classList.remove('bounce'); void chick.offsetWidth; chick.classList.add('bounce');

        opened++;
        $('chick-n').textContent = opened;

        const r = chick.getBoundingClientRect();
        for (let i = 0; i < 6; i++) {
            popHeart(r.left + r.width / 2, r.top + r.height / 3, rand(['💛', '💖', '🐥', '✨']));
        }
        if (opened % notes.length === 0) burstConfetti(140);
    });

    /* ---------- CAKE ---------- */
    const cake = $('cake');
    const blowBtn = $('blow-btn');
    const cakeMsg = $('cake-msg');
    const nick = document.querySelector('.cake-wrap').dataset.nick;

    function toggleCandles() {
        const out = cake.classList.toggle('out');
        blowBtn.textContent = out ? '🔥 Relight' : '💨 Blow the candles';
        cakeMsg.textContent = out
            ? 'Your wish is on its way, ' + nick + ' 💛 Happy birthday!'
            : 'Close your eyes, make a wish, then blow the candles…';
        if (out) { burstConfetti(220); setTimeout(() => burstConfetti(120), 350); }
    }
    cake.addEventListener('click', toggleCandles);
    blowBtn.addEventListener('click', toggleCandles);

    /* ---------- LETTER: WORD BY WORD ---------- */
    const envelope = $('envelope');
    const letterModal = $('letter-modal');
    const letterScroll = $('letter-scroll');
    const skipBtn = $('skip-btn');
    const replayBtn = $('replay-btn');
    const wishBtn = $('wish-btn');

    // Split every paragraph into word spans
    const words = [];
    document.querySelectorAll('#letter-text p').forEach(p => {
        const parts = p.textContent.trim().split(/\s+/);
        p.textContent = '';
        parts.forEach((word, i) => {
            const span = document.createElement('span');
            span.className = 'w';
            span.textContent = word;
            p.appendChild(span);
            p.appendChild(document.createTextNode(' '));
            words.push({ el: span, endOfPara: i === parts.length - 1 });
        });
    });

    let letterTimer = null;
    let idx = 0;

    function keepInView(el) {
        const bottom = el.offsetTop + el.offsetHeight;
        if (bottom > letterScroll.scrollTop + letterScroll.clientHeight - 60) {
            letterScroll.scrollTo({ top: el.offsetTop - letterScroll.clientHeight / 2, behavior: 'smooth' });
        }
    }

    function revealNext() {
        if (idx >= words.length) { finishLetter(); return; }
        const { el, endOfPara } = words[idx++];
        el.classList.add('show');
        keepInView(el);

        const t = el.textContent;
        let delay = 150;
        if (/[,;—]$/.test(t)) delay += 150;
        if (/[.!?]$/.test(t)) delay += 350;
        if (endOfPara) delay += 400;
        letterTimer = setTimeout(revealNext, delay);
    }

    function finishLetter() {
        clearTimeout(letterTimer);
        skipBtn.hidden = true;
        replayBtn.hidden = false;
        wishBtn.hidden = false;
    }

    function resetLetter() {
        clearTimeout(letterTimer);
        idx = 0;
        words.forEach(w => w.el.classList.remove('show'));
        letterScroll.scrollTop = 0;
        skipBtn.hidden = false;
        replayBtn.hidden = true;
        wishBtn.hidden = true;
    }

    function startLetter() {
        resetLetter();
        letterTimer = setTimeout(revealNext, 1000);
    }

    skipBtn.addEventListener('click', () => {
        clearTimeout(letterTimer);
        words.forEach(w => w.el.classList.add('show'));
        idx = words.length;
        finishLetter();
    });
    replayBtn.addEventListener('click', startLetter);

    envelope.addEventListener('click', () => {
        envelope.classList.add('open');
        setTimeout(() => {
            letterModal.classList.add('open');
            burstConfetti(60);
            startLetter();
        }, 1100);
    });

    function closeLetter() {
        letterModal.classList.remove('open');
        clearTimeout(letterTimer);
        setTimeout(() => { envelope.classList.remove('open'); resetLetter(); }, 500);
    }
    $('letter-close').addEventListener('click', closeLetter);
    letterModal.addEventListener('click', e => { if (e.target === letterModal) closeLetter(); });

    wishBtn.addEventListener('click', () => {
        burstConfetti(250);
        setTimeout(() => burstConfetti(150), 400);
    });

    /* ---------- KEYBOARD ---------- */
    document.addEventListener('keydown', e => {
        if (lightbox.classList.contains('open')) {
            if (e.key === 'ArrowRight') showPhoto(current + 1);
            if (e.key === 'ArrowLeft') showPhoto(current - 1);
            if (e.key === 'Escape') lightbox.classList.remove('open');
        } else if (e.key === 'Escape' && letterModal.classList.contains('open')) {
            closeLetter();
        }
    });
});