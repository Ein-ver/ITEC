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
    { name: "NEMU",    title: "JUSTICEMAXXING",    level: "75%", pawer: "70 PAWS", energy: "100%", img: "/Assets/gomcat.png" },
    { name: "LUNA",    title: "THE SWIFT SCOUT",   level: "40%", pawer: "35 PAWS", energy: "80%",  img: "/Assets/elgato.png" },
    { name: "COCO",    title: "GENTLE GIANT",       level: "95%", pawer: "15 PAWS", energy: "50%",  img: "/Assets/grrr.png" },
    { name: "SHONGET", title: "LOREM IPSUM DOLOR",  level: "15%", pawer: "10 PAWS", energy: "10%",  img: "/Assets/wilsonlosiento.png" }
];

let currentPetIndex = 0;

function rotatePetCard() {
    const card = document.getElementById('petCardContent');
    if (!card) return;

    card.classList.add('fade-out');

    setTimeout(() => {
        currentPetIndex = (currentPetIndex + 1) % petData.length;
        const nextPet = petData[currentPetIndex];

        const nameEl  = document.querySelector('.pet-name-vertical');
        const titleEl = document.querySelector('.pet-title');
        const pawerEl = document.getElementById('cardPawer');
        const energyEl= document.getElementById('cardEnergy');
        const imgEl   = document.getElementById('cardPetImg');
        const xpEl    = document.querySelector('.xp-progress');

        if (nameEl)   nameEl.innerText       = nextPet.name;
        if (titleEl)  titleEl.innerText      = nextPet.title;
        if (pawerEl)  pawerEl.innerText      = nextPet.pawer;
        if (energyEl) energyEl.innerText     = nextPet.energy;
        if (imgEl)    imgEl.src              = nextPet.img;
        if (xpEl)     xpEl.style.width       = nextPet.level;

        card.classList.remove('fade-out');
    }, 200);
}

setInterval(rotatePetCard, 4000);

// 5. --- MODAL OPEN/CLOSE ---
const authModal       = document.getElementById('authModal');
const btnLoginNav     = document.querySelector('.btn-login');
const btnJourney      = document.querySelector('.btn-journey');
const closeModalBtn   = document.getElementById('closeModalBtn');
const loginView       = document.getElementById('loginView');
const registerView    = document.getElementById('registerView');
const switchToRegister= document.getElementById('switchToRegister');
const switchToLogin   = document.getElementById('switchToLogin');

function openModal() {
    authModal.classList.add('active');
    showLoginView();
    clearErrors(); // clear any leftover errors when reopening
}

function closeModal() {
    authModal.classList.remove('active');
    clearErrors();
}

function showRegisterView(e) {
    if (e) e.preventDefault();
    loginView.classList.add('hidden');
    registerView.classList.remove('hidden');
    clearErrors();
}

function showLoginView(e) {
    if (e) e.preventDefault();
    registerView.classList.add('hidden');
    loginView.classList.remove('hidden');
    clearErrors();
}

if (btnLoginNav)      btnLoginNav.addEventListener('click', openModal);
if (btnJourney)       btnJourney.addEventListener('click', openModal);
if (closeModalBtn)    closeModalBtn.addEventListener('click', closeModal);
if (switchToRegister) switchToRegister.addEventListener('click', showRegisterView);
if (switchToLogin)    switchToLogin.addEventListener('click', showLoginView);

window.addEventListener('click', (e) => {
    if (e.target === authModal) closeModal();
});

// 6. --- INLINE ERROR HELPERS ---

// Shows a red error message below an input and turns the border red
function showError(inputEl, message) {
    inputEl.classList.add('input-error');

    // Check if an error message already exists below this input
    let errMsg = inputEl.parentElement.querySelector('.error-msg');
    if (!errMsg) {
        errMsg = document.createElement('span');
        errMsg.classList.add('error-msg');
        inputEl.parentElement.appendChild(errMsg);
    }
    errMsg.textContent = message;
}

// Clears error state from one input
function clearError(inputEl) {
    inputEl.classList.remove('input-error');
    const errMsg = inputEl.parentElement.querySelector('.error-msg');
    if (errMsg) errMsg.textContent = '';
}

// Clears ALL errors in the modal
function clearErrors() {
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
}

// Clear error on input when user starts typing again
document.querySelectorAll('.input-group input').forEach(input => {
    input.addEventListener('input', () => clearError(input));
});

// 7. --- REGISTER LOGIC ---
const registerForm = document.getElementById('registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        clearErrors();

        const usernameInput  = document.getElementById('regUser');
        const passwordInput  = document.getElementById('regPass');
        const confirmInput   = document.getElementById('regConfirm');
        const agreeTerms     = document.getElementById('agreeTerms');
        const formError      = document.getElementById('registerFormError');

        let hasError = false;

        // Validate username
        if (usernameInput.value.trim() === '') {
            showError(usernameInput, 'Username or email is required.');
            hasError = true;
        }

        // Validate password length
        if (passwordInput.value.length < 6) {
            showError(passwordInput, 'Password must be at least 6 characters.');
            hasError = true;
        }

        // Validate confirm password matches
        if (confirmInput.value !== passwordInput.value) {
            showError(confirmInput, 'Passwords do not match.');
            hasError = true;
        }

        // Validate terms checkbox
        if (!agreeTerms.checked) {
            if (formError) formError.textContent = 'You must agree to the Terms of Service.';
            hasError = true;
        }

        if (hasError) return;

        // Save to localStorage
        const userAccountData = {
            username: usernameInput.value.trim(),
            password: passwordInput.value
        };
        localStorage.setItem('registeredUser', JSON.stringify(userAccountData));

        registerForm.reset();
        showLoginView();

        // Show success message on login view
        const loginFormError = document.getElementById('loginFormError');
        if (loginFormError) {
            loginFormError.style.color = '#4a7c4e';
            loginFormError.textContent = '✔ Account created! You can now log in.';
        }
    });
}

// 8. --- LOGIN LOGIC ---
const loginForm = document.getElementById('loginForm');

// REGISTER
if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        clearErrors();

        const emailInput   = document.getElementById('regEmail');
        const passwordInput= document.getElementById('regPass');
        const confirmInput = document.getElementById('regConfirm');
        const agreeTerms   = document.getElementById('agreeTerms');
        const formError    = document.getElementById('registerFormError');

        let hasError = false;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
            showError(emailInput, 'Please enter a valid email address.');
            hasError = true;
        }

        if (passwordInput.value.length < 6) {
            showError(passwordInput, 'Password must be at least 6 characters.');
            hasError = true;
        }

        if (confirmInput.value !== passwordInput.value) {
            showError(confirmInput, 'Passwords do not match.');
            hasError = true;
        }

        if (!agreeTerms.checked) {
            if (formError) {
                formError.style.color = '#c0392b';
                formError.textContent = 'You must agree to the Terms of Service.';
            }
            hasError = true;
        }

        if (hasError) return;

        // Save email + password, username is empty until profile setup
        const userAccountData = {
            email: emailInput.value.trim(),
            password: passwordInput.value,
            username: ''   // will be set on profile page later
        };
        localStorage.setItem('registeredUser', JSON.stringify(userAccountData));

        registerForm.reset();
        showLoginView();

        const loginFormError = document.getElementById('loginFormError');
        if (loginFormError) {
            loginFormError.style.color = '#4a7c4e';
            loginFormError.textContent = '✔ Account created! You can now log in.';
        }
    });
}

// LOGIN
if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        clearErrors();

        const userInput = document.getElementById('loginUser');
        const passInput = document.getElementById('loginPass');
        const formError = document.getElementById('loginFormError');

        let hasError = false;

        if (userInput.value.trim() === '') {
            showError(userInput, 'Please enter your email.');
            hasError = true;
        }

        if (passInput.value === '') {
            showError(passInput, 'Please enter your password.');
            hasError = true;
        }

        if (hasError) return;

        const storedUserData = localStorage.getItem('registeredUser');

        if (storedUserData) {
            const parsedAccount = JSON.parse(storedUserData);

            // Login only via email now
            if (userInput.value.trim() === parsedAccount.email && 
                passInput.value === parsedAccount.password) {
                closeModal();
                // window.location.href = "/profile.html"; // redirect to profile later
            } else {
                showError(userInput, '');
                showError(passInput, '');
                if (formError) {
                    formError.style.color = '#c0392b';
                    formError.textContent = 'Wrong email or password. Try again!';
                }
            }
        } else {
            if (formError) {
                formError.style.color = '#c0392b';
                formError.textContent = 'No account found. Register first!';
            }
        }
    });
}