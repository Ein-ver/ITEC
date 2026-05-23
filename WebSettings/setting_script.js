// ═══════════════════════════════════════
// 1. LOAD LOGGED IN USER DATA
// ═══════════════════════════════════════
const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));

// If no one is logged in, redirect back to home
if (!currentUser) {
    window.location.href = '../WebIndex/index.html';
}

// Pre-fill email (read-only) and username if already set
const profileEmailEl = document.getElementById('profileEmail');
const profileUsernameEl = document.getElementById('profileUsername');
const petNameEl = document.getElementById('petName');
const petTitleEl = document.getElementById('petTitle');

if (profileEmailEl) profileEmailEl.value = currentUser.email || '';
if (profileUsernameEl) profileUsernameEl.value = currentUser.username || '';
if (petNameEl) petNameEl.value = currentUser.petName || '';
if (petTitleEl) petTitleEl.value = currentUser.petTitle || '';

// Pre-fill pet card preview with saved data
updatePreviewName(currentUser.petName || 'PET NAME');
updatePreviewTitle(currentUser.petTitle || 'YOUR PET TITLE');

// Pre-fill pet image if saved
if (currentUser.petPhoto) {
    showPetImage(currentUser.petPhoto);
}

// After pre-filling email and username...
if (profileEmailEl) {
    profileEmailEl.value = currentUser.email || '';

    // Only make email editable if username is already set
    if (currentUser.username && currentUser.username.trim() !== '') {
        profileEmailEl.removeAttribute('readonly');
    }
}

// ═══════════════════════════════════════
// 2. SIDEBAR SWITCHING
// ═══════════════════════════════════════
const sidebarBtns = document.querySelectorAll('.sidebar-btn');
const sectionPanels = document.querySelectorAll('.section-panel');

sidebarBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.section;

        // Toggle active button
        sidebarBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Toggle active section
        sectionPanels.forEach(panel => panel.classList.remove('active'));
        document.getElementById(`section-${target}`).classList.add('active');
    });
});

// ═══════════════════════════════════════
// 3. LIVE PET CARD PREVIEW
// ═══════════════════════════════════════
function updatePreviewName(val) {
    const el = document.getElementById('previewPetName');
    if (el) el.textContent = val.trim() || 'PET NAME';
}

function updatePreviewTitle(val) {
    const el = document.getElementById('previewPetTitle');
    if (el) el.textContent = val.trim() || 'YOUR PET TITLE';
}

function showPetImage(src) {
    const placeholder = document.getElementById('petImagePlaceholder');
    const img = document.getElementById('previewPetImg');
    if (placeholder) placeholder.style.display = 'none';
    if (img) { img.src = src; img.style.display = 'block'; }
}

// Listen for live typing
if (petNameEl) petNameEl.addEventListener('input', () => updatePreviewName(petNameEl.value));
if (petTitleEl) petTitleEl.addEventListener('input', () => updatePreviewTitle(petTitleEl.value));

// ═══════════════════════════════════════
// 4. PET PHOTO UPLOAD
// ═══════════════════════════════════════
const btnUploadPet = document.getElementById('btnUploadPet');
const petPhotoInput = document.getElementById('petPhotoInput');

if (btnUploadPet) {
    btnUploadPet.addEventListener('click', () => petPhotoInput.click());
}

if (petPhotoInput) {
    petPhotoInput.addEventListener('change', () => {
        const file = petPhotoInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            showPetImage(e.target.result);
            // Temporarily store in memory for saving
            petPhotoInput.dataset.base64 = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// ═══════════════════════════════════════
// 5. SAVE CHANGES
// ═══════════════════════════════════════
const btnSave = document.getElementById('btnSave');

if (btnSave) {
    btnSave.addEventListener('click', () => {
        // Get all accounts
        const accounts = JSON.parse(localStorage.getItem('petmaluAccounts') || '[]');

        // Find and update the current user's account
        const index = accounts.findIndex(acc => acc.email === currentUser.email);
        if (index === -1) return;

        // Update fields
        accounts[index].username = profileUsernameEl.value.trim();
        accounts[index].petName = petNameEl.value.trim();
        accounts[index].petTitle = petTitleEl.value.trim();
        if (petPhotoInput.dataset.base64) {
            accounts[index].petPhoto = petPhotoInput.dataset.base64;
        }

        // Save back
        localStorage.setItem('petmaluAccounts', JSON.stringify(accounts));

        // Update the loggedInUser too
        const updatedUser = accounts[index];
        localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));

        // After saving to localStorage...
        if (accounts[index].username && accounts[index].username.trim() !== '') {
            profileEmailEl.removeAttribute('readonly');
        }

        // Show save confirmation on button
        btnSave.textContent = '✔ SAVED!';
        setTimeout(() => btnSave.textContent = 'SAVE CHANGES', 2000);
    });
}

// ═══════════════════════════════════════
// 6. CHANGE PASSWORD (SECURITY TAB)
// ═══════════════════════════════════════
const btnChangePass = document.getElementById('btnChangePass');

if (btnChangePass) {
    btnChangePass.addEventListener('click', () => {
        const currentPassEl = document.getElementById('currentPass');
        const newPassEl = document.getElementById('newPass');
        const confirmNewEl = document.getElementById('confirmNewPass');
        const formError = document.getElementById('securityFormError');

        // Clear previous errors
        [currentPassEl, newPassEl, confirmNewEl].forEach(el => {
            el.classList.remove('input-error');
        });
        document.querySelectorAll('.form-error').forEach(el => el.textContent = '');

        let hasError = false;

        const accounts = JSON.parse(localStorage.getItem('petmaluAccounts') || '[]');
        const index = accounts.findIndex(acc => acc.email === currentUser.email);

        // Validate current password
        if (currentPassEl.value !== accounts[index].password) {
            currentPassEl.classList.add('input-error');
            document.getElementById('currentPassError').textContent = 'Current password is incorrect.';
            hasError = true;
        }

        // Validate new password length
        if (newPassEl.value.length < 6) {
            newPassEl.classList.add('input-error');
            document.getElementById('newPassError').textContent = 'New password must be at least 6 characters.';
            hasError = true;
        }

        // Validate confirm matches
        if (confirmNewEl.value !== newPassEl.value) {
            confirmNewEl.classList.add('input-error');
            document.getElementById('confirmPassError').textContent = 'Passwords do not match.';
            hasError = true;
        }

        if (hasError) return;

        // Update password
        accounts[index].password = newPassEl.value;
        localStorage.setItem('petmaluAccounts', JSON.stringify(accounts));
        localStorage.setItem('loggedInUser', JSON.stringify(accounts[index]));

        // Clear fields and show success
        currentPassEl.value = '';
        newPassEl.value = '';
        confirmNewEl.value = '';
        if (formError) {
            formError.style.color = '#4a7c4e';
            formError.textContent = '✔ Password changed successfully!';
        }
    });
}

// ═══════════════════════════════════════
// 7. LOGOUT
// ═══════════════════════════════════════
const btnLogout = document.getElementById('btnLogout');

if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('loggedInUser');
        window.location.href = '../WebIndex/index.html';
    });
}