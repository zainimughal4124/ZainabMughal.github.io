// =========================================================
// COLLECTION ALBUM
// Opens a collection as a full-screen photo album:
//   cover → research board → mood board → one page per project (up to 15).
// The album's content lives in script.js, in the collection's `album` field.
// Usage: openAlbum(collection)   (called by the Collections cards)
// =========================================================
(function () {
    "use strict";

    const MAX_PROJECTS = 15;
    // starts moving straight away (no slow wind-up) and settles softly
    const EASE = "cubic-bezier(.38,.12,.22,1)";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pad = (n) => String(n).padStart(2, "0");
    // "collection 1/project 1/Model dress-1 P1.jpeg" → URL-safe path
    const src = (path) => path.split("/").map(encodeURIComponent).join("/");
    const esc = (text) => String(text ?? "").replace(/[&<>"']/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const nextFrame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    const ARROW_PREV = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>`;
    const ARROW_NEXT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;

    // board pages shown before the projects, in this order (key = field in the album data)
    const BOARDS = [
        { key: "storyboard", title: "Research Board", short: "Research" },
        { key: "moodboard", title: "Mood Board", short: "Mood" },
    ];

    // ---------- page templates ----------
    const leafHTML = (cls, inner) => `
        <div class="al-leaf ${cls}">
          <div class="al-face al-front">${inner}<div class="al-cast"></div><div class="al-shade"></div></div>
          <div class="al-face al-back"><div class="al-shade"></div></div>
        </div>`;

    function coverPage(c, a) {
        return leafHTML("al-cover", `
          ${a.coverImage ? `<div class="al-cover-art" style="--cover:url(&quot;${src(a.coverImage)}&quot;)"></div>` : ""}
          <div class="al-spine"></div>
          <div class="al-panel">
            <span class="al-diamond al-t"></span><span class="al-diamond al-b"></span>
            ${a.designer ? `<div class="al-designer">${esc(a.designer)}</div>` : ""}
            <div class="al-rule al-rule-top"><i></i></div>
            <h1 class="al-title">${esc(c.name)}</h1>
          </div>`);
    }

    function boardPage(c, board, def, folio) {
        const ratio = board.ratio || "1";
        const tall = ratioOf(ratio) < 0.85;
        return leafHTML("al-page", `
          <div class="al-sheet al-sheet-sb${tall ? " al-tall" : ""}">
            <header class="al-sb-head">
              <span class="al-eyebrow">${esc(c.name)}</span>
              <h2>${esc(def.title)}</h2>
              <div class="al-rule"><i></i></div>
            </header>
            <div class="al-sb" style="--ar:${esc(ratio)}">
              ${board.images.map((s, i) => `
                <figure class="al-sb-item" data-board="${def.key}" data-index="${i}" role="button" tabindex="0" aria-label="Enlarge ${esc(def.title.toLowerCase())} ${i + 1}">
                  <img data-src="${src(s)}" alt="${esc(def.title)} ${i + 1}" draggable="false" decoding="async">
                </figure>`).join("")}
            </div>
          </div>
          <span class="al-folio">${pad(folio)}</span>`);
    }

    // "899 / 1599" → 0.562
    function ratioOf(r) {
        const [w, h = 1] = String(r).split("/").map(Number);
        return w / h || 1;
    }

    // 1 large + 5 thumbnails; projects with 7–9 pictures get a 4-column grid (1 large + up to 8)
    const MAX_THUMBS = 8;
    const thumbsOf = (p) => p.images.slice(1, 1 + MAX_THUMBS);

    function projectPage(p, index, folio) {
        const first = p.images[0];
        const rest = thumbsOf(p);
        const wide = rest.length > 5;
        return leafHTML("al-page al-project", `
          <div class="al-sheet">
            <div class="al-gallery${wide ? ` al-wide al-w${rest.length}` : ""}">
              <div class="al-tile al-large" role="button" tabindex="0" aria-label="Enlarge ${esc(first.label)}">
                <img class="al-fg" data-src="${src(first.src)}" alt="${esc(first.label)}" draggable="false" decoding="async">
              </div>
              ${rest.map((im, i) => `
                <button type="button" class="al-tile al-thumb al-t${i + 1}" data-slot="${i}" aria-label="Show ${esc(im.label)}">
                  <img data-src="${src(im.src)}" alt="${esc(im.label)}" draggable="false" decoding="async">
                </button>`).join("")}
            </div>
          </div>
          <span class="al-folio">${pad(folio)}</span>`);
    }

    // ---------- open / close ----------
    let active = null;

    // inline = true: the album sits in the page (inside `host`) instead of a full-screen pop-up
    function createAlbum(collection, { inline = false, host = document.body, startPage = 0 } = {}) {
        if (!inline && active) return;
        const a = collection.album;
        const projects = (a.projects || []).filter((p) => p.images && p.images.length).slice(0, MAX_PROJECTS);
        const boards = BOARDS.filter((b) => a[b.key] && a[b.key].images && a[b.key].images.length);

        const pages = [{ short: "Cover", label: collection.name }];
        let html = coverPage(collection, a);
        boards.forEach((b) => {
            html += boardPage(collection, a[b.key], b, pages.length);
            pages.push({ short: b.short, label: b.title });
        });
        projects.forEach((p, i) => {
            html += projectPage(p, i, pages.length);
            pages.push({ short: pad(i + 1), label: `Project ${pad(i + 1)} — ${p.name}` });
        });

        const overlay = document.createElement("div");
        overlay.className = inline ? "al-overlay al-inline al-visible" : "al-overlay";
        if (inline) {
            overlay.setAttribute("role", "region");
        } else {
            overlay.setAttribute("role", "dialog");
            overlay.setAttribute("aria-modal", "true");
        }
        overlay.setAttribute("aria-label", `${collection.name} album`);
        overlay.innerHTML = `
          ${inline ? "" : `<button type="button" class="al-close" aria-label="Close album">&times;</button>`}
          <div class="al-stage">
            <button type="button" class="al-arrow al-prev" aria-label="Previous page">${ARROW_PREV}</button>
            <div class="al-book" aria-live="polite">
              <div class="al-board"></div>
              <div class="al-edges"></div>
              ${html}
            </div>
            <button type="button" class="al-arrow al-next" aria-label="Next page">${ARROW_NEXT}</button>
            <div class="al-footer">
              <div class="al-hint al-pulse"></div>
              <nav class="al-dots" aria-label="Album pages">
                ${pages.map((p, i) => `<button type="button" class="al-dot" data-i="${i}">${esc(p.short)}</button>`).join("")}
              </nav>
            </div>
          </div>
          <div class="al-lightbox" aria-hidden="true" role="dialog" aria-label="Enlarged picture">
            <button type="button" class="al-lb-close" aria-label="Close picture">&times;</button>
            <button type="button" class="al-lb-nav al-lb-prev" aria-label="Previous picture">${ARROW_PREV}</button>
            <figure class="al-lb-stage"><img alt=""><figcaption class="al-lb-caption"></figcaption></figure>
            <button type="button" class="al-lb-nav al-lb-next" aria-label="Next picture">${ARROW_NEXT}</button>
            <div class="al-lb-count" aria-live="polite"></div>
          </div>`;

        host.append(overlay);
        if (!inline) {
            requestAnimationFrame(() => overlay.classList.add("al-visible"));
            // stop the page scrolling only once the album covers it, so the click itself never
            // makes the whole page re-layout
            setTimeout(() => overlay.isConnected && document.documentElement.classList.add("al-locked"),
                reduceMotion.matches ? 0 : 460);
        }

        // ---- state ----
        const book = overlay.querySelector(".al-book");
        const leaves = [...book.querySelectorAll(".al-leaf")];
        const prevBtn = overlay.querySelector(".al-prev");
        const nextBtn = overlay.querySelector(".al-next");
        const hint = overlay.querySelector(".al-hint");
        const dots = [...overlay.querySelectorAll(".al-dot")];
        const lightbox = overlay.querySelector(".al-lightbox");
        // in the page, the enlarged picture must cover the whole screen, so it lives on <body>
        if (inline) document.body.append(lightbox);
        const lightboxImg = lightbox.querySelector("img");
        const opener = document.activeElement;
        let cur = 0;
        let busy = false;
        let queued = 0;      // a click made mid-turn is remembered and played straight after
        let autoOpen = null;

        leaves.forEach((leaf, i) => (leaf.style.zIndex = leaves.length - i));

        // remember each project's images so thumbnails can swap with the large frame
        leaves.filter((l) => l.classList.contains("al-project")).forEach((leaf, i) => {
            leaf._large = projects[i].images[0];
            leaf._thumbs = thumbsOf(projects[i]).slice();
        });

        // ---- pictures load page by page, only when a page is about to be seen ----
        function hydrate(from, to) {
            for (let i = Math.max(0, from); i <= Math.min(leaves.length - 1, to); i++) {
                leaves[i].querySelectorAll("img[data-src]").forEach((img) => {
                    img.src = img.dataset.src;
                    img.removeAttribute("data-src");
                });
            }
        }
        // resolves when a page's pictures are decoded (or after `cap` ms, so a slow picture never blocks)
        function ready(leaf, cap = 450) {
            if (!leaf) return Promise.resolve();
            const imgs = [...leaf.querySelectorAll("img")].filter((img) => img.src);
            const all = Promise.all(imgs.map((img) => img.decode().catch(() => {})));
            return Promise.race([all, new Promise((r) => setTimeout(r, cap))]);
        }

        // ---- page turning ----
        const clearAnims = (el) => el.getAnimations({ subtree: true }).forEach((an) => an.cancel());
        const durFor = (i, quick) => reduceMotion.matches ? 1 : quick ? 380 : i === 0 ? 1050 : 820;

        function turnForward(i, dur) {
            const leaf = leaves[i];
            const under = leaves[i + 1];
            const opts = { duration: dur, easing: EASE, fill: "forwards" };
            const lift = i === 0 ? "translateZ(14px)" : "translateZ(4px)";
            const flip = leaf.animate([
                { transform: "rotateY(0deg)" },
                { transform: `${lift} rotateY(-90deg)`, offset: .5 },
                { transform: "rotateY(-180deg)" }
            ], opts);
            leaf.querySelector(".al-front .al-shade").animate([{ opacity: 0 }, { opacity: .55, offset: .5 }, { opacity: .55 }], opts);
            leaf.querySelector(".al-back .al-shade").animate([{ opacity: .6 }, { opacity: .6, offset: .5 }, { opacity: 0 }], opts);
            leaf.querySelector(".al-back").animate([{ opacity: 1 }, { opacity: 1, offset: .6 }, { opacity: 0 }], opts);
            if (under) under.querySelector(".al-front .al-cast").animate(
                [{ opacity: 0 }, { opacity: .9, offset: .3 }, { opacity: 0 }], { duration: dur, easing: "ease-out" });
            return flip.finished.then(() => { leaf.classList.add("al-flipped"); clearAnims(leaf); });
        }

        async function turnBack(i, dur) {
            const leaf = leaves[i];
            const under = leaves[i + 1];
            const opts = { duration: dur, easing: EASE, fill: "forwards" };
            const lift = i === 0 ? "translateZ(14px)" : "translateZ(4px)";
            // un-hide the page (still turned over, back hidden) and let the browser paint it
            // before it moves, so the turn doesn't stall halfway while the pictures are drawn
            const back = leaf.querySelector(".al-back");
            back.style.opacity = "0";
            leaf.style.transform = "rotateY(-180deg)";
            leaf.classList.remove("al-flipped");
            if (dur > 1) await nextFrame();
            back.style.opacity = "";
            leaf.style.transform = "";
            const flip = leaf.animate([
                { transform: "rotateY(-180deg)" },
                { transform: `${lift} rotateY(-90deg)`, offset: .5 },
                { transform: "rotateY(0deg)" }
            ], opts);
            leaf.querySelector(".al-back").animate([{ opacity: 0 }, { opacity: 1, offset: .4 }, { opacity: 1 }], opts);
            leaf.querySelector(".al-back .al-shade").animate([{ opacity: 0 }, { opacity: .6, offset: .5 }, { opacity: .6 }], opts);
            leaf.querySelector(".al-front .al-shade").animate([{ opacity: .55 }, { opacity: .55, offset: .5 }, { opacity: 0 }], opts);
            if (under) under.querySelector(".al-front .al-cast").animate(
                [{ opacity: 0 }, { opacity: .9, offset: .7 }, { opacity: 0 }], { duration: dur, easing: "ease-in" });
            return flip.finished.then(() => clearAnims(leaf));
        }

        async function go(dir, quick = false) {
            if (busy) {
                if (!quick) queued = dir;
                return;
            }
            const target = cur + dir;
            if (target < 0 || target >= leaves.length || !overlay.isConnected) return;
            clearTimeout(autoOpen);
            busy = true;
            hydrate(Math.min(cur, target) - 1, Math.max(cur, target) + 2);
            if (!quick) await ready(leaves[dir > 0 ? cur + 1 : target]);
            if (dir > 0) await turnForward(cur, durFor(cur, quick || queued !== 0));
            else await turnBack(target, durFor(target, quick || queued !== 0));
            cur = target;
            busy = false;
            update();
            if (queued && !quick) {
                const next = queued;
                queued = 0;
                go(next);
            }
        }

        // far jumps (e.g. Cover → Project 12) skip the pages in between and turn only the last one
        async function goTo(n) {
            if (busy || n === cur) return;
            queued = 0;
            clearTimeout(autoOpen);
            const dir = n > cur ? 1 : -1;
            if (Math.abs(n - cur) > 1) {
                const stop = n - dir;
                if (dir > 0) for (let i = cur; i < stop; i++) leaves[i].classList.add("al-flipped");
                else for (let i = cur - 1; i >= stop; i--) leaves[i].classList.remove("al-flipped");
                cur = stop;
                update();
            }
            await go(dir);
            queued = 0;
        }

        function update() {
            // only the open page and the two under it are drawn; pages further back stay hidden
            leaves.forEach((leaf, i) => leaf.classList.toggle("al-far", i > cur + 2));
            hydrate(cur - 1, cur + 2);
            prevBtn.disabled = cur === 0;
            nextBtn.disabled = cur === leaves.length - 1;
            dots.forEach((d, i) => {
                d.classList.toggle("al-on", i === cur);
                d.setAttribute("aria-current", i === cur ? "page" : "false");
            });
            // on phones the page list is one scrolling row: keep the current page in view
            const nav = dots[cur].parentElement;
            if (nav.scrollWidth > nav.clientWidth) {
                nav.scrollTo({
                    left: dots[cur].offsetLeft - nav.offsetLeft - (nav.clientWidth - dots[cur].offsetWidth) / 2,
                    behavior: reduceMotion.matches ? "auto" : "smooth",
                });
            }
            const coverOnly = leaves.length === 1;
            hint.classList.remove("al-pulse");
            hint.textContent = coverOnly ? "New pieces coming soon"
                : cur === 0 ? "" : pages[cur].label;
            overlay.querySelector(".al-dots").hidden = coverOnly;
            overlay.querySelector(".al-cover .al-front").style.cursor = coverOnly ? "default" : "";
        }

        // ---- thumbnails: clicked picture moves into the large frame ----
        const preload = (s) => { const img = new Image(); img.src = s; return img.decode().catch(() => {}); };

        async function swap(thumb) {
            const leaf = thumb.closest(".al-leaf");
            if (leaf._busy) return;
            leaf._busy = true;
            const slot = Number(thumb.dataset.slot);
            const large = leaf.querySelector(".al-large");
            const incoming = leaf._thumbs[slot];
            const outgoing = leaf._large;
            await preload(src(incoming.src));
            large.classList.add("al-swapping");
            thumb.classList.add("al-swapping");
            setTimeout(() => {
                large.querySelector(".al-fg").src = src(incoming.src);
                large.querySelector(".al-fg").alt = incoming.label;
                large.setAttribute("aria-label", `Enlarge ${incoming.label}`);
                thumb.querySelector("img").src = src(outgoing.src);
                thumb.querySelector("img").alt = outgoing.label;
                thumb.setAttribute("aria-label", `Show ${outgoing.label}`);
                leaf._large = incoming;
                leaf._thumbs[slot] = outgoing;
                requestAnimationFrame(() => {
                    large.classList.remove("al-swapping");
                    thumb.classList.remove("al-swapping");
                });
                leaf._busy = false;
            }, 320);
        }

        // ---- lightbox ----
        // the enlarged picture steps through the pictures of the page it came from
        let lbList = [];
        let lbIndex = 0;
        const lbCount = lightbox.querySelector(".al-lb-count");
        const lbCaption = lightbox.querySelector(".al-lb-caption");
        const lbPrev = lightbox.querySelector(".al-lb-prev");
        const lbNext = lightbox.querySelector(".al-lb-next");

        function showLightbox(i) {
            lbIndex = (i + lbList.length) % lbList.length;
            const item = lbList[lbIndex];
            lightboxImg.classList.add("al-lb-fade");
            const show = () => {
                lightboxImg.src = src(item.src);
                lightboxImg.alt = item.label || "";
                lbCaption.textContent = item.label || "";
                lbCount.textContent = `${lbIndex + 1} / ${lbList.length}`;
                requestAnimationFrame(() => lightboxImg.classList.remove("al-lb-fade"));
            };
            preload(src(item.src)).then(show);
            const many = lbList.length > 1;
            lbPrev.hidden = !many;
            lbNext.hidden = !many;
            lbCount.hidden = !many;
        }

        function openLightbox(list, index) {
            lbList = list;
            showLightbox(index);
            lightbox.classList.add("al-open");
            lightbox.setAttribute("aria-hidden", "false");
        }

        // pictures of the page a click came from, and which one was clicked
        function lightboxFor(target) {
            const leaf = target.closest(".al-leaf");
            const item = target.closest(".al-sb-item");
            if (item) {
                const def = BOARDS.find((b) => b.key === item.dataset.board);
                const list = a[def.key].images.map((s, i) => ({ src: s, label: `${def.title} ${i + 1}` }));
                return [list, Number(item.dataset.index)];
            }
            const projectIndex = leaves.filter((l) => l.classList.contains("al-project")).indexOf(leaf);
            const list = projects[projectIndex].images;
            const at = Math.max(0, list.findIndex((im) => im.src === leaf._large.src));
            return [list, at];
        }
        const closeLightbox = () => {
            lightbox.classList.remove("al-open");
            lightbox.setAttribute("aria-hidden", "true");
        };

        // ---- close ----
        function close() {
            clearTimeout(autoOpen);
            document.removeEventListener("keydown", onKey);
            overlay.classList.remove("al-visible");
            setTimeout(() => {
                overlay.remove();
                document.documentElement.classList.remove("al-locked");
                active = null;
                if (opener && opener.focus) opener.focus({ preventScroll: true });
            }, reduceMotion.matches ? 0 : 450);
        }

        // ---- events ----
        prevBtn.addEventListener("click", () => go(-1));
        nextBtn.addEventListener("click", () => go(1));
        if (!inline) overlay.querySelector(".al-close").addEventListener("click", close);
        overlay.querySelector(".al-dots").addEventListener("click", (e) => {
            const dot = e.target.closest(".al-dot");
            if (dot) goTo(Number(dot.dataset.i));
        });
        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox || e.target.closest(".al-lb-close")) closeLightbox();
        });
        lbPrev.addEventListener("click", () => showLightbox(lbIndex - 1));
        lbNext.addEventListener("click", () => showLightbox(lbIndex + 1));
        let lbStartX = null;
        lightbox.addEventListener("pointerdown", (e) => (lbStartX = e.clientX));
        lightbox.addEventListener("pointerup", (e) => {
            if (lbStartX === null) return;
            const dx = e.clientX - lbStartX;
            lbStartX = null;
            if (Math.abs(dx) > 50 && lbList.length > 1) showLightbox(lbIndex + (dx < 0 ? 1 : -1));
        });

        book.addEventListener("click", (e) => {
            if (cur === 0 && e.target.closest(".al-cover")) return go(1);
            const thumb = e.target.closest(".al-thumb");
            if (thumb) return swap(thumb);
            const zoom = e.target.closest(".al-sb-item, .al-large");
            if (zoom) openLightbox(...lightboxFor(zoom));
        });
        book.addEventListener("keydown", (e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            const target = e.target.closest(".al-large, .al-sb-item");
            if (!target) return;
            e.preventDefault();
            openLightbox(...lightboxFor(target));
        });

        let inView = !inline;
        function onKey(e) {
            if (e.key === "Escape") {
                if (lightbox.classList.contains("al-open")) { e.preventDefault(); return closeLightbox(); }
                if (!inline) { e.preventDefault(); close(); }
                return;
            }
            if (lightbox.classList.contains("al-open")) {
                if (e.key === "ArrowRight") { e.preventDefault(); showLightbox(lbIndex + 1); }
                if (e.key === "ArrowLeft") { e.preventDefault(); showLightbox(lbIndex - 1); }
                return;
            }
            // in the page, arrow keys only turn pages while the album is on screen
            if (!inView || e.target.closest("input, textarea, select, [contenteditable]")) return;
            if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
            if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
        }
        document.addEventListener("keydown", onKey);

        let startX = null;
        book.addEventListener("pointerdown", (e) => (startX = e.clientX));
        book.addEventListener("pointercancel", () => (startX = null));
        book.addEventListener("pointerup", (e) => {
            if (startX === null) return;
            const dx = e.clientX - startX;
            startX = null;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        });


        update();

        if (inline) {
            // opens by itself the first time it scrolls into view
            let opened = false;
            const watcher = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    inView = entry.intersectionRatio >= 0.5;
                    if (inView && !opened && cur === 0 && leaves.length > 1) {
                        opened = true;
                        autoOpen = setTimeout(() => go(1), reduceMotion.matches ? 300 : 900);
                    }
                });
            }, { threshold: [0, 0.5, 0.75] });
            watcher.observe(book);
            return { go, goTo };
        }

        overlay.querySelector(".al-close").focus({ preventScroll: true });

        // the album opens by itself after it settles; clicking/arrows open it sooner
        if (startPage > 0) {
            autoOpen = setTimeout(() => goTo(Math.min(startPage, leaves.length - 1)), 900);
        } else {
            if (leaves.length > 1) autoOpen = setTimeout(() => go(1), reduceMotion.matches ? 600 : 900);
        }

        active = { close };
    }

    const openAlbum = (collection, startPage = 0) => createAlbum(collection, { startPage });

    // ---------- closed album shown in the page ----------
    // <div class="album-preview" data-album="collection-1"></div>  → the album cover; clicking it opens the pop-up.
    // <ol data-album-projects="collection-1"></ol>                   → numbered list of the album's projects.
    // <button data-album-open="collection-1">                        → any button that opens the album.
    // The data comes from window.ALBUMS["collection-1"] (set in script.js).
    function mountPreviews() {
        const albums = window.ALBUMS || {};

        document.querySelectorAll(".album-preview[data-album]").forEach((mount) => {
            const data = albums[mount.dataset.album];
            if (!data || mount.dataset.ready) return;
            mount.dataset.ready = "1";
            mount.innerHTML = `
              <div class="al-overlay al-preview" role="button" tabindex="0" aria-label="Open the ${esc(data.name)} album">
                <div class="al-book">
                  <div class="al-board"></div>
                  <div class="al-edges"></div>
                  ${coverPage(data, data.album)}
                </div>
                <span class="al-preview-cta">Open the album</span>
              </div>`;
            const preview = mount.firstElementChild;
            // pointer over the album: start fetching the first inner pages so opening doesn't wait
            let warmed = false;
            const warm = () => {
                if (warmed) return;
                warmed = true;
                const al = data.album;
                const first = [...(al.storyboard?.images || []), ...(al.moodboard?.images || [])];
                first.forEach((s) => { const img = new Image(); img.src = src(s); img.decode().catch(() => {}); });
            };
            preview.addEventListener("pointerenter", warm);
            preview.addEventListener("focus", warm);
            preview.addEventListener("click", () => openAlbum(data));
            preview.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openAlbum(data); }
            });
        });

        document.querySelectorAll("[data-album-projects]").forEach((list) => {
            const data = albums[list.dataset.albumProjects];
            if (!data) return;
            const projects = (data.album.projects || []).filter((p) => p.images && p.images.length).slice(0, MAX_PROJECTS);
            list.innerHTML = projects.map((p, i) => `
              <li><span class="album-project-no">${pad(i + 1)}</span>
                <span><strong>${esc(p.name)}</strong>${p.text ? `<br>${esc(p.text)}` : ""}</span></li>`).join("");
        });

        const touch = window.matchMedia("(hover: none)").matches;
        document.querySelectorAll("[data-album-open]").forEach((button) => {
            const data = albums[button.dataset.albumOpen];
            if (data) button.addEventListener("click", () => openAlbum(data));
            if (touch) button.textContent = button.textContent.replace(/^Click/, "Tap");
        });
    }

    window.openAlbum = openAlbum;
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountPreviews);
    else mountPreviews();
})();
