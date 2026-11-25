// Hamburger mobile menu
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobile-menu");

function closeMobileMenu() {
    hamburger.classList.remove("active");
    mobileMenu.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
}

hamburger.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");
    hamburger.classList.toggle("active");
    hamburger.setAttribute("aria-expanded", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
});

// Experience dropdown (Collection 1 / Collection 2)
// Mouse: opens on hover. Touch screens: first tap opens the menu, second tap goes to Experience.
document.querySelectorAll(".nav-drop").forEach((drop) => {
    const trigger = drop.querySelector(":scope > a");
    trigger.addEventListener("click", (event) => {
        if (!window.matchMedia("(hover: none)").matches || drop.classList.contains("is-open")) return;
        event.preventDefault();
        drop.classList.add("is-open");
    });
    drop.querySelectorAll(".nav-drop-menu a").forEach((link) =>
        link.addEventListener("click", () => {
            drop.classList.remove("is-open");
            link.blur();
        }));
    document.addEventListener("click", (event) => {
        if (!drop.contains(event.target)) drop.classList.remove("is-open");
    });
});

// Lightbox
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxSpec = document.getElementById("lightbox-spec");

document.querySelectorAll(".project-image").forEach((button) => {
    button.addEventListener("click", () => {
        if (button.classList.contains("is-empty")) return; // image not added yet
        const image = button.querySelector("img");
        lightboxImage.src = image.currentSrc || image.src;
        lightboxImage.alt = image.alt;
        lightboxCaption.textContent = button.dataset.title;
        const spec = button.closest(".project-card")?.querySelector(".spec");
        lightboxSpec.innerHTML = spec ? spec.innerHTML : "";
        lightbox.showModal();
    });
});

document.querySelector(".lightbox-close").addEventListener("click", () => {
    lightbox.close();
});

lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
        lightbox.close();
    }
});

// ===== Portfolio: placeholder for designs whose image isn't added yet =====
document.querySelectorAll(".project-image img").forEach((img, i) => {
    const showPlaceholder = () => {
        const button = img.closest(".project-image");
        console.warn(`Portfolio: missing image ${img.getAttribute("src")}`);
        img.remove();
        button.classList.add("is-empty");
        button.dataset.pattern = i % 8;
        button.setAttribute("aria-disabled", "true");
        const note = document.createElement("span");
        note.className = "coming-soon";
        note.textContent = "Image coming soon";
        button.append(note);
    };
    if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) showPlaceholder();
    else img.addEventListener("error", showPlaceholder, { once: true });
});

// ===== Portfolio: filter by type =====
const FILTER_LABELS = {
    "half-drop": "Half-drop",
    diamond: "Diamond",
    ogee: "Ogee",
    reverse: "Reverse",
    geometric: "Geometric",
    bedsheets: "Bedsheets",
    brick: "Brick",
};
const projectCards = [...document.querySelectorAll(".project-card")];
const filterBar = document.getElementById("pattern-filters");
const projectCount = document.getElementById("project-count");
const categoryCounts = projectCards.reduce((counts, card) => {
    const key = card.dataset.category;
    if (key) counts[key] = (counts[key] || 0) + 1;
    return counts;
}, {});
const filterLabel = (key) => FILTER_LABELS[key] || key.replace(/-/g, " ").replace(/^./, (ch) => ch.toUpperCase());

function makeFilterButton(key, label, count) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-chip";
    button.dataset.filter = key;
    button.setAttribute("aria-pressed", key === "all");
    button.innerHTML = `<span></span><small>${count}</small>`;
    button.querySelector("span").textContent = label;
    button.addEventListener("click", () => applyFilter(key));
    return button;
}

function applyFilter(key) {
    let shown = 0;
    projectCards.forEach((card) => {
        const match = key === "all" || card.dataset.category === key;
        card.hidden = !match;
        if (match) shown += 1;
    });
    filterBar.querySelectorAll(".filter-chip").forEach((chip) => {
        chip.setAttribute("aria-pressed", chip.dataset.filter === key);
    });
    projectCount.textContent = key === "all"
        ? `${projectCards.length} designs`
        : `${shown} of ${projectCards.length} designs`;
}

filterBar.append(makeFilterButton("all", "All", projectCards.length));
Object.keys(categoryCounts)
    .sort((a, b) => categoryCounts[b] - categoryCounts[a])
    .forEach((key) => filterBar.append(makeFilterButton(key, filterLabel(key), categoryCounts[key])));

// ===== Collection 1: photo album (shown in the page, under Experience) =====
// The album is drawn by album.js into <div class="album-mount" data-album="collection-1"> in index.html.
// Paths start from the site folder, exactly as on disk, e.g. "collection 1/project 2/model image 1 p2.jpeg".
// - coverImage: picture that fills the album cover (the title sits on top of it)
// - storyboard: Research Board page (page 1)
// - moodboard:  Mood Board page (page 2). ratio = picture width / height, so the boards aren't cropped
// - projects:   name, text and images (up to 15 projects). images[0] fills the large frame first;
//               the rest are thumbnails (up to 8; projects with more than 6 pictures get a wider grid).
//   To add Project 3: copy one project block below, change name/text and point images at "collection 1/project 3/...".
window.ALBUMS = {
    "collection-1": {
        name: "Collection-I",
        album: {
            designer: "Zainab Shahnawaz",
            subtitle: "Fashion Illustration Collection",
            coverImage: "collection 1/collection 1 album cover/cover.jpeg",
            storyboard: {
                text: "Drawn from Mughal Lahore: the Badshahi Mosque, carved havelis, blue tiles and busy bazaars. Gold zardozi, kundan jewellery, mehndi and jewel-toned satins set the palette for every piece.",
                images: [
                    "collection 1/story board/story board 1.jpeg",
                    "collection 1/story board/story board 2.jpeg",
                ],
            },
            moodboard: {
                ratio: "899 / 1599",
                images: [
                    "collection 1/Mood boards/Mood board 1.jpeg",
                    "collection 1/Mood boards/Mood board 2.jpeg",
                ],
            },
            projects: [
                {
                    name: "Peplum Poise",
                    text: "Navy satin peplum with a choker collar and gold hand-embroidered yoke, paired with flared trousers.",
                    images: [
                        { src: "collection 1/project 1/Fashion illustration.jpeg", label: "Fashion illustration" },
                        { src: "collection 1/project 1/hand draw and vector P1.jpeg", label: "Hand drawn & vector" },
                        { src: "collection 1/project 1/Model dress-1 P1.jpeg", label: "Embroidered yoke, detail" },
                        { src: "collection 1/project 1/Model dress-2 P1.jpeg", label: "Front, flared sleeve" },
                        { src: "collection 1/project 1/Model dress-3 P1.jpeg", label: "Back view" },
                        { src: "collection 1/project 1/Model dress-4 P1.jpeg", label: "Three-quarter view" },
                    ],
                },
                {
                    name: "The Ember",
                    text: "Rust satin draped dress with a square neckline and copper embroidery along the shoulder.",
                    images: [
                        { src: "collection 1/project 2/fashion illustration.jpeg", label: "Fashion illustration" },
                        { src: "collection 1/project 2/hand drw and vector.jpeg", label: "Hand drawn & vector" },
                        { src: "collection 1/project 2/model image 1 p2.jpeg", label: "Embroidered shoulder" },
                        { src: "collection 1/project 2/model image 2 p2.jpeg", label: "Full length, front" },
                        { src: "collection 1/project 2/model image 3 p2.jpeg", label: "Draped back" },
                        { src: "collection 1/project 2/model image 4 p2.jpeg", label: "Full length, side drape" },
                    ],
                },
                {
                    name: "The Liquid Gold",
                    text: "Gold satin blouse with pleated balloon sleeves and a buttoned cuff, over a pencil skirt embroidered in a geometric gold motif.",
                    images: [
                        { src: "collection 1/project 3/fashion illustration P3.jpeg", label: "Fashion illustration" },
                        { src: "collection 1/project 3/hand drawn and vector P3.jpeg", label: "Hand drawn & vector" },
                        { src: "collection 1/project 3/model 1 P3.jpeg", label: "Full length" },
                        { src: "collection 1/project 3/model 2 P3.jpeg", label: "Pleated front" },
                        { src: "collection 1/project 3/model 3 P3.jpeg", label: "Buttoned cuff, detail" },
                        { src: "collection 1/project 3/model 4 P3.jpeg", label: "Back view" },
                    ],
                },
                {
                    name: "The Tasselled",
                    text: "Peach strapless midi dress with an embroidered bodice, scattered tassel work across the skirt and an asymmetric hem.",
                    images: [
                        { src: "collection 1/project 4/fashion illustration P4.jpeg", label: "Fashion illustration" },
                        { src: "collection 1/project 4/hand drawn and vector P4.jpeg", label: "Hand drawn & vector" },
                        { src: "collection 1/project 4/model 1 P4.jpeg", label: "Full length, front" },
                        { src: "collection 1/project 4/model 2 P4.jpeg", label: "Front view" },
                        { src: "collection 1/project 4/model 3 P4.jpeg", label: "Tasselled hem, detail" },
                        { src: "collection 1/project 4/model 4 P4.jpeg", label: "Back view" },
                    ],
                },
                {
                    name: "Evening Winds",
                    text: "Rust asymmetric dress with a draped flared sleeve, embroidered in gold with flowing leaf and feather motifs.",
                    images: [
                        { src: "collection 1/project 5/fashion illustration P5.jpeg", label: "Fashion illustration" },
                        { src: "collection 1/project 5/hand drawn and vector P5.jpeg", label: "Hand drawn & vector" },
                        { src: "collection 1/project 5/model 1 P5.jpeg", label: "Full length, front" },
                        { src: "collection 1/project 5/model 2 P5.jpeg", label: "Embroidered sleeve, detail" },
                        { src: "collection 1/project 5/model 3 P5.jpeg", label: "Three-quarter view" },
                        { src: "collection 1/project 5/model 4 P5.jpeg", label: "Sleeve drape" },
                        { src: "collection 1/project 5/model 5 P5.jpeg", label: "Back view" },
                    ],
                },
                {
                    name: "Ivory Brocade",
                    text: "Ivory off-shoulder jumpsuit with an embroidered neckline and gold dreamcatcher motifs down the flared legs.",
                    images: [
                        { src: "collection 1/project 6/fashion illustration P6.jpeg", label: "Fashion illustration" },
                        { src: "collection 1/project 6/hand drawn and vector P6.jpeg", label: "Hand drawn & vector" },
                        { src: "collection 1/project 6/model 1 P6.jpeg", label: "Full length" },
                        { src: "collection 1/project 6/model 2 P6.jpeg", label: "Seated, back" },
                        { src: "collection 1/project 6/model 3 P6.jpeg", label: "Embroidered neckline, detail" },
                        { src: "collection 1/project 6/model 4 P6.jpeg", label: "Trouser motif, detail" },
                    ],
                },
                {
                    name: "The Velvet Veil",
                    text: "Black velvet strapless dress with gold branch embroidery, layered under a flowing navy cape embroidered across the back.",
                    images: [
                        { src: "collection 1/project 7/fashion illustration P7.jpeg", label: "Fashion illustration" },
                        { src: "collection 1/project 7/hand drawn and vector P7.jpeg", label: "Hand drawn & vector" },
                        { src: "collection 1/project 7/model 1 P7.jpeg", label: "Full length with cape" },
                        { src: "collection 1/project 7/model 2 P7.jpeg", label: "Embroidery, detail" },
                        { src: "collection 1/project 7/model 3 P7.jpeg", label: "Dress without cape" },
                        { src: "collection 1/project 7/model 4 P7.jpeg", label: "Side view" },
                        { src: "collection 1/project 7/model 5 P7.jpeg", label: "Cape open" },
                        { src: "collection 1/project 7/model 6 P7.jpeg", label: "Embroidered cape, back" },
                    ],
                },
                {
                    name: "Dusk Dreaming",
                    text: "Ivory corset top and pleated skirt with a dreamcatcher embroidery, styled under a cropped copper jacket.",
                    images: [
                        { src: "collection 1/project 8/fashion illustration P8.jpeg", label: "Fashion illustration" },
                        { src: "collection 1/project 8/hand drawn and vector P8.jpeg", label: "Hand drawn & vector" },
                        { src: "collection 1/project 8/model 1 P8.jpeg", label: "Full length with jacket" },
                        { src: "collection 1/project 8/model 2 P8.jpeg", label: "Front view" },
                        { src: "collection 1/project 8/model 3 P8.jpeg", label: "Without jacket" },
                        { src: "collection 1/project 8/model 4 P8.jpeg", label: "Embroidered collar, detail" },
                        { src: "collection 1/project 8/model 5 P8.jpeg", label: "Dreamcatcher motif, detail" },
                        { src: "collection 1/project 8/model 6 P8.jpeg", label: "Back view" },
                    ],
                },
                {
                    name: "Midnight Drape",
                    text: "Navy satin wrap jumpsuit with feather embroidery on the shoulders and a matching embroidered waist tie.",
                    images: [
                        { src: "collection 1/project 9/fashion illustration P9.jpeg", label: "Fashion illustration" },
                        { src: "collection 1/project 9/hand drawn and vector P9.jpeg", label: "Hand drawn & vector" },
                        { src: "collection 1/project 9/model 1 P9.jpeg", label: "Full length" },
                        { src: "collection 1/project 9/model 2 P9.jpeg", label: "Front, open drape" },
                        { src: "collection 1/project 9/model 3 P9.jpeg", label: "Side view" },
                        { src: "collection 1/project 9/model 4 P9.jpeg", label: "Embroidered shoulder" },
                        { src: "collection 1/project 9/model 5 P9.jpeg", label: "Embroidered waist, detail" },
                    ],
                },
                {
                    name: "A Pleated Golden Hour",
                    text: "Caramel satin halter dress with a pleated skirt and a wide waistband embroidered in gold scrolls and leaves.",
                    images: [
                        { src: "collection 1/project 10/fashion illustration P10.jpeg", label: "Fashion illustration" },
                        { src: "collection 1/project 10/hand drawn and vector P10.jpeg", label: "Hand drawn & vector" },
                        { src: "collection 1/project 10/model 1 P10.jpeg", label: "Full length, front" },
                        { src: "collection 1/project 10/model 2 P10.jpeg", label: "Embroidered waistband" },
                        { src: "collection 1/project 10/model 3 P10.jpeg", label: "Front pose" },
                        { src: "collection 1/project 10/model 4 P10.jpeg", label: "Back view" },
                        { src: "collection 1/project 10/model 5 P10.jpeg", label: "Halter back, detail" },
                    ],
                },
                {
                    name: "Sunset Flare",
                    text: "Orange satin halter dress with draped cold shoulders, a fluted hem and dreamcatcher embroidery falling down the bodice.",
                    images: [
                        { src: "collection 1/project 11/fashion illustration P11.jpeg", label: "Fashion illustration" },
                        { src: "collection 1/project 11/hand drawn and vector P11.jpeg", label: "Hand drawn & vector" },
                        { src: "collection 1/project 11/model 1 P11.jpeg", label: "Full length" },
                        { src: "collection 1/project 11/model 2 P11.jpeg", label: "Embroidered bodice" },
                        { src: "collection 1/project 11/model 3 P11.jpeg", label: "Neckline, detail" },
                        { src: "collection 1/project 11/model 4 P11.jpeg", label: "Back view" },
                    ],
                },
                {
                    name: "Banarsi Gleams - 01",
                    text: "Cropped gold Banarsi jacket with embroidered vines, styled with relaxed white denim.",
                    images: [
                        { src: "collection 1/project 12/fashion illustration P12.jpeg", label: "Fashion illustration" },
                        { src: "collection 1/project 12/hand drawn and vector P12.jpeg", label: "Hand drawn & vector" },
                        { src: "collection 1/project 12/model 1 P12.jpeg", label: "Jacket, front" },
                        { src: "collection 1/project 12/model 2 P12.jpeg", label: "Full length" },
                        { src: "collection 1/project 12/model 3 P12.jpeg", label: "Back view" },
                    ],
                },
                {
                    name: "Banarsi Gleams - 02",
                    text: "Cropped gold Banarsi jacket with a pointed collar and embroidered vines, styled with straight-leg denim.",
                    images: [
                        { src: "collection 1/project 13/fashion illustration P13.jpeg", label: "Fashion illustration" },
                        { src: "collection 1/project 13/hand drawn and vector P13.jpeg", label: "Hand drawn & vector" },
                        { src: "collection 1/project 13/model 1 P13.jpeg", label: "Full length" },
                        { src: "collection 1/project 13/model 2 P13.jpeg", label: "Jacket, front" },
                        { src: "collection 1/project 13/model 3 P13.jpeg", label: "Styled look" },
                        { src: "collection 1/project 13/model 4 P13.jpeg", label: "Back view" },
                    ],
                },
                {
                    name: "Banarsi Gleams - 03",
                    text: "Menswear take on the Banarsi jacket: a cropped wrap-front cut with wide lapels over black flared trousers.",
                    images: [
                        { src: "collection 1/project 14/fashion illustration P14.jpeg", label: "Fashion illustration" },
                        { src: "collection 1/project 14/hand drawn and vector P14.jpeg", label: "Hand drawn & vector" },
                        { src: "collection 1/project 14/model 1 P14.jpeg", label: "Full length" },
                        { src: "collection 1/project 14/model 2 P14.jpeg", label: "Lapel, detail" },
                        { src: "collection 1/project 14/model 3 P14.jpeg", label: "Side view" },
                    ],
                },
                {
                    name: "Banarsi Gleams - 04",
                    text: "Collarless cropped Banarsi jacket with embroidered vines, worn open over chocolate trousers.",
                    images: [
                        { src: "collection 1/project 15/fashion illustration P15.jpeg", label: "Fashion illustration" },
                        { src: "collection 1/project 15/hand drawn and vector P15.jpeg", label: "Hand drawn & vector" },
                        { src: "collection 1/project 15/model 1 P15.jpeg", label: "Front view" },
                        { src: "collection 1/project 15/model 2 P15.jpeg", label: "Embroidery, detail" },
                        { src: "collection 1/project 15/model 3 P15.jpeg", label: "Back view" },
                    ],
                },
            ],
        },
    },
};

// ===== Collection 2: fabric rail (cards on the hanging rail) =====
// HOW TO ADD PIECES TO COLLECTION 2
// Each entry is one card on the rail. It has a COVER (shown on the card) and a GALLERY (shown when the card is opened).
// - cover:  file name inside Images/  (e.g. "my-design.jpeg")
// - folder: gallery folder inside Images/collections/  (e.g. "my-design" = Images/collections/my-design/)
//           Leave it "" to load the gallery photos straight from Images/.
// - images: gallery photo file names inside that folder, in the order you want them shown.
//   Leave images empty ([]) and the viewer shows the cover until the gallery photos are added.
// - focus (optional): which part of the cover shows on the card, e.g. "70% 50%" = right of centre.
// year and description are optional ("" to hide).
// While the list is empty, the rail shows one "Coming soon" card.
const COLLECTIONS = [
    // {
    //     name: "Design name",
    //     technique: "Print development",
    //     year: "2026",
    //     description: "",
    //     cover: "my-design.jpeg",
    //     focus: "",
    //     folder: "my-design",
    //     images: ["1.jpeg", "2.jpeg", "3.jpeg"],
    // },
];

const PATTERN_COUNT = 8;
const pad = (n) => String(n).padStart(2, "0");
const piecesLabel = (n) => `${n} ${n === 1 ? "piece" : "pieces"}`;
const imagePath = (collection, file) => collection.folder
    ? `Images/collections/${encodeURIComponent(collection.folder)}/${encodeURIComponent(file)}`
    : `Images/${encodeURIComponent(file)}`;
const sitePath = (path) => path.split("/").map(encodeURIComponent).join("/");
const coverPath = (collection) => collection.album
    ? (collection.album.card.cover ? sitePath(collection.album.card.cover) : "")
    : collection.cover
    ? `Images/${collection.cover.split("/").map(encodeURIComponent).join("/")}`
    : (collection.images.length ? imagePath(collection, collection.images[0]) : "");
// What the viewer shows: the gallery, or the cover alone while the gallery is empty
const galleryOf = (collection) => collection.images.length
    ? collection.images.map((file) => imagePath(collection, file))
    : (coverPath(collection) ? [coverPath(collection)] : []);
const countLabel = (collection) => collection.album
    ? (collection.album.projects.length
        ? `${collection.album.projects.length} ${collection.album.projects.length === 1 ? "project" : "projects"}`
        : "coming soon")
    : collection.images.length ? piecesLabel(collection.images.length) : "";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// Swap a missing photo for a placeholder fabric
function fallbackOnError(img, holder, patternIndex) {
    img.addEventListener("error", () => {
        console.warn(`Collections: missing image ${img.getAttribute("src")}`);
        img.remove();
        holder.classList.add("is-empty");
        holder.dataset.pattern = patternIndex % PATTERN_COUNT;
    }, { once: true });
}

// --- Rail ---
const rail = document.getElementById("rail");
const railTrack = document.getElementById("rail-track");
const railPrev = document.getElementById("rail-prev");
const railNext = document.getElementById("rail-next");
const railCount = document.getElementById("rail-count");
const railNav = document.getElementById("rail-nav");
const railToggle = document.getElementById("rail-toggle");
const railBar = document.getElementById("rail-progress-bar");
let suppressClick = false;

COLLECTIONS.forEach((collection, index) => {
    const item = document.createElement("li");
    item.className = "rail-item";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "swatch";
    button.setAttribute("aria-label",
        [`Open ${collection.name} collection`, countLabel(collection)].filter(Boolean).join(", "));
    button.innerHTML = `
        <span class="swatch-body"><span class="swatch-fabric"></span></span>
        <span class="swatch-label"><span class="swatch-name"></span><span class="swatch-no"></span></span>
        <span class="swatch-thumbs"></span>`;

    const fabric = button.querySelector(".swatch-fabric");
    if (coverPath(collection)) {
        const cover = document.createElement("img");
        cover.alt = "";
        cover.loading = "lazy";
        cover.decoding = "async";
        cover.draggable = false;
        const focus = collection.album ? collection.album.card.focus : collection.focus;
        if (focus) cover.style.objectPosition = focus;
        fallbackOnError(cover, fabric, index);
        cover.src = coverPath(collection);
        fabric.prepend(cover);
    } else {
        fabric.classList.add("is-empty");
        fabric.dataset.pattern = index % PATTERN_COUNT;
    }

    button.querySelector(".swatch-name").textContent = collection.name;
    button.querySelector(".swatch-no").textContent = pad(index + 1);
    // First 4 gallery photos as a preview strip under the card (clicking one opens that photo)
    const thumbs = button.querySelector(".swatch-thumbs");
    const previews = collection.album
        ? (collection.album.card.previews || []).map(sitePath)
        : collection.images.map((file) => imagePath(collection, file));
    previews.slice(0, 4).forEach((previewSrc, i) => {
        const thumb = document.createElement("img");
        thumb.className = "swatch-thumb";
        thumb.alt = "";
        thumb.loading = "lazy";
        thumb.decoding = "async";
        thumb.draggable = false;
        thumb.dataset.photo = i;
        thumb.addEventListener("error", () => thumb.classList.add("is-missing"), { once: true });
        thumb.src = previewSrc;
        thumbs.append(thumb);
    });
    thumbs.hidden = !thumbs.children.length;

    button.addEventListener("click", (event) => {
        if (suppressClick) return;
        if (collection.album && window.openAlbum) {
            window.openAlbum(collection);
            return;
        }
        openCollection(index);
        const thumb = event.target.closest(".swatch-thumb");
        if (thumb) openPhoto(Number(thumb.dataset.photo));
    });

    item.append(button);
    railTrack.append(item);
});

if (!COLLECTIONS.length) {
    const item = document.createElement("li");
    item.className = "rail-item";
    item.innerHTML = `
        <div class="swatch swatch-placeholder" aria-label="Collection 2, coming soon">
            <span class="swatch-body"><span class="swatch-fabric is-empty" data-pattern="1"></span></span>
            <span class="swatch-label"><span class="swatch-name">Coming soon</span><span class="swatch-no">02</span></span>
        </div>`;
    railTrack.append(item);
}

railToggle.textContent = `View all ${COLLECTIONS.length}`;

function itemStep() {
    const first = railTrack.querySelector(".rail-item");
    const gap = parseFloat(getComputedStyle(railTrack).columnGap) || 0;
    return first ? first.offsetWidth + gap : 236;
}

function scrollRail(direction) {
    const step = itemStep();
    const page = Math.max(step, Math.floor(railTrack.clientWidth / step) * step);
    railTrack.scrollBy({ left: direction * page, behavior: reduceMotion.matches ? "auto" : "smooth" });
}

function updateRail() {
    const total = COLLECTIONS.length;
    const max = railTrack.scrollWidth - railTrack.clientWidth;
    const fits = max <= 2;
    const isGrid = rail.classList.contains("is-grid");
    railNav.hidden = fits || isGrid;
    railToggle.hidden = fits && !isGrid;
    rail.classList.toggle("is-fit", fits && !isGrid);
    railPrev.disabled = railTrack.scrollLeft <= 2;
    railNext.disabled = railTrack.scrollLeft >= max - 2;

    const step = itemStep();
    const first = Math.min(total, Math.round(railTrack.scrollLeft / step) + 1);
    const last = Math.min(total, Math.floor((railTrack.scrollLeft + railTrack.clientWidth) / step));
    railCount.textContent = last > first
        ? `${pad(first)}–${pad(last)} of ${pad(total)}`
        : `${pad(first)} of ${pad(total)}`;

    railBar.style.width = `${(railTrack.clientWidth / railTrack.scrollWidth) * 100}%`;
    railBar.style.marginLeft = `${(railTrack.scrollLeft / railTrack.scrollWidth) * 100}%`;
}

let railFrame = null;
const queueRailUpdate = () => {
    if (railFrame) return;
    railFrame = requestAnimationFrame(() => {
        railFrame = null;
        updateRail();
    });
};

railPrev.addEventListener("click", () => scrollRail(-1));
railNext.addEventListener("click", () => scrollRail(1));
railTrack.addEventListener("scroll", queueRailUpdate, { passive: true });
window.addEventListener("resize", queueRailUpdate);

railToggle.addEventListener("click", () => {
    const isGrid = rail.classList.toggle("is-grid");
    railToggle.setAttribute("aria-pressed", isGrid);
    railToggle.textContent = isGrid ? "Show as rail" : `View all ${COLLECTIONS.length}`;
    railNav.hidden = isGrid;
    if (!isGrid) {
        railTrack.scrollLeft = 0;
        updateRail();
    }
});

// Click-and-drag scrolling for mouse users (touch already swipes natively)
let drag = null;
railTrack.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0 || rail.classList.contains("is-grid")) return;
    drag = { x: event.clientX, left: railTrack.scrollLeft, moved: false };
});
window.addEventListener("pointermove", (event) => {
    if (!drag) return;
    const dx = event.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 5) {
        drag.moved = true;
        railTrack.classList.add("is-dragging");
    }
    if (drag.moved) railTrack.scrollLeft = drag.left - dx;
});
window.addEventListener("pointerup", () => {
    if (!drag) return;
    if (drag.moved) {
        suppressClick = true;
        setTimeout(() => { suppressClick = false; }, 0);
    }
    railTrack.classList.remove("is-dragging");
    drag = null;
});
railTrack.addEventListener("dragstart", (event) => event.preventDefault());

updateRail();

// --- Collection viewer (gallery grid) ---
const viewer = document.getElementById("collection-viewer");
const cvEyebrow = document.getElementById("cv-eyebrow");
const cvTitle = document.getElementById("cv-title");
const cvMeta = document.getElementById("cv-meta");
const cvDesc = document.getElementById("cv-desc");
const cvGrid = document.getElementById("cv-grid");
const cvPrevCol = document.getElementById("cv-prev-col");
const cvNextCol = document.getElementById("cv-next-col");
let currentCollection = 0;

function openCollection(index) {
    currentCollection = (index + COLLECTIONS.length) % COLLECTIONS.length;
    renderCollection();
    if (!viewer.open) viewer.showModal();
    viewer.scrollTop = 0;
}

function renderCollection() {
    const collection = COLLECTIONS[currentCollection];
    const gallery = galleryOf(collection);
    const total = COLLECTIONS.length;

    cvEyebrow.textContent = `Collection ${pad(currentCollection + 1)} of ${pad(total)}`;
    cvTitle.textContent = collection.name;
    cvMeta.textContent = [collection.technique, collection.year, countLabel(collection)]
        .filter(Boolean).join(" · ");
    cvDesc.textContent = collection.description || "";

    cvGrid.replaceChildren();
    gallery.forEach((src, i) => {
        const item = document.createElement("li");
        const tile = document.createElement("button");
        tile.type = "button";
        tile.className = "cv-tile";
        tile.setAttribute("aria-label", `Open photo ${i + 1} of ${gallery.length}`);
        const img = document.createElement("img");
        img.alt = "";
        img.loading = "lazy";
        img.decoding = "async";
        fallbackOnError(img, tile, currentCollection + i);
        img.src = src;
        const no = document.createElement("span");
        no.className = "cv-tile-no";
        no.textContent = `${i + 1} / ${gallery.length}`;
        tile.append(img, no);
        tile.addEventListener("click", () => openPhoto(i));
        item.append(tile);
        cvGrid.append(item);
    });
    cvGrid.classList.toggle("is-single", gallery.length === 1);

    const single = total < 2;
    cvPrevCol.hidden = single;
    cvNextCol.hidden = single;
    cvPrevCol.querySelector("span").textContent = COLLECTIONS[(currentCollection - 1 + total) % total].name;
    cvNextCol.querySelector("span").textContent = COLLECTIONS[(currentCollection + 1) % total].name;
}

cvPrevCol.addEventListener("click", () => openCollection(currentCollection - 1));
cvNextCol.addEventListener("click", () => openCollection(currentCollection + 1));
document.getElementById("cv-close").addEventListener("click", () => viewer.close());

// Close when clicking the dark backdrop (outside the dialog box)
viewer.addEventListener("click", (event) => {
    if (event.target !== viewer) return;
    const box = viewer.getBoundingClientRect();
    const inside = event.clientX >= box.left && event.clientX <= box.right &&
        event.clientY >= box.top && event.clientY <= box.bottom;
    if (!inside) viewer.close();
});

// --- Photo viewer (enlarged photo, 1 / N, arrows + keyboard + swipe) ---
const photoViewer = document.getElementById("photo-viewer");
const pvStage = document.getElementById("pv-stage");
const pvImage = document.getElementById("pv-image");
const pvTitle = document.getElementById("pv-title");
const pvCounter = document.getElementById("pv-counter");
const pvPrev = document.getElementById("pv-prev");
const pvNext = document.getElementById("pv-next");
let photos = [];
let currentPhoto = 0;

function openPhoto(index) {
    const collection = COLLECTIONS[currentCollection];
    photos = galleryOf(collection);
    if (!photos.length) return;
    pvTitle.textContent = collection.name;
    const single = photos.length < 2;
    pvPrev.hidden = single;
    pvNext.hidden = single;
    showPhoto(index);
    if (!photoViewer.open) photoViewer.showModal();
}

function showPhoto(index) {
    const total = photos.length;
    currentPhoto = (index + total) % total;
    pvStage.classList.remove("is-empty");
    pvImage.hidden = false;
    pvImage.src = photos[currentPhoto];
    pvImage.alt = `${COLLECTIONS[currentCollection].name}, photo ${currentPhoto + 1} of ${total}`;
    pvCounter.textContent = `${currentPhoto + 1} / ${total}`;

    // Preload neighbours so the arrows feel instant
    if (total > 1) {
        new Image().src = photos[(currentPhoto + 1) % total];
        new Image().src = photos[(currentPhoto - 1 + total) % total];
    }
}

pvImage.addEventListener("error", () => {
    if (!pvImage.getAttribute("src")) return;
    console.warn(`Collections: missing image ${pvImage.getAttribute("src")}`);
    pvImage.hidden = true;
    pvStage.classList.add("is-empty");
    pvStage.dataset.pattern = (currentCollection + currentPhoto) % PATTERN_COUNT;
});

pvPrev.addEventListener("click", () => showPhoto(currentPhoto - 1));
pvNext.addEventListener("click", () => showPhoto(currentPhoto + 1));
document.getElementById("pv-close").addEventListener("click", () => photoViewer.close());

// Clicking the dark area around the photo closes it (Esc also works)
photoViewer.addEventListener("click", (event) => {
    if (event.target === photoViewer || event.target === pvStage) photoViewer.close();
});

photoViewer.addEventListener("keydown", (event) => {
    if (photos.length < 2) return;
    if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPhoto(currentPhoto - 1);
    } else if (event.key === "ArrowRight") {
        event.preventDefault();
        showPhoto(currentPhoto + 1);
    }
});

// Swipe between photos on touch screens
let swipeStart = null;
pvStage.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") swipeStart = event.clientX;
});
pvStage.addEventListener("pointerup", (event) => {
    if (swipeStart === null) return;
    const dx = event.clientX - swipeStart;
    swipeStart = null;
    if (Math.abs(dx) > 40 && photos.length > 1) showPhoto(currentPhoto + (dx < 0 ? 1 : -1));
});
pvStage.addEventListener("pointercancel", () => { swipeStart = null; });

document.getElementById("current-year").textContent = new Date().getFullYear();
