/ ==================== DOPE DICE v2.0 - ENHANCED ====================
// Complete Yahtzee Game Engine with Advanced Features

const Game = {
  state: {
    // Player state
    playerDice: [1, 2, 3, 4, 5],
    playerHeld: [false, false, false, false, false],
    playerRollsLeft: 3,
    playerScores: {},
    
    // CPU state
    cpuDice: [1, 1, 1, 1, 1],
    cpuHeld: [false, false, false, false, false],
    cpuRollsLeft: 3,
    cpuScores: {},
    
    // Game state
    currentTurn: 'player',
    gameActive: false,
    difficulty: 'medium',
    roundNumber: 1,
    
    // Settings
    settings: {
      sound: true,
      vibration: true,
      theme: 'green',
      animations: true
    },
    
    // Stats
    history: [],
    highScores: [],
    stats: {
      gamesPlayed: 0,
      gamesWon: 0,
      yahtzees: 0,
      totalScore: 0
    }
  },
  
  categories: [
    { id: 'ones', name: 'Ones', type: 'upper', hint: 'Sum of all 1s' },
    { id: 'twos', name: 'Twos', type: 'upper', hint: 'Sum of all 2s' },
    { id: 'threes', name: 'Threes', type: 'upper', hint: 'Sum of all 3s' },
    { id: 'fours', name: 'Fours', type: 'upper', hint: 'Sum of all 4s' },
    { id: 'fives', name: 'Fives', type: 'upper', hint: 'Sum of all 5s' },
    { id: 'sixes', name: 'Sixes', type: 'upper', hint: 'Sum of all 6s' },
    { id: 'threeKind', name: '3 of a Kind', type: 'lower', hint: 'At least 3 same dice' },
    { id: 'fourKind', name: '4 of a Kind', type: 'lower', hint: 'At least 4 same dice' },
    { id: 'fullHouse', name: 'Full House', type: 'lower', hint: '3 of one + 2 of another' },
    { id: 'smallStraight', name: 'Small Straight', type: 'lower', hint: '4 consecutive dice' },
    { id: 'largeStraight', name: 'Large Straight', type: 'lower', hint: '5 consecutive dice' },
    { id: 'yahtzee', name: 'Yahtzee', type: 'lower', hint: 'All 5 dice the same!' },
    { id: 'chance', name: 'Chance', type: 'lower', hint: 'Sum of all dice' }
  ],
  
  init() {
    this.loadAllData();
    this.setupEventListeners();
    this.renderScoreboard();
    this.updateDiceDisplay();
    this.hideSplash();
    this.setStatus('Welcome to Dope Dice! 🍃 Tap New Game to start.');
  },
  
  loadAllData() {
    this.loadSettings();
    this.loadHistory();
    this.loadStats();
  },
  
  hideSplash() {
    setTimeout(() => {
      const splash = document.getElementById('splash');
      if (splash) {
        splash.classList.add('hidden');
        setTimeout(() => splash.remove(), 500);
      }
    }, 1500);
  }
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
        .then(() => console.log('✅ Service Worker registered'))
        .catch(err => console.log('❌ SW registration failed:', err));
    }
    
    // Initialize game
    Game.init();
    
  } catch (error) {
    console.error('❌ Initialization error:', error);
    alert('Error starting game. Please refresh the page.');
  }
});

// ==================== EVENT LISTENERS ====================
Game.setupEventListeners = function() {
  // Menu button
  const menuBtn = document.getElementById('menuBtn');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => this.showOverlay('menuOverlay'));
  }
  
  // Close buttons
  const closeButtons = {
    'closeMenu': 'menuOverlay',
    'closeHistory': 'historyOverlay',
    'closeSettings': 'settingsOverlay',
    'closeAbout': 'aboutOverlay'
  };
  
  Object.entries(closeButtons).forEach(([btnId, overlayId]) => {
    const btn = document.getElementById(btnId);
    if (btn) btn.addEventListener('click', () => this.hideOverlay(overlayId));
  });
  
  // Bottom navigation
  const navButtons = {
    'navNewGame': () => this.startNewGame(),
    'navHistory': () => {
      this.loadHistory();
      this.showOverlay('historyOverlay');
    },
    'navSettings': () => this.showOverlay('settingsOverlay'),
    'navAbout': () => this.showOverlay('aboutOverlay')
  };
  
  Object.entries(navButtons).forEach(([id, handler]) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', handler);
  });
  
  // Menu options
  const menuOptions = {
    'menuNewGame': () => {
      this.hideOverlay('menuOverlay');
      this.startNewGame();
    },
    'menuHistory': () => {
      this.hideOverlay('menuOverlay');
      this.loadHistory();
      this.showOverlay('historyOverlay');
    },
    'menuSettings': () => {
      this.hideOverlay('menuOverlay');
      this.showOverlay('settingsOverlay');
    },
    'menuAbout': () => {
      this.hideOverlay('menuOverlay');
      this.showOverlay('aboutOverlay');
    }
  };
  
  Object.entries(menuOptions).forEach(([id, handler]) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', handler);
  });
  
  // Settings
  const difficulty = document.getElementById('difficulty');
  if (difficulty) {
    difficulty.addEventListener('change', (e) => {
      this.state.difficulty = e.target.value;
      this.saveSettings();
      this.playSound('click');
    });
  }
  
  const soundToggle = document.getElementById('soundToggle');
  if (soundToggle) {
    soundToggle.addEventListener('change', (e) => {
      this.state.settings.sound = e.target.value === 'on';
      this.saveSettings();
      this.playSound('click');
    });
  }
  
  const vibrationToggle = document.getElementById('vibrationToggle');
  if (vibrationToggle) {
    vibrationToggle.addEventListener('change', (e) => {
      this.state.settings.vibration = e.target.value === 'on';
      this.saveSettings();
      if (e.target.value === 'on') this.vibrate(50);
    });
  }
  
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('change', (e) => {
      this.state.settings.theme = e.target.value;
      this.saveSettings();
      this.applyTheme(e.target.value);
    });
  }
  
  // Clear history
  const clearHistoryBtn = document.getElementById('clearHistory');
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => this.clearHistory());
  }
  
  // Roll button
  const rollBtn = document.getElementById('rollBtn');
  if (rollBtn) {
    rollBtn.addEventListener('click', () => this.playerRoll());
  }
};

// ==================== OVERLAY MANAGEMENT ====================
Game.showOverlay = function(id) {
  const overlay = document.getElementById(id);
  if (overlay) {
    overlay.classList.add('active');
    this.playSound('click');
  }
};

Game.hideOverlay = function(id) {
  const overlay = document.getElementById(id);
  if (overlay) {
    overlay.classList.remove('active');
    this.playSound('click');
  }
};

Game.hideAllOverlays = function() {
  document.querySelectorAll('.overlay').forEach(o => o.classList.remove('active'));
};

// ==================== GAME FLOW ====================
Game.startNewGame = function() {
  this.hideAllOverlays();
  
  // Reset state
  this.state.playerDice = [1, 2, 3, 4, 5];
  this.state.playerHeld = [false, false, false, false, false];
  this.state.playerRollsLeft = 3;
  this.state.playerScores = {};
  
  this.state.cpuDice = [1, 1, 1, 1, 1];
  this.state.cpuHeld = [false, false, false, false, false];
  this.state.cpuRollsLeft = 3;
  this.state.cpuScores = {};
  
  this.state.currentTurn = 'player';
  this.state.gameActive = true;
  this.state.roundNumber = 1;
  
  // Update UI
  this.renderScoreboard();
  this.updateDiceDisplay();
  this.updateRollsLeft();
  this.updateTurnIndicator();
  this.setStatus('Your turn! Roll the dice to start. 🎲');
  
  const gameResult = document.getElementById('gameResult');
  if (gameResult) gameResult.textContent = '';
  
  const rollBtn = document.getElementById('rollBtn');
  if (rollBtn) rollBtn.disabled = false;
  
  this.playSound('start');
  this.vibrate(100);
};

Game.playerRoll = function() {
  if (this.state.playerRollsLeft <= 0 || !this.state.gameActive) return;
  
  // Add rolling animation
  const diceContainer = document.getElementById('diceContainer');
  if (diceContainer) {
    const dice = diceContainer.querySelectorAll('.die');
    dice.forEach((die, i) => {
      if (!this.state.playerHeld[i]) {
        die.classList.add('rolling');
        setTimeout(() => die.classList.remove('rolling'), 600);
      }
    });
  }
  
  // Roll unheld dice
  setTimeout(() => {
    for (let i = 0; i < 5; i++) {
      if (!this.state.playerHeld[i]) {
        this.state.playerDice[i] = this.rollDie();
      }
    }
    
    this.state.playerRollsLeft--;
    this.updateDiceDisplay();
    this.updateRollsLeft();
    
    this.playSound('roll');
    this.vibrate(50);
    
    // Check for Yahtzee
    if (this.isYahtzee(this.state.playerDice)) {
      this.setStatus('🎉 YAHTZEE! Choose where to score it!');
      this.vibrate([100, 50, 100, 50, 100]);
    } else if (this.state.playerRollsLeft === 0) {
      this.setStatus('Choose a category to score! Tap any available row.');
      const rollBtn = document.getElementById('rollBtn');
      if (rollBtn) rollBtn.disabled = true;
    } else {
      this.setStatus(`${this.state.playerRollsLeft} roll(s) left. Tap dice to hold them.`);
    }
    

// ==================== CPU AI ====================
Game.cpuTurn = function() {
  this.state.currentTurn = 'cpu';
  this.state.cpuRollsLeft = 3;
  this.state.cpuHeld = [false, false, false, false, false];
  
  this.updateTurnIndicator();
  this.setStatus('CPU is thinking... 🤔');
  
  setTimeout(() => this.cpuRollSequence(), 1000);
};

Game.cpuRollSequence = function() {
  if (this.state.cpuRollsLeft <= 0) {
    this.cpuChooseCategory();
    return;
  }
  
  // Roll unheld dice
  for (let i = 0; i < 5; i++) {
    if (!this.state.cpuHeld[i]) {
      this.state.cpuDice[i] = this.rollDie();
    }
  }
  
  this.state.cpuRollsLeft--;
  this.playSound('roll');
  
  // CPU decision
  if (this.state.cpuRollsLeft > 0) {
    this.cpuDecideHolds();
    setTimeout(() => this.cpuRollSequence(), 1200);
  } else {
    setTimeout(() => this.cpuChooseCategory(), 1000);
  }
};

Game.cpuDecideHolds = function() {
  const dice = this.state.cpuDice;
  const counts = {};
  dice.forEach(d => counts[d] = (counts[d] || 0) + 1);
  
  if (this.state.difficulty === 'easy') {
    // Random strategy (40% hold chance)
    this.state.cpuHeld = dice.map(() => Math.random() > 0.6);
  } else if (this.state.difficulty === 'medium') {
    // Hold pairs and better
    this.state.cpuHeld = dice.map(d => counts[d] >= 2);
  } else {
    // Hard: Optimal strategy
    const maxCount = Math.max(...Object.values(counts));
    
    // If has 4 or 5 of a kind, hold those
    if (maxCount >= 4) {
      const bestValue = Object.keys(counts).find(k => counts[k] === maxCount);
      this.state.cpuHeld = dice.map(d => d == bestValue);
    }
    // If has 3 of a kind, hold those
    else if (maxCount === 3) {
      const bestValue = Object.keys(counts).find(k => counts[k] === 3);
      this.state.cpuHeld = dice.map(d => d == bestValue);
    }
    // Check for straight potential
    else {
      const sorted = [...new Set(dice)].sort((a, b) => a - b);
      if (sorted.length >= 4) {
        // Keep dice that form sequences
        this.state.cpuHeld = dice.map(d => sorted.includes(d));
      } else {
        // Keep highest value pairs/singles
        const bestValue = Object.keys(counts).reduce((a, b) => 
          counts[a] > counts[b] || (counts[a] === counts[b] && a > b) ? a : b
        );
        this.state.cpuHeld = dice.map(d => d == bestValue);
      }
    }
  }
};

Game.cpuChooseCategory = function() {
  const available = this.categories.filter(cat => 
    this.state.cpuScores[cat.id] === undefined
  );
  
  if (available.length === 0) {
    this.endGame();
    return;
  }
  
  // Find best scoring option
  let best = available[0];
  let bestScore = this.calculateScore(best.id, this.state.cpuDice);
  
  available.forEach(cat => {
    const score = this.calculateScore(cat.id, this.state.cpuDice);
    
    // Prioritize Yahtzee
    if (cat.id === 'yahtzee' && score === 50) {
      best = cat;
      bestScore = score;
    } else if (score > bestScore) {
      bestScore = score;
      best = cat;
    }
  });
  
  this.scoreCategory(best.id, 'cpu');
  this.setStatus(`CPU scored ${bestScore} in ${best.name}`);
  
  setTimeout(() => {
    if (this.isGameOver()) {
      this.endGame();
    } else {
      this.state.roundNumber++;
      this.startPlayerTurn();
    }
  }, 1500);
};

Game.startPlayerTurn = function() {
  this.state.currentTurn = 'player';
  this.state.playerRollsLeft = 3;
  this.state.playerHeld = [false, false, false, false, false];
  
  this.updateDiceDisplay();
  this.updateRollsLeft();
  this.updateTurnIndicator();
  this.renderScoreboard();
  this.setStatus(`Round ${this.state.roundNumber} - Your turn! Roll the dice.`);
  
  const rollBtn = document.getElementById('rollBtn');
  if (rollBtn) rollBtn.disabled = false;
};

// ==================== SCORING ENGINE ====================
Game.scoreCategory = function(categoryId, player) {
  const dice = player === 'player' ? this.state.playerDice : this.state.cpuDice;
  const score = this.calculateScore(categoryId, dice);
  
  if (player === 'player') {
    this.state.playerScores[categoryId] = score;
    
    // Track yahtzees
    if (categoryId === 'yahtzee' && score === 50) {
      this.state.stats.yahtzees++;
    }
  } else {
    this.state.cpuScores[categoryId] = score;
  }
  
  this.renderScoreboard();
  this.playSound('score');
  this.vibrate(100);
};

Game.calculateScore = function(categoryId, dice) {
  const counts = {};
  dice.forEach(d => counts[d] = (counts[d] || 0) + 1);
  const sum = dice.reduce((a, b) => a + b, 0);
  
  switch (categoryId) {
    case 'ones': return dice.filter(d => d === 1).length * 1;
    case 'twos': return dice.filter(d => d === 2).length * 2;
    case 'threes': return dice.filter(d => d === 3).length * 3;
    case 'fours': return dice.filter(d => d === 4).length * 4;
    case 'fives': return dice.filter(d => d === 5).length * 5;
    case 'sixes': return dice.filter(d => d === 6).length * 6;
    
    case 'threeKind':
      return Object.values(counts).some(c => c >= 3) ? sum : 0;
    
    case 'fourKind':
      return Object.values(counts).some(c => c >= 4) ? sum : 0;
    
    case 'fullHouse': {
      const has3 = Object.values(counts).some(c => c === 3);
      const has2 = Object.values(counts).some(c => c === 2);
      return (has3 && has2) ? 25 : 0;
    }
    
    case 'smallStraight': {
      const sorted = [...new Set(dice)].sort((a, b) => a - b);
      const straights = [[1,2,3,4], [2,3,4,5], [3,4,5,6]];
      return straights.some(s => s.every(n => sorted.includes(n))) ? 30 : 0;
    }
    
    case 'largeStraight': {
      const str = dice.slice().sort().join('');
      return (str === '12345' || str === '23456') ? 40 : 0;
    }
    
    case 'yahtzee':
      return Object.values(counts).some(c => c === 5) ? 50 : 0;
    
    case 'chance':
      return sum;
    
    default:
      return 0;
  }
};

Game.getTotal = function(player) {
  const scores = player === 'player' ? this.state.playerScores : this.state.cpuScores;
  
  let upper = 0;
  ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'].forEach(cat => {
    if (scores[cat] !== undefined) upper += scores[cat];
  });
  
  const bonus = upper >= 63 ? 35 : 0;
  
  let lower = 0;
  ['threeKind', 'fourKind', 'fullHouse', 'smallStraight', 'largeStraight', 'yahtzee', 'chance'].forEach(cat => {
    if (scores[cat] !== undefined) lower += scores[cat];
  });
  
  return upper + bonus + lower;
};

Game.handleCategoryClick = function(categoryId) {
  if (this.state.playerScores[categoryId] !== undefined) return;
  if (!this.state.gameActive) return;
  if (this.state.currentTurn !== 'player') return;
  if (this.state.playerRollsLeft >= 3) return;
  
  this.scoreCategory(categoryId, 'player');
  
  const score = this.state.playerScores[categoryId];
  const catName = this.categories.find(c => c.id === categoryId).name;
  this.setStatus(`You scored ${score} points in ${catName}! 🎯`);
  
  const rollBtn = document.getElementById('rollBtn');
  if (rollBtn) rollBtn.disabled = true;
  
  setTimeout(() => {
    if (this.isGameOver()) {
      this.endGame();
    } else {
      this.cpuTurn();
    }
  }, 1000);
};

// ==================== GAME END ====================
Game.isGameOver = function() {
  const playerDone = this.categories.every(cat => 
    this.state.playerScores[cat.id] !== undefined
  );
  const cpuDone = this.categories.every(cat => 
    this.state.cpuScores[cat.id] !== undefined
  );
  return playerDone && cpuDone;
};

Game.endGame = function() {
  this.state.gameActive = false;
  
  const playerTotal = this.getTotal('player');
  const cpuTotal = this.getTotal('cpu');
  const playerWon = playerTotal > cpuTotal;
  
  let result = '';
  if (playerTotal > cpuTotal) {
    result = `🎉 YOU WIN! ${playerTotal} - ${cpuTotal}`;
    this.playSound('win');
    this.showParticles();
    this.state.stats.gamesWon++;
  } else if (cpuTotal > playerTotal) {
    result = `😞 CPU WINS ${cpuTotal} - ${playerTotal}`;
    this.playSound('lose');
  } else {
    result = `🤝 TIE GAME! ${playerTotal} - ${playerTotal}`;
  }
  
  const gameResult = document.getElementById('gameResult');
  if (gameResult) gameResult.textContent = result;
  
  this.setStatus('Game Over! Tap New Game to play again.');
  
  // Update stats
  this.state.stats.gamesPlayed++;
  this.state.stats.totalScore += playerTotal;
  this.saveStats();
  
  this.saveGameResult(playerTotal, cpuTotal, playerWon);
  this.vibrate([100, 50, 100]);
};

// ==================== UI RENDERING ====================
Game.renderScoreboard = function() {
  const container = document.getElementById('scoreBody');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Upper section
  this.categories.filter(c => c.type === 'upper').forEach(cat => {
    container.appendChild(this.createScoreRow(cat));
  });
  
  // Bonus
  container.appendChild(this.createBonusRow());
  
  // Lower section
  this.categories.filter(c => c.type === 'lower').forEach(cat => {
    container.appendChild(this.createScoreRow(cat));
  });
  
  // Total
  container.appendChild(this.createTotalRow());
};

Game.createScoreRow = function(category) {
  const row = document.createElement('div');
  row.className = 'score-row ' + category.type;
  
  const playerScored = this.state.playerScores[category.id] !== undefined;
  const cpuScored = this.state.cpuScores[category.id] !== undefined;
  
  // Make clickable if applicable
  const isClickable = !playerScored && 
                      this.state.currentTurn === 'player' && 
                      this.state.playerRollsLeft < 3 && 
                      this.state.gameActive;
  
  if (isClickable) {
    row.classList.add('clickable');
    
    const potentialScore = this.calculateScore(category.id, this.state.playerDice);
    row.title = `Score ${potentialScore} points`;
    
    row.addEventListener('click', () => this.handleCategoryClick(category.id));
    row.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.handleCategoryClick(category.id);
    });
  }
  
  row.innerHTML = `
    <div class="score-cell category-cell">${category.name}</div>
    <div class="score-cell score-value ${playerScored ? 'player' : 'empty'}">
      ${playerScored ? this.state.playerScores[category.id] : '-'}
    </div>
    <div class="score-cell score-value ${cpuScored ? 'cpu' : 'empty'}">
      ${cpuScored ? this.state.cpuScores[category.id] : '-'}
    </div>
  `;
  
  return row;
};

Game.createBonusRow = function() {
  const row = document.createElement('div');
  row.className = 'score-row bonus';
  
  let playerUpper = 0;
  let cpuUpper = 0;
  
  ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'].forEach(cat => {
    if (this.state.playerScores[cat]) playerUpper += this.state.playerScores[cat];
    if (this.state.cpuScores[cat]) cpuUpper += this.state.cpuScores[cat];
  });
  
  const playerBonus = playerUpper >= 63 ? 35 : 0;
  const cpuBonus = cpuUpper >= 63 ? 35 : 0;
  
  row.innerHTML = `
    <div class="score-cell category-cell">Bonus (63+)</div>
    <div class="score-cell score-value player">${playerBonus}</div>
    <div class="score-cell score-value cpu">${cpuBonus}</div>
  `;
  
  return row;
};

Game.createTotalRow = function() {
  const row = document.createElement('div');
  row.className = 'score-row total';
  
  const playerTotal = this.getTotal('player');
  const cpuTotal = this.getTotal('cpu');
  
  row.innerHTML = `
    <div class="score-cell category-cell">TOTAL</div>
    <div class="score-cell score-value player">${playerTotal}</div>
    <div class="score-cell score-value cpu">${cpuTotal}</div>
  `;
  
  return row;
};

Game.updateDiceDisplay = function() {
  const container = document.getElementById('diceContainer');
  if (!container) return;
  
  container.innerHTML = '';
  
  this.state.playerDice.forEach((value, index) => {
    const die = document.createElement('div');
    die.className = 'die';
    if (this.state.playerHeld[index]) die.classList.add('held');
    
    const number = document.createElement('span');
    number.className = 'die-number';
    number.textContent = value;
    die.appendChild(number);
    
    die.addEventListener('click', () => this.toggleHold(index));
    die.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.toggleHold(index);
    });
    
    container.appendChild(die);
  });
};

Game.updateRollsLeft = function() {
  const rollsLeft = document.getElementById('rollsLeft');
  if (rollsLeft) rollsLeft.textContent = this.state.playerRollsLeft;
};

Game.updateTurnIndicator = function() {
  const indicator = document.getElementById('turnIndicator');
  if (!indicator) return;
  
  const text = indicator.querySelector('.turn-text');
  if (!text) return;
  
  if (this.state.currentTurn === 'player') {
    text.textContent = 'Your Turn';
    indicator.style.background = 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)';
  } else {
    text.textContent = 'CPU Turn';
    indicator.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
  }
};

Game.setStatus = function(message) {
  const statusText = document.getElementById('statusText');
  if (statusText) statusText.textContent = message;
};
    this.renderScoreboard(); // Update clickable categories
  }, 300);
};

Game.rollDie = function() {
  return Math.floor(Math.random() * 6) + 1;
};

Game.toggleHold = function(index) {
  if (this.state.playerRollsLeft < 3 && this.state.gameActive && this.state.currentTurn === 'player') {
    this.state.playerHeld[index] = !this.state.playerHeld[index];
    this.updateDiceDisplay();
    this.playSound('hold');
    this.vibrate(30);
  }
};

Game.isYahtzee = function(dice) {
  return dice.every(d => d === dice[0]);
};
    

// ==================== STORAGE ====================
Game.saveGameResult = function(playerScore, cpuScore, playerWon) {
  const result = {
    date: new Date().toISOString(),
    playerScore,
    cpuScore,
    playerWon,
    difficulty: this.state.difficulty
  };
  
  this.state.history.unshift(result);
  if (this.state.history.length > 50) this.state.history = this.state.history.slice(0, 50);
  
  // Update high scores
  const existing = this.state.highScores.find(s => s.score === playerScore);
  if (!existing && this.state.highScores.length < 10) {
    this.state.highScores.push({ score: playerScore, date: result.date });
    this.state.highScores.sort((a, b) => b.score - a.score);
  } else if (!existing) {
    if (playerScore > this.state.highScores[9].score) {
      this.state.highScores[9] = { score: playerScore, date: result.date };
      this.state.highScores.sort((a, b) => b.score - a.score);
    }
  }
  
  localStorage.setItem('dopeDiceHistory', JSON.stringify(this.state.history));
  localStorage.setItem('dopeDiceHighScores', JSON.stringify(this.state.highScores));
};

Game.loadHistory = function() {
  try {
    const history = localStorage.getItem('dopeDiceHistory');
    const highScores = localStorage.getItem('dopeDiceHighScores');
    
    if (history) this.state.history = JSON.parse(history);
    if (highScores) this.state.highScores = JSON.parse(highScores);
    
    this.renderHistory();
  } catch (e) {
    console.error('Error loading history:', e);
  }
};

Game.renderHistory = function() {
  const historyList = document.getElementById('historyList');
  const highScoresList = document.getElementById('highScoresList');
  
  if (historyList) {
    if (this.state.history.length === 0) {
      historyList.innerHTML = '<div style="text-align:center;color:#808080;padding:20px;font-style:italic;">No games played yet</div>';
    } else {
      historyList.innerHTML = this.state.history.slice(0, 10).map(game => {
        const date = new Date(game.date).toLocaleDateString();
        const result = game.playerWon ? '🏆 Win' : '❌ Loss';
        return `
          <div class="history-item">
            <strong>${result}</strong> - ${game.playerScore} vs ${game.cpuScore}
            <br><small>${date} • ${game.difficulty}</small>
          </div>
        `;
      }).join('');
    }
  }
  
  if (highScoresList) {
    if (this.state.highScores.length === 0) {
      highScoresList.innerHTML = '<div style="text-align:center;color:#808080;padding:20px;font-style:italic;">No high scores yet</div>';
    } else {
      highScoresList.innerHTML = this.state.highScores.map((score, i) => {
        const date = new Date(score.date).toLocaleDateString();
        return `
          <div class="highscore-item">
            <strong>#${i + 1}</strong> - ${score.score} points
            <br><small>${date}</small>
          </div>
        `;
      }).join('');
    }
  }
};

Game.clearHistory = function() {
  if (confirm('Clear all game history and high scores?')) {
    this.state.history = [];
    this.state.highScores = [];
    localStorage.removeItem('dopeDiceHistory');
    localStorage.removeItem('dopeDiceHighScores');
    this.renderHistory();
    this.playSound('click');
  }
};

Game.saveSettings = function() {
  localStorage.setItem('dopeDiceSettings', JSON.stringify(this.state.settings));
  localStorage.setItem('dopeDiceDifficulty', this.state.difficulty);
};

Game.loadSettings = function() {
  try {
    const settings = localStorage.getItem('dopeDiceSettings');
    const difficulty = localStorage.getItem('dopeDiceDifficulty');
    
    if (settings) {
      this.state.settings = JSON.parse(settings);
      
      const soundToggle = document.getElementById('soundToggle');
      if (soundToggle) soundToggle.value = this.state.settings.sound ? 'on' : 'off';
      
      const vibrationToggle = document.getElementById('vibrationToggle');
      if (vibrationToggle) vibrationToggle.value = this.state.settings.vibration ? 'on' : 'off';
      
      const themeToggle = document.getElementById('themeToggle');
      if (themeToggle) themeToggle.value = this.state.settings.theme;
      
      this.applyTheme(this.state.settings.theme);
    }
    
    if (difficulty) {
      this.state.difficulty = difficulty;
      const difficultySelect = document.getElementById('difficulty');
      if (difficultySelect) difficultySelect.value = difficulty;
    }
  } catch (e) {
    console.error('Error loading settings:', e);
  }
};

Game.saveStats = function() {
  localStorage.setItem('dopeDiceStats', JSON.stringify(this.state.stats));
};

Game.loadStats = function() {
  try {
    const stats = localStorage.getItem('dopeDiceStats');
    if (stats) this.state.stats = JSON.parse(stats);
  } catch (e) {
    console.error('Error loading stats:', e);
  }
};

// ==================== THEME ====================
Game.applyTheme = function(theme) {
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.style.setProperty('--primary', '#1abc9c');
    root.style.setProperty('--primary-dark', '#16a085');
  } else if (theme === 'purple') {
    root.style.setProperty('--primary', '#9b59b6');
    root.style.setProperty('--primary-dark', '#8e44ad');
  } else {
    root.style.setProperty('--primary', '#2ecc71');
    root.style.setProperty('--primary-dark', '#27ae60');
  }
};

// ==================== AUDIO & HAPTICS ====================
Game.playSound = function(type) {
  if (!this.state.settings.sound) return;
  
  const frequencies = {
    roll: 200,
    hold: 300,
    score: 400,
    win: 500,
    lose: 150,
    click: 250,
    start: 350
  };
  
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequencies[type] || 300;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (e) {
    // Audio not supported
  }
};

Game.vibrate = function(pattern) {
  if (!this.state.settings.vibration) return;
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

// ==================== PARTICLES ====================
Game.showParticles = function() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.classList.add('active');
  
  const particles = [];
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      size: Math.random() * 10 + 4,
      color: `hsl(${Math.random() * 60 + 100}, 80%, 60%)`
    });
  }
  
  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    
    frame++;
    if (frame < 200) {
      requestAnimationFrame(animate);
    } else {
      canvas.classList.remove('active');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  
  animate();
};

// ==================== UTILITIES ====================
// Prevent double-tap zoom
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) {
    e.preventDefault();
  }
  lastTouchEnd = now;
}, false);

// Window resize handler
window.addEventListener('resize', () => {
  const canvas = document.getElementById('particleCanvas');
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
});

// Log ready
console.log('🍃 Dope Dice v2.0 Enhanced - Ready to Roll! 🎲');
