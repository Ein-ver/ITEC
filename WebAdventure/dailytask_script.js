// ═══════════════════════════════════════
// 0. MOBILE MENU TOGGLE
// ═══════════════════════════════════════
function toggleMenu() {
    document.querySelector('.nav-links').classList.toggle('open');
}

// GLOBAL
// ----------------------
let pendingEnergyCallback = null;
const energyModal      = document.getElementById('energyWarningModal');
const btnEnergyConfirm = document.getElementById('btnEnergyConfirm');
const btnEnergyCancel  = document.getElementById('btnEnergyCancel');


// ═══════════════════════════════════════
// 1. AUTH GUARD + LOAD USER
// ═══════════════════════════════════════
const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));
if (!currentUser) window.location.href = '../WebIndex/index.html';

// ═══════════════════════════════════════
// 2. GAME CONSTANTS
// ═══════════════════════════════════════
const XP_PER_LEVEL = 200;
const GROUP_ENERGY = { morning: 20, bonding: 40, care: 10 };
const PAWR_PER_LEVEL = 2;  // PAW-ER increases by 2 per level
const TOTAL_TASKS = 7;   // add kayo kapag nagdagdag tasks dito ah
const MAX_ENERGY = 200;

// ═══════════════════════════════════════
// 3. LOAD / INIT GAME STATE
// ═══════════════════════════════════════
function getTodayKey() {
    return new Date().toISOString().split('T')[0];
}

function loadGameState() {
    const accounts = JSON.parse(localStorage.getItem('petmaluAccounts') || '[]');
    const index = accounts.findIndex(acc => acc.email === currentUser.email);
    if (index === -1) return null;

    const acc = accounts[index];

    // Init game data if first time
    if (!acc.game) {
        acc.game = {
            xp: 0, level: 1, pawer: 2,
            energy: 100, streak: 0,
            lastDate: '', checkedTasks: {}
        };
        save(accounts, index, acc);
    }

    // Ensure pawer exists on older saves
    if (acc.game.pawer === undefined) {
        acc.game.pawer = acc.game.level * PAWR_PER_LEVEL;
        save(accounts, index, acc);
    }

    // Midnight reset
    const today = getTodayKey();
    if (acc.game.lastDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yKey = yesterday.toISOString().split('T')[0];

        // FIX: streak counts how many tasks were checked, not if ALL were true
        const checkedCount = Object.keys(acc.game.checkedTasks).length;
        const totalTasks = document.querySelectorAll('.task-item input[type="checkbox"]').length;

        if (acc.game.lastDate === yKey && checkedCount >= totalTasks) {
            acc.game.streak += 1;   // completed all tasks yesterday
        } else if (acc.game.lastDate !== '' && acc.game.lastDate !== yKey) {
            acc.game.streak = 0;    // missed a day
        }

        acc.game.checkedTasks = {};
        acc.game.lastDate = today;
        save(accounts, index, acc);
    }



    return { acc, accounts, index };
}

// ═══════════════════════════════════════
// 4. SAVE HELPER
// ═══════════════════════════════════════
function save(accounts, index, acc) {
    accounts[index] = acc;
    localStorage.setItem('petmaluAccounts', JSON.stringify(accounts));
    localStorage.setItem('loggedInUser', JSON.stringify(acc));
}

// ═══════════════════════════════════════
// 5. POPULATE PET CARD
// ═══════════════════════════════════════
function populatePetCard(acc) {
    const nameEl = document.getElementById('gameCardName');
    const titleEl = document.getElementById('gameCardTitle');
    const imgEl = document.getElementById('gamePetImg');
    const phEl = document.getElementById('gamePetPlaceholder');
    const pawerEl = document.getElementById('gameCardPawer');
    const energyEl = document.getElementById('gameCardEnergy');
    const xpBarEl = document.getElementById('xpBar');
    const levelEl = document.getElementById('levelBadge');
    const streakEl = document.getElementById('streakCount');

    if (nameEl) nameEl.textContent = acc.petName || 'PET NAME';
    if (titleEl) titleEl.textContent = acc.petTitle || 'YOUR PET TITLE';

    if (acc.petPhoto && imgEl && phEl) {
        imgEl.src = acc.petPhoto;
        imgEl.style.display = 'block';
        phEl.style.display = 'none';
    }

    const game = acc.game;
    const xpIntoLevel = game.xp % XP_PER_LEVEL;
    const xpPercent = Math.min((xpIntoLevel / XP_PER_LEVEL) * 100, 100);

    if (xpBarEl) xpBarEl.style.width = xpPercent + '%';
    if (levelEl) levelEl.textContent = `LVL ${game.level}:`;
    if (pawerEl) pawerEl.textContent = `${game.pawer} PAWS`;  // PAW-ER, not XP
    if (energyEl) energyEl.textContent = `${game.energy}%`;
    if (streakEl) streakEl.textContent = game.streak;
}

// ═══════════════════════════════════════
// 6. RESTORE CHECKED + DISABLE CHECKED
// ═══════════════════════════════════════
function restoreCheckboxes(checkedTasks) {
    const checkboxes = document.querySelectorAll('.task-item input[type="checkbox"]');
    checkboxes.forEach((cb, i) => {
        const key = `task_${i}`;
        if (checkedTasks[key]) {
            cb.checked = true;
            disableTaskItem(cb); // already checked today — lock it
        }
    });
}

// Visually lock a checked task item
function disableTaskItem(cb) {
    cb.disabled = true;
    const label = cb.closest('.task-item');
    if (label) label.style.pointerEvents = 'none';
}

// ═══════════════════════════════════════
// 7. HANDLE CHECKBOX CHANGE
// ═══════════════════════════════════════
function handleTaskChange(cb, taskIndex, acc, accounts, accIndex) {
    if (!cb.checked) return; // only fires on check, not uncheck (disabled anyway)

    const exp = parseInt(cb.dataset.exp) || 0;
    const group = cb.dataset.group;
    const key = `task_${taskIndex}`;
    const streak = acc.game.streak || 0;
    const multiplier = 1 + (streak * 0.1);
    const gained = Math.round(exp * multiplier);

    // Award XP
    acc.game.xp += gained;
    acc.game.checkedTasks[key] = true;

    // Check group completion → award energy
    const groupBoxes = document.querySelectorAll(`.task-item input[data-group="${group}"]`);
    const allGroupDone = [...groupBoxes].every(c => c.checked);
    if (allGroupDone) {
        if (acc.game.energy >= MAX_ENERGY) {
            // Energy is full — warn the user but still give XP
            const proceed = confirm('Warning: Energy from this quest won\'t be added (max energy reached). Do you still want to complete (would only get EXP)?');
            if (!proceed) {
                // Undo the checkbox
                cb.checked = false;
                cb.disabled = false;
                const label = cb.closest('.task-item');
                if (label) label.style.pointerEvents = '';
                acc.game.xp = Math.max(0, acc.game.xp - gained);
                delete acc.game.checkedTasks[key];
                save(accounts, accIndex, acc);
                populatePetCard(acc);
                return;
            }
            // User chose to continue — skip energy award but keep XP
        } else {
            acc.game.energy = Math.min(MAX_ENERGY, acc.game.energy + (GROUP_ENERGY[group] || 0));
        }
    }

    // Level up check
    const newLevel = Math.floor(acc.game.xp / XP_PER_LEVEL) + 1;
    if (newLevel > acc.game.level) {
        const levelsGained = newLevel - acc.game.level;
        acc.game.level = newLevel;
        acc.game.pawer += levelsGained * PAWR_PER_LEVEL; // +2 PAW-ER per level
        showLevelUpPopup(newLevel);
    }

    // Lock the checkbox after checking
    disableTaskItem(cb);

    // Floating popup
    showExpPopup(cb, `+${gained} XP`);

    // Save + refresh card
    save(accounts, accIndex, acc);
    populatePetCard(acc);
}

// ═══════════════════════════════════════
// 8. POPUPS
// ═══════════════════════════════════════
function showExpPopup(element, text) {
    const rect = element.closest('.task-item').getBoundingClientRect();
    const popup = document.createElement('div');
    popup.classList.add('exp-popup');
    popup.textContent = text;
    popup.style.left = (rect.right + 10) + 'px';
    popup.style.top = (rect.top + window.scrollY) + 'px';
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 1200);
}

function showLevelUpPopup(level) {
    const popup = document.createElement('div');
    popup.classList.add('exp-popup');
    popup.style.cssText = `
        position: fixed; top: 40%; left: 50%;
        transform: translateX(-50%);
        font-size: 2rem; color: #aa532b;
        font-family: 'ArchivoBlack', sans-serif;
        text-shadow: 0 2px 8px rgba(0,0,0,0.2);
        white-space: nowrap;
    `;
    popup.textContent = `LEVELED UP!!`;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 2000);
}

// ═══════════════════════════════════════
// 9. SIDEBAR SWITCHING
// ═══════════════════════════════════════
document.querySelectorAll('.sidebar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.section-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`section-${btn.dataset.section}`).classList.add('active');
    });
});

// ═══════════════════════════════════════
// 10. LOGOUT
// ═══════════════════════════════════════
const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('loggedInUser');
        window.location.href = '../WebIndex/index.html';
    });
}

// ═══════════════════════════════════════
// 11. INIT
// ═══════════════════════════════════════
const state = loadGameState();
if (state) {
    const { acc, accounts, index } = state;

    populatePetCard(acc);
    restoreCheckboxes(acc.game.checkedTasks);

    const checkboxes = document.querySelectorAll('.task-item input[type="checkbox"]');
    checkboxes.forEach((cb, i) => {
        cb.addEventListener('change', () => handleTaskChange(cb, i, acc, accounts, index));
    });
}