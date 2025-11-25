export interface GameConfig {
  width: number;
  height: number;
  fps: number;
  initialMeteorSpawnRate: number;
  meteorSpeedIncrease: number;
  spawnRateIncrease: number;
  difficultyIncreaseInterval: number;
}

export interface GameState {
  score: number;
  highScore: number;
  level: number;
  meteorsDestroyed: number;
  isGameRunning: boolean;
}