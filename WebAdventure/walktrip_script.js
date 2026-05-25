// Mobile hamburger menu toggle
function toggleWalkMenu() {
    document.querySelector('.nav-links').classList.toggle('open');
}

// Logout button
const _logoutBtn = document.getElementById('btnLogout');
if (_logoutBtn) {
    _logoutBtn.addEventListener('click', function () {
        localStorage.removeItem('loggedInUser');
        window.location.href = '../WebIndex/index.html';
    });
}

(function () {
    // ----- DOM elements -----
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const startScreen = document.getElementById('startScreen');
    const howScreen = document.getElementById('howScreen');
    const settingsScreen = document.getElementById('settingsScreen');
    const pauseMenu = document.getElementById('pauseMenu');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const energyWarningScreen = document.getElementById('energyWarningScreen');
    const scoreSpan = document.getElementById('scoreValue');
    const timerSpan = document.getElementById('timerValue');
    const highScoreDisplay = document.getElementById('highScoreDisplay');
    const totalCoinsDisplay = document.getElementById('totalCoinsDisplay');

    // ----- images for obstacles (hole.jpg, mud.jpg, fence.jpg) -----
    const mudImg = new Image();
    const holeImg = new Image();
    const fenceImg = new Image();
    mudImg.src = "../Assets/mud.jpg";
    holeImg.src = "../Assets/hole.jpg";
    fenceImg.src = "../Assets/fence.jpg";
    let imagesReady = false;
    let imagesLoadedCount = 0;
    function checkAllImages() {
        imagesLoadedCount++;
        if (imagesLoadedCount === 3) imagesReady = true;
    }
    mudImg.onload = checkAllImages;
    holeImg.onload = checkAllImages;
    fenceImg.onload = checkAllImages;
    mudImg.onerror = () => { console.warn("mud.jpg missing, using fallback"); imagesLoadedCount++; checkAllImages(); };
    holeImg.onerror = () => { imagesLoadedCount++; checkAllImages(); };
    fenceImg.onerror = () => { imagesLoadedCount++; checkAllImages(); };

    // ----- audio & settings -----
    let audioCtx = null;
    let bgmInterval = null;
    let sfxEnabled = true;
    let bgmEnabled = true;
    let currentDifficulty = "normal";

    // ----- game state -----
    let gameActive = false;
    let paused = false;
    let animationId = null;
    let obstacles = [];
    let score = 0;
    let totalPoints = 0;
    let highScore = 0;
    let timeLeft = 32;
    let baseObstacleSpeed = 145;
    let currentSpeed = 145;
    let spawnInterval = 1.0;
    let timeSinceLastSpawn = 0;
    let lastFrameTime = 0;
    let obstaclesClearedTotal = 0;
    let survivalTimerStart = 0;

    // coin / Pawrency tracking
    let lastCoinMilestone = 0;  // last score milestone at which coins were awarded
    let coinsEarnedThisRun = 0; // coins earned in the current run

    // pet photo
    const PET_ENERGY_COST = 25; // energy cost per play
    let petImage = null;        // Image object loaded from acc.petPhoto

    // visual feedback
    let feedbackMsg = { text: "", active: false, x: 0, y: 0 };
    let redFlashActive = false;

    // canvas dimensions
    const canvasW = 500, canvasH = 600;
    canvas.width = canvasW; canvas.height = canvasH;
    const PET_Y = canvasH - 70;
    const OBSTACLE_SIZE = 46;

    // ----- stats helpers -----
    function loadStats() {
        let storedHigh = localStorage.getItem('earthSwipeHigh');
        let storedTotal = localStorage.getItem('earthTotalPoints');
        highScore = storedHigh ? parseInt(storedHigh) : 0;
        totalPoints = storedTotal ? parseInt(storedTotal) : 0;
        highScoreDisplay.innerText = highScore;
        totalCoinsDisplay.innerText = totalPoints;
    }
    function saveStats() {
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('earthSwipeHigh', highScore);
        }
        localStorage.setItem('earthTotalPoints', totalPoints);
        highScoreDisplay.innerText = highScore;
        totalCoinsDisplay.innerText = totalPoints;
    }

    // ----- PETmalu Pawrency integration -----
    function getPetmaluUser() {
        try {
            const loggedIn = JSON.parse(localStorage.getItem('loggedInUser'));
            if (!loggedIn) return null;
            const accounts = JSON.parse(localStorage.getItem('petmaluAccounts') || '[]');
            const idx = accounts.findIndex(a => a.email === loggedIn.email);
            if (idx === -1) return null;
            return { accounts, idx };
        } catch (e) { return null; }
    }
    function awardPawrency(amount) {
        const data = getPetmaluUser();
        if (!data) return;
        const { accounts, idx } = data;
        if (!accounts[idx].game) accounts[idx].game = { xp: 0, level: 1, pawer: 2, energy: 100, streak: 0, coins: 0, highScore: 0 };
        if (!accounts[idx].game.coins) accounts[idx].game.coins = 0;
        accounts[idx].game.coins += amount;
        localStorage.setItem('petmaluAccounts', JSON.stringify(accounts));
        localStorage.setItem('loggedInUser', JSON.stringify(accounts[idx]));
    }
    function getPawrencyBalance() {
        const data = getPetmaluUser();
        if (!data) return null;
        const acc = data.accounts[data.idx];
        return (acc.game && acc.game.coins) ? acc.game.coins : 0;
    }
    function loadPawrencyDisplay() {
        const bal = getPawrencyBalance();
        const energy = getPetmaluEnergy();
        const el = document.getElementById('pawrencyDisplay');
        const energyEl = document.getElementById('energyDisplay');
        if (bal !== null) {
            el.innerText = bal + ' 🪙';
            const energyPct = (energy != null ? energy : 100);
            energyEl.innerText = energyPct + '%';
            document.getElementById('pawrencyRow').style.display = 'flex';
        } else {
            document.getElementById('pawrencyRow').style.display = 'none';
        }
        // Update start-screen avatar
        refreshStartAvatar();
        // Update in-game energy HUD
        refreshEnergyHud();
    }

    // Update the circular avatar on the start screen
    function refreshStartAvatar() {
        const avatarImg = document.getElementById('startPetAvatar');
        const fallback = document.getElementById('startPetFallback');
        const data = getPetmaluUser();
        if (data) {
            const acc = data.accounts[data.idx];
            if (acc.petPhoto) {
                avatarImg.src = acc.petPhoto;
                avatarImg.style.display = 'block';
                fallback.style.display = 'none';
                return;
            }
        }
        avatarImg.style.display = 'none';
        fallback.style.display = 'flex';
    }

    // Update the in-game energy HUD pill
    function refreshEnergyHud() {
        const energy = getPetmaluEnergy();
        const hudVal = document.getElementById('energyHudValue');
        const hudBar = document.getElementById('energyHudBar');
        const hud = document.getElementById('energyHud');
        if (energy === null) { hud.style.display = 'none'; return; }
        hud.style.display = 'flex';
        hudVal.innerText = energy;
        hudBar.style.width = Math.max(0, energy) + '%';
        if (energy >= 50) hudBar.style.background = '#5D9B4A';
        else if (energy >= 25) hudBar.style.background = '#D1774C';
        else hudBar.style.background = '#CC3322';
    }

    // load pet photo from PETmalu account into an Image object
    function loadPetImage() {
        const data = getPetmaluUser();
        if (!data) { petImage = null; return; }
        const acc = data.accounts[data.idx];
        if (acc.petPhoto) {
            const img = new Image();
            img.onload = () => { petImage = img; };
            img.onerror = () => { petImage = null; };
            img.src = acc.petPhoto;
        } else {
            petImage = null;
        }
    }

    // get energy from PETmalu account
    function getPetmaluEnergy() {
        const data = getPetmaluUser();
        if (!data) return null;
        const acc = data.accounts[data.idx];
        return (acc.game && acc.game.energy != null) ? acc.game.energy : 100;
    }

    // deduct energy and save
    function deductEnergy() {
        const data = getPetmaluUser();
        if (!data) return;
        const { accounts, idx } = data;
        if (!accounts[idx].game) accounts[idx].game = { xp: 0, level: 1, pawer: 2, energy: 100, streak: 0, coins: 0, highScore: 0 };
        accounts[idx].game.energy = Math.max(0, accounts[idx].game.energy - PET_ENERGY_COST);
        localStorage.setItem('petmaluAccounts', JSON.stringify(accounts));
        localStorage.setItem('loggedInUser', JSON.stringify(accounts[idx]));
    }
    function addPoints(amt) {
        score += amt;
        totalPoints += amt;
        scoreSpan.innerText = score;

        // Award 3 Pawrency coins per 100 points milestone
        const milestone = Math.floor(score / 100);
        if (milestone > lastCoinMilestone) {
            const newMilestones = milestone - lastCoinMilestone;
            const coinsToAward = newMilestones * 3;
            coinsEarnedThisRun += coinsToAward;
            lastCoinMilestone = milestone;
            awardPawrency(coinsToAward);
            // show coin pop feedback
            showFeedback(`+${coinsToAward} 🐾 COINS!`, true);
        }

        saveStats();
    }
    function reduceTime(amount) {
        timeLeft = Math.max(0, timeLeft - amount);
        timerSpan.innerText = Math.floor(timeLeft);
        if (timeLeft <= 0 && gameActive && !paused) gameOver();
    }

    // ----- sound fx (earthy pluck) -----
    function playSfx(type) {
        if (!sfxEnabled) return;
        if (!audioCtx) {
            try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
        }
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        gain.gain.value = 0.22;
        let freq = type === 'good' ? 660 : 180;
        osc.frequency.value = freq;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.35);
        osc.stop(audioCtx.currentTime + 0.35);
    }

    // ----- background music: calm earthy rhythm -----
    function startBgm() {
        if (!bgmEnabled) return;
        if (bgmInterval) clearInterval(bgmInterval);
        if (!audioCtx) {
            try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
        }
        if (audioCtx.state === 'suspended') return;
        function playNote(freq, duration, vol = 0.07) {
            if (!bgmEnabled || !gameActive || paused) return;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.value = freq;
            gain.gain.value = vol;
            osc.start();
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
            osc.stop(audioCtx.currentTime + duration);
        }
        let pattern = 0;
        bgmInterval = setInterval(() => {
            if (!bgmEnabled || !gameActive || paused) return;
            if (audioCtx && audioCtx.state !== 'running') return;
            const notes = [392, 494, 587, 440];
            playNote(notes[pattern % notes.length], 0.28, 0.045);
            pattern++;
        }, 580);
    }
    function stopBgm() { if (bgmInterval) { clearInterval(bgmInterval); bgmInterval = null; } }
    function updateBgmState() {
        if (bgmEnabled && gameActive && !paused && audioCtx && audioCtx.state === 'running') {
            if (!bgmInterval) startBgm();
        } else if (!bgmEnabled || !gameActive || paused) {
            if (bgmInterval) { clearInterval(bgmInterval); bgmInterval = null; }
        }
    }

    // ----- feedback & flash -----
    function showFeedback(text, isGood) {
        feedbackMsg.text = text;
        feedbackMsg.active = true;
        feedbackMsg.x = canvasW / 2 - 70;
        feedbackMsg.y = canvasH / 2 - 50;
        setTimeout(() => { if (feedbackMsg.text === text) feedbackMsg.active = false; }, 550);
        if (isGood) playSfx('good');
        else playSfx('wrong');
    }
    function flashRed() {
        redFlashActive = true;
        setTimeout(() => redFlashActive = false, 180);
    }

    // ----- swipe logic -----
    function handleSwipe(direction) {
        if (!gameActive || paused) return;
        let matched = false;
        let targetIndex = -1;
        if (direction === 'up') {
            for (let i = obstacles.length - 1; i >= 0; i--) {
                if (obstacles[i].type === 'mud') { targetIndex = i; matched = true; break; }
            }
        } else if (direction === 'down') {
            for (let i = obstacles.length - 1; i >= 0; i--) {
                if (obstacles[i].type === 'hole') { targetIndex = i; matched = true; break; }
            }
        } else if (direction === 'right') {
            for (let i = obstacles.length - 1; i >= 0; i--) {
                if (obstacles[i].type === 'fence') { targetIndex = i; matched = true; break; }
            }
        }
        if (matched && targetIndex !== -1) {
            obstacles.splice(targetIndex, 1);
            addPoints(10);
            obstaclesClearedTotal++;
            showFeedback("✨ GOOD! ✨", true);
        } else {
            reduceTime(2);
            showFeedback("🌑 WRONG SWIPE!", false);
            flashRed();
        }
    }

    // spawn obstacle
    function spawnObstacle() {
        if (!gameActive || paused) return;
        const types = ['mud', 'hole', 'fence'];
        const rand = Math.floor(Math.random() * 3);
        const x = 25 + Math.random() * (canvasW - OBSTACLE_SIZE - 25);
        obstacles.push({
            type: types[rand],
            x: x,
            y: 15,
            width: OBSTACLE_SIZE,
            height: OBSTACLE_SIZE
        });
    }

    function updateObstacles(deltaSec) {
        if (!gameActive) return;
        for (let i = 0; i < obstacles.length; i++) {
            obstacles[i].y += currentSpeed * deltaSec;
        }
        for (let i = obstacles.length - 1; i >= 0; i--) {
            if (obstacles[i].y + OBSTACLE_SIZE >= PET_Y - 8) {
                obstacles.splice(i, 1);
                reduceTime(2);
                showFeedback("❌ MISSED!", false);
                flashRed();
            }
        }
    }

    function updateDifficultyByScore() {
        let factor = 1 + Math.floor(score / 210);
        if (factor > 2.25) factor = 2.25;
        currentSpeed = Math.min(baseObstacleSpeed + (score / 85) * 7, 410);
        let newSpawn = Math.max(0.44, 1.08 - (score / 520));
        spawnInterval = newSpawn;
    }

    // ----- drawing with earthy palette & obstacle images-----
    function drawGame() {
        ctx.clearRect(0, 0, canvasW, canvasH);
        // ground layer - olive & soft earth
        ctx.fillStyle = "#36401A";
        ctx.fillRect(0, PET_Y - 18, canvasW, 90);
        ctx.fillStyle = "#4A5A2A";
        for (let i = 0; i < 14; i++) ctx.fillRect(i * 42, PET_Y - 12, 22, 12);
        ctx.fillStyle = "#DBC7B6";
        ctx.font = "bold 12px monospace";

        // draw obstacles with images
        for (let obs of obstacles) {
            let img = null;
            if (obs.type === 'mud') img = mudImg;
            else if (obs.type === 'hole') img = holeImg;
            else if (obs.type === 'fence') img = fenceImg;

            if (img && img.complete && img.naturalWidth > 0) {
                ctx.drawImage(img, obs.x, obs.y, OBSTACLE_SIZE, OBSTACLE_SIZE);
            } else {
                // fallback colored emblem
                ctx.fillStyle = "#B65B2F";
                ctx.fillRect(obs.x, obs.y, OBSTACLE_SIZE, OBSTACLE_SIZE);
                ctx.fillStyle = "#F4E5D5";
                ctx.fillText(obs.type[0], obs.x + 18, obs.y + 28);
            }
            // small swipe hint (elegant)
            ctx.font = "bold 16px 'Segoe UI'";
            ctx.fillStyle = "#E1AF93";
            ctx.shadowBlur = 2;
            if (obs.type === 'mud') ctx.fillText("⬆️", obs.x + 12, obs.y - 5);
            else if (obs.type === 'hole') ctx.fillText("⬇️", obs.x + 12, obs.y - 5);
            else ctx.fillText("➡️", obs.x + 12, obs.y - 5);
            ctx.shadowBlur = 0;
        }

        // pet (loyal companion) — circular avatar from profile photo
        const petR = 32; // avatar radius
        const petCX = canvasW / 2;
        const petCY = PET_Y - petR + 8;

        // Animated walking legs (always shown beneath avatar)
        const legSwing = Math.sin(Date.now() * 0.022) * 7;
        ctx.fillStyle = "#574537";
        ctx.beginPath(); ctx.roundRect(petCX - 20 + legSwing, PET_Y, 13, 16, 4); ctx.fill();
        ctx.beginPath(); ctx.roundRect(petCX + 7 - legSwing, PET_Y, 13, 16, 4); ctx.fill();

        if (petImage && petImage.complete && petImage.naturalWidth > 0) {
            // Draw circular clipped pet photo
            ctx.save();
            ctx.beginPath();
            ctx.arc(petCX, petCY, petR, 0, 2 * Math.PI);
            ctx.clip();
            ctx.drawImage(petImage, petCX - petR, petCY - petR, petR * 2, petR * 2);
            ctx.restore();
            // Ring border
            ctx.beginPath();
            ctx.arc(petCX, petCY, petR, 0, 2 * Math.PI);
            ctx.strokeStyle = "#E1AF93";
            ctx.lineWidth = 3.5;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(petCX, petCY, petR + 3.5, 0, 2 * Math.PI);
            ctx.strokeStyle = "#B65B2F";
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            // Fallback drawn pet (earthy style)
            ctx.fillStyle = "#D1774C";
            ctx.beginPath(); ctx.ellipse(petCX, petCY, 26, 30, 0, 0, 2 * Math.PI); ctx.fill();
            ctx.fillStyle = "#B65B2F";
            ctx.fillRect(petCX - 28, petCY + 2, 56, 20);
            ctx.fillStyle = "#F4E5D5";
            ctx.beginPath(); ctx.arc(petCX - 10, petCY - 16, 6, 0, 2 * Math.PI); ctx.fill();
            ctx.beginPath(); ctx.arc(petCX + 10, petCY - 16, 6, 0, 2 * Math.PI); ctx.fill();
            ctx.fillStyle = "#361D0F";
            ctx.beginPath(); ctx.arc(petCX - 12, petCY - 18, 3, 0, 2 * Math.PI); ctx.fill();
            ctx.beginPath(); ctx.arc(petCX + 8, petCY - 18, 3, 0, 2 * Math.PI); ctx.fill();
            ctx.fillStyle = "#E1AF93";
            ctx.fillRect(petCX - 5, petCY - 8, 10, 7);
            // Circle outline on fallback too
            ctx.beginPath();
            ctx.arc(petCX, petCY, petR, 0, 2 * Math.PI);
            ctx.strokeStyle = "#E1AF93";
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // floating feedback
        if (feedbackMsg.active) {
            ctx.font = "bold 32px 'Segoe UI'";
            ctx.fillStyle = feedbackMsg.text.includes("GOOD") ? "#F4E5D5" : "#FFB28B";
            ctx.shadowBlur = 4;
            ctx.fillText(feedbackMsg.text, feedbackMsg.x, feedbackMsg.y);
            ctx.shadowBlur = 0;
        }
        if (redFlashActive) {
            ctx.fillStyle = "rgba(210, 70, 40, 0.6)";
            ctx.fillRect(0, 0, canvasW, canvasH);
        }
    }

    // ----- game loop -----
    let lastFrameRequest = 0;
    function gameUpdate(nowMs) {
        if (!gameActive || paused) {
            drawGame();
            requestAnimationFrame(gameUpdate);
            return;
        }
        let delta = Math.min(0.033, (nowMs - lastFrameTime) / 1000);
        if (delta > 0.008) {
            // timer reduction
            if (lastFrameTime !== 0 && delta > 0) {
                let newTime = timeLeft - delta;
                if (newTime < 0) newTime = 0;
                if (timeLeft > 0 && newTime <= 0) gameOver();
                timeLeft = newTime;
                timerSpan.innerText = Math.floor(timeLeft);
            }
            updateObstacles(delta);
            timeSinceLastSpawn += delta;
            while (timeSinceLastSpawn >= spawnInterval) {
                if (gameActive && !paused) spawnObstacle();
                timeSinceLastSpawn -= spawnInterval;
                updateDifficultyByScore();
            }
            updateDifficultyByScore();
            drawGame();
        } else {
            drawGame();
        }
        lastFrameTime = nowMs;
        requestAnimationFrame(gameUpdate);
    }

    function gameOver() {
        if (!gameActive) return;
        gameActive = false;
        paused = false;
        if (animationId) cancelAnimationFrame(animationId);
        stopBgm();
        const survivalSec = Math.floor(survivalTimerStart - timeLeft);
        document.getElementById('finalScoreSpan').innerText = score;
        document.getElementById('finalHighSpan').innerText = Math.max(highScore, score);
        document.getElementById('clearedCountSpan').innerText = obstaclesClearedTotal;
        document.getElementById('survivalTimeSpan').innerText = survivalSec >= 0 ? survivalSec : 0;
        document.getElementById('coinsEarnedSpan').innerText = coinsEarnedThisRun;
        saveStats();
        loadPawrencyDisplay();
        gameOverScreen.classList.remove('hide');
    }

    function startGame(keepSettings = true, isRetry = false) {
        // Energy check — only if a PETmalu user is logged in
        const energy = getPetmaluEnergy();
        if (energy !== null && energy < PET_ENERGY_COST) {
            // Show styled energy warning screen instead of alert
            showEnergyWarning(energy);
            return;
        }
        // Deduct energy before starting
        if (energy !== null) { deductEnergy(); refreshEnergyHud(); }

        // Load pet image fresh each run
        loadPetImage();

        if (animationId) cancelAnimationFrame(animationId);
        stopBgm();
        gameActive = true;
        paused = false;
        obstacles = [];
        score = 0;
        obstaclesClearedTotal = 0;
        lastCoinMilestone = 0;
        coinsEarnedThisRun = 0;
        scoreSpan.innerText = "0";
        // difficulty
        if (currentDifficulty === 'easy') { timeLeft = 46; baseObstacleSpeed = 110; }
        else if (currentDifficulty === 'normal') { timeLeft = 33; baseObstacleSpeed = 145; }
        else { timeLeft = 23; baseObstacleSpeed = 182; }
        currentSpeed = baseObstacleSpeed;
        spawnInterval = 1.0;
        timeSinceLastSpawn = 0;
        timerSpan.innerText = Math.floor(timeLeft);
        survivalTimerStart = timeLeft;
        lastFrameTime = 0;
        updateDifficultyByScore();
        animationId = requestAnimationFrame(gameUpdate);
        if (bgmEnabled && audioCtx) {
            if (audioCtx.state === 'suspended') audioCtx.resume().then(() => startBgm());
            else startBgm();
        } else if (bgmEnabled) startBgm();
        updateBgmState();
    }

    function showEnergyWarning(energy) {
        hideAllScreens();
        const pct = Math.max(0, energy);
        document.getElementById('energyWarnValue').innerText = pct;
        document.getElementById('energyWarnBar').style.width = pct + '%';
        energyWarningScreen.classList.remove('hide');
    }

    function restartGame() { startGame(); hideAllScreens(); }
    function backToMain() {
        gameActive = false; paused = false;
        if (animationId) cancelAnimationFrame(animationId);
        stopBgm();
        hideAllScreens();
        startScreen.classList.remove('hide');
        loadStats();
        loadPawrencyDisplay();
    }
    function hideAllScreens() {
        startScreen.classList.add('hide'); howScreen.classList.add('hide');
        settingsScreen.classList.add('hide'); pauseMenu.classList.add('hide');
        gameOverScreen.classList.add('hide'); energyWarningScreen.classList.add('hide');
    }

    // ----- swipe detection -----
    let touchStart = null;
    function onSwipeStart(e) { e.preventDefault(); const p = getEventPoint(e); touchStart = p; }
    function onSwipeEnd(e) {
        if (!touchStart || !gameActive || paused) { touchStart = null; return; }
        e.preventDefault();
        const end = getEventPoint(e);
        const dx = end.x - touchStart.x, dy = end.y - touchStart.y;
        if (Math.abs(dx) < 18 && Math.abs(dy) < 18) { touchStart = null; return; }
        let dir = null;
        if (Math.abs(dx) > Math.abs(dy)) dir = dx > 0 ? 'right' : null;
        else dir = dy < 0 ? 'up' : (dy > 0 ? 'down' : null);
        if (dir) handleSwipe(dir);
        touchStart = null;
    }
    function getEventPoint(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        let clientX, clientY;
        if (e.touches) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
        else { clientX = e.clientX; clientY = e.clientY; }
        let x = (clientX - rect.left) * scaleX;
        let y = (clientY - rect.top) * scaleY;
        return { x: Math.min(canvasW, Math.max(0, x)), y: Math.min(canvasH, Math.max(0, y)) };
    }
    canvas.addEventListener('touchstart', onSwipeStart, { passive: false });
    canvas.addEventListener('touchend', onSwipeEnd);
    canvas.addEventListener('mousedown', onSwipeStart);
    window.addEventListener('mouseup', onSwipeEnd);

    // ----- buttons wiring -----
    document.getElementById('playBtnMain').onclick = () => { hideAllScreens(); startGame(); };
    document.getElementById('howToBtn').onclick = () => { startScreen.classList.add('hide'); howScreen.classList.remove('hide'); };
    document.getElementById('settingsBtn').onclick = () => { startScreen.classList.add('hide'); settingsScreen.classList.remove('hide'); };
    document.getElementById('backFromHow').onclick = () => { howScreen.classList.add('hide'); startScreen.classList.remove('hide'); };
    document.getElementById('backFromSettings').onclick = () => { settingsScreen.classList.add('hide'); startScreen.classList.remove('hide'); };
    document.getElementById('energyWarnBack').onclick = () => { energyWarningScreen.classList.add('hide'); startScreen.classList.remove('hide'); };
    document.getElementById('energyWarnTasks').onclick = () => { window.location.href = '../WebAdventure/dailytask.html'; };
    document.getElementById('saveSettingsBtn').onclick = () => {
        sfxEnabled = document.getElementById('sfxToggle').checked;
        bgmEnabled = document.getElementById('bgmToggle').checked;
        currentDifficulty = document.getElementById('difficultySelect').value;
        if (!bgmEnabled && bgmInterval) stopBgm();
        else if (bgmEnabled && gameActive && !paused) startBgm();
        settingsScreen.classList.add('hide'); startScreen.classList.remove('hide');
    };
    document.getElementById('pauseButton').onclick = () => { if (gameActive && !paused) { paused = true; stopBgm(); pauseMenu.classList.remove('hide'); } };
    document.getElementById('resumeBtn').onclick = () => { paused = false; pauseMenu.classList.add('hide'); updateBgmState(); if (bgmEnabled && gameActive) startBgm(); };
    document.getElementById('restartBtn').onclick = () => { pauseMenu.classList.add('hide'); restartGame(); };
    document.getElementById('mainMenuFromPause').onclick = () => { pauseMenu.classList.add('hide'); backToMain(); };
    document.getElementById('playAgainBtn').onclick = () => { gameOverScreen.classList.add('hide'); startGame(true, true); };
    document.getElementById('goCoupawsBtn').onclick = () => { window.location.href = '../WebCoupons/coupons.html'; };
    document.getElementById('mainMenuFromGameOver').onclick = () => { gameOverScreen.classList.add('hide'); backToMain(); };

    // animated pet on start screen fallback (only visible when no pet photo)
    function animateRunningPet() {
        const runCanvas = document.getElementById('runningPetCanvas');
        if (!runCanvas) return;
        const runCtxPet = runCanvas.getContext('2d');
        if (!runCtxPet) return;
        runCtxPet.clearRect(0, 0, 80, 80);
        runCtxPet.fillStyle = "#D1774C";
        runCtxPet.beginPath(); runCtxPet.ellipse(40, 34, 18, 20, 0, 0, 2 * Math.PI); runCtxPet.fill();
        runCtxPet.fillStyle = "#B65B2F";
        runCtxPet.fillRect(24, 36, 32, 14);
        let leg = Math.sin(Date.now() * 0.022) * 5;
        runCtxPet.fillStyle = "#574537";
        runCtxPet.fillRect(26 + leg, 48, 7, 10); runCtxPet.fillRect(46 - leg, 48, 7, 10);
        runCtxPet.fillStyle = "#F4E5D5";
        runCtxPet.fillRect(33, 22, 4, 4); runCtxPet.fillRect(42, 22, 4, 4);
        requestAnimationFrame(animateRunningPet);
    }
    animateRunningPet();
    loadStats();
    loadPawrencyDisplay();   // also calls refreshStartAvatar() + refreshEnergyHud()
    startScreen.classList.remove('hide');

    // resume audio on first tap
    window.addEventListener('click', () => {
        if (!audioCtx) { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    }, { once: true });
})();
