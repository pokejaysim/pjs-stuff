// Snake Competition Game Logic

class SnakeGame {
  constructor() {
    // Game constants
    this.GRID_SIZE = 20;
    this.GRID_WIDTH = 30;
    this.GRID_HEIGHT = 30;
    this.FRAME_RATE = 15;
    this.SNAKE_COLORS = [
      [255, 50, 50],   // Red
      [50, 255, 50],   // Green
      [50, 50, 255],   // Blue
      [255, 255, 50],  // Yellow
      [255, 50, 255]   // Purple
    ];
    this.MAX_FOOD = 3;
    
    // Game state
    this.snakes = [];
    this.foods = [];
    this.gameOver = false;
    this.paused = false;
    this.scores = [0, 0, 0, 0, 0];
    this.gameTime = 0;
    this.maxGameTime = 60 * this.FRAME_RATE; // 60 seconds
    
    // UI elements
    this.canvas = null;
    this.gameUI = null;
    this.gameOverOverlay = null;
    this.pauseOverlay = null;
    
    // Performance monitoring
    this.performanceMonitor = GameUtils.createPerformanceMonitor();
    
    this.init();
  }
  
  init() {
    this.setupUI();
    this.setupCanvas();
    this.setupEventListeners();
    this.setupSounds();
    this.startGame();
  }
  
  setupUI() {
    // Create game UI elements
    const wrapper = document.querySelector('.game-wrapper') || document.body;
    
    // Game stats UI
    this.gameUI = document.createElement('div');
    this.gameUI.className = 'game-ui';
    this.gameUI.innerHTML = `
      <div class="timer">Time: 60s</div>
      <div class="scores-container">
        ${this.SNAKE_COLORS.map((color, i) => `
          <div class="snake-score">
            <span class="snake-color" style="background-color: rgb(${color.join(',')})"></span>
            Snake ${i + 1}: <span class="score-value">0</span>
            <span class="snake-status">🐍</span>
          </div>
        `).join('')}
      </div>
    `;
    wrapper.appendChild(this.gameUI);
    
    // Game over overlay
    this.gameOverOverlay = document.createElement('div');
    this.gameOverOverlay.className = 'game-over-overlay';
    this.gameOverOverlay.style.display = 'none';
    this.gameOverOverlay.innerHTML = `
      <div class="game-over-title">GAME OVER</div>
      <div class="winner-text"></div>
      <div class="final-scores"></div>
      <div class="restart-hint">Click or tap to restart</div>
    `;
    wrapper.appendChild(this.gameOverOverlay);
    
    // Pause overlay
    this.pauseOverlay = document.createElement('div');
    this.pauseOverlay.className = 'pause-overlay';
    this.pauseOverlay.style.display = 'none';
    this.pauseOverlay.innerHTML = `
      <div class="pause-title">PAUSED</div>
      <div class="restart-hint">Press SPACE to continue</div>
    `;
    wrapper.appendChild(this.pauseOverlay);
    
    // Game controls
    const controls = document.createElement('div');
    controls.className = 'game-controls';
    controls.innerHTML = `
      <button class="control-btn pause-btn" title="Pause/Resume">⏸️</button>
      <button class="control-btn restart-btn" title="Restart">🔄</button>
    `;
    wrapper.appendChild(controls);
  }
  
  setupCanvas() {
    this.canvas = createCanvas(
      this.GRID_WIDTH * this.GRID_SIZE, 
      this.GRID_HEIGHT * this.GRID_SIZE
    );
    frameRate(this.FRAME_RATE);
    
    // Make canvas responsive
    GameUtils.setupResponsiveCanvas(this.canvas.canvas, 600, 600);
  }
  
  setupEventListeners() {
    // Mouse click for restart
    document.addEventListener('click', (e) => {
      if (this.gameOver && e.target.closest('.game-over-overlay')) {
        this.restartGame();
      }
    });
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      switch(e.code) {
        case 'Space':
          e.preventDefault();
          this.togglePause();
          break;
        case 'KeyR':
          this.restartGame();
          break;
        case 'Escape':
          this.togglePause();
          break;
      }
    });
    
    // Control buttons
    document.querySelector('.pause-btn')?.addEventListener('click', () => {
      this.togglePause();
    });
    
    document.querySelector('.restart-btn')?.addEventListener('click', () => {
      this.restartGame();
    });
    
    // Touch controls for mobile
    if (GameUtils.isMobile()) {
      GameUtils.setupTouchControls(document.body, {
        tap: () => {
          if (this.gameOver) {
            this.restartGame();
          } else {
            this.togglePause();
          }
        }
      });
    }
  }
  
  setupSounds() {
    if (window.soundManager) {
      // Load sound effects (placeholder URLs - replace with actual sounds)
      window.soundManager.load('eat', 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsEJHfK8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsEJHfK8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsEJHfK8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsEJHfK8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsEJHfK8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsEJHfK8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsEJHfK8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsEJHfK8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsEJHfK8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsEJHfK8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsEJHfK8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsEJHfK8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsEJHfK8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsEJHfK8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsEJHfK8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsEJHfK8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsE');
      window.soundManager.load('gameOver', 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsEJHfK8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsEJHfK8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsEJHfK8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsEJHfK8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsEJHfK8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsEJHfK8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsEJHfK8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsEJHfK8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsEJHfK8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsEJHfK8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsEJHfK8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsEJHfK8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsEJHfK8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsEJHfK8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsEJHfK8N2QQAoUXrTp66hVFApGn+DyvmYdBz2U2fPJeSsE');
    }
  }
  
  startGame() {
    this.resetGame();
    this.createSnakes();
    this.spawnInitialFood();
  }
  
  resetGame() {
    this.snakes = [];
    this.foods = [];
    this.scores = [0, 0, 0, 0, 0];
    this.gameTime = 0;
    this.gameOver = false;
    this.paused = false;
    this.hideOverlays();
    this.updateUI();
  }
  
  createSnakes() {
    const startPositions = [
      createVector(5, 5),                                    // Top left
      createVector(this.GRID_WIDTH - 5, 5),                 // Top right
      createVector(5, this.GRID_HEIGHT - 5),                // Bottom left
      createVector(this.GRID_WIDTH - 5, this.GRID_HEIGHT - 5), // Bottom right
      createVector(this.GRID_WIDTH/2, this.GRID_HEIGHT/2)   // Center
    ];
    
    for (let i = 0; i < 5; i++) {
      this.snakes.push(new Snake(i, startPositions[i], this.SNAKE_COLORS[i]));
    }
  }
  
  spawnInitialFood() {
    for (let i = 0; i < this.MAX_FOOD; i++) {
      this.addFood();
    }
  }
  
  togglePause() {
    if (this.gameOver) return;
    
    this.paused = !this.paused;
    this.pauseOverlay.style.display = this.paused ? 'flex' : 'none';
    
    // Update pause button
    const pauseBtn = document.querySelector('.pause-btn');
    if (pauseBtn) {
      pauseBtn.textContent = this.paused ? '▶️' : '⏸️';
    }
  }
  
  restartGame() {
    this.startGame();
  }
  
  hideOverlays() {
    this.gameOverOverlay.style.display = 'none';
    this.pauseOverlay.style.display = 'none';
  }
  
  update() {
    if (this.gameOver || this.paused) return;
    
    this.performanceMonitor.update();
    
    // Update game time
    this.gameTime++;
    if (this.gameTime >= this.maxGameTime) {
      this.endGame();
      return;
    }
    
    // Update snakes
    for (let snake of this.snakes) {
      if (snake.alive) {
        snake.think();
        snake.update();
      }
    }
    
    // Maintain food count
    while (this.foods.length < this.MAX_FOOD) {
      this.addFood();
    }
    
    // Check if all snakes are dead
    if (this.snakes.every(s => !s.alive)) {
      this.endGame();
    }
    
    this.updateUI();
  }
  
  draw() {
    background(20);
    
    // Draw grid
    this.drawGrid();
    
    // Draw food
    for (let food of this.foods) {
      food.draw();
    }
    
    // Draw snakes
    for (let snake of this.snakes) {
      snake.draw();
    }
  }
  
  drawGrid() {
    stroke(40);
    strokeWeight(1);
    
    // Vertical lines
    for (let i = 0; i <= this.GRID_WIDTH; i++) {
      line(i * this.GRID_SIZE, 0, i * this.GRID_SIZE, height);
    }
    
    // Horizontal lines
    for (let i = 0; i <= this.GRID_HEIGHT; i++) {
      line(0, i * this.GRID_SIZE, width, i * this.GRID_SIZE);
    }
  }
  
  updateUI() {
    // Update timer
    const timeLeft = Math.max(0, Math.floor((this.maxGameTime - this.gameTime) / this.FRAME_RATE));
    document.querySelector('.timer').textContent = `Time: ${timeLeft}s`;
    
    // Update scores
    const scoreElements = document.querySelectorAll('.snake-score');
    scoreElements.forEach((el, i) => {
      const scoreValue = el.querySelector('.score-value');
      const status = el.querySelector('.snake-status');
      
      scoreValue.textContent = this.scores[i];
      status.textContent = this.snakes[i]?.alive ? '🐍' : '💀';
    });
  }
  
  endGame() {
    this.gameOver = true;
    
    if (window.soundManager) {
      window.soundManager.play('gameOver', 0.3);
    }
    
    // Find winner
    const maxScore = Math.max(...this.scores);
    const winnerIndex = this.scores.indexOf(maxScore);
    
    // Update game over overlay
    const winnerText = document.querySelector('.winner-text');
    winnerText.innerHTML = `<span style="color: rgb(${this.SNAKE_COLORS[winnerIndex].join(',')})">${
      this.snakes[winnerIndex].alive ? '🐍' : '💀'
    } Snake ${winnerIndex + 1}</span> wins with ${maxScore} points!`;
    
    // Show final scores
    const finalScores = document.querySelector('.final-scores');
    finalScores.innerHTML = this.scores.map((score, i) => 
      `<div style="color: rgb(${this.SNAKE_COLORS[i].join(',')})">
        Snake ${i + 1}: ${score} points
      </div>`
    ).join('');
    
    this.gameOverOverlay.style.display = 'flex';
    
    // Save high score
    GameUtils.saveHighScore('snake_competition', maxScore);
  }
  
  addFood() {
    let pos;
    let overlapping;
    let attempts = 0;
    const maxAttempts = 100;
    
    do {
      overlapping = false;
      attempts++;
      
      pos = createVector(
        Math.floor(Math.random() * (this.GRID_WIDTH - 2)) + 1,
        Math.floor(Math.random() * (this.GRID_HEIGHT - 2)) + 1
      );
      
      // Check overlap with existing food
      for (let food of this.foods) {
        if (food.pos.x === pos.x && food.pos.y === pos.y) {
          overlapping = true;
          break;
        }
      }
      
      // Check overlap with snakes
      if (!overlapping) {
        for (let snake of this.snakes) {
          for (let segment of snake.body) {
            if (segment.x === pos.x && segment.y === pos.y) {
              overlapping = true;
              break;
            }
          }
          if (overlapping) break;
        }
      }
    } while (overlapping && attempts < maxAttempts);
    
    if (attempts < maxAttempts) {
      this.foods.push(new Food(pos));
    }
  }
  
  checkFoodCollision(snake) {
    const head = snake.body[0];
    
    for (let i = 0; i < this.foods.length; i++) {
      const food = this.foods[i];
      if (head.x === food.pos.x && head.y === food.pos.y) {
        this.foods.splice(i, 1);
        this.scores[snake.id]++;
        
        if (window.soundManager) {
          window.soundManager.play('eat', 0.2);
        }
        
        return true;
      }
    }
    
    return false;
  }
}

// Snake class
class Snake {
  constructor(id, pos, color) {
    this.id = id;
    this.color = color;
    this.body = [pos.copy()];
    this.velocity = createVector(1, 0);
    this.alive = true;
    this.growCount = 2;
    this.lastDirection = 'right';
    
    // AI personality traits
    this.personality = {
      aggressiveness: Math.random() * 0.6 + 0.2,
      carefulness: Math.random() * 0.6 + 0.3,
      foodPriority: Math.random() * 0.4 + 0.6,
      intelligence: id === 0 ? Math.random() * 0.2 + 0.7 : Math.random() * 0.3 + 0.5
    };
  }
  
  think() {
    if (!this.alive) return;
    
    // Find nearest food
    const nearestFood = this.findNearestFood();
    if (!nearestFood) return;
    
    const directions = [
      { dx: 1, dy: 0, name: 'right' },
      { dx: -1, dy: 0, name: 'left' },
      { dx: 0, dy: 1, name: 'down' },
      { dx: 0, dy: -1, name: 'up' }
    ];
    
    // Filter out reverse direction
    const validDirections = directions.filter(dir => {
      return !((this.lastDirection === 'right' && dir.name === 'left') ||
               (this.lastDirection === 'left' && dir.name === 'right') ||
               (this.lastDirection === 'up' && dir.name === 'down') ||
               (this.lastDirection === 'down' && dir.name === 'up'));
    });
    
    // Score each direction
    const scoredDirections = validDirections.map(dir => {
      const newHead = createVector(
        this.body[0].x + dir.dx,
        this.body[0].y + dir.dy
      );
      
      if (this.wouldDie(newHead)) {
        return { dir, score: -1000 };
      }
      
      let score = 0;
      
      // Distance to food
      const foodDistance = this.manhattanDistance(newHead, nearestFood.pos);
      score -= foodDistance * this.personality.foodPriority;
      
      // Safety check
      const safetyScore = this.checkSafety(newHead) * this.personality.carefulness * 10;
      score += safetyScore;
      
      // Direction preference
      if ((nearestFood.pos.x > this.body[0].x && dir.name === 'right') ||
          (nearestFood.pos.x < this.body[0].x && dir.name === 'left') ||
          (nearestFood.pos.y > this.body[0].y && dir.name === 'down') ||
          (nearestFood.pos.y < this.body[0].y && dir.name === 'up')) {
        score += 20 * this.personality.intelligence;
      }
      
      // Add some randomness
      score += (Math.random() - 0.5) * 10;
      
      return { dir, score };
    });
    
    // Choose best valid direction
    const safeMoves = scoredDirections.filter(item => item.score > -999);
    
    if (safeMoves.length > 0) {
      safeMoves.sort((a, b) => b.score - a.score);
      const chosen = safeMoves[0].dir;
      this.velocity.x = chosen.dx;
      this.velocity.y = chosen.dy;
      this.lastDirection = chosen.name;
    } else {
      // No safe moves, pick random valid direction
      const randomDir = validDirections[Math.floor(Math.random() * validDirections.length)];
      this.velocity.x = randomDir.dx;
      this.velocity.y = randomDir.dy;
      this.lastDirection = randomDir.name;
    }
  }
  
  findNearestFood() {
    let nearest = null;
    let minDistance = Infinity;
    
    for (let food of game.foods) {
      const distance = this.manhattanDistance(this.body[0], food.pos);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = food;
      }
    }
    
    return nearest;
  }
  
  manhattanDistance(pos1, pos2) {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  }
  
  checkSafety(pos) {
    let safeDirections = 0;
    const checkDirs = [
      { x: 1, y: 0 }, { x: -1, y: 0 },
      { x: 0, y: 1 }, { x: 0, y: -1 }
    ];
    
    for (let dir of checkDirs) {
      const checkPos = createVector(pos.x + dir.x, pos.y + dir.y);
      if (!this.wouldDie(checkPos)) {
        safeDirections++;
      }
    }
    
    return safeDirections;
  }
  
  wouldDie(newHead) {
    // Wall collision
    if (newHead.x < 0 || newHead.x >= game.GRID_WIDTH || 
        newHead.y < 0 || newHead.y >= game.GRID_HEIGHT) {
      return true;
    }
    
    // Self collision (excluding tail if not growing)
    const checkLength = this.growCount > 0 ? this.body.length : this.body.length - 1;
    for (let i = 0; i < checkLength; i++) {
      if (this.body[i].x === newHead.x && this.body[i].y === newHead.y) {
        return true;
      }
    }
    
    // Other snake collision
    for (let snake of game.snakes) {
      if (snake !== this && snake.alive) {
        for (let segment of snake.body) {
          if (segment.x === newHead.x && segment.y === newHead.y) {
            return true;
          }
        }
      }
    }
    
    return false;
  }
  
  update() {
    if (!this.alive) return;
    
    const newHead = createVector(
      this.body[0].x + this.velocity.x,
      this.body[0].y + this.velocity.y
    );
    
    if (this.wouldDie(newHead)) {
      this.alive = false;
      return;
    }
    
    this.body.unshift(newHead);
    
    // Check food collision
    if (game.checkFoodCollision(this)) {
      this.growCount += 3;
    }
    
    // Remove tail unless growing
    if (this.growCount > 0) {
      this.growCount--;
    } else {
      this.body.pop();
    }
  }
  
  draw() {
    noStroke();
    
    for (let i = 0; i < this.body.length; i++) {
      let segmentColor = [...this.color];
      const alpha = this.alive ? 255 : 120;
      
      if (i === 0) {
        // Head - brighter
        segmentColor = segmentColor.map(c => Math.min(c + 50, 255));
      } else {
        // Body - gradient effect
        const gradientFactor = 1 - (i / this.body.length) * 0.5;
        segmentColor = segmentColor.map(c => c * gradientFactor);
      }
      
      fill(segmentColor[0], segmentColor[1], segmentColor[2], alpha);
      
      const x = this.body[i].x * game.GRID_SIZE;
      const y = this.body[i].y * game.GRID_SIZE;
      
      if (i === 0) {
        // Head - circle with eyes
        ellipse(x + game.GRID_SIZE/2, y + game.GRID_SIZE/2, 
                game.GRID_SIZE * 0.9, game.GRID_SIZE * 0.9);
        
        // Eyes
        fill(10);
        let eyeOffsetX = 0, eyeOffsetY = 0;
        
        switch(this.lastDirection) {
          case 'right': eyeOffsetX = 3; break;
          case 'left': eyeOffsetX = -3; break;
          case 'down': eyeOffsetY = 3; break;
          case 'up': eyeOffsetY = -3; break;
        }
        
        const eyeSize = game.GRID_SIZE * 0.2;
        ellipse(x + game.GRID_SIZE/2 + eyeOffsetX + game.GRID_SIZE/5, 
                y + game.GRID_SIZE/2 - game.GRID_SIZE/6, eyeSize, eyeSize);
        ellipse(x + game.GRID_SIZE/2 + eyeOffsetX - game.GRID_SIZE/5, 
                y + game.GRID_SIZE/2 - game.GRID_SIZE/6, eyeSize, eyeSize);
      } else {
        // Body - rounded rectangle
        rect(x + game.GRID_SIZE * 0.1, y + game.GRID_SIZE * 0.1,
             game.GRID_SIZE * 0.8, game.GRID_SIZE * 0.8, game.GRID_SIZE * 0.3);
      }
    }
  }
}

// Food class
class Food {
  constructor(pos) {
    this.pos = pos;
    this.color = [
      GameUtils.randomBetween(150, 255),
      GameUtils.randomBetween(150, 255),
      GameUtils.randomBetween(150, 255)
    ];
    this.pulseSize = GameUtils.randomBetween(0.6, 0.8);
    this.pulseSpeed = GameUtils.randomBetween(0.05, 0.1);
    this.pulseOffset = GameUtils.randomBetween(0, TWO_PI);
  }
  
  draw() {
    const pulse = this.pulseSize + sin(frameCount * this.pulseSpeed + this.pulseOffset) * 0.1;
    
    strokeWeight(3);
    stroke(this.color[0], this.color[1], this.color[2], 100);
    fill(this.color[0], this.color[1], this.color[2], 200);
    
    const x = this.pos.x * game.GRID_SIZE + game.GRID_SIZE/2;
    const y = this.pos.y * game.GRID_SIZE + game.GRID_SIZE/2;
    
    push();
    translate(x, y);
    rotate(frameCount * 0.01);
    
    beginShape();
    for (let i = 0; i < 5; i++) {
      const angle1 = TWO_PI / 5 * i;
      const x1 = cos(angle1) * game.GRID_SIZE/2 * pulse;
      const y1 = sin(angle1) * game.GRID_SIZE/2 * pulse;
      vertex(x1, y1);
      
      const angle2 = TWO_PI / 5 * (i + 0.5);
      const x2 = cos(angle2) * game.GRID_SIZE/4 * pulse;
      const y2 = sin(angle2) * game.GRID_SIZE/4 * pulse;
      vertex(x2, y2);
    }
    endShape(CLOSE);
    pop();
  }
}

// Global game instance
let game;

// p5.js setup and draw functions
function setup() {
  game = new SnakeGame();
}

function draw() {
  game.update();
  game.draw();
}