document.addEventListener('DOMContentLoaded', () => {
    class MathQuizGame {
        constructor(manager) {
            this.mgr = manager;
            
            this.questionElement = document.getElementById('question');
            this.answerElement = document.getElementById('answer');
            this.submitButton = document.getElementById('submit');
            this.levelElement = document.getElementById('level');
            this.timerElement = document.getElementById('timer');

            this.level = 1;
            this.timer = null;
            this.timeLeft = 15;
            this.dynamicTime = 15;
            this.correctAnswer = 0;
            this.combo = 0;

            this.operations = [
                { symbol: '+', label: 'Addition Blast', minLevel: 1, fn: (a, b) => a + b },
                { symbol: '-', label: 'Subtraction Slide', minLevel: 2, fn: (a, b) => a - b },
                { symbol: '×', label: 'Multiplication Magic', minLevel: 3, fn: (a, b) => a * b }
            ];

            this.submitButton.addEventListener('click', () => {
                this.mgr.playSound('click');
                this.handleSubmit();
            });

            this.answerElement.addEventListener('keyup', (event) => {
                if (event.key === 'Enter') {
                    this.handleSubmit();
                }
            });
        }

        checkBadges() {
            if (this.level >= 2) this.mgr.unlockBadge('math_genius_1', 'Math Beginner');
            if (this.level >= 5) this.mgr.unlockBadge('math_genius_2', 'Math Adept');
            if (this.level >= 10) this.mgr.unlockBadge('math_genius_3', 'Math Wizard');
        }

        startTimer() {
            clearInterval(this.timer);
            this.timeLeft = this.dynamicTime;
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

        pickOperation() {
            const available = this.operations.filter(op => this.level >= op.minLevel);
            return available[Math.floor(Math.random() * available.length)];
        }

        generateOperands(operation) {
            const difficulty = Math.min(this.level, 8);
            const max = 5 + difficulty * 5;
            let a = Math.floor(Math.random() * max) + 1;
            let b = Math.floor(Math.random() * max) + 1;
            if (operation.symbol === '-') {
                if (a < b) [a, b] = [b, a];
            }
            if (operation.symbol === '×') {
                a = Math.floor(Math.random() * (6 + difficulty)) + 1;
                b = Math.floor(Math.random() * (5 + difficulty)) + 1;
            }
            return [a, b];
        }

        generateQuestion() {
            this.mgr.setCharacterExpression('neutral');
            this.answerElement.disabled = false;
            this.submitButton.disabled = false;

            const operation = this.pickOperation();
            const [a, b] = this.generateOperands(operation);
            this.correctAnswer = operation.fn(a, b);

            this.questionElement.innerHTML = `
                <span class="quiz-label">${operation.label}</span>
                <span class="quiz-equation">${a} ${operation.symbol} ${b} = ?</span>
            `;
            this.answerElement.value = '';
            this.answerElement.focus();
            this.startTimer();

            let verbalSymbol = '';
            if (operation.symbol === '+') verbalSymbol = 'plus';
            else if (operation.symbol === '-') verbalSymbol = 'minus';
            else if (operation.symbol === '×') verbalSymbol = 'times';

            this.mgr.speak(`What is ${a} ${verbalSymbol} ${b}?`);
        }

        handleCorrectAnswer() {
            const timeTaken = this.dynamicTime - this.timeLeft;
            if (timeTaken < 3) this.dynamicTime = Math.max(5, this.dynamicTime - 1);
            else if (timeTaken > 10) this.dynamicTime = Math.min(20, this.dynamicTime + 1);

            this.mgr.playSound('correct');
            this.mgr.setCharacterExpression('happy');
            this.combo++;
            
            const points = 1 + (this.combo > 1 ? this.combo - 1 : 0);
            this.mgr.addScore(points);
            this.mgr.addStar(1);
            
            const message = this.combo > 1 ? `Combo x${this.combo}! Sparkly math!` : 'You got it!';
            this.mgr.showPopup(true, 'Correct!', message, () => this.generateQuestion());
            this.mgr.speak(`Correct! ${message}`);

            if (this.mgr.gameScore > 0 && this.mgr.gameScore % 5 === 0) {
                this.level++;
                this.levelElement.textContent = `Level: ${this.level}`;
                this.mgr.speak(`Wow! Level ${this.level} unlocked!`);
            }
            this.checkBadges();
        }

        handleWrongAnswer(message) {
            this.dynamicTime = Math.min(20, this.dynamicTime + 2);
            this.mgr.playSound('incorrect');
            this.mgr.setCharacterExpression('sad');
            this.combo = 0;
            const fullMessage = `${message} The correct answer was ${this.correctAnswer}.`;
            this.mgr.showPopup(false, 'Oops!', fullMessage, () => this.generateQuestion());
            this.mgr.speak(fullMessage);
        }

        checkAnswer(userAnswer) {
            clearInterval(this.timer);
            this.answerElement.disabled = true;
            this.submitButton.disabled = true;

            if (userAnswer === null) {
                this.handleWrongAnswer("Time's up!");
                return;
            }

            if (userAnswer === this.correctAnswer) {
                this.handleCorrectAnswer();
            } else {
                this.handleWrongAnswer('Not quite!');
            }
        }

        handleSubmit() {
            const userAnswerText = this.answerElement.value.trim();
            if (userAnswerText === '') {
                this.mgr.speak("Please type an answer first.");
                this.answerElement.focus();
                return;
            }
            const userAnswer = Number(userAnswerText);
            if (Number.isNaN(userAnswer)) {
                this.mgr.speak("Numbers only, please.");
                this.answerElement.value = '';
                this.answerElement.focus();
                return;
            }
            this.checkAnswer(userAnswer);
        }

        start() {
            this.level = 1;
            this.combo = 0;
            if (this.levelElement) this.levelElement.textContent = `Level: ${this.level}`;
            this.generateQuestion();
        }
    }

    const game = new MathQuizGame(window.gameManager);
    game.start();
});