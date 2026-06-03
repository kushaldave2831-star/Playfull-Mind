document.addEventListener('DOMContentLoaded', () => {
    const mgr = window.gameManager;
    const dashboardScore = document.getElementById('dashboard-score');
    const dashboardStars = document.getElementById('dashboard-stars');
    const dashboardBadges = document.getElementById('dashboard-badges');
    const clearProgressBtn = document.getElementById('clear-progress-btn');

    function loadDashboardData() {
        dashboardScore.textContent = mgr.score;
        dashboardStars.textContent = mgr.stars;

        dashboardBadges.innerHTML = ''; // Clear previous badges
        if (mgr.badges.length > 0) {
            mgr.badges.forEach(badgeId => {
                const badgeInfo = mgr.allPossibleBadges.find(badge => badge.id === badgeId);
                if (badgeInfo) {
                    const badgeElement = document.createElement('span');
                    badgeElement.className = 'badge-small shadow-sm border border-gray-100 bg-white hover:bg-gray-50 transition-colors cursor-default';
                    badgeElement.innerHTML = `${badgeInfo.icon} ${badgeInfo.name}`;
                    dashboardBadges.appendChild(badgeElement);
                }
            });
        } else {
            dashboardBadges.innerHTML = '<p class="text-gray-400 italic">No badges earned yet. Keep playing!</p>';
        }

        loadFeedback();
    }

    function loadFeedback() {
        const feedbackList = document.getElementById('feedback-list');
        if (!feedbackList) return;

        const allFeedback = JSON.parse(localStorage.getItem('userFeedback')) || [];
        feedbackList.innerHTML = '';

        if (allFeedback.length > 0) {
            allFeedback.reverse().forEach(item => {
                const div = document.createElement('div');
                div.className = 'bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-400';
                div.innerHTML = `
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-bold text-gray-800">${item.name}</h3>
                        <span class="text-xs text-gray-400">${item.date}</span>
                    </div>
                    <p class="text-gray-600 italic">"${item.message}"</p>
                    <div class="mt-2 text-xs text-blue-500">${item.email}</div>
                `;
                feedbackList.appendChild(div);
            });
        } else {
            feedbackList.innerHTML = '<p class="text-center text-gray-400 italic">No feedback received yet.</p>';
        }
    }

    // Make it globally accessible so script.js can call it
    window.loadFeedback = loadFeedback;

    clearProgressBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all progress and feedback? This cannot be undone.')) {
            localStorage.removeItem('totalScore');
            localStorage.removeItem('totalStars');
            localStorage.removeItem('earnedBadges');
            localStorage.removeItem('gemini-api-key');
            localStorage.removeItem('userFeedback');
            mgr.loadProgress(); // Reload manager state
            loadDashboardData(); // Reload UI
            alert('All progress and feedback cleared!');
        }
    });

    loadDashboardData();
});