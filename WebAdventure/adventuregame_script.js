// ═══════════════════════════════════════
// 0. MOBILE MENU TOGGLE
// ═══════════════════════════════════════
function toggleMenu() {
    document.querySelector('.nav-links').classList.toggle('open');
}

// ═══════════════════════════════════════
// AUTH GUARD + LOAD USER
// ═══════════════════════════════════════
const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));
if (!currentUser) window.location.href = '../WebIndex/index.html';

const XP_PER_LEVEL   = 200;
const KM_PER_ENEMY   = 0.1;   // each enemy defeated = +0.1 KM (0.5 too muc mr.greedy)
const ENERGY_COST    = 20;     // -20% energy to start
const STARTING_BONES = 5;
const ATTACK_INTERVAL_MS = 3000; // pet attacks every 3 seconds

// ═══════════════════════════════════════
// GAME INI
// ═══════════════════════════════════════
let gameRunning  = false;
let attackTimer  = null;
let bones        = STARTING_BONES;
let km           = 0;
let coins        = 0;
let enemyHealth  = 0;
let enemyMaxHealth = 0;
let acc          = null;
let accounts     = [];
let accIndex     = -1;

// Enemy pool — add pa kayo dito
// All starts at 2 health para mas madali mapatay
const ENEMY_POOL = [
    { name: "WILD CATTO",       title: "WANDERER",          baseHealth: 2, coinDrop: 2, img: "../Assets/Cat_Enemy.jpg"},
    { name: "WILD RABBIT",      title: "SPEEDSTER",         baseHealth: 2, coinDrop: 3, img: "../Assets/Rabbit_Enemy.jpeg"},
    { name: "GRUMPY UNC DOG",   title: "BARKER",            baseHealth: 2, coinDrop: 3, img: "../Assets/Dog_Enemy.jpg"},
    { name: "RACCOON..?",       title: "STELLE",            baseHealth: 2, coinDrop: 3, img: "../Assets/Raccoon_Enemy.jpg"},
    { name: "ANGY GOOSE",       title: "UNTAMED BUT CUTE",  baseHealth: 2, coinDrop: 4, img: "../Assets/Goose_Enemy.jpg"},
    { name: "BEAR CUB?",        title: "HAR HAR HAR",       baseHealth: 2, coinDrop: 5, img: "../Assets/Bear_Enemy.gif"},
];

// ═══════════════════════════════════════
// LOAD ACCOUNT DATA
// ═══════════════════════════════════════
function loadAccount() {
    accounts = JSON.parse(localStorage.getItem('petmaluAccounts') || '[]');
    accIndex = accounts.findIndex(a => a.email === currentUser.email);
    if (accIndex === -1) return false;
    acc = accounts[accIndex];
    if (!acc.game) acc.game = { xp: 0, level: 1, pawer: 2, energy: 100, streak: 0, coins: 0, highScore: 0 };
    if (!acc.game.coins)     acc.game.coins     = 0;
    if (!acc.game.highScore) acc.game.highScore = 0;
    return true;
}

function saveAccount() {
    accounts[accIndex] = acc;
    localStorage.setItem('petmaluAccounts', JSON.stringify(accounts));
    localStorage.setItem('loggedInUser', JSON.stringify(acc));
}

// ═══════════════════════════════════════
// POPULATE PET CARD
// ═══════════════════════════════════════
function populateArenaCard() {
    document.getElementById('arenaCardName').textContent  = acc.petName  || 'PET NAME';
    document.getElementById('arenaCardTitle').textContent = acc.petTitle || 'YOUR PET TITLE';
    document.getElementById('arenaPawer').textContent     = `${acc.game.pawer} PAWS`;
    document.getElementById('arenaEnergy').textContent    = `${acc.game.energy}%`;
    document.getElementById('arenaLevelBadge').textContent = `LVL ${acc.game.level}:`;

    const xpIntoLevel = acc.game.xp % XP_PER_LEVEL;
    document.getElementById('arenaXpBar').style.width = ((xpIntoLevel / XP_PER_LEVEL) * 100) + '%';

    if (acc.petPhoto) {
        document.getElementById('arenaPetImg').src = acc.petPhoto;
        document.getElementById('arenaPetImg').style.display = 'block';
        document.getElementById('arenaPetPlaceholder').style.display = 'none';
    }
}

// ═══════════════════════════════════════
// UPDATE HUD
// ═══════════════════════════════════════
function updateHUD() {
    document.getElementById('bonesCount').textContent   = bones;
    document.getElementById('kmCount').textContent      = km.toFixed(1);
    document.getElementById('coinsCount').textContent   = coins;
    document.getElementById('kmHighScore').textContent  = (acc.game.highScore || 0).toFixed(1);
}

// ═══════════════════════════════════════
// SPAWN ENEMY
// ═══════════════════════════════════════
function spawnEnemy() {
    // Pick random enemy from pool
    const template = ENEMY_POOL[Math.floor(Math.random() * ENEMY_POOL.length)];

    // Scale health: base + 2 per full KM reached
    const kmBonus  = Math.floor(km) * 2;
    enemyMaxHealth = template.baseHealth + kmBonus;
    enemyHealth    = enemyMaxHealth;

    document.getElementById('enemyName').textContent    = template.name;
    document.getElementById('enemyTitle').textContent   = template.title;
    document.getElementById('enemyHealth').textContent  = `${enemyHealth} PAWS`;
    document.getElementById('enemyCoinDrop').textContent = template.coinDrop + Math.floor(km);

    // Pictures
    const enemyImgContainer = document.querySelector('.enemy-img-container');
    enemyImgContainer.innerHTML = ''; // clear previous
    if (template.img) {
        const img = document.createElement('img');
        img.src = template.img;
        img.style.cssText = 'width:100%; height:100%; object-fit:cover;';
        enemyImgContainer.appendChild(img);
    } else {
        enemyImgContainer.innerHTML = '<div class="pet-image-placeholder"><span>ENEMY PICTURE<br>HERE</span></div>';
    }

    // Show enemy card
    document.getElementById('enemyCard').classList.remove('hidden');
    document.getElementById('startZone').classList.add('hidden');
}

// ═══════════════════════════════════════
// ATTACK LOOP
// ═══════════════════════════════════════
function attackLoop() {
    if (!gameRunning) return;

    const pawer = acc.game.pawer;

    // Pet attacks enemy
    enemyHealth -= pawer;
    showDmgPopup('enemyCard', `-${pawer}`);
    document.getElementById('enemyCard').classList.add('shake-right');
    setTimeout(() => document.getElementById('enemyCard').classList.remove('shake-right'), 400);

    if (enemyHealth <= 0) {
        // Enemy defeated!
        enemyDefeated();
    } else {
        // Enemy attacks back — takes one bone
        document.getElementById('enemyHealth').textContent = `${enemyHealth} PAWS`;
        setTimeout(() => {
            if (!gameRunning) return;
            bones -= 1;
            updateHUD();
            showDmgPopup('pet-side', `-1 🦴`);
            document.querySelector('.pet-side').classList.add('shake-left');
            setTimeout(() => document.querySelector('.pet-side').classList.remove('shake-left'), 400);

            if (bones <= 0) {
                triggerLose();
            }
        }, 1000); // enemy attacks 1 second after pet
    }
}

function enemyDefeated() {
    // Award coins
    const drop = parseInt(document.getElementById('enemyCoinDrop').textContent);
    coins += drop;
    acc.game.coins += drop;

    // Advance KM
    km = parseFloat((km + KM_PER_ENEMY).toFixed(1));

    // Update high score
    if (km > (acc.game.highScore || 0)) acc.game.highScore = km;

    saveAccount();
    updateHUD();

    // Kyrie fadeout (larp)
    const enemyCard = document.getElementById('enemyCard');
    enemyCard.classList.add('enemy-fade-out');

    // Spawn next enemy after short delay
    setTimeout(() => {
        enemyCard.classList.remove('enemy-fade-out');

        if (gameRunning) {
            spawnEnemy();

            // Fade new enemy
            enemyCard.classList.add('enemy-fade-in');
            setTimeout(() => enemyCard.classList.remove('enemy-fade-in'), 500);
        }
    }, 500);
}

// ═══════════════════════════════════════
// DAMAGE POPUP
// ═══════════════════════════════════════
function showDmgPopup(cardClass, text) {
    const card  = document.querySelector(`.${cardClass}`) || document.getElementById(cardClass);
    if (!card) return;
    const rect  = card.getBoundingClientRect();
    const popup = document.createElement('div');
    popup.classList.add('dmg-popup');
    popup.textContent = text;
    popup.style.left  = (rect.left + rect.width / 2) + 'px';
    popup.style.top   = (rect.top  + window.scrollY + 20) + 'px';
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 1000);
}

// ═══════════════════════════════════════
// START GAME
// ═══════════════════════════════════════
function startGame() {
    // Deduct 20% energy
    acc.game.energy = Math.max(0, acc.game.energy - ENERGY_COST);
    saveAccount();
    populateArenaCard();

    bones      = STARTING_BONES;
    km         = 0;
    coins      = 0;
    gameRunning = true;

    updateHUD();
    spawnEnemy();

    // Start attack loop every 3 seconds
    attackTimer = setInterval(attackLoop, ATTACK_INTERVAL_MS);
}

// ═══════════════════════════════════════
// LOSE
// ═══════════════════════════════════════
function triggerLose() {
    gameRunning = false;
    clearInterval(attackTimer);

    document.getElementById('loseKm').textContent        = km.toFixed(1);
    document.getElementById('loseHighScore').textContent = (acc.game.highScore || 0).toFixed(1);
    document.getElementById('loseModal').classList.add('active');
}

// ═══════════════════════════════════════
// WARN ON TAB CLOSE DURING GAME
// ═══════════════════════════════════════
window.addEventListener('beforeunload', (e) => {
    if (gameRunning) {
        e.preventDefault();
        e.returnValue = 'Leaving will result in a loss!';
    }
});

// ═══════════════════════════════════════
// TUTORIAL
// ═══════════════════════════════════════
const tutorialSteps = [
    "Try not to make the enemy get your bone by knocking them out in one-shot!",
    "Enemies drop Pawrency (coins) when they get knocked out.",
    "You can use these Pawrency on the Coupaws page to buy coupons!",
    "Finally, every kilometer adds 1 coin to enemy drops, but it also increases health by 2. So be sure to always enjoy the daily tasks with your pet and up your KM!!",
    "Your pet card automatically attacks enemies, so you can sit back and check your pets while grinding!",
    "Warning: leaving while the game is continuing will result in a loss!\n\nNow, are you ready to take the adventure?",
];

let tutorialStep = 0;

function showTutorial() {
    tutorialStep = 0;
    document.getElementById('tutorialText').textContent = tutorialSteps[0];
    document.getElementById('btnTutorialNext').textContent = 'Next';
    document.getElementById('tutorialModal').classList.add('active');
}

function nextTutorialStep() {
    tutorialStep++;
    if (tutorialStep >= tutorialSteps.length) {
        // Tutorial done — mark as seen
        acc.game.hasSeenTutorial = true;
        saveAccount();
        document.getElementById('tutorialModal').classList.remove('active');
        return;
    }

    document.getElementById('tutorialText').textContent = tutorialSteps[tutorialStep];

    // Last step — change button to "I'M READY!"
    if (tutorialStep === tutorialSteps.length - 1) {
        document.getElementById('btnTutorialNext').textContent = "I'M READY!";
    }
}

// ═══════════════════════════════════════
// 13. INIT
// ═══════════════════════════════════════
if (loadAccount()) {
    populateArenaCard();
    updateHUD();
    coins = acc.game.coins || 0;
    updateHUD();

    // Show tutorial only once for new users
    if (!acc.game.hasSeenTutorial) {
        showTutorial();
    }

    // Start adventure button
    document.getElementById('btnStartAdventure').addEventListener('click', () => {
        if (acc.game.energy < ENERGY_COST) {
            alert('Not enough energy! Complete daily tasks to restore energy.');
            return;
        }
        startGame();
    });

    // Tutorial next button
    document.getElementById('btnTutorialNext').addEventListener('click', nextTutorialStep);

    // Try again button
    document.getElementById('btnTryAgain').addEventListener('click', () => {
        if (acc.game.energy < ENERGY_COST) {
            alert('Not enough energy to try again! Complete daily tasks first.');
            return;
        }
        document.getElementById('loseModal').classList.remove('active');
        document.getElementById('enemyCard').classList.add('hidden');
        document.getElementById('startZone').classList.remove('hidden');
        startGame();
    });

    // Quit button
    document.getElementById('btnQuit').addEventListener('click', () => {
        document.getElementById('loseModal').classList.remove('active');
        document.getElementById('enemyCard').classList.add('hidden');
        document.getElementById('startZone').classList.remove('hidden');
        bones = STARTING_BONES;
        km    = 0;
        coins = acc.game.coins || 0;
        updateHUD();
    });

    // Logout
    document.getElementById('btnLogout').addEventListener('click', () => {
        gameRunning = false;
        clearInterval(attackTimer);
        localStorage.removeItem('loggedInUser');
        window.location.href = '../WebIndex/index.html';
    });
}