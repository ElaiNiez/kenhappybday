(function () {
    const D = window.SITE;
    const $ = id => document.getElementById(id);
    const esc = s => String(s).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

    // OUR STORY
    $('timeline').innerHTML = D.timeline.map(t => `
        <div class="tl-item reveal">
            <div class="tl-card">
                <span class="tl-date">${esc(t.date)}</span>
                <h3>${esc(t.title)}</h3>
                <p>${esc(t.text)}</p>
            </div>
        </div>`).join('');

    // REASONS
    $('reasons').innerHTML = D.reasons.map((r, i) => `
        <div class="flip reveal" style="transition-delay:${(i * 0.08).toFixed(2)}s">
            <div class="flip-inner">
                <div class="flip-face flip-front">
                    <span class="flip-icon">${r.icon}</span>
                    <h3>${esc(r.title)}</h3>
                    <small>Reason #${i + 1} · tap to flip</small>
                </div>
                <div class="flip-face flip-back">
                    <p>${esc(r.text)}</p>
                </div>
            </div>
        </div>`).join('');

    // PHOTOBOOTH BOARD
    const tilts = [-5, 3, -2, 5, -4, 2, 4, -3];
    const board = $('pb-board');
    if (D.photoboothPhotos.length) {
        board.innerHTML = D.photoboothPhotos.map((src, i) => `
            <div class="pb-item reveal" style="transition-delay:${((i % 4) * 0.1).toFixed(1)}s">
                <figure class="pb-card" style="--r:${tilts[i % tilts.length]}deg" data-index="${i}" tabindex="0">
                    <span class="pb-tape"></span>
                    <div class="pb-photo">
                        <img src="${esc(src)}" alt="Photobooth ${i + 1}" loading="lazy" />
                    </div>
                    <figcaption>Photobooth #${i + 1}</figcaption>
                </figure>
            </div>`).join('');
    } else {
        board.innerHTML = '<p class="empty">Add your photobooth photos to images/us 📸</p>';
        $('pb-shake').parentElement.hidden = true;
    }

    // GALLERY POOL (for Memory Match)
    $('gallery-pool').innerHTML = D.galleryPhotos.map(src =>
        `<div class="gallery-item"><img src="${esc(src)}" alt="" /></div>`).join('');

    // LOVE NOTES
    $('notes-list').innerHTML = D.loveNotes.map(n => `<li>${esc(n)}</li>`).join('');

    // LETTER
    $('letter-text').innerHTML =
        D.letter.map((p, i) => `<p class="${i === 0 ? 'letter-first' : ''}">${esc(p)}</p>`).join('') +
        '<p class="letter-sign">Forever yours 💛</p>';
})();