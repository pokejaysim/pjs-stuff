// Common utilities for all PJS Games

class GameUtils {
  // Local storage helper for high scores
  static saveHighScore(gameName, score, playerName = 'Anonymous') {
    const key = `pjs_${gameName}_highscores`;
    let scores = this.getHighScores(gameName);
    
    scores.push({
      score: score,
      player: playerName,
      date: new Date().toISOString()
    });
    
    // Sort by score (descending) and keep top 10
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 10);
    
    localStorage.setItem(key, JSON.stringify(scores));
    return scores;
  }
  
  static getHighScores(gameName) {
    const key = `pjs_${gameName}_highscores`;
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
      return [];
    }
  }
  
  // Sound management
  static createSoundManager() {
    return {
      enabled: localStorage.getItem('pjs_sound_enabled') !== 'false',
      sounds: {},
      
      toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('pjs_sound_enabled', this.enabled.toString());
        this.updateUI();
      },
      
      play(soundName, volume = 0.5) {
        if (!this.enabled || !this.sounds[soundName]) return;
        
        try {
          const sound = this.sounds[soundName].cloneNode();
          sound.volume = volume;
          sound.play().catch(() => {}); // Ignore autoplay restrictions
        } catch (e) {
          // Ignore sound errors
        }
      },
      
      load(soundName, url) {
        const audio = new Audio(url);
        audio.preload = 'auto';
        this.sounds[soundName] = audio;
      },
      
      updateUI() {
        const toggleBtn = document.querySelector('.sound-toggle');
        if (toggleBtn) {
          toggleBtn.textContent = this.enabled ? '🔊 Sound' : '🔇 Muted';
          toggleBtn.classList.toggle('muted', !this.enabled);
        }
      }
    };
  }
  
  // Performance monitoring
  static createPerformanceMonitor() {
    return {
      fps: 60,
      frameCount: 0,
      lastTime: Date.now(),
      
      update() {
        this.frameCount++;
        const now = Date.now();
        if (now - this.lastTime >= 1000) {
          this.fps = this.frameCount;
          this.frameCount = 0;
          this.lastTime = now;
        }
      },
      
      getFPS() {
        return this.fps;
      }
    };
  }
  
  // Responsive canvas helper
  static setupResponsiveCanvas(canvas, maxWidth = 800, maxHeight = 600) {
    const container = canvas.parentElement;
    
    function resize() {
      const containerRect = container.getBoundingClientRect();
      const screenWidth = Math.min(containerRect.width - 40, maxWidth);
      const screenHeight = Math.min(window.innerHeight - 200, maxHeight);
      
      const aspectRatio = maxWidth / maxHeight;
      let newWidth = screenWidth;
      let newHeight = screenWidth / aspectRatio;
      
      if (newHeight > screenHeight) {
        newHeight = screenHeight;
        newWidth = screenHeight * aspectRatio;
      }
      
      canvas.style.width = newWidth + 'px';
      canvas.style.height = newHeight + 'px';
    }
    
    window.addEventListener('resize', resize);
    resize();
    
    return { resize };
  }
  
  // Mobile detection
  static isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768);
  }
  
  // Touch controls helper
  static setupTouchControls(element, callbacks) {
    if (!this.isMobile()) return;
    
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    element.addEventListener('touchstart', (e) => {
      e.preventDefault();
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: false });
    
    element.addEventListener('touchend', (e) => {
      e.preventDefault();
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      const minSwipeDistance = 50;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0 && callbacks.swipeRight) callbacks.swipeRight();
          else if (deltaX < 0 && callbacks.swipeLeft) callbacks.swipeLeft();
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
          if (deltaY > 0 && callbacks.swipeDown) callbacks.swipeDown();
          else if (deltaY < 0 && callbacks.swipeUp) callbacks.swipeUp();
        }
      }
      
      // Tap detection
      if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && callbacks.tap) {
        callbacks.tap();
      }
    }, { passive: false });
  }
  
  // Game state management
  static createGameState() {
    return {
      state: 'loading', // loading, menu, playing, paused, gameOver
      score: 0,
      level: 1,
      lives: 3,
      
      setState(newState) {
        this.state = newState;
        this.notifyStateChange();
      },
      
      addScore(points) {
        this.score += points;
        this.notifyScoreChange();
      },
      
      notifyStateChange() {
        const event = new CustomEvent('gameStateChange', { 
          detail: { state: this.state } 
        });
        document.dispatchEvent(event);
      },
      
      notifyScoreChange() {
        const event = new CustomEvent('gameScoreChange', { 
          detail: { score: this.score } 
        });
        document.dispatchEvent(event);
      }
    };
  }
  
  // Animation helpers
  static lerp(start, end, factor) {
    return start + (end - start) * factor;
  }
  
  static easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
  
  // Color utilities
  static hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
  
  static rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  
  // Random utilities
  static randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }
  
  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  static randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
  
  // Debounce function for performance
  static debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  }
}

// Initialize common elements when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Add navigation back button if it doesn't exist
  if (!document.querySelector('.game-nav')) {
    const nav = document.createElement('div');
    nav.className = 'game-nav';
    nav.innerHTML = '<a href="../index.html" class="back-btn">Games</a>';
    document.body.appendChild(nav);
  }
  
  // Add sound toggle if it doesn't exist
  if (!document.querySelector('.sound-toggle')) {
    const soundManager = GameUtils.createSoundManager();
    const controls = document.querySelector('.game-controls') || document.body;
    
    const soundBtn = document.createElement('button');
    soundBtn.className = 'control-btn sound-toggle';
    soundBtn.textContent = soundManager.enabled ? '🔊 Sound' : '🔇 Muted';
    soundBtn.addEventListener('click', () => soundManager.toggle());
    
    if (controls === document.body) {
      // Create a controls container
      const controlsDiv = document.createElement('div');
      controlsDiv.className = 'game-controls';
      controlsDiv.appendChild(soundBtn);
      
      // Insert after title or at the top
      const title = document.querySelector('.game-title, h1');
      if (title) {
        title.parentNode.insertBefore(controlsDiv, title.nextSibling);
      } else {
        document.body.insertBefore(controlsDiv, document.body.firstChild);
      }
    } else {
      controls.appendChild(soundBtn);
    }
    
    // Store reference for other scripts
    window.soundManager = soundManager;
  }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameUtils;
} else {
  window.GameUtils = GameUtils;
}