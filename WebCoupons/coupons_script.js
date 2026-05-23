// ═══════════════════════════════════════
// 0. MOBILE MENUS (Hamburger & Filters)
// ═══════════════════════════════════════
function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('open');
}

function toggleFilters() {
    document.querySelector('.filter-sidebar').classList.toggle('open');
}

// ═══════════════════════════════════════
// AUTH STATE
// ═══════════════════════════════════════
const currentUser = JSON.parse(localStorage.getItem('loggedInUser'));
const isLoggedIn = !!currentUser;

// ═══════════════════════════════════════
// COUPON DATA
// ═══════════════════════════════════════
const ALL_COUPONS = [
    {
        id: 'spotify',
        brand: 'SPOTIFY',
        offer: '2 months Premium – 60% Discount',
        detail: 'Enjoy nonstop listening with Spotify Premium.',
        tags: ['hooman-leisure'],
        tagLabel: 'HOOMAN, LEISURE',
        cost: 100,
        img: '../Assets/Spotify.webp'
    },
    {
        id: 'pedigree',
        brand: 'PEDIGREE',
        offer: '40% Discount on Adult: Roasted Chicken Flavor',
        detail: 'Made with high quality protein, ensuring a dog that lives healthy.',
        tags: ['pet-food'],
        tagLabel: 'PETS, FOOD',
        cost: 250,
        img: '../Assets/Pedigree.webp'
    },
    {
        id: 'petstyle',
        brand: 'PETSTYLE PH',
        offer: '15% Off Accessories',
        detail: 'Valid on collars, leashes, bowls and toys. Online & in-store.',
        tags: ['pet-accessory'],
        tagLabel: 'PET, ACCESSORY',
        cost: 300,
        img: '../Assets/PetStyle.webp'
    },
    {
        id: 'whiskers',
        brand: 'WHISKERS',
        offer: 'Buy 2 Get 1 Cat Treats',
        detail: 'Mix and match any cat treats from Whiskers Market branches.',
        tags: ['pet-food'],
        tagLabel: 'PET, FOOD',
        cost: 300,
        img: '../Assets/WNP.webp'
    },
    {
        id: 'vetcare',
        brand: 'VETCARE CLINIC',
        offer: 'Free Initial Consultation',
        detail: 'First-time clients only. Valid at all VetCare branches.',
        tags: ['pet-veterinary'],
        tagLabel: 'PET, FOOD',
        cost: 400,
        img: '../Assets/Vetcare.jpg'
    },
];

// ═══════════════════════════════════════
// LOAD USER DATA
// ═══════════════════════════════════════
let acc = null;
let accounts = [];
let accIndex = -1;
let userCoins = 0;
let ownedCoupons = [];

function loadUserData() {
    if (!isLoggedIn) return;
    accounts = JSON.parse(localStorage.getItem('petmaluAccounts') || '[]');
    accIndex = accounts.findIndex(a => a.email === currentUser.email);
    if (accIndex === -1) return;
    acc = accounts[accIndex];
    if (!acc.game) acc.game = { coins: 0 };
    if (!acc.game.coins) acc.game.coins = 0;
    if (!acc.inventory) acc.inventory = [];
    userCoins = acc.game.coins;
    ownedCoupons = acc.inventory;
}

function saveUserData() {
    accounts[accIndex] = acc;
    localStorage.setItem('petmaluAccounts', JSON.stringify(accounts));
    localStorage.setItem('loggedInUser', JSON.stringify(acc));
}

// ═══════════════════════════════════════
// NAVBAR — logged in vs logged out
// ═══════════════════════════════════════
function buildNavbar() {
    const navRight = document.getElementById('navRight');
    if (isLoggedIn) {
        navRight.innerHTML = `
            <a href="../WebSettings/setting.html" class="btn-profile">PROFILE</a>
            <button class="btn-logout" id="btnLogout">Log out</button>
        `;
        document.getElementById('btnLogout').addEventListener('click', () => {
            localStorage.removeItem('loggedInUser');
            window.location.reload();
        });
        // Show coins
        document.getElementById('coinsDisplay').style.display = 'flex';
        document.getElementById('userCoins').textContent = userCoins;
    } else {
        navRight.innerHTML = `
            <a href="../WebIndex/index.html" class="btn-nav-login">Log In</a>
        `;
    }
}

// ═══════════════════════════════════════
// BUILD COUPON CARD
// ═══════════════════════════════════════
function buildCouponCard(coupon) {
    const isOwned = ownedCoupons.includes(coupon.id);
    const canAfford = isLoggedIn && userCoins >= coupon.cost;
    const isLocked = !isLoggedIn || !canAfford;

    const card = document.createElement('div');
    card.classList.add('coupon-card');
    card.dataset.id = coupon.id;
    card.dataset.tags = coupon.tags.join(',');
    card.dataset.cost = coupon.cost;

    const imgHtml = coupon.img
        ? `<img src="${coupon.img}" alt="${coupon.brand}">`
        : `<div class="coupon-img-placeholder"></div>`;

    const lockReason = !isLoggedIn
        ? 'Log in to buy'
        : `Not enough coins`;

    const btnHtml = isLocked
        ? `<button class="btn-buy locked" disabled>
               <img src="../Assets/Pawrency.webp" class="coin-icon-sm" alt="coin">
               <span style="color:#ff9080;">${coupon.cost}</span>
               <span style="font-size:0.7rem; color:#ff9080;">(${lockReason})</span>
           </button>`
        : `<button class="btn-buy" data-id="${coupon.id}">
               <img src="../Assets/Pawrency.webp" class="coin-icon-sm" alt="coin">
               ${coupon.cost}
           </button>`;

    card.innerHTML = `
        <div class="coupon-img">${imgHtml}</div>
        <div class="coupon-info">
            <div class="coupon-brand">${coupon.brand}</div>
            <div class="coupon-offer">${coupon.offer}</div>
            <div class="coupon-detail">${coupon.detail}</div>
            <div class="coupon-tags">TAGS: ${coupon.tagLabel}</div>
            <div class="coupon-buy-row">${btnHtml}</div>
        </div>
    `;

    // Attach buy listener if not locked
    if (!isLocked) {
        card.querySelector('.btn-buy').addEventListener('click', () => openBuyModal(coupon));
    }

    return card;
}

// ═══════════════════════════════════════
// RENDER COUPONS
// ═══════════════════════════════════════
function renderCoupons(list) {
    const grid = document.getElementById('couponGrid');
    grid.innerHTML = '';

    // Filter out already owned
    const available = list.filter(c => !ownedCoupons.includes(c.id));

    if (available.length === 0) {
        grid.innerHTML = '<p class="no-results">No coupons found!</p>';
        return;
    }

    available.forEach(coupon => grid.appendChild(buildCouponCard(coupon)));
}

// ═══════════════════════════════════════
// SEARCH + FILTER
// ═══════════════════════════════════════
function getFilteredCoupons() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const priceSort = document.querySelector('input[name="price"]:checked')?.value;
    const categories = [...document.querySelectorAll('.filter-option input[type="checkbox"]:checked')]
        .map(cb => cb.value);

    let result = ALL_COUPONS.filter(c => {
        const matchSearch = c.brand.toLowerCase().includes(query) ||
            c.offer.toLowerCase().includes(query) ||
            c.tagLabel.toLowerCase().includes(query);
        const matchCat = categories.length === 0 ||
            categories.some(cat => c.tags.includes(cat));
        return matchSearch && matchCat;
    });

    // Price filter
    if (priceSort === 'low-high') {
        result.sort((a, b) => a.cost - b.cost);
    } else if (priceSort === 'high-low') {
        result.sort((a, b) => b.cost - a.cost);
    } else if (priceSort === 'affordable') {
        result = result.filter(c => isLoggedIn && userCoins >= c.cost);
    }

    return result;
}

function applyFilters() {
    renderCoupons(getFilteredCoupons());
}

// ═══════════════════════════════════════
// BUY MODAL
// ═══════════════════════════════════════
let pendingCoupon = null;

function openBuyModal(coupon) {
    pendingCoupon = coupon;
    document.getElementById('buyModalTitle').textContent = coupon.brand;
    document.getElementById('buyModalDesc').textContent = coupon.offer;
    document.getElementById('buyModalDetail').textContent = coupon.detail;
    document.getElementById('buyModalCost').textContent = coupon.cost;
    document.getElementById('buyModal').classList.add('active');
}

function closeBuyModal() {
    pendingCoupon = null;
    document.getElementById('buyModal').classList.remove('active');
}

function confirmBuy() {
    if (!pendingCoupon) return;

    // Deduct coins
    acc.game.coins -= pendingCoupon.cost;
    userCoins = acc.game.coins;

    // Add to inventory
    acc.inventory.push(pendingCoupon.id);
    ownedCoupons = acc.inventory;

    saveUserData();
    closeBuyModal();

    // Update coins display
    document.getElementById('userCoins').textContent = userCoins;

    // Show success
    document.getElementById('successMsg').textContent =
        `"${pendingCoupon.brand}" coupon added to your inventory in Profile!`;
    document.getElementById('successModal').classList.add('active');

    // Re-render to remove bought coupon
    applyFilters();
}

// ═══════════════════════════════════════
// INIT
// ═══════════════════════════════════════
loadUserData();
buildNavbar();
renderCoupons(ALL_COUPONS);

// Search
document.getElementById('searchInput').addEventListener('input', applyFilters);

// Price filter
document.querySelectorAll('input[name="price"]').forEach(r =>
    r.addEventListener('change', applyFilters));

// Category filter
document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb =>
    cb.addEventListener('change', applyFilters));

// Clear buttons
document.getElementById('clearPrice').addEventListener('click', () => {
    document.querySelectorAll('input[name="price"]').forEach(r => r.checked = false);
    applyFilters();
});
document.getElementById('clearCategory').addEventListener('click', () => {
    document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => cb.checked = false);
    applyFilters();
});

// Buy modal buttons
document.getElementById('btnConfirmBuy').addEventListener('click', confirmBuy);
document.getElementById('btnCancelBuy').addEventListener('click', closeBuyModal);
document.getElementById('btnSuccessClose').addEventListener('click', () => {
    document.getElementById('successModal').classList.remove('active');
});

// Close modal on overlay click
document.getElementById('buyModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('buyModal')) closeBuyModal();
});