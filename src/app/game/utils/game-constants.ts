import { PlayerConfig } from '../interfaces/player.interface';
import { BulletConfig } from '../interfaces/bullet.interface';
import { MeteorConfig } from '../interfaces/meteor.interface';
import { GameConfig } from '../interfaces/game-config.interface';
import { UIConfig } from '../interfaces/ui.interface';
import { MeteorSize } from '../enums/meteor-size.enum';

export const GAME_CONFIG: GameConfig = {
  width: 1920,
  height: 1080,
  fps: 60,
  initialMeteorSpawnRate: 1.2,
  meteorSpeedIncrease: 0.1,
  spawnRateIncrease: 0.05,
  difficultyIncreaseInterval: 20
};

export const PLAYER_CONFIG: PlayerConfig = {
  speed: 8,
  hitPoints: 1,
  fireRate: 0.25,
  width: 60,
  height: 80
};

export const BULLET_CONFIG: BulletConfig = {
  speed: 15,
  damage: 1,
  width: 8,
  height: 20
};

export const METEOR_CONFIGS: Record<MeteorSize, MeteorConfig> = {
  [MeteorSize.SMALL]: {
    size: MeteorSize.SMALL,
    hitPoints: 1,
    speed: 2.5,
    scoreValue: 10,
    width: 40,
    height: 40,
    rotationSpeed: 0.02
  },
  [MeteorSize.MEDIUM]: {
    size: MeteorSize.MEDIUM,
    hitPoints: 2,
    speed: 2,
    scoreValue: 25,
    width: 70,
    height: 70,
    rotationSpeed: 0.015
  },
  [MeteorSize.LARGE]: {
    size: MeteorSize.LARGE,
    hitPoints: 3,
    speed: 1.5,
    scoreValue: 50,
    width: 100,
    height: 100,
    rotationSpeed: 0.01
  }
};

export const UI_CONFIG: UIConfig = {
  fontSize: 32,
  fontFamily: 'Arial',
  primaryColor: '#00ffff',
  secondaryColor: '#ffffff',
  backgroundColor: '#000033'
};