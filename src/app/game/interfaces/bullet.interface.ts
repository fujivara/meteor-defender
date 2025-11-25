export interface BulletConfig {
  speed: number;
  damage: number;
  width: number;
  height: number;
}

export interface BulletState {
  x: number;
  y: number;
  velocityY: number;
  isActive: boolean;
}