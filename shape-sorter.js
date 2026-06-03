document.addEventListener('DOMContentLoaded', () => {
    class ShapeSorterGame {
        constructor(manager) {
            this.mgr = manager;
            
            this.shapeContainer = document.getElementById('shape-container');
            this.categoryContainer = document.getElementById('category-container');
            this.levelElement = document.getElementById('level');
            this.timerElement = document.getElementById('timer');

            this.shapes = [
                { name: 'Circle', category: 'Round', icon: '⭕', color: '#ffcb77' },
                { name: 'Oval', category: 'Round', icon: '🏵️', color: '#ffd166' },
                { name: 'Square', category: 'Quadrilateral', icon: '🟥', color: '#ef476f' },
                { name: 'Rectangle', category: 'Quadrilateral', icon: '🧱', color: '#f94144' },
                { name: 'Triangle', category: 'Triangle', icon: '🔺', color: '#06d6a0' },
                { name: 'Star', category: 'Polygon', icon: '⭐', color: '#ffd23f' },
                { name: 'Pentagon', category: 'Polygon', icon: '⬟', color: '#118ab2' },
                { name: 'Hexagon', category: 'Polygon', icon: '⬢', color: '#073b4c' },
                { name: 'Heart', category: 'Symbol', icon: '❤️', color: '#ef476f' },
                { name: 'Diamond', category: 'Symbol', icon: '💎', color: '#8ecae6' },
                { name: 'Arrow', category: 'Symbol', icon: '➡️', color: '#f9844a' },
                { name: 'Cube', category: '3D Shape', icon: '🧊', color: '#219ebc' }
            ];

            this.levels = [
                { categories: ['Round', 'Quadrilateral'], count: 4, time: 25 },
                { categories: ['Round', 'Triangle', 'Quadrilateral'], count: 6, time: 30 },
                { categories: ['Polygon', 'Symbol', '3D Shape'], count: 7, time: 35 },
                { categories: ['Round', 'Polygon', 'Symbol', '3D Shape'], count: 8, time: 35 }
            ];

            this.level = 1;
            this.timer = null;
            this.timeLeft = 30;
            this.currentShapes = [];
            this.placedShapes = 0;
            this.draggedShape = null;
        }

        checkBadges() {
            if (this.mgr.gameScore >= 10) this.mgr.unlockBadge('shape_sorter_1', 'Shape Sorter');
        }

        shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        startTimer(duration) {
            clearInterval(this.timer);
            this.timeLeft = duration;
            this.timerElement.textContent = `Time: ${this.timeLeft}`;
            this.timer = setInterval(() => {
                this.timeLeft--;
                this.timerElement.textContent = `Time: ${this.timeLeft}`;
                if (this.timeLeft <= 0) {
                    clearInterval(this.timer);
                    this.mgr.playSound('incorrect');
                    this.mgr.setCharacterExpression('sad');
                    this.mgr.showPopup(false, "Time's Up!", "Don't worry, you can try again.", () => this.renderBoard());
                }
            }, 1000);
        }

        buildShapeToken(shape) {
            const token = document.createElement('button');
            token.type = 'button';
            token.className = 'shape-token m-2 p-4 bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:border-blue-400 transition-all';
            token.style.setProperty('--shape-color', shape.color);
            token.setAttribute('draggable', 'true');
            token.dataset.category = shape.category;
            token.dataset.name = shape.name;
            token.innerHTML = `<span class="shape-icon text-3xl block mb-1">${shape.icon}</span><span class="shape-name text-xs font-bold uppercase">${shape.name}</span>`;
            
            token.addEventListener('dragstart', (e) => {
                this.draggedShape = e.target.closest('.shape-token');
                e.dataTransfer.setData('text/plain', this.draggedShape.dataset.category);
                setTimeout(() => this.draggedShape.classList.add('opacity-50'), 0);
            });
            
            token.addEventListener('dragend', () => {
                if (this.draggedShape) this.draggedShape.classList.remove('opacity-50');
            });

            return token;
        }

        buildCategoryTile(category) {
            const tile = document.createElement('div');
            tile.className = 'category-dropzone p-6 border-4 border-dashed border-gray-300 rounded-2xl min-h-[120px] flex flex-col items-center justify-center transition-all bg-gray-50';
            tile.dataset.category = category;
            tile.innerHTML = `<span class="drop-label font-bold text-gray-400 uppercase tracking-widest mb-2">${category}</span><div class="drop-space flex flex-wrap justify-center"></div>`;
            
            tile.addEventListener('dragover', (e) => {
                e.preventDefault();
                tile.classList.add('border-blue-400', 'bg-blue-50');
            });
            
            tile.addEventListener('dragleave', () => {
                tile.classList.remove('border-blue-400', 'bg-blue-50');
            });
            
            tile.addEventListener('drop', (e) => {
                e.preventDefault();
                tile.classList.remove('border-blue-400', 'bg-blue-50');
                if (!this.draggedShape) return;

                const expected = tile.dataset.category;
                const actual = this.draggedShape.dataset.category;

                if (expected === actual) {
                    this.mgr.playSound('correct');
                    this.mgr.setCharacterExpression('happy');
                    this.mgr.addScore(1);
                    this.mgr.addStar(1);
                    this.placedShapes++;
                    
                    const dropSpace = tile.querySelector('.drop-space');
                    this.draggedShape.classList.add('scale-75', 'm-1');
                    this.draggedShape.setAttribute('draggable', 'false');
                    dropSpace.appendChild(this.draggedShape);
                    
                    this.draggedShape = null;
                    this.checkLevelComplete();
                } else {
                    this.mgr.playSound('incorrect');
                    this.mgr.setCharacterExpression('sad');
                }
            });
            
            return tile;
        }

        renderBoard() {
            this.mgr.setCharacterExpression('neutral');
            this.shapeContainer.innerHTML = '';
            this.categoryContainer.innerHTML = '';

            const levelConfig = this.levels[Math.min(this.level - 1, this.levels.length - 1)];
            
            const pool = this.shapes.filter(shape => levelConfig.categories.includes(shape.category));
            this.shuffle(pool);
            this.currentShapes = pool.slice(0, levelConfig.count);
            this.placedShapes = 0;

            const shuffledShapes = [...this.currentShapes];
            this.shuffle(shuffledShapes);

            this.shapeContainer.className = 'shape-bank flex flex-wrap justify-center mb-8 bg-gray-100 p-6 rounded-2xl';
            shuffledShapes.forEach(shape => this.shapeContainer.appendChild(this.buildShapeToken(shape)));

            this.categoryContainer.className = 'category-grid grid grid-cols-2 gap-4';
            levelConfig.categories.forEach(category => this.categoryContainer.appendChild(this.buildCategoryTile(category)));

            this.startTimer(levelConfig.time);
        }

        checkLevelComplete() {
            if (this.placedShapes === this.currentShapes.length) {
                clearInterval(this.timer);
                this.checkBadges();
                
                if (this.level < this.levels.length) {
                    this.level++;
                    if (this.levelElement) this.levelElement.textContent = `Level: ${this.level}`;
                    this.mgr.showPopup(true, 'Level Complete!', 'Great job! On to the next level.', () => this.renderBoard());
                } else {
                    this.level = 1;
                    this.mgr.showPopup(true, 'You Won!', 'You sorted all the shapes!', () => this.renderBoard());
                }
            }
        }

        start() {
            this.level = 1;
            if (this.levelElement) this.levelElement.textContent = `Level: ${this.level}`;
            this.renderBoard();
        }
    }

    const game = new ShapeSorterGame(window.gameManager);
    game.start();
});