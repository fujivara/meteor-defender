import { MeteorSize } from '../enums/meteor-size.enum';

export interface MeteorConfig {
  size: MeteorSize;
  hitPoints: number;
  speed: number;
  scoreValue: number;
  width: number;
  height: number;
  rotationSpeed: number;
}

export interface MeteorState {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  health: number;
  size: MeteorSize;
}