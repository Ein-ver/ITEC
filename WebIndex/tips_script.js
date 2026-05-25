// Modal elements
const modalOverlay = document.getElementById('modalPopupOverlay');
const modalContent = document.getElementById('modalPopupContent');
const modalCloseBtn = document.getElementById('modalCloseBtn');

// Training data for each card
const trainingData = {
    wash: {
        icon: '🛁',
        title: 'How to Wash Your Pet',
        description: 'A proper bath keeps your pet clean, healthy, and happy. Follow these steps for a stress-free bathing experience.',
        steps: [
            'Gather supplies first. You\'ll need pet-safe shampoo, a towel, a non-slip mat, and a cup or handheld sprayer. Having everything ready prevents stress.',
            'Brush before the bath. Remove loose fur and tangles. This makes washing easier and prevents mats from tightening when wet.',
            'Use lukewarm water. Test the temperature on your wrist — it should feel warm but not hot. Avoid getting water in eyes, ears, and nose.',
            'Apply shampoo gently. Start from the neck and work down toward the tail. Massage in a circular motion to work the lather through the coat.',
            'Rinse thoroughly. Leftover shampoo can irritate skin. Rinse until the water runs completely clear with no suds.',
            'Towel dry first. Wrap your pet in a warm towel and gently pat — don\'t rub — to avoid matting fur and causing static.',
            'Finish with a dryer (optional). Use a pet-safe blow dryer on the lowest heat setting, keeping it 12 inches away.',
            'Reward them! Give your pet a treat and praise right after the bath. Positive association makes the next bath much easier.'
        ],
        proTip: 'Bathe dogs every 4–6 weeks. Most cats self-groom and rarely need baths unless they get into something messy.'
    },
    litter: {
        icon: '🪣',
        title: 'How to Litter Box Train Your Pet',
        description: 'Proper litter box training creates good habits and a clean home environment for both you and your feline friend.',
        steps: [
            'Choose the right box. The litter box should be 1.5× the length of your pet. Kittens and senior pets need low-sided boxes.',
            'Pick the right litter. Unscented clumping litter is preferred by most cats. Avoid strongly scented litter.',
            'Place it in a quiet spot. Keep the box in a low-traffic, private area away from food and water bowls.',
            'Introduce your pet immediately. When you bring a new pet home, place them directly in the litter box.',
            'Guide them after meals. Gently place your pet in the litter box after eating, playing, or waking up.',
            'Never punish accidents. Clean up calmly with an enzyme cleaner. Punishment creates fear and worsens the problem.',
            'Scoop daily, deep-clean weekly. Cats are fastidious — a dirty box is the number one reason they avoid it.',
            'Have enough boxes. The golden rule is one litter box per cat, plus one extra. For multiple cats, place boxes in different rooms.'
        ],
        proTip: 'If your litter-trained cat suddenly starts missing the box, consult a vet — it can signal a urinary or health issue.'
    },
    leash: {
        icon: '🦮',
        title: 'How to Train Your Pet to Use a Leash',
        description: 'Leash training opens up a world of outdoor adventures for you and your pet. Start with patience and positive reinforcement.',
        steps: [
            'Introduce the collar or harness first. Let your pet sniff it before putting it on. Put it on briefly indoors and give treats.',
            'Let them wear it indoors. Allow your pet to wear the harness around the house for short periods before attaching the leash.',
            'Attach the leash indoors. Let them drag it around under supervision first to get used to the feeling.',
            'Hold the leash and follow them. At first, follow your pet\'s lead while you hold the leash without pulling.',
            'Use treats to guide direction. Hold a treat to your side to encourage your pet to walk beside you.',
            'Stop when they pull. The moment your pet pulls forward, stop walking. Only continue when the leash goes slack.',
            'Graduate to outdoors. Once comfortable indoors, take short 5-minute outdoor walks. Increase duration gradually.',
            'Practice every day. Daily short sessions build better habits faster than occasional long ones.'
        ],
        proTip: 'For cats, use a harness (never just a collar) and start leash training young — kittens adapt faster than adult cats.'
    },
    rollover: {
        icon: '🔄',
        title: 'How to Teach Your Pet to Roll Over',
        description: 'Roll over is a fun trick that impresses friends and gives your pet great mental stimulation. Patience is key!',
        steps: [
            'Make sure they know "down" first. Your pet should comfortably lie down on command before learning roll over.',
            'Get into position. Ask your pet to lie down. Kneel beside them at their level with a high-value treat ready.',
            'Lure with the treat. Hold the treat at their nose, then slowly move it toward their shoulder. Their head will follow.',
            'Guide them onto their back. Continue moving the treat in an arc over their body until they tip onto their back.',
            'Complete the roll. Keep guiding the treat in a circle until they complete a full roll back onto their belly.',
            'Reward immediately. Give the treat and praise the instant they complete the roll. Timing is everything.',
            'Reduce the lure. After several repetitions, add the verbal cue "roll over" and gradually make your hand gesture smaller.',
            'Practice in short sessions. 5–10 repetitions per session, 2–3 times a day. End while they\'re still succeeding.'
        ],
        proTip: 'Some dogs roll more easily one direction. Pay attention to which side they naturally lean and lure toward that direction first.'
    },
    shake: {
        icon: '🤝',
        title: 'How to Teach Your Pet to Shake Hands',
        description: 'Teaching your pet to shake hands is a classic trick that builds trust and strengthens your bond.',
        steps: [
            'Start with "sit." Your pet must be sitting calmly before attempting shake. A sitting position makes it natural to raise one paw.',
            'Hide a treat in your fist. Make a fist with a treat inside and hold it at your pet\'s chest level. Let them sniff it.',
            'Wait for them to paw at your fist. Most pets will eventually paw at your hand to get the treat. When they touch — open and reward!',
            'Repeat until reliable. Do this 10–15 times until your pet consistently paws at your closed fist.',
            'Open your hand. Present an open flat hand and guide their paw into your palm. The moment they touch — reward immediately.',
            'Add the verbal cue. Say "shake" or "paw" right before you extend your hand. Say it once, calmly and clearly.',
            'Generalize the handshake. Practice with different people in different locations so they learn it\'s not just for one person.',
            'Phase out the food lure. Gradually reward every other repetition, then randomly to prevent treat-dependency.'
        ],
        proTip: 'Once they master shake with one paw, teach "other paw" the same way — it\'s impressive and keeps their mind sharp!'
    },
    sit: {
        icon: '🪑',
        title: 'How to Teach Your Pet to Sit',
        description: 'The "sit" command is the foundation for all other training. Master this, and everything else becomes easier!',
        steps: [
            'Start in a calm environment. Find a quiet room with minimal distractions. Keep first sessions to 3–5 minutes.',
            'Get a tasty treat. Use a treat your pet absolutely loves — small, soft, and smelly works best.',
            'Lure their nose upward. Hold the treat at your pet\'s nose, then slowly move it up and back over their head.',
            'The sit happens naturally. As their nose goes up, their bottom goes down. The moment it touches the floor — reward!',
            'Repeat 5–10 times. Repeat the lure motion until they follow it reliably. Don\'t push their bottom down.',
            'Add the verbal cue. Once they\'re sitting reliably from the hand movement, add the word "sit" just before you lure.',
            'Fade the lure. Gradually move from using an actual treat to mimicking the motion with an empty hand.',
            'Practice in new places. Once reliable at home, practice in the yard, then on walks. Each location is like starting over.'
        ],
        proTip: '"Sit" is the gateway to all other commands — once mastered, teaching "stay," "down," and "come" becomes much easier!'
    }
};

// Function to open modal with specific content
function openModal(cardId) {
    const data = trainingData[cardId];
    if (!data) return;
    
    // Build modal HTML content
    const stepsHtml = data.steps.map((step, index) => `
        <li>
            <span class="step-number">${index + 1}</span>
            <span class="step-text">${step}</span>
        </li>
    `).join('');
    
    modalContent.innerHTML = `
        <div class="modal-header-icon">${data.icon}</div>
        <h2 class="modal-title">${data.title}</h2>
        <p class="modal-description">${data.description}</p>
        
        <div class="modal-section">
            <div class="modal-section-title">
                <span class="section-icon"></span>
                <span>Step-by-Step Guide</span>
            </div>
            <ul class="modal-steps">
                ${stepsHtml}
            </ul>
        </div>
        
        <div class="modal-pro-tip">
            <p>💡 <strong>Pro Tip:</strong> ${data.proTip}</p>
        </div>
    `;
    
    // Show modal with animation
    modalOverlay.classList.add('active');
    document.body.classList.add('modal-open');
}

// Function to close modal
function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.classList.remove('modal-open');
}

// Add click event listeners to all tutorial cards
document.querySelectorAll('.tutorial-card').forEach(card => {
    card.addEventListener('click', (e) => {
        // Prevent closing if clicking inside modal (handled by overlay click)
        e.stopPropagation();
        const cardId = card.getAttribute('data-card-id');
        if (cardId) {
            openModal(cardId);
        }
    });
});

// Close modal when clicking close button
if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
}

// Close modal when clicking outside the modal container
if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
}

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
    }
});

/**
 * Toggle the hamburger nav menu on mobile
 */
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('open');
}

// Close nav if user clicks outside of it on mobile
document.addEventListener('click', function (e) {
    const nav = document.querySelector('nav');
    const navLinks = document.getElementById('navLinks');
    if (navLinks && navLinks.classList.contains('open')) {
        if (!nav.contains(e.target)) {
            navLinks.classList.remove('open');
        }
    }
});

// Dynamic Header Scroll Background Logic
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('nav');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth Scroll back to top when clicking Logo
// No
/*
const backTopLogo = document.getElementById('logo-backtop');
if (backTopLogo) {
    backTopLogo.addEventListener('click', (event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
*/