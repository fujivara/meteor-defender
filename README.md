# Meteor Defender 💫

A fast-paced space arcade game where you pilot a ship through an endless meteor storm. Survive as long as you can by shooting meteors and dodging destruction! Built with Angular, TypeScript, and Phaser.

![Game Screenshot](./src/assets/screenshots/meteor-shtorm-gameplay.png)

## 🎮 How to Play

1. **Start the game** from the main menu by clicking "START GAME" or pressing SPACE
2. **Move your ship** using arrow keys or WASD to navigate through space
3. **Shoot meteors** by pressing SPACE to fire bullets and destroy incoming threats
4. **Avoid collisions** - touching a meteor will destroy your ship and end the game
5. **Score points** by destroying meteors: Small (10pts), Medium (25pts), Large (50pts)
6. **Survive as long as possible** - the game gets progressively harder with faster meteors and increased spawn rates

### Game Features

- 🚀 **Smooth Controls**: Responsive ship movement with keyboard input
- 💥 **Dynamic Combat**: Shoot and destroy meteors of different sizes
- ⭐ **Particle Effects**: Explosive destruction effects and animated starfield
- 🎵 **Sound Effects**: Immersive audio for shooting, explosions, and impacts
- 📈 **Progressive Difficulty**: Meteor spawn rate and speed increase over time
- 🏆 **Score Tracking**: Real-time scoring with high score persistence
- 🎨 **Retro Aesthetic**: Classic arcade-style graphics and UI

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern web browser with WebGL support

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/meteor-shtorm.git
cd meteor-shtorm
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:4200`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/meteor-shtorm/browser` directory.

## 🏗️ Project Structure

```
meteor-shtorm/
├── src/
│   ├── app/
│   │   ├── game/
│   │   │   ├── entities/           # Game entities (Player, Bullet, Meteor)
│   │   │   │   ├── player.entity.ts
│   │   │   │   ├── bullet.entity.ts
│   │   │   │   └── meteor.entity.ts
│   │   │   ├── scenes/             # Phaser game scenes
│   │   │   │   ├── menu.scene.ts   # Main menu scene
│   │   │   │   ├── game.scene.ts   # Core gameplay scene
│   │   │   │   └── game-over.scene.ts
│   │   │   ├── systems/            # Game systems and logic
│   │   │   │   ├── collision.system.ts
│   │   │   │   ├── particle.system.ts
│   │   │   │   ├── scoring.system.ts
│   │   │   │   ├── starfield.system.ts
│   │   │   │   └── object-pool.system.ts
│   │   │   ├── enums/              # Game enumerations
│   │   │   ├── interfaces/         # TypeScript interfaces
│   │   │   └── utils/              # Game constants and utilities
│   │   ├── app.ts                  # Main app component
│   │   └── game.component.ts       # Phaser game integration
│   ├── assets/                     # Game assets
│   │   ├── *.svg                   # Ship and meteor sprites
│   │   ├── *.wav                   # Sound effects
│   │   └── screenshots/            # Documentation images
│   └── main.ts                     # Angular bootstrap
├── angular.json                    # Angular configuration
├── package.json                    # Dependencies and scripts
└── README.md                       # Project documentation
```

## 🛠️ Technical Details

### Technologies Used

- **Angular 21** - Application framework and component architecture
- **TypeScript** - Type-safe development with modern JavaScript features
- **Phaser 3.80** - Game engine for rendering, physics, and input handling
- **RxJS** - Reactive programming for game state management
- **TailwindCSS** - Utility-first CSS framework for styling

### Game Architecture

The game follows a clean, modular architecture:

- **Entity-Component System**: Game objects are represented as entities with observable state
- **Object Pooling**: Efficient memory management for bullets and meteors
- **Reactive State Management**: RxJS observables handle game state changes
- **Scene Management**: Phaser scenes organize different game states (Menu, Game, Game Over)

### Key Systems

- **Collision System**: Handles bullet-meteor and player-meteor collision detection
- **Particle System**: Manages explosion effects and visual feedback
- **Scoring System**: Tracks player score and persists high scores
- **Starfield System**: Creates animated background star effects

## ⚙️ Game Configuration

### Difficulty Settings

Modify game difficulty in `src/app/game/utils/game-constants.ts`:

```typescript
export const GAME_CONFIG: GameConfig = {
  width: 800,
  height: 600,
  initialMeteorSpawnRate: 1.2,    // Lower = more meteors
  spawnRateIncrease: 0.05,        // Difficulty ramp speed
  difficultyIncreaseInterval: 20  // Seconds between difficulty increases
};
```

### Player Configuration

Adjust player ship behavior:

```typescript
export const PLAYER_CONFIG: PlayerConfig = {
  speed: 8,          // Movement speed
  hitPoints: 1,      // Health (currently always 1)
  fireRate: 0.25,    // Seconds between shots
  width: 60,         // Collision width
  height: 80         // Collision height
};
```

### Meteor Properties

Customize meteor types in `METEOR_CONFIGS`:

```typescript
[MeteorSize.SMALL]: {
  hitPoints: 1,      // Shots to destroy
  speed: 2.5,        // Movement speed
  scoreValue: 10,    // Points awarded
  rotationSpeed: 0.02 // Visual rotation
}
```

## 🎨 Customization

### Audio Assets

Replace sound files in `src/assets/`:
- `shoot.wav` - Bullet firing sound
- `meteor_hit.wav` - Meteor damage sound
- `meteor_explosion_*.wav` - Destruction sounds by size
- `ship_death.wav` - Player destruction
- `button_click.wav` - UI interaction sound

### Visual Assets

Replace SVG sprites in `src/assets/`:
- `player-ship.svg` - Player ship sprite
- `meteor-small.svg` - Small meteor sprite
- `meteor-medium.svg` - Medium meteor sprite
- `meteor-large.svg` - Large meteor sprite

## 📝 Scripts

- `npm start` - Start development server (alias for `ng serve`)
- `npm run build` - Build for production
- `npm run watch` - Build and watch for changes
- `npm test` - Run unit tests
- `npm run ng` - Angular CLI commands

## 🎯 Gameplay Tips

- **Prioritize Movement**: Survival is more important than shooting every meteor
- **Target Large Meteors**: They give the most points but take more shots to destroy
- **Use the Edges**: The ship can wrap around screen edges for quick escapes
- **Watch Your Fire Rate**: There's a cooldown between shots, so time them carefully
- **Study Patterns**: Meteors spawn from the top - anticipate their paths

## 🤝 Contributing

Contributions are welcome! Areas for improvement:

- Additional meteor types with special behaviors
- Power-ups and weapon upgrades
- Multiple difficulty levels with different spawn patterns
- Local multiplayer support
- Mobile touch controls
- Additional visual effects and screen shake

Please feel free to submit Pull Requests or open Issues for bugs and feature requests.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with modern web technologies and best practices
- Inspired by classic arcade space shooters
- Sound effects sourced from royalty-free libraries

---

Made with 💫 using Angular and Phaser
