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


// ═══════════════════════════════════════
// 8. LOAD OWNED COUPONS IN COUPAWS TAB
// ═══════════════════════════════════════

// Must match the ALL_COUPONS array in coupons_script.js
const ALL_COUPONS = [
    { id: 'spotify', brand: 'SPOTIFY', offer: '2 months Premium – 60% Discount', tagLabel: 'HOOMAN, LEISURE', cost: 100, code: 'PETMALU-SPT-2024' },
    { id: 'pedigree', brand: 'PEDIGREE', offer: '40% Discount on Adult: Roasted Chicken Flavor', tagLabel: 'PETS, FOOD', cost: 250, code: 'PETMALU-PDG-40OFF' },
    { id: 'petstyle', brand: 'PETSTYLE PH', offer: '15% Off Accessories', tagLabel: 'PET, ACCESSORY', cost: 300, code: 'PETMALU-PST-15ACC' },
    { id: 'whiskers', brand: 'WHISKERS', offer: 'Buy 2 Get 1 Cat Treats', tagLabel: 'PET, FOOD', cost: 300, code: 'PETMALU-WSK-B2G1' },
    { id: 'vetcare', brand: 'VETCARE CLINIC', offer: 'Free Initial Consultation', tagLabel: 'PET, FOOD', cost: 400, code: 'PETMALU-VTC-FREE1' },
];

function loadInventory() {
    const accounts = JSON.parse(localStorage.getItem('petmaluAccounts') || '[]');
    const index = accounts.findIndex(acc => acc.email === currentUser.email);
    if (index === -1) return;

    const inventory = accounts[index].inventory || [];
    const container = document.querySelector('#section-coupaws .panel-left');
    if (!container) return;

    // Clear placeholder
    container.innerHTML = '<h2 class="section-title">COUPAWS:</h2>';

    if (inventory.length === 0) {
        container.innerHTML += '<p class="placeholder-text">Your Coupaws will appear here once you start buying!</p>';
        return;
    }

    // Build owned coupon list
    const list = document.createElement('div');
    list.style.cssText = 'display: flex; flex-direction: column; gap: 12px; margin-top: 16px;';

    inventory.forEach(id => {
        const coupon = ALL_COUPONS.find(c => c.id === id);
        if (!coupon) return;

        const item = document.createElement('div');
        item.style.cssText = `
            background: #6b4226;
            border-radius: 14px;
            padding: 14px 18px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
        `;
        item.innerHTML = `
    <div style="flex:1;">
        <div style="font-family:'LeagueSpartan',sans-serif; color:white; font-size:1.2rem; font-weight: 600;">
            ${coupon.brand}
        </div>
        <div style="font-size:0.82rem; color:rgba(255,255,255,0.8); margin-top:4px;">
            ${coupon.offer}
        </div>
        <div style="font-size:0.7rem; color:rgba(255,255,255,0.5); margin-top:2px;">
            TAGS: ${coupon.tagLabel}
        </div>

        <!-- COUPON CODE (hidden by default) -->
        <div class="coupon-code-box" id="code-${coupon.id}" style="
            display: none;
            margin-top: 10px;
            background: rgba(0,0,0,0.25);
            border-radius: 10px;
            padding: 8px 14px;
            display: none;
            align-items: center;
            gap: 10px;
        ">
            <span style="
                font-family: monospace;
                font-size: 0.95rem;
                color: #f0c080;
                letter-spacing: 2px;
                font-weight: bold;
            ">${coupon.code}</span>
            <button onclick="navigator.clipboard.writeText('${coupon.code}')" style="
                background: none; border: none;
                color: rgba(255,255,255,0.6);
                font-size: 0.75rem; cursor: pointer;
                text-decoration: underline;
            ">copy</button>
        </div>
    </div>

    <!-- SHOW/HIDE BUTTON -->
    <button class="btn-toggle-code" data-id="${coupon.id}" style="
        background: #d97b4f; color: white; border: none;
        padding: 8px 16px; border-radius: 20px;
        font-family: 'Nunito', sans-serif; font-weight: 700;
        font-size: 0.82rem; cursor: pointer; white-space: nowrap;
        flex-shrink: 0; transition: background 0.2s;
    ">SHOW CODE</button>
`;

        // Toggle show/hide code
        item.querySelector('.btn-toggle-code').addEventListener('click', (e) => {
            const btn = e.currentTarget;
            const codeBox = document.getElementById(`code-${coupon.id}`);
            const isHidden = codeBox.style.display === 'none' || codeBox.style.display === '';

            codeBox.style.display = isHidden ? 'flex' : 'none';
            btn.textContent = isHidden ? 'HIDE CODE' : 'SHOW CODE';
            btn.style.background = isHidden ? '#b85e32' : '#d97b4f';
        });

        list.appendChild(item);
    });

    container.appendChild(list);
}

loadInventory();

// Reload inventory when switching to Coupaws tab
sidebarBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.dataset.section === 'coupaws') loadInventory();
    });
});