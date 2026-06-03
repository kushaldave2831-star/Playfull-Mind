document.addEventListener('DOMContentLoaded', () => {
    class MemoryGame {
        constructor(manager) {
            this.mgr = manager;
            
            this.gameBoard = document.getElementById('game-board');
            this.levelElement = document.getElementById('level');
            this.timerElement = document.getElementById('timer');

            this.allCards = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
            this.levelLayouts = [
                { rows: 2, cols: 2, pairs: 2 },
                { rows: 2, cols: 3, pairs: 3 },
                { rows: 3, cols: 4, pairs: 6 },
                { rows: 4, cols: 4, pairs: 8 }
            ];
            this.maxLevel = this.levelLayouts.length;

            this.cardsChosen = [];
            this.cardsChosenIds = [];
            this.cardsWon = [];
            this.level = 1;
            this.timer = null;
            this.timeLeft = 30;
            this.cardsArray = [];
            this.lockBoard = false;
            this.nextAction = 'start'; // 'start', 'next', 'retry'
        }

        checkBadges() {
            if (this.level >= 2) this.mgr.unlockBadge('memory_master_1', 'Memory Novice');
            if (this.level >= 4) this.mgr.unlockBadge('memory_master_2', 'Memory Expert');
        }

        startTimer() {
            clearInterval(this.timer);
            this.timeLeft = 45 - (this.level * 5);
            this.timerElement.textContent = `Time: ${this.timeLeft}`;
            this.timer = setInterval(() => {
                this.timeLeft--;
                this.timerElement.textContent = `Time: ${this.timeLeft}`;
                if (this.timeLeft <= 0) {
                    clearInterval(this.timer);
                    this.mgr.playSound('incorrect');
                    this.mgr.setCharacterExpression('sad');
                    this.lockBoard = true;
                    this.nextAction = 'retry';
                    this.mgr.showPopup(false, "Time's Up!", 'Better luck next time. Give it another shot!', () => this.createBoard());
                }
            }, 1000);
        }

        createBoard() {
            this.mgr.setCharacterExpression('neutral');
            this.gameBoard.innerHTML = '';
            this.cardsWon = [];
            this.cardsChosen = [];
            this.cardsChosenIds = [];
            this.lockBoard = false;
            
            if (this.levelElement) this.levelElement.textContent = `Level: ${this.level}`;

            const layout = this.levelLayouts[Math.min(this.level - 1, this.maxLevel - 1)];
            const pairs = layout.pairs;
            const cardsForLevel = this.allCards.slice(0, pairs);
            this.cardsArray = [...cardsForLevel, ...cardsForLevel];
            this.shuffle(this.cardsArray);

            this.gameBoard.className = 'memory-grid max-w-2xl mx-auto';
            this.gameBoard.style.display = 'grid';
            this.gameBoard.style.gap = '1rem';
            this.gameBoard.style.gridTemplateColumns = `repeat(${layout.cols}, 1fr)`;

            for (let i = 0; i < this.cardsArray.length; i++) {
                const card = document.createElement('div');
                card.setAttribute('data-id', i);
                card.classList.add('memory-card');
                card.addEventListener('click', (e) => this.flipCard(e.target));
                this.gameBoard.appendChild(card);
            }
            this.startTimer();
        }

        flipCard(cardElement) {
            if (this.lockBoard || cardElement.classList.contains('matched') || cardElement.classList.contains('flipped')) return;
            
            this.mgr.playSound('flip');
            const cardId = cardElement.getAttribute('data-id');
            const cardName = this.cardsArray[cardId];
            this.cardsChosen.push(cardName);
            this.cardsChosenIds.push(cardId);
            cardElement.textContent = cardName;
            cardElement.classList.add('flipped');

            if (this.cardsChosen.length === 2) {
                this.lockBoard = true;
                setTimeout(() => this.checkForMatch(), 600);
            }
        }

        checkForMatch() {
            const [optionOneId, optionTwoId] = this.cardsChosenIds;
            const cardOne = this.gameBoard.querySelector(`[data-id='${optionOneId}']`);
            const cardTwo = this.gameBoard.querySelector(`[data-id='${optionTwoId}']`);

            if (this.cardsChosen[0] === this.cardsChosen[1] && optionOneId !== optionTwoId) {
                this.mgr.playSound('correct');
                this.mgr.setCharacterExpression('happy');
                this.mgr.addScore(1);
                this.mgr.addStar(1);
                cardOne.classList.add('matched');
                cardTwo.classList.add('matched');
                this.cardsWon.push(this.cardsChosen[0]);
            } else {
                this.mgr.playSound('incorrect');
                this.mgr.setCharacterExpression('sad');
                cardOne.textContent = '';
                cardTwo.textContent = '';
                cardOne.classList.remove('flipped');
                cardTwo.classList.remove('flipped');
            }

            this.cardsChosen = [];
            this.cardsChosenIds = [];
            this.lockBoard = false;

            if (this.cardsWon.length === this.cardsArray.length / 2) {
                clearInterval(this.timer);
                this.checkBadges();
                if (this.level < this.maxLevel) {
                    this.level++;
                    this.mgr.showPopup(true, 'Level Complete!', 'You found them all! Ready for the next challenge?', () => this.createBoard());
                } else {
                    this.level = 1;
                    this.mgr.showPopup(true, 'Congratulations!', 'You have mastered the memory game!', () => this.createBoard());
                }
            }
        }

        shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        start() {
            this.level = 1;
            this.createBoard();
        }
    }

    const game = new MemoryGame(window.gameManager);
    game.start();
});