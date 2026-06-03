/**
 * GameUtils - Centralized logic for Playfull Minds games
 */
class GameManager {
    constructor() {
        this.score = 0;
        this.stars = 0;
        this.badges = [];
        this.gameScore = 0;
        this.gameStars = 0;
        
        this.loadProgress();
        this.allPossibleBadges = [
            { id: 'math_genius_1', name: 'Math Beginner', description: 'Reach level 2 in Math Quiz.', icon: '🔢' },
            { id: 'math_genius_2', name: 'Math Adept', description: 'Reach level 5 in Math Quiz.', icon: '🧮' },
            { id: 'math_genius_3', name: 'Math Wizard', description: 'Reach level 10 in Math Quiz.', icon: '🧙' },
            { id: 'memory_master_1', name: 'Memory Novice', description: 'Complete level 2 in Memory Match.', icon: '🤔' },
            { id: 'memory_master_2', name: 'Memory Expert', description: 'Complete level 4 in Memory Match.', icon: '🧠' },
            { id: 'word_scrambler_1', name: 'Word Scrambler', description: 'Solve 10 words in Word Scramble.', icon: '🔤' },
            { id: 'spelling_bee_1', name: 'Spelling Bee', description: 'Spell 10 words correctly in Spelling Game.', icon: '🐝' },
            { id: 'pattern_pro_1', name: 'Pattern Pro', description: 'Complete 10 patterns in Pattern Sequence.', icon: '🔄' },
            { id: 'shape_sorter_1', name: 'Shape Sorter', description: 'Sort 10 shapes in Shape Sorter.', icon: '🔺' },
        ];
        this.initCommonElements();
    }

    initCommonElements() {
        // Modal Elements
        this.modal = document.getElementById('game-modal');
        this.modalContent = document.getElementById('modal-content');
        this.modalTitle = document.getElementById('modal-title');
        this.modalMessage = document.getElementById('modal-message');
        this.modalBtn = document.getElementById('modal-btn');
        this.modalIcon = document.getElementById('modal-icon');
        
        // Stats Elements
        this.scoreElement = document.getElementById('score');
        this.starsElement = document.getElementById('stars');
        this.levelElement = document.getElementById('level');
        
        // Character
        this.characterSvg = document.getElementById('character-svg');
        this.svgDoc = null;

        if (this.characterSvg) {
            this.characterSvg.addEventListener('load', () => {
                this.svgDoc = this.characterSvg.contentDocument;
                this.setCharacterExpression('neutral');
            });
        }

        if (this.modalBtn) {
            this.modalBtn.addEventListener('click', () => {
                this.playSound('click');
                this.hidePopup();
            });
        }

        this.updateUI();
    }

    loadProgress() {
        this.score = parseInt(localStorage.getItem('totalScore')) || 0;
        this.stars = parseInt(localStorage.getItem('totalStars')) || 0;
        this.badges = JSON.parse(localStorage.getItem('earnedBadges')) || [];
    }

    saveProgress() {
        localStorage.setItem('totalScore', this.score);
        localStorage.setItem('totalStars', this.stars);
        localStorage.setItem('earnedBadges', JSON.stringify(this.badges));
    }

    addScore(points = 1) {
        this.gameScore += points;
        this.score += points;
        this.updateUI();
        this.saveProgress();
    }

    addStar(count = 1) {
        this.gameStars += count;
        this.stars += count;
        this.updateUI();
        this.saveProgress();
    }

    updateUI() {
        if (this.scoreElement) this.scoreElement.textContent = `Score: ${this.gameScore}`;
        if (this.starsElement) this.starsElement.textContent = `Stars: ${this.gameStars}`;
    }

    unlockBadge(badgeId, badgeName) {
        if (!this.badges.includes(badgeId)) {
            this.badges.push(badgeId);
            this.saveProgress();
            this.speak(`New badge unlocked: ${badgeName}!`);
            return true;
        }
        return false;
    }

    setCharacterExpression(expression) {
        if (!this.svgDoc) return;
        const expressions = ['neutral', 'happy', 'sad'];
        expressions.forEach(exp => {
            const element = this.svgDoc.querySelector(`.${exp}`);
            if (element) {
                element.style.display = (exp === expression) ? 'block' : 'none';
            }
        });
    }

    playSound(soundName) {
        try {
            const audio = new Audio(`sounds/${soundName}.mp3`);
            audio.play().catch(e => console.warn(`Audio play failed: ${e.message}`));
        } catch (e) {
            console.error(`Sound ${soundName} not found`);
        }
    }

    speak(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.1;
            window.speechSynthesis.speak(utterance);
        }
    }

    showPopup(isCorrect, title, message, callback) {
        this.onModalClose = callback;
        if (this.modal) {
            this.modal.classList.add('active');
            if (this.modalContent) this.modalContent.className = isCorrect ? 'modal-content correct' : 'modal-content wrong';
            if (this.modalTitle) this.modalTitle.textContent = title;
            if (this.modalMessage) this.modalMessage.textContent = message;
            if (this.modalIcon) this.modalIcon.innerHTML = isCorrect ? '✔' : '✖';
            if (this.modalBtn) this.modalBtn.focus();
        }
    }

    hidePopup() {
        if (this.modal) {
            this.modal.classList.remove('active');
            if (this.onModalClose) {
                setTimeout(() => {
                    this.onModalClose();
                    this.onModalClose = null;
                }, 300);
            }
        }
    }
}

// Global instance for simple access
window.gameManager = new GameManager();
