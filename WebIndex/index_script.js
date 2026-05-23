// ═══════════════════════════════════════
// AUTHENTICATION VISIBILITY UTILITY
// ═══════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    const navAuthBtn = document.getElementById('navAuthBtn');
    
    // Check if a valid session profile exists in the browser's storage cache
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (loggedInUser && navAuthBtn) {
        // 1. Swap the display label text cleanly to match your RPG theme
        navAuthBtn.textContent = "Play";
        
        // 2. Change its visual styling or add an optional unique class if needed
        navAuthBtn.classList.add('authenticated-play');

        // 3. Intercept the normal click action and reroute them instantly to game.html
        navAuthBtn.addEventListener('click', (event) => {
            event.stopPropagation(); // Stops the default login modal script from firing
            window.location.href = '../WebAdventure/dailytask.html'; // Adjust path if it lives in a subfolder like /WebAdventure/game.html
        });
    } else {
        // If NO one is logged in, wire it up to open the native login popup modal normally
        if (navAuthBtn) {
            navAuthBtn.addEventListener('click', openModal);
        }
    }
});

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
const backTopLogo = document.getElementById('logo-backtop');
if (backTopLogo) {
    backTopLogo.addEventListener('click', (event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// 4. --- CARD SWITCHER LOGIC ---
const petData = [
    { name: "NEMU", title: "JUSTICEMAXXING", level: "75%", pawer: "70 PAWS", energy: "100%", img: "../Assets/gomcat.webp" },
    { name: "LUNA", title: "THE SWIFT SCOUT", level: "40%", pawer: "35 PAWS", energy: "80%", img: "../Assets/Elgato.webp" },
    { name: "COCO", title: "GENTLE GIANT", level: "95%", pawer: "15 PAWS", energy: "50%", img: "../Assets/grrr.webp" },
    { name: "SHONGET", title: "LOREM IPSUM DOLOR", level: "15%", pawer: "10 PAWS", energy: "10%", img: "../Assets/wilsonlosiento.webp" }
];

let currentPetIndex = 0;

function rotatePetCard() {
    const card = document.getElementById('petCardContent');
    if (!card) return;

    card.classList.add('fade-out');

    setTimeout(() => {
        currentPetIndex = (currentPetIndex + 1) % petData.length;
        const nextPet = petData[currentPetIndex];

        const nameEl = document.querySelector('.pet-name-vertical');
        const titleEl = document.querySelector('.pet-title');
        const pawerEl = document.getElementById('cardPawer');
        const energyEl = document.getElementById('cardEnergy');
        const imgEl = document.getElementById('cardPetImg');
        const xpEl = document.querySelector('.xp-progress');

        if (nameEl) nameEl.innerText = nextPet.name;
        if (titleEl) titleEl.innerText = nextPet.title;
        if (pawerEl) pawerEl.innerText = nextPet.pawer;
        if (energyEl) energyEl.innerText = nextPet.energy;
        if (imgEl) imgEl.src = nextPet.img;
        if (xpEl) xpEl.style.width = nextPet.level;

        card.classList.remove('fade-out');
    }, 200);
}

setInterval(rotatePetCard, 4000);

// ═══════════════════════════════════════
// 5. MODAL DISPLAY OPEN/CLOSE UTILITIES
// ═══════════════════════════════════════
const authModal = document.getElementById('authModal');
const btnLoginNav = document.querySelector('.btn-login'); // Nav bar button
const btnJourney = document.querySelector('.btn-journey'); // Main CTA button
const closeModalBtn = document.getElementById('closeModalBtn');

const loginView = document.getElementById('loginView');
const registerView = document.getElementById('registerView');
const switchToRegister = document.getElementById('switchToRegister');
const switchToLogin = document.getElementById('switchToLogin');

// Open Utility: Accepts a dynamic starting view string ('login' or 'register')
function openModal(defaultView = 'login') {
    if (!authModal) return;
    
    authModal.classList.add('active');
    
    if (defaultView === 'register') {
        showRegisterView();
    } else {
        showLoginView();
    }
}

function closeModal() {
    if (authModal) authModal.classList.remove('active');
}

function showRegisterView(e) {
    if (e) e.preventDefault();
    if (loginView && registerView) {
        loginView.classList.add('hidden');
        registerView.classList.remove('hidden');
    }
}

function showLoginView(e) {
    if (e) e.preventDefault();
    if (loginView && registerView) {
        registerView.classList.add('hidden');
        loginView.classList.remove('hidden');
    }
}

// FIXED: Consolidated Nav Bar Log In / Play Listener
if (btnLoginNav) {
    btnLoginNav.addEventListener('click', (e) => {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
            window.location.href = '../WebAdventure/dailytask.html';
        } else {
            openModal('login');
        }
    });
}

// FIXED: Consolidated "Start the Journey" Listener (Prevents the split-second pop-up flicker)
if (btnJourney) {
    btnJourney.addEventListener('click', (e) => {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
            window.location.href = '../WebAdventure/dailytask.html';
        } else {
            openModal('register'); // Directly flags registration without triggering login view
        }
    });
}

// Close Triggers
if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

// Toggle UI Switch Links
if (switchToRegister) switchToRegister.addEventListener('click', showRegisterView);
if (switchToLogin) switchToLogin.addEventListener('click', showLoginView);

// Dismiss modal if mask backdrop area clicked directly
window.addEventListener('click', (e) => {
    if (e.target === authModal) closeModal();
});


// ═══════════════════════════════════════
// 6. FORM VALIDATION & AUTHENTICATION LOGIC
// ═══════════════════════════════════════
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');

// Error Display helper functions
function showError(inputElement, errorMessage) {
    const group = inputElement.closest('.input-group');
    if (!group) return;
    let errorSpan = group.querySelector('.error-msg');
    if (!errorSpan) {
        errorSpan = document.createElement('span');
        errorSpan.className = 'error-msg';
        errorSpan.style.color = '#c0392b';
        errorSpan.style.fontSize = '0.8rem';
        errorSpan.style.marginTop = '4px';
        group.appendChild(errorSpan);
    }
    errorSpan.textContent = errorMessage;
    if (errorMessage) {
        inputElement.classList.add('input-error');
    } else {
        inputElement.classList.remove('input-error');
    }
}

function clearAllErrors() {
    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
    document.querySelectorAll('input').forEach(el => el.classList.remove('input-error'));
    const loginError = document.getElementById('loginFormError');
    const registerError = document.getElementById('registerFormError');
    if (loginError) loginError.textContent = '';
    if (registerError) registerError.textContent = '';
}

// --- REGISTER FORM SUBMISSION HANDLER ---
if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        clearAllErrors();

        const emailInput = document.getElementById('regEmail');
        const passInput = document.getElementById('regPass');
        const confirmInput = document.getElementById('regConfirm');
        const agreeTerms = document.getElementById('agreeTerms');
        const formError = document.getElementById('registerFormError');

        let hasError = false;

        if (!emailInput.value.trim()) {
            showError(emailInput, 'Email is required.');
            hasError = true;
        }
        if (!passInput.value) {
            showError(passInput, 'Password is required.');
            hasError = true;
        } else if (passInput.value.length < 6) {
            showError(passInput, 'Password must be at least 6 characters.');
            hasError = true;
        }
        if (confirmInput.value !== passInput.value) {
            showError(confirmInput, 'Passwords do not match.');
            hasError = true;
        }
        if (agreeTerms && !agreeTerms.checked) {
            if (formError) {
                formError.style.color = '#c0392b';
                formError.textContent = 'You must agree to the Terms of Service.';
            }
            hasError = true;
        }

        if (hasError) return;

        // Fetch local database accounts array
        const accounts = JSON.parse(localStorage.getItem('petmaluAccounts') || '[]');

        // Check if email already registered
        const emailExists = accounts.some(acc => acc.email === emailInput.value.trim());
        if (emailExists) {
            showError(emailInput, 'Email is already registered!');
            return;
        }

        // Generate temporary clean username from email string prefix
        const generatedUsername = emailInput.value.split('@')[0];

        // Package new account details
        const newAccount = {
            email: emailInput.value.trim(),
            username: generatedUsername,
            password: passInput.value,
            petName: '',
            petTitle: '',
            petPhoto: ''
        };

        // Add to database
        accounts.push(newAccount);
        localStorage.setItem('petmaluAccounts', JSON.stringify(accounts));

        // UPDATED: Set this new account as the active session right away!
        localStorage.setItem('loggedInUser', JSON.stringify(newAccount));

        //alert(`wowzerz`);
        registerForm.reset();
        closeModal();

        // Reroute them straight to the profile setup configuration dashboard
        window.location.href = '../WebSettings/setting.html'; 
    });
}

// --- LOGIN FORM SUBMISSION HANDLER ---
if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        clearAllErrors();

        const userInput = document.getElementById('loginUser');
        const passInput = document.getElementById('loginPass');
        const formError = document.getElementById('loginFormError');

        let hasError = false;

        if (userInput.value.trim() === '') {
            showError(userInput, 'Please enter your email/username.');
            hasError = true;
        }
        if (passInput.value === '') {
            showError(passInput, 'Please enter your password.');
            hasError = true;
        }

        if (hasError) return;

        const accounts = JSON.parse(localStorage.getItem('petmaluAccounts') || '[]');

        const matched = accounts.find(acc =>
            acc.email === userInput.value.trim() ||
            acc.username === userInput.value.trim()
        );

        if (!matched) {
            if (formError) {
                formError.style.color = '#c0392b';
                formError.textContent = 'No account found with that details!';
            }
            return;
        }

        if (matched.password !== passInput.value) {
            if (formError) {
                formError.style.color = '#c0392b';
                formError.textContent = 'Wrong password/username. Try again!';
            }
            return;
        }

        // Save active session token data
        localStorage.setItem('loggedInUser', JSON.stringify(matched));
        
        //alert(`Yo, ${matched.username || 'Adventurer'}`); <-- For debugging
        loginForm.reset();
        closeModal();
        
        window.location.href = '../WebAdventure/dailytask.html';
    });
}