// 1. Definiamo direttamente l'array con i video dei salmoni
const SLIDES = [
    { path: "Assets/Images/ungulati/1.mp4", type: "video" },
    { path: "Assets/Images/ungulati/2.mp4", type: "video" },
    { path: "Assets/Images/ungulati/3.mp4", type: "video" },
    { path: "Assets/Images/ungulati/4.mp4", type: "video" },
    { path: "Assets/Images/ungulati/5.mp4", type: "video" },
    { path: "Assets/Images/ungulati/6.mp4", type: "video" },
    { path: "Assets/Images/ungulati/7.mp4", type: "video" },
    { path: "Assets/Images/ungulati/8.mp4", type: "video" },
    { path: "Assets/Images/ungulati/9.mp4", type: "video" },
    { path: "Assets/Images/ungulati/10.mp4", type: "video" }
];

// ---- GESTIONE DEL PLAYER E DELLE STORIE ---- //

let currentIdx = 0;
let isPaused = false;
let rafId = null;
let isTransitioning = false; // Evita glitch se si tocca troppo velocemente

// Setup dei due video
let activeVideo = document.getElementById('video-1');
let hiddenVideo = document.getElementById('video-2');

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
    if (isTransitioning) return;
    isTransitioning = true;
    currentIdx = idx;
    
    // Aggiorna lo stato visivo delle barre
    bars.forEach((bar, i) => {
        bar.style.width = i < currentIdx ? "100%" : "0%";
    });

    const s = SLIDES[currentIdx];
    
    // Carica la sorgente nel video NASCOSTO
    hiddenVideo.src = s.path;
    hiddenVideo.load();
    
    // Aspetta che il video nascosto sia pronto per riprodurre il primo frame
    hiddenVideo.onloadeddata = () => {
        hiddenVideo.play().catch(e => console.log("Autoplay in attesa di interazione.", e));
        
        // Scambia le classi: il nascosto diventa visibile e viceversa
        hiddenVideo.classList.add('active');
        activeVideo.classList.remove('active');
        
        // Ferma e resetta il vecchio video attivo
        activeVideo.pause();
        activeVideo.currentTime = 0;
        
        // Inverti i ruoli delle variabili
        let temp = activeVideo;
        activeVideo = hiddenVideo;
        hiddenVideo = temp;

        // Attacca l'evento di fine al nuovo video attivo
        activeVideo.onended = next;
        
        // Transizione finita, sblocca i tap
        isTransitioning = false;
    };
}

function tick() {
    if (!isPaused && activeVideo.duration && !isTransitioning) {
        const pct = (activeVideo.currentTime / activeVideo.duration) * 100;
        bars[currentIdx].style.width = `${pct}%`;
    }
    rafId = requestAnimationFrame(tick);
}

function next() {
    if (currentIdx < SLIDES.length - 1) {
        loadSlide(currentIdx + 1);
    } else {
        // Alla fine dell'ultimo video, per ora si mette in pausa.
        activeVideo.pause();
    }
}

function prev() {
    if (currentIdx > 0) {
        loadSlide(currentIdx - 1);
    } else {
        activeVideo.currentTime = 0;
    }
}

// Gestione del tocco per pausa/avanti/indietro
let holdTimer;
interactionLayer.addEventListener('pointerdown', (e) => {
    if(isTransitioning) return;
    holdTimer = setTimeout(() => {
        isPaused = true;
        activeVideo.pause();
    }, 150);
});

interactionLayer.addEventListener('pointerup', (e) => {
    if(isTransitioning) return;
    clearTimeout(holdTimer);
    if (isPaused) {
        isPaused = false;
        activeVideo.play();
    } else {
        const x = e.clientX;
        const width = window.innerWidth;
        if (x < width / 3) prev(); 
        else next();               
    }
});

// Partenza: carica la prima slide direttamente sul video attivo
activeVideo.src = SLIDES[0].path;
activeVideo.onloadeddata = () => {
    activeVideo.play().catch(e => console.log("Autoplay in attesa di interazione."));
    activeVideo.onended = next;
    requestAnimationFrame(tick);
};
