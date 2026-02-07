# Dope Dice - Weed-Themed Yahtzee Game

A fully functional Progressive Web App (PWA) Yahtzee-style dice game with a cannabis theme.

## 🎮 Features

- **Player vs CPU gameplay** with 3 difficulty levels (Easy, Medium, Hard)
- **Vertical scoreboard** optimized for mobile portrait orientation
- **13 scoring categories** following classic Yahtzee rules
- **Full game statistics** with match history and high scores
- **Touch-friendly interface** with haptic feedback
- **Offline play** via PWA installation
- **Sound effects** and vibration feedback
- **Weed-themed design** with green color scheme and leaf motifs

## 📱 Installation for Android using AIDE

### Method 1: Direct HTML/JS/CSS Project

1. **Open AIDE Web**
   - Launch AIDE app on your Android device
   - Select "Create HTML5 Project" or "Web Project"

2. **Create Project Structure**
   ```
   DopeDice/
   ├── index.html
   ├── styles.css
   ├── app.js
   ├── manifest.json
   ├── sw.js
   └── icon.png
   ```

3. **Copy Files**
   - Copy each file's content into AIDE
   - Make sure file names match exactly

4. **Add App Icon**
   - Create or download a 512x512 PNG icon with cannabis/dice theme
   - Save as `icon.png` in project root
   - Use green (#2b7a2b) color scheme

5. **Run the App**
   - Click "Run" in AIDE
   - AIDE will open the app in browser
   - Test all features

### Method 2: Convert to APK (Advanced)

1. **Use Apache Cordova in AIDE**
   - Install Cordova plugin for AIDE
   - Create new Cordova project
   - Copy all web files to `www/` folder

2. **Configure for Android**
   - Edit `config.xml` to set app details
   - Set orientation to portrait
   - Add permissions for vibration

3. **Build APK**
   - Use AIDE's build function
   - Sign with debug/release key
   - Install on device

### Method 3: PWA Installation (Easiest)

1. **Host the Files**
   - Upload to GitHub Pages, Netlify, or Vercel
   - Make sure HTTPS is enabled

2. **Install as App**
   - Open in Chrome/Edge on Android
   - Click "Add to Home Screen"
   - App will install like native app
   - Works offline after first load

## 🎯 How to Play

1. **Start Game**
   - Click "Play Game" from menu
   - Choose CPU difficulty

2. **Rolling Dice**
   - Click "Roll Dice" button
   - You get 3 rolls per turn
   - Tap dice to hold them between rolls

3. **Scoring**
   - After rolling, click a category to score
   - Each category can only be used once
   - Try to maximize your total score

4. **Winning**
   - Player with highest total score wins
   - Bonus 35 points if upper section ≥ 63

## 📊 Scoring Categories

### Upper Section (Sum of matching dice)
- Ones, Twos, Threes, Fours, Fives, Sixes
- **Bonus:** 35 points if total ≥ 63

### Lower Section
- **3 of a Kind:** Sum of all dice (if 3+ match)
- **4 of a Kind:** Sum of all dice (if 4+ match)
- **Full House:** 25 points (3 of one + 2 of another)
- **Small Straight:** 30 points (4 consecutive numbers)
- **Large Straight:** 40 points (5 consecutive numbers)
- **Yahtzee:** 50 points (all 5 dice match)
- **Chance:** Sum of all dice (any combination)

## 🔧 Customization

### Change Colors
Edit `styles.css` variables:
```css
:root {
  --primary: #2b7a2b;      /* Main green */
  --accent: #7cb342;        /* Light green */
  --player-color: #4caf50;  /* Player score color */
  --cpu-color: #ff6b6b;     /* CPU score color */
}
```

### Adjust Difficulty
In `app.js`, modify `cpuDecideHolds()` function:
- **Easy:** Random dice holding
- **Medium:** Hold pairs and better
- **Hard:** Optimal strategy

### Add New Game Modes
Edit settings panel in `index.html` and implement in `app.js`

## 📂 File Descriptions

- **index.html** - Main HTML structure with semantic markup
- **styles.css** - Complete styling with CSS variables and animations
- **app.js** - Full game logic, AI, scoring, and state management
- **manifest.json** - PWA configuration for installability
- **sw.js** - Service Worker for offline functionality
- **icon.png** - App icon (512x512 recommended)

## 🐛 Troubleshooting

### App won't install as PWA
- Ensure HTTPS is enabled
- Check manifest.json is valid
- Verify icon.png exists and is correct size

### Dice not rolling
- Check JavaScript console for errors
- Ensure all files are loaded
- Verify click events are working

### Scores not calculating
- Review `calculateScore()` function
- Check dice array values
- Verify category logic

### No sound/vibration
- Check settings are enabled
- Verify browser supports Web Audio API
- Confirm vibration permission granted

## 🎨 Icon Suggestions

For `icon.png`, use:
- Cannabis leaf + dice combination
- 512x512 pixels minimum
- PNG format with transparency
- Green color scheme (#2b7a2b)
- Clear, simple design for small sizes

## 📝 License

Free to use and modify. Created for personal enjoyment.

## 🌿 Credits

Built with love for cannabis enthusiasts and Yahtzee fans.
Optimized for mobile play and offline use.

---

**Tip:** Install as PWA for best experience and offline play!

**For your wife:** Enjoy the game! 🎲🍃
