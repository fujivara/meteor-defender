import { Observable, BehaviorSubject } from 'rxjs';
import { BulletConfig, BulletState } from '../interfaces/bullet.interface';
import { BULLET_CONFIG, GAME_CONFIG } from '../utils/game-constants';

export class BulletEntity {
  private state: BulletState;
  private config: BulletConfig;
  private stateSubject: BehaviorSubject<BulletState>;
  private sprite?: Phaser.GameObjects.Sprite;

  constructor(x: number, y: number) {
    this.config = BULLET_CONFIG;
    this.state = {
      x,
      y,
      velocityY: -this.config.speed,
      isActive: true
    };
    this.stateSubject = new BehaviorSubject(this.state);
  }

  getState(): Observable<BulletState> {
    return this.stateSubject.asObservable();
  }

  getStateSnapshot(): BulletState {
    return { ...this.state };
  }

  setSprite(sprite: Phaser.GameObjects.Sprite): void {
    this.sprite = sprite;
  }

  getSprite(): Phaser.GameObjects.Sprite | undefined {
    return this.sprite;
  }

  update(deltaTime: number): Observable<boolean> {
    return new Observable(observer => {
      if (!this.state.isActive) {
        observer.next(false);
        observer.complete();
        return;
      }

      this.state.y += this.state.velocityY;

      if (this.state.y < -this.config.height) {
        this.state.isActive = false;
      }

      this.emitState();
      observer.next(this.state.isActive);
      observer.complete();
    });
  }

  reset(x: number, y: number): void {
    this.state = {
      x,
      y,
      velocityY: -this.config.speed,
      isActive: true
    };
    this.emitState();
  }

  deactivate(): Observable<void> {
    return new Observable(observer => {
      this.state.isActive = false;
      this.emitState();
      observer.next();
      observer.complete();
    });
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.state.x - this.config.width / 2,
      y: this.state.y - this.config.height / 2,
      width: this.config.width,
      height: this.config.height
    };
  }

  getDamage(): number {
    return this.config.damage;
  }

  private emitState(): void {
    this.stateSubject.next({ ...this.state });
  }
}