document.addEventListener('DOMContentLoaded', () => {
    class WordScrambleGame {
        constructor(manager) {
            this.mgr = manager;
            
            this.scrambledWordElement = document.getElementById('scrambled-word');
            this.answerElement = document.getElementById('answer');
            this.submitButton = document.getElementById('submit');
            this.levelElement = document.getElementById('level');
            this.timerElement = document.getElementById('timer');

            this.words = ['apple', 'banana', 'orange', 'grape', 'strawberry', 'planet', 'rocket', 'circle', 'family', 'happy'];
            this.currentWord = '';
            this.level = 1;
            this.timer = null;
            this.timeLeft = 15;

            this.submitButton.addEventListener('click', () => {
                this.mgr.playSound('click');
                this.checkAnswer();
            });

            this.answerElement.addEventListener('keyup', (event) => {
                if (event.key === 'Enter') {
                    this.checkAnswer();
                }
            });
        }

        checkBadges() {
            if (this.mgr.gameScore >= 10) this.mgr.unlockBadge('word_scrambler_1', 'Word Scrambler');
        }

        scrambleWord(word) {
            let scrambled = word.split('').sort(() => 0.5 - Math.random()).join('');
            while (scrambled === word) {
                scrambled = word.split('').sort(() => 0.5 - Math.random()).join('');
            }
            return scrambled;
        }

        startTimer() {
            clearInterval(this.timer);
            this.timeLeft = Math.max(8, 18 - this.level);
            this.timerElement.textContent = `Time: ${this.timeLeft}`;
            this.timer = setInterval(() => {
                this.timeLeft--;
                this.timerElement.textContent = `Time: ${this.timeLeft}`;
                if (this.timeLeft <= 0) {
                    clearInterval(this.timer);
                    this.checkAnswer(true);
                }
            }, 1000);
        }

        generateWord() {
            this.mgr.setCharacterExpression('neutral');
            this.answerElement.disabled = false;
            this.submitButton.disabled = false;
            
            this.currentWord = this.words[Math.floor(Math.random() * this.words.length)];
            const scrambled = this.scrambleWord(this.currentWord);
            this.scrambledWordElement.textContent = scrambled;
            this.answerElement.value = '';
            this.answerElement.focus();
            this.startTimer();
        }

        checkAnswer(isTimeout = false) {
            clearInterval(this.timer);
            const userAnswer = this.answerElement.value.trim().toLowerCase();
            
            if (isTimeout) {
                this.mgr.playSound('incorrect');
                this.mgr.setCharacterExpression('sad');
                this.mgr.showPopup(false, "Time's Up!", `The correct word was "${this.currentWord}".`, () => this.generateWord());
                return;
            }

            if (userAnswer === '') {
                this.answerElement.focus();
                return;
            }

            this.answerElement.disabled = true;
            this.submitButton.disabled = true;

            if (userAnswer === this.currentWord) {
                this.mgr.playSound('correct');
                this.mgr.setCharacterExpression('happy');
                this.mgr.addScore(1);
                this.mgr.addStar(1);
                this.mgr.showPopup(true, 'Correct!', `You unscrambled it! The word was "${this.currentWord}".`, () => this.generateWord());
                
                if (this.mgr.gameScore > 0 && this.mgr.gameScore % 5 === 0) {
                    this.level++;
                    if (this.levelElement) this.levelElement.textContent = `Level: ${this.level}`;
                }
                this.checkBadges();
            } else {
                this.mgr.playSound('incorrect');
                this.mgr.setCharacterExpression('sad');
                this.mgr.showPopup(false, 'Oops!', `Not quite. The correct word was "${this.currentWord}".`, () => this.generateWord());
            }
        }

        start() {
            this.level = 1;
            if (this.levelElement) this.levelElement.textContent = `Level: ${this.level}`;
            this.generateWord();
        }
    }

    const game = new WordScrambleGame(window.gameManager);
    game.start();
});