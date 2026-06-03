document.addEventListener('DOMContentLoaded', () => {
    const mgr = window.gameManager;
    const totalScoreElement = document.getElementById('total-score');
    const totalStarsElement = document.getElementById('total-stars');
    const badgesContainer = document.getElementById('badges-container');

    // Display score and stars
    totalScoreElement.textContent = mgr.score;
    totalStarsElement.textContent = mgr.stars;

    // Display badges
    mgr.allPossibleBadges.forEach(badge => {
        const badgeElement = document.createElement('div');
        const isEarned = mgr.badges.includes(badge.id);
        badgeElement.className = `reward-card p-6 flex flex-col items-center justify-center transition-all duration-500 ${isEarned ? 'earned border-yellow-400 bg-white' : 'opacity-40 grayscale'}`;
        
        badgeElement.innerHTML = `
            <div class="text-6xl mb-4 transform transition-transform duration-500 ${isEarned ? 'scale-110 hover:scale-125' : ''}">${badge.icon}</div>
            <h3 class="text-xl font-bold text-gray-800">${badge.name}</h3>
            <p class="text-sm text-gray-500 mt-2">${badge.description}</p>
            ${isEarned ? '<span class="mt-4 text-xs font-bold text-green-500 uppercase tracking-widest">Unlocked!</span>' : ''}
        `;
        badgesContainer.appendChild(badgeElement);
    });
});