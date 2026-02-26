const SLIDES = [
    { path: "Assets/Images/2.mp4", type: "video" },
    { path: "Assets/Images/Calma_insta.mp4", type: "video" },
    { path: "Assets/Images/nuova_sfera.mp4", type: "video" },
    { path: "Assets/Images/2.mp4", type: "video" },
    { path: "Assets/Images/2.mp4", type: "video" },
    { path: "Assets/Images/2.mp4", type: "video" }
];

let currentIdx = 0;
let isPaused = false;
let rafId = null;

const videoEl = document.getElementById('main-video');
const progressContainer = document.getElementById('progress-container');
const interactionLayer = document.getElementById('interaction-layer');

// Genera dinamicamente le barre in base al numero di slide
SLIDES.forEach(() => {
    const track = document.createElement('div');
    track.className = 'progress-track';
    const bar = document.createElement('div');
    bar.className = 'progress-bar';
    track.appendChild(bar);
    progressContainer.appendChild(track);
});

const bars = document.querySelectorAll('.progress-bar');

function loadSlide(idx) {
    currentIdx = idx;
    const s = SLIDES[currentIdx];
    
    videoEl.src = s.path;
    videoEl.load();
    
    // Aggiorna lo stato visivo delle barre (piene o vuote)
    bars.forEach((bar, i) => {
        bar.style.width = i < currentIdx ? "100%" : "0%";
    });

    videoEl.play().catch(e => console.log("Autoplay in attesa di interazione."));
}

function tick() {
    if (!isPaused && videoEl.duration) {
        const pct = (videoEl.currentTime / videoEl.duration) * 100;
        bars[currentIdx].style.width = `${pct}%`;
    }
    rafId = requestAnimationFrame(tick);
}

function next() {
    if (currentIdx < SLIDES.length - 1) {
        loadSlide(currentIdx + 1);
    } else {
        videoEl.pause();
    }
}

function prev() {
    if (currentIdx > 0) {
        loadSlide(currentIdx - 1);
    } else {
        videoEl.currentTime = 0;
    }
}

videoEl.onended = next;

// Gestione del tocco: pausa su pressione lunga, cambio slide su tocco rapido
let holdTimer;
interactionLayer.addEventListener('pointerdown', (e) => {
    holdTimer = setTimeout(() => {
        isPaused = true;
        videoEl.pause();
    }, 150);
});

interactionLayer.addEventListener('pointerup', (e) => {
    clearTimeout(holdTimer);
    if (isPaused) {
        isPaused = false;
        videoEl.play();
    } else {
        const x = e.clientX;
        const width = window.innerWidth;
        if (x < width / 3) prev(); 
        else next();               
    }
});

// Partenza
loadSlide(0);
requestAnimationFrame(tick);