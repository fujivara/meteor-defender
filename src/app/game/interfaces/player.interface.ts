export interface PlayerConfig {
  speed: number;
  hitPoints: number;
  fireRate: number;
  width: number;
  height: number;
}

export interface PlayerState {
  x: number;
  y: number;
  health: number;
  isAlive: boolean;
  canShoot: boolean;
}