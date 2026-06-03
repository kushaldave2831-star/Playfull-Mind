document.addEventListener('DOMContentLoaded', () => {
    class PatternGame {
        constructor(manager) {
            this.mgr = manager;
            
            this.patternElement = document.getElementById('pattern');
            this.optionsElement = document.getElementById('options');
            this.levelElement = document.getElementById('level');
            this.timerElement = document.getElementById('timer');

            this.patterns = {
                1: [
                    { sequence: ['A', 'B', 'A', 'B'], options: ['A', 'B', 'C'], answer: 'A' },
                    { sequence: [1, 2, 3, 1, 2], options: [1, 2, 3], answer: 3 }
                ],
                2: [
                    { sequence: ['Red', 'Blue', 'Red', 'Blue'], options: ['Red', 'Blue', 'Green'], answer: 'Red' },
                    { sequence: ['Up', 'Down', 'Up', 'Down'], options: ['Up', 'Down', 'Left'], answer: 'Up' }
                ],
                3: [
                    { sequence: [1, 1, 2, 2, 3], options: [1, 2, 3], answer: 3 },
                    { sequence: ['A', 'A', 'B', 'B', 'C'], options: ['A', 'B', 'C'], answer: 'C' }
                ]
            };
            
            this.maxLevel = Math.max(...Object.keys(this.patterns).map(Number));
            this.currentPattern = null;
            this.level = 1;
            this.timer = null;
            this.timeLeft = 10;
        }

        checkBadges() {
            if (this.mgr.gameScore >= 10) this.mgr.unlockBadge('pattern_pro_1', 'Pattern Pro');
        }

        startTimer() {
            clearInterval(this.timer);
            this.timeLeft = 12 - this.level;
            this.timerElement.textContent = `Time: ${this.timeLeft}`;
            this.timer = setInterval(() => {
                this.timeLeft--;
                this.timerElement.textContent = `Time: ${this.timeLeft}`;
                if (this.timeLeft <= 0) {
                    clearInterval(this.timer);
                    this.checkAnswer(null);
                }
            }, 1000);
        }

        generatePattern() {
            this.mgr.setCharacterExpression('neutral');
            const patternList = this.patterns[this.level] || this.patterns[this.maxLevel];
            this.currentPattern = patternList[Math.floor(Math.random() * patternList.length)];
            
            this.patternElement.innerHTML = '';
            const questionText = document.createElement('p');
            questionText.textContent = 'What comes next in the sequence?';
            questionText.classList.add('sequence-question', 'mb-4', 'text-xl', 'font-bold');

            const track = document.createElement('div');
            track.classList.add('sequence-track', 'flex', 'justify-center', 'gap-4', 'mb-8');
            
            this.currentPattern.sequence.forEach(item => {
                const slot = document.createElement('div');
                slot.classList.add('sequence-slot', 'w-16', 'h-16', 'bg-white', 'border-4', 'border-blue-400', 'rounded-xl', 'flex', 'items-center', 'justify-center', 'text-2xl', 'font-bold', 'shadow-md');
                slot.textContent = item;
                track.appendChild(slot);
            });
            
            const missingSlot = document.createElement('div');
            missingSlot.classList.add('sequence-slot', 'missing', 'w-16', 'h-16', 'bg-yellow-100', 'border-4', 'border-dashed', 'border-yellow-400', 'rounded-xl', 'flex', 'items-center', 'justify-center', 'text-2xl', 'font-bold', 'text-yellow-600');
            missingSlot.textContent = '?';
            track.appendChild(missingSlot);

            this.patternElement.appendChild(questionText);
            this.patternElement.appendChild(track);

            this.optionsElement.innerHTML = '';
            this.optionsElement.classList.add('option-grid', 'flex', 'justify-center', 'gap-4');
            this.currentPattern.options.forEach(option => {
                const button = document.createElement('button');
                button.type = 'button';
                button.textContent = option;
                button.classList.add('option-card', 'primary-btn', 'px-8', 'py-4');
                button.addEventListener('click', () => {
                    this.mgr.playSound('click');
                    this.checkAnswer(option);
                });
                this.optionsElement.appendChild(button);
            });

            this.startTimer();
        }

        checkAnswer(selectedOption) {
            clearInterval(this.timer);
            this.optionsElement.querySelectorAll('.option-card').forEach(btn => btn.disabled = true);

            if (selectedOption === this.currentPattern.answer) {
                this.mgr.playSound('correct');
                this.mgr.setCharacterExpression('happy');
                this.mgr.addScore(1);
                this.mgr.addStar(1);
                this.mgr.showPopup(true, 'Correct!', 'You figured out the pattern!', () => this.generatePattern());
                
                if (this.mgr.gameScore > 0 && this.mgr.gameScore % 5 === 0 && this.level < this.maxLevel) {
                    this.level++;
                    if (this.levelElement) this.levelElement.textContent = `Level: ${this.level}`;
                }
                this.checkBadges();
            } else if (selectedOption === null) {
                this.mgr.playSound('incorrect');
                this.mgr.setCharacterExpression('sad');
                this.mgr.showPopup(false, "Time's Up!", `The correct answer was ${this.currentPattern.answer}.`, () => this.generatePattern());
            } else {
                this.mgr.playSound('incorrect');
                this.mgr.setCharacterExpression('sad');
                this.mgr.showPopup(false, 'Not Quite!', `The correct answer was ${this.currentPattern.answer}.`, () => this.generatePattern());
            }
        }

        start() {
            this.level = 1;
            if (this.levelElement) this.levelElement.textContent = `Level: ${this.level}`;
            this.generatePattern();
        }
    }

    const game = new PatternGame(window.gameManager);
    game.start();
});