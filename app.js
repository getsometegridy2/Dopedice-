// ==================== GAME STATE ====================
const GameState = {
  playerDice: [1, 1, 1, 1, 1],
  cpuDice: [1, 1, 1, 1, 1],
  playerHeld: [false, false, false, false, false],
  cpuHeld: [false, false, false, false, false],
  playerRollsLeft: 3,
  cpuRollsLeft: 3,
  currentTurn: 'player',
  gameActive: false,
  playerScores: {},
  cpuScores: {},
  difficulty: 'medium',
  settings: {
    gameType: 'classic',
    sfx: true,
    vibration: true
  },
  history: [],
  highScores: []
};

// ==================== CATEGORIES ====================
const CATEGORIES = [
  { id: 'ones', name: 'Ones', upper: true },
  { id: 'twos', name: 'Twos', upper: true },
  { id: 'threes', name: 'Threes', upper: true },
  { id: 'fours', name: 'Fours', upper: true },
  { id: 'fives', name: 'Fives', upper: true },
  { id: 'sixes', name: 'Sixes', upper: true },
  { id: 'threeKind', name: '3 of a Kind', upper: false },
  { id: 'fourKind', name: '4 of a Kind', upper: false },
  { id: 'fullHouse', name: 'Full House', upper: false },
  { id: 'smallStraight', name: 'Small Straight', upper: false },
  { id: 'largeStraight', name: 'Large Straight', upper: false },
  { id: 'yahtzee', name: 'Yahtzee', upper: false },
  { id: 'chance', name: 'Chance', upper: false }
];

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  loadSettings();
  loadHistory();
  setupEventListeners();
  renderScorecard();
  showStartScreen();
  
  // Hide splash after load
  setTimeout(() => {
    const splash = document.querySelector('.splash');
    if (splash) {
      splash.style.opacity = '0';
      setTimeout(() => splash.remove(), 500);
    }
  }, 1500);
});

function initializeApp() {
  // Register service worker for PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
  
  // Initialize dice displays
  renderDice('player');
  renderDice('cpu');
  updateStatus('Welcome to Dope Dice!');
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
  // Menu buttons
  document.getElementById('btnPlay').addEventListener('click', startNewGame);
  document.getElementById('btnSettings').addEventListener('click', () => showPanel('settingsPanel'));
  document.getElementById('btnAbout').addEventListener('click', () => showPanel('aboutPanel'));
  document.getElementById('openStart').addEventListener('click', showStartScreen);
  document.getElementById('historyBtn').addEventListener('click', () => {
    loadHistory();
    showPanel('historyPanel');
  });
  
  // Back buttons
  document.getElementById('settingsBack').addEventListener('click', () => showPanel('startPanel'));
  document.getElementById('aboutBack').addEventListener('click', () => showPanel('startPanel'));
  document.getElementById('historyBack').addEventListener('click', () => showPanel('startPanel'));
  
  // Clear history
  document.getElementById('clearHistory').addEventListener('click', clearHistory);
  
  // Settings
  document.getElementById('difficulty').addEventListener('change', (e) => {
    GameState.difficulty = e.target.value;
    saveSettings();
  });
  
  document.getElementById('gameType').addEventListener('change', (e) => {
    GameState.settings.gameType = e.target.value;
    saveSettings();
  });
  
  document.getElementById('sfxToggle').addEventListener('change', (e) => {
    GameState.settings.sfx = e.target.value === 'on';
    saveSettings();
  });
  
  document.getElementById('vibrationToggle').addEventListener('change', (e) => {
    GameState.settings.vibration = e.target.value === 'on';
    saveSettings();
  });
  
  // Roll button
  document.getElementById('playerRoll').addEventListener('click', playerRoll);
}

// ==================== PANEL MANAGEMENT ====================
function showPanel(panelId) {
  const panels = document.querySelectorAll('.panel');
  panels.forEach(p => {
    p.classList.add('hidden');
    p.setAttribute('aria-hidden', 'true');
  });
  
  const panel = document.getElementById(panelId);
  panel.classList.remove('hidden');
  panel.setAttribute('aria-hidden', 'false');
  
  const overlay = document.getElementById('overlay');
  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden', 'false');
}

function hideOverlay() {
  const overlay = document.getElementById('overlay');
  overlay.classList.add('hidden');
  overlay.setAttribute('aria-hidden', 'true');
}

function showStartScreen() {
  showPanel('startPanel');
}

// ==================== GAME LOGIC ====================
function startNewGame() {
  hideOverlay();
  
  // Reset game state
  GameState.playerDice = [1, 2, 3, 4, 5];
  GameState.cpuDice = [1, 1, 1, 1, 1];
  GameState.playerHeld = [false, false, false, false, false];
  GameState.cpuHeld = [false, false, false, false, false];
  GameState.playerRollsLeft = 3;
  GameState.cpuRollsLeft = 3;
  GameState.currentTurn = 'player';
  GameState.gameActive = true;
  GameState.playerScores = {};
  GameState.cpuScores = {};
  
  renderScorecard();
  renderDice('player');
  renderDice('cpu');
  updateRollsDisplay();
  updateStatus("Your turn! Roll the dice to start.");
  
  document.getElementById('playerRoll').disabled = false;
  document.getElementById('finalScore').textContent = '';
  
  playSound('start');
  vibrate(100);
}

function playerRoll() {
  if (GameState.playerRollsLeft <= 0 || !GameState.gameActive) return;
  
  // Roll unheld dice with animation
  const diceContainer = document.getElementById('playerDice');
  const dice = diceContainer.querySelectorAll('.die');
  
  dice.forEach((die, i) => {
    if (!GameState.playerHeld[i]) {
      die.classList.add('rolling');
      setTimeout(() => die.classList.remove('rolling'), 500);
    }
  });
  
  // Update dice values
  setTimeout(() => {
    for (let i = 0; i < 5; i++) {
      if (!GameState.playerHeld[i]) {
        GameState.playerDice[i] = rollDie();
      }
    }
    
    GameState.playerRollsLeft--;
    renderDice('player');
    updateRollsDisplay();
    
    playSound('roll');
    vibrate(50);
    
    if (GameState.playerRollsLeft === 0) {
      updateStatus("Choose a category to score! Tap any category row.");
      document.getElementById('playerRoll').disabled = true;
    } else {
      updateStatus(`${GameState.playerRollsLeft} roll(s) left. Tap dice to hold them.`);
    }
  }, 300);
}

function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function toggleHold(player, index) {
  if (player === 'player' && GameState.playerRollsLeft < 3 && GameState.gameActive) {
    GameState.playerHeld[index] = !GameState.playerHeld[index];
    renderDice('player');
    playSound('hold');
    vibrate(30);
  }
}

// ==================== CPU AI ====================
function cpuTurn() {
  updateStatus("CPU is thinking...");
  GameState.currentTurn = 'cpu';
  GameState.cpuRollsLeft = 3;
  GameState.cpuHeld = [false, false, false, false, false];
  
  setTimeout(() => cpuRollSequence(), 1000);
}

function cpuRollSequence() {
  if (GameState.cpuRollsLeft <= 0) {
    cpuChooseCategory();
    return;
  }
  
  // Roll unheld dice
  for (let i = 0; i < 5; i++) {
    if (!GameState.cpuHeld[i]) {
      GameState.cpuDice[i] = rollDie();
    }
  }
  
  GameState.cpuRollsLeft--;
  renderDice('cpu');
  playSound('roll');
  
  // CPU decision making
  if (GameState.cpuRollsLeft > 0) {
    cpuDecideHolds();
    setTimeout(() => cpuRollSequence(), 1200);
  } else {
    setTimeout(() => cpuChooseCategory(), 1000);
  }
}

function cpuDecideHolds() {
  const dice = GameState.cpuDice;
  const counts = {};
  
  dice.forEach(d => counts[d] = (counts[d] || 0) + 1);
  
  // Strategy based on difficulty
  const difficulty = GameState.difficulty;
  
  if (difficulty === 'easy') {
    // Random holds
    GameState.cpuHeld = dice.map(() => Math.random() > 0.6);
  } else if (difficulty === 'medium') {
    // Hold pairs and better
    GameState.cpuHeld = dice.map(d => counts[d] >= 2);
  } else {
    // Optimal strategy
    const bestValue = Object.keys(counts).reduce((a, b) => 
      counts[a] > counts[b] ? a : b
    );
    GameState.cpuHeld = dice.map(d => d == bestValue);
  }
}

function cpuChooseCategory() {
  const availableCategories = CATEGORIES.filter(cat => 
    GameState.cpuScores[cat.id] === undefined
  );
  
  if (availableCategories.length === 0) {
    endGame();
    return;
  }
  
  // Choose best scoring category
  let bestCat = availableCategories[0];
  let bestScore = calculateScore(bestCat.id, GameState.cpuDice);
  
  availableCategories.forEach(cat => {
    const score = calculateScore(cat.id, GameState.cpuDice);
    if (score > bestScore) {
      bestScore = score;
      bestCat = cat;
    }
  });
  
  scoreCategory(bestCat.id, 'cpu');
  updateStatus(`CPU scored ${bestScore} in ${bestCat.name}`);
  
  setTimeout(() => {
    if (checkGameOver()) {
      endGame();
    } else {
      startPlayerTurn();
    }
  }, 1500);
}

function startPlayerTurn() {
  GameState.currentTurn = 'player';
  GameState.playerRollsLeft = 3;
  GameState.playerHeld = [false, false, false, false, false];
  renderDice('player');
  updateRollsDisplay();
  updateStatus("Your turn! Roll the dice.");
  document.getElementById('playerRoll').disabled = false;
}

// ==================== SCORING ====================
function scoreCategory(categoryId, player) {
  const dice = player === 'player' ? GameState.playerDice : GameState.cpuDice;
  const score = calculateScore(categoryId, dice);
  
  if (player === 'player') {
    GameState.playerScores[categoryId] = score;
  } else {
    GameState.cpuScores[categoryId] = score;
  }
  
  renderScorecard();
  playSound('score');
  vibrate(100);
}

function calculateScore(categoryId, dice) {
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
    
    case 'fullHouse':
      const hasThree = Object.values(counts).some(c => c === 3);
      const hasTwo = Object.values(counts).some(c => c === 2);
      return (hasThree && hasTwo) ? 25 : 0;
    
    case 'smallStraight':
      const sorted = [...new Set(dice)].sort();
      const straights = [
        [1,2,3,4], [2,3,4,5], [3,4,5,6]
      ];
      return straights.some(s => s.every(n => sorted.includes(n))) ? 30 : 0;
    
    case 'largeStraight':
      const sortedStr = dice.slice().sort().join('');
      return (sortedStr === '12345' || sortedStr === '23456') ? 40 : 0;
    
    case 'yahtzee':
      return Object.values(counts).some(c => c === 5) ? 50 : 0;
    
    case 'chance':
      return sum;
    
    default:
      return 0;
  }
}

function getPlayerTotal(player) {
  const scores = player === 'player' ? GameState.playerScores : GameState.cpuScores;
  
  // Upper section
  let upperTotal = 0;
  ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'].forEach(cat => {
    if (scores[cat] !== undefined) upperTotal += scores[cat];
  });
  
  // Upper bonus
  const bonus = upperTotal >= 63 ? 35 : 0;
  
  // Lower section
  let lowerTotal = 0;
  ['threeKind', 'fourKind', 'fullHouse', 'smallStraight', 'largeStraight', 'yahtzee', 'chance'].forEach(cat => {
    if (scores[cat] !== undefined) lowerTotal += scores[cat];
  });
  
  return upperTotal + bonus + lowerTotal;
}

// ==================== RENDERING ====================
function renderScorecard() {
  const container = document.getElementById('scoreRows');
  container.innerHTML = '';
  
  // Upper section
  CATEGORIES.filter(c => c.upper).forEach(cat => {
    const row = createScoreRow(cat);
    container.appendChild(row);
  });
  
  // Upper bonus
  const bonusRow = createBonusRow();
  container.appendChild(bonusRow);
  
  // Lower section
  CATEGORIES.filter(c => !c.upper).forEach(cat => {
    const row = createScoreRow(cat);
    container.appendChild(row);
  });
  
  // Total
  const totalRow = createTotalRow();
  container.appendChild(totalRow);
}

function createScoreRow(category) {
  const row = document.createElement('div');
  row.className = 'score-row';
  row.classList.add(category.upper ? 'upper-section' : 'lower-section');
  row.setAttribute('role', 'row');
  
  const playerScored = GameState.playerScores[category.id] !== undefined;
  const cpuScored = GameState.cpuScores[category.id] !== undefined;
  
  // Make clickable if player hasn't scored and has rolled
  if (!playerScored && 
      GameState.currentTurn === 'player' && 
      GameState.playerRollsLeft < 3 && 
      GameState.gameActive) {
    row.classList.add('clickable');
    
    // Add click event
    row.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleCategoryClick(category.id);
    });
    
    // Add touch event for better mobile support
    row.addEventListener('touchend', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleCategoryClick(category.id);
    });
    
    // Show potential score
    const potentialScore = calculateScore(category.id, GameState.playerDice);
    row.title = `Tap to score ${potentialScore} points`;
  }
  
  row.innerHTML = `
    <div class="cell cat" role="cell">${category.name}</div>
    <div class="cell you" role="cell">
      ${playerScored ? GameState.playerScores[category.id] : '-'}
    </div>
    <div class="cell cpu" role="cell">
      ${cpuScored ? GameState.cpuScores[category.id] : '-'}
    </div>
  `;
  
  return row;
}

function createBonusRow() {
  const row = document.createElement('div');
  row.className = 'score-row bonus-row';
  row.setAttribute('role', 'row');
  
  let playerUpper = 0;
  let cpuUpper = 0;
  
  ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'].forEach(cat => {
    if (GameState.playerScores[cat] !== undefined) {
      playerUpper += GameState.playerScores[cat];
    }
    if (GameState.cpuScores[cat] !== undefined) {
      cpuUpper += GameState.cpuScores[cat];
    }
  });
  
  const playerBonus = playerUpper >= 63 ? 35 : 0;
  const cpuBonus = cpuUpper >= 63 ? 35 : 0;
  
  row.innerHTML = `
    <div class="cell cat" role="cell">Bonus (63+)</div>
    <div class="cell you" role="cell">${playerBonus}</div>
    <div class="cell cpu" role="cell">${cpuBonus}</div>
  `;
  
  return row;
}

function createTotalRow() {
  const row = document.createElement('div');
  row.className = 'score-row total-row';
  row.setAttribute('role', 'row');
  
  const playerTotal = getPlayerTotal('player');
  const cpuTotal = getPlayerTotal('cpu');
  
  row.innerHTML = `
    <div class="cell cat" role="cell">TOTAL</div>
    <div class="cell you" role="cell">${playerTotal}</div>
    <div class="cell cpu" role="cell">${cpuTotal}</div>
  `;
  
  return row;
}

function handleCategoryClick(categoryId) {
  if (GameState.playerScores[categoryId] !== undefined) return;
  if (!GameState.gameActive) return;
  if (GameState.currentTurn !== 'player') return;
  if (GameState.playerRollsLeft >= 3) return;
  
  scoreCategory(categoryId, 'player');
  
  const score = GameState.playerScores[categoryId];
  const catName = CATEGORIES.find(c => c.id === categoryId).name;
  updateStatus(`You scored ${score} in ${catName}!`);
  
  document.getElementById('playerRoll').disabled = true;
  
  setTimeout(() => {
    if (checkGameOver()) {
      endGame();
    } else {
      cpuTurn();
    }
  }, 1000);
}

function renderDice(player) {
  const dice = player === 'player' ? GameState.playerDice : GameState.cpuDice;
  const held = player === 'player' ? GameState.playerHeld : GameState.cpuHeld;
  const container = document.getElementById(player === 'player' ? 'playerDice' : 'cpuDice');
  
  container.innerHTML = '';
  
  dice.forEach((value, index) => {
    const die = document.createElement('div');
    die.className = 'die';
    die.setAttribute('data-value', value);
    
    if (held[index]) die.classList.add('held');
    
    if (player === 'player') {
      die.addEventListener('click', () => toggleHold('player', index));
      die.addEventListener('touchend', (e) => {
        e.preventDefault();
        toggleHold('player', index);
      });
    }
    
    container.appendChild(die);
  });
}

function updateRollsDisplay() {
  document.getElementById('playerRollsLeft').textContent = GameState.playerRollsLeft;
  document.getElementById('cpuRollsLeft').textContent = GameState.cpuRollsLeft;
}

function updateStatus(message) {
  document.getElementById('status').textContent = message;
}

// ==================== GAME END ====================
function checkGameOver() {
  const allPlayerScored = CATEGORIES.every(cat => 
    GameState.playerScores[cat.id] !== undefined
  );
  const allCpuScored = CATEGORIES.every(cat => 
    GameState.cpuScores[cat.id] !== undefined
  );
  
  return allPlayerScored && allCpuScored;
}

function endGame() {
  GameState.gameActive = false;
  
  const playerTotal = getPlayerTotal('player');
  const cpuTotal = getPlayerTotal('cpu');
  
  let result = '';
  if (playerTotal > cpuTotal) {
    result = `🎉 You Win! ${playerTotal} - ${cpuTotal}`;
    playSound('win');
    showParticles();
  } else if (cpuTotal > playerTotal) {
    result = `CPU Wins! ${cpuTotal} - ${playerTotal}`;
    playSound('lose');
  } else {
    result = `Tie Game! ${playerTotal} - ${playerTotal}`;
  }
  
  document.getElementById('finalScore').textContent = result;
  updateStatus('Game Over! Click Menu to play again.');
  
  // Save to history
  saveGameResult(playerTotal, cpuTotal, playerTotal > cpuTotal);
  
  vibrate([100, 50, 100]);
}

// ==================== HISTORY & STORAGE ====================
function saveGameResult(playerScore, cpuScore, playerWon) {
  const result = {
    date: new Date().toISOString(),
    playerScore,
    cpuScore,
    playerWon,
    difficulty: GameState.difficulty
  };
  
  GameState.history.unshift(result);
  if (GameState.history.length > 20) GameState.history.pop();
  
  // Update high scores
  if (!GameState.highScores.find(s => s.score === playerScore) || GameState.highScores.length < 10) {
    GameState.highScores.push({ score: playerScore, date: result.date });
    GameState.highScores.sort((a, b) => b.score - a.score);
    GameState.highScores = GameState.highScores.slice(0, 10);
  }
  
  localStorage.setItem('dopeDiceHistory', JSON.stringify(GameState.history));
  localStorage.setItem('dopeDiceHighScores', JSON.stringify(GameState.highScores));
}

function loadHistory() {
  try {
    const history = localStorage.getItem('dopeDiceHistory');
    const highScores = localStorage.getItem('dopeDiceHighScores');
    
    if (history) GameState.history = JSON.parse(history);
    if (highScores) GameState.highScores = JSON.parse(highScores);
    
    renderHistory();
  } catch (e) {
    console.error('Error loading history:', e);
  }
}

function renderHistory() {
  const historyList = document.getElementById('historyList');
  const highScoresList = document.getElementById('highScoresList');
  
  if (GameState.history.length === 0) {
    historyList.innerHTML = '<div class="muted">No games played yet</div>';
  } else {
    historyList.innerHTML = GameState.history.slice(0, 10).map(game => {
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
  
  if (GameState.highScores.length === 0) {
    highScoresList.innerHTML = '<div class="muted">No high scores yet</div>';
  } else {
    highScoresList.innerHTML = GameState.highScores.map((score, i) => {
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

function clearHistory() {
  if (confirm('Clear all game history and high scores?')) {
    GameState.history = [];
    GameState.highScores = [];
    localStorage.removeItem('dopeDiceHistory');
    localStorage.removeItem('dopeDiceHighScores');
    renderHistory();
    playSound('click');
  }
}

// ==================== SETTINGS ====================
function saveSettings() {
  localStorage.setItem('dopeDiceSettings', JSON.stringify(GameState.settings));
  localStorage.setItem('dopeDiceDifficulty', GameState.difficulty);
}

function loadSettings() {
  try {
    const settings = localStorage.getItem('dopeDiceSettings');
    const difficulty = localStorage.getItem('dopeDiceDifficulty');
    
    if (settings) {
      GameState.settings = JSON.parse(settings);
      document.getElementById('gameType').value = GameState.settings.gameType;
      document.getElementById('sfxToggle').value = GameState.settings.sfx ? 'on' : 'off';
      document.getElementById('vibrationToggle').value = GameState.settings.vibration ? 'on' : 'off';
    }
    
    if (difficulty) {
      GameState.difficulty = difficulty;
      document.getElementById('difficulty').value = difficulty;
    }
  } catch (e) {
    console.error('Error loading settings:', e);
  }
}

// ==================== AUDIO & HAPTICS ====================
function playSound(type) {
  if (!GameState.settings.sfx) return;
  
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
}

function vibrate(pattern) {
  if (!GameState.settings.vibration) return;
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

// ==================== PARTICLES ====================
function showParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.classList.add('active');
  
  const particles = [];
  const particleCount = 50;
  
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      size: Math.random() * 6 + 2,
      color: `hsl(${Math.random() * 60 + 90}, 70%, 50%)`
    });
  }
  
  let animationId;
  let frame = 0;
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    
    frame++;
    if (frame < 200) {
      animationId = requestAnimationFrame(animate);
    } else {
      canvas.classList.remove('active');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  
  animate();
}

// ==================== UTILITIES ====================
window.addEventListener('resize', () => {
  const canvas = document.getElementById('particleCanvas');
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
});

// Prevent pull-to-refresh on mobile
document.body.addEventListener('touchmove', (e) => {
  if (e.target.closest('.game-area') || e.target.closest('.panel')) {
    // Allow scrolling in these areas
  } else {
    e.preventDefault();
  }
}, { passive: false });

// Prevent accidental double-tap zoom
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) {
    e.preventDefault();
  }
  lastTouchEnd = now;
}, false);

console.log('🍃 Dope Dice loaded successfully!');
