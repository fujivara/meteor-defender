import { Observable, BehaviorSubject, interval } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { PlayerConfig, PlayerState } from '../interfaces/player.interface';
import { PLAYER_CONFIG, GAME_CONFIG } from '../utils/game-constants';

export class PlayerEntity {
  private state: PlayerState;
  private config: PlayerConfig;
  private stateSubject: BehaviorSubject<PlayerState>;
  private shootCooldown: number = 0;
  private keys: { [key: string]: boolean } = {};

  constructor() {
    this.config = PLAYER_CONFIG;
    this.state = {
      x: GAME_CONFIG.width / 2,
      y: GAME_CONFIG.height - 100,
      health: this.config.hitPoints,
      isAlive: true,
      canShoot: true
    };
    this.stateSubject = new BehaviorSubject(this.state);
  }

  getState(): Observable<PlayerState> {
    return this.stateSubject.asObservable();
  }

  getStateSnapshot(): PlayerState {
    return { ...this.state };
  }

  setKeyPressed(key: string, pressed: boolean): void {
    this.keys[key] = pressed;
  }

  update(deltaTime: number): void {
    if (!this.state.isAlive) return;

    this.updateMovement();
    this.updateShooting(deltaTime);
    this.emitState();
  }

  private updateMovement(): void {
    let newX = this.state.x;

    if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
      newX -= this.config.speed;
    }
    if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
      newX += this.config.speed;
    }

    newX = Math.max(this.config.width / 2, Math.min(GAME_CONFIG.width - this.config.width / 2, newX));
    this.state.x = newX;
  }

  private updateShooting(deltaTime: number): void {
    if (this.shootCooldown > 0) {
      this.shootCooldown -= deltaTime;
      this.state.canShoot = false;
    } else {
      this.state.canShoot = true;
    }
  }

  shoot(): Observable<{ x: number; y: number }> {
    return new Observable(observer => {
      if (this.state.canShoot && this.state.isAlive) {
        observer.next({
          x: this.state.x,
          y: this.state.y - this.config.height / 2
        });
        this.shootCooldown = this.config.fireRate * 1000;
        this.state.canShoot = false;
        this.emitState();
      }
      observer.complete();
    });
  }

  takeDamage(damage: number): Observable<boolean> {
    return new Observable(observer => {
      this.state.health -= damage;
      if (this.state.health <= 0) {
        this.state.isAlive = false;
        this.state.health = 0;
      }
      this.emitState();
      observer.next(!this.state.isAlive);
      observer.complete();
    });
  }

  reset(): void {
    this.state = {
      x: GAME_CONFIG.width / 2,
      y: GAME_CONFIG.height - 100,
      health: this.config.hitPoints,
      isAlive: true,
      canShoot: true
    };
    this.shootCooldown = 0;
    this.keys = {};
    this.emitState();
  }

  private emitState(): void {
    this.stateSubject.next({ ...this.state });
  }
}