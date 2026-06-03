document.addEventListener('DOMContentLoaded', () => {
    class SpellingGame {
        constructor(manager) {
            this.mgr = manager;
            
            this.promptElement = document.getElementById('word-to-spell');
            this.hintElement = document.getElementById('word-hint');
            this.answerElement = document.getElementById('answer');
            this.submitButton = document.getElementById('submit');
            this.levelElement = document.getElementById('level');
            this.timerElement = document.getElementById('timer');
            this.speakBtn = document.getElementById('speak-again-btn');

            this.wordPools = {
                1: [
                    { word: 'cat', hint: 'A small pet that says meow' },
                    { word: 'sun', hint: 'The bright star in our sky' },
                    { word: 'tree', hint: 'It has roots, a trunk, and leaves' },
                    { word: 'book', hint: 'Something you read' }
                ],
                2: [
                    { word: 'apple', hint: 'A red or green fruit that grows on trees' },
                    { word: 'water', hint: 'You drink it every day' },
                    { word: 'green', hint: 'The color of grass' },
                    { word: 'happy', hint: 'The opposite of sad' }
                ],
                3: [
                    { word: 'circle', hint: 'A round shape with no corners' },
                    { word: 'yellow', hint: 'The color of a banana' },
                    { word: 'purple', hint: 'A color made by mixing red and blue' },
                    { word: 'family', hint: 'People who love and live with you' }
                ],
                4: [
                    { word: 'banana', hint: 'A long yellow fruit' },
                    { word: 'planet', hint: 'Earth is one of these' },
                    { word: 'rocket', hint: 'A ship that travels to space' },
                    { word: 'rainbow', hint: 'Colorful arc seen after rain' }
                ],
                5: [
                    { word: 'computer', hint: 'A machine you use to play and learn' },
                    { word: 'keyboard', hint: 'It has keys you press to type' },
                    { word: 'strawberry', hint: 'A red fruit with tiny seeds outside' },
                    { word: 'dinosaur', hint: 'A huge reptile from long ago' }
                ]
            };

            this.maxLevel = Math.max(...Object.keys(this.wordPools).map(Number));
            this.currentItem = null;
            this.level = 1;
            this.timer = null;
            this.timeLeft = 12;

            this.submitButton.addEventListener('click', () => {
                this.mgr.playSound('click');
                this.handleSubmit();
            });
            
            this.answerElement.addEventListener('keyup', (event) => {
                if (event.key === 'Enter') {
                    this.handleSubmit();
                }
            });

            if (this.speakBtn) {
                this.speakBtn.addEventListener('click', () => this.speakWord());
            }
        }

        checkBadges() {
            if (this.mgr.gameScore >= 10) this.mgr.unlockBadge('spelling_bee_1', 'Spelling Bee');
        }

        startTimer() {
            clearInterval(this.timer);
            this.timeLeft = Math.max(8, 14 - this.level);
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

        getPool() {
            return this.wordPools[this.level] || this.wordPools[this.maxLevel];
        }

        speakWord() {
            if (this.currentItem) {
                this.mgr.speak(`The word is ${this.currentItem.word}`);
            }
        }

        nextWord() {
            this.mgr.setCharacterExpression('neutral');
            this.answerElement.disabled = false;
            this.submitButton.disabled = false;

            const spellingWords = this.getPool();
            const randomIndex = Math.floor(Math.random() * spellingWords.length);
            this.currentItem = spellingWords[randomIndex];

            this.hintElement.innerHTML = `Spell the word for:<br><strong>"${this.currentItem.hint}"</strong>`;
            this.promptElement.textContent = 'Listen & Spell';
            this.answerElement.value = '';
            this.answerElement.focus();

            this.mgr.speak(`Spell the word for: ${this.currentItem.hint}. The word is ${this.currentItem.word}`);
            this.startTimer();
        }

        checkAnswer(userAnswer) {
            clearInterval(this.timer);
            this.answerElement.disabled = true;
            this.submitButton.disabled = true;
            
            const correctWord = this.currentItem?.word || '';

            if (userAnswer === correctWord) {
                this.mgr.playSound('correct');
                this.mgr.setCharacterExpression('happy');
                this.mgr.addScore(1);
                this.mgr.addStar(1);
                this.mgr.showPopup(true, 'Correct!', `You spelled "${correctWord}" perfectly!`, () => this.nextWord());
                this.mgr.speak('Correct!');
                
                if (this.mgr.gameScore > 0 && this.mgr.gameScore % 5 === 0 && this.level < this.maxLevel) {
                    this.level++;
                    if (this.levelElement) this.levelElement.textContent = `Level: ${this.level}`;
                    this.mgr.speak(`Awesome! You've reached level ${this.level}.`);
                }
                this.checkBadges();
            } else if (userAnswer === null) {
                this.mgr.playSound('incorrect');
                this.mgr.setCharacterExpression('sad');
                const message = `Time's up! The correct spelling is "${correctWord}".`;
                this.mgr.showPopup(false, "Time's Up!", message, () => this.nextWord());
                this.mgr.speak(message);
            } else {
                this.mgr.playSound('incorrect');
                this.mgr.setCharacterExpression('sad');
                const message = `Not quite! The correct spelling is "${correctWord}".`;
                this.mgr.showPopup(false, 'Oops!', message, () => this.nextWord());
                this.mgr.speak(message);
            }
        }
        
        handleSubmit() {
            const userAnswer = this.answerElement.value.trim().toLowerCase();
            if (userAnswer === '') {
                this.mgr.speak("Please type your answer first.");
                this.answerElement.focus();
                return;
            }
            this.checkAnswer(userAnswer);
        }

        start() {
            this.level = 1;
            if (this.levelElement) this.levelElement.textContent = `Level: ${this.level}`;
            this.nextWord();
        }
    }

    const game = new SpellingGame(window.gameManager);
    game.start();
});