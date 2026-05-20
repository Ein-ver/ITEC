// 1. Mobile Menu Toggle Logic
function toggleMenu() {
    document.querySelector('.nav-links').classList.toggle('open');
}

// 2. Dynamic Header Scroll Background Logic
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('nav');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// 3. Smooth Scroll back to top when clicking Logo
// FIXED: Changed 'logo-scroll-top' to 'logo-backtop' to match your index.html exactly
const backTopLogo = document.getElementById('logo-backtop');
if (backTopLogo) {
    backTopLogo.addEventListener('click', (event) => {
        event.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// 4. --- CARD SWITCHER LOGIC ---
const petData = [
    {
        name: "BUDDY",
        title: "LOREM IPSUM DOLOR",
        level: "75%", 
        pawer: "20 PAWS",
        energy: "100%",
        img: "/Assets/wilsonlosiento.png" // FIXED: Removed absolute path slash to match HTML
    },
    {
        name: "LUNA",
        title: "THE SWIFT SCOUT",
        level: "40%",
        pawer: "35 PAWS",
        energy: "80%",
        img: "/Assets/elgato.png"
    },
    {
        name: "COCO",
        title: "GENTLE GIANT",
        level: "95%",
        pawer: "15 PAWS",
        energy: "50%",
        img: "/Assets/grrr.png"
    }
];

let currentPetIndex = 0;

function rotatePetCard() {
    const card = document.getElementById('petCardContent');
    if (!card) return; // Defensive check to avoid console errors if element isn't rendered

    // Step A: Trigger the CSS fade-out effect (sets opacity to 0)
    card.classList.add('fade-out');

    // Step B: Wait 400 milliseconds for the fade-out to finish, then swap data text nodes
    setTimeout(() => {
        currentPetIndex = (currentPetIndex + 1) % petData.length;
        const nextPet = petData[currentPetIndex];

        // Safely capture elements before writing to them
        const nameEl = document.querySelector('.pet-name-vertical');
        const titleEl = document.querySelector('.pet-title');
        const pawerEl = document.getElementById('cardPawer');
        const energyEl = document.getElementById('cardEnergy');
        const imgEl = document.getElementById('cardPetImg');
        const xpEl = document.querySelector('.xp-progress');

        // Injecting the new profile data dynamically
        if (nameEl) nameEl.innerText = nextPet.name;
        if (titleEl) titleEl.innerText = nextPet.title;
        if (pawerEl) pawerEl.innerText = nextPet.pawer;
        if (energyEl) energyEl.innerText = nextPet.energy;
        if (imgEl) imgEl.src = nextPet.img;
        if (xpEl) xpEl.style.width = nextPet.level;

        // Step C: Remove the fade-out class to let it smoothly fade back into view
        card.classList.remove('fade-out');
    }, 400);
}

// Runs your rotation loop automatically every 4000ms (4 seconds)
setInterval(rotatePetCard, 4000);