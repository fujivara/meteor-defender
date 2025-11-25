import { Observable, BehaviorSubject } from 'rxjs';
import { MeteorConfig, MeteorState } from '../interfaces/meteor.interface';
import { MeteorSize } from '../enums/meteor-size.enum';
import { METEOR_CONFIGS, GAME_CONFIG } from '../utils/game-constants';

export class MeteorEntity {
  private state: MeteorState;
  private config: MeteorConfig;
  private stateSubject: BehaviorSubject<MeteorState>;
  private sprite?: Phaser.GameObjects.Sprite;

  constructor(size: MeteorSize, x: number) {
    this.config = METEOR_CONFIGS[size];

    const driftAngle = (Math.random() - 0.5) * 20 * (Math.PI / 180);
    const speed = this.config.speed;

    this.state = {
      x,
      y: -this.config.height,
      velocityX: Math.sin(driftAngle) * speed,
      velocityY: Math.cos(driftAngle) * speed,
      rotation: 0,
      health: this.config.hitPoints,
      size
    };
    this.stateSubject = new BehaviorSubject(this.state);
  }

  getState(): Observable<MeteorState> {
    return this.stateSubject.asObservable();
  }

  getStateSnapshot(): MeteorState {
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
      this.state.x += this.state.velocityX;
      this.state.y += this.state.velocityY;
      this.state.rotation += this.config.rotationSpeed;

      const isOutOfBounds =
        this.state.y > GAME_CONFIG.height + this.config.height ||
        this.state.x < -this.config.width ||
        this.state.x > GAME_CONFIG.width + this.config.width;

      this.emitState();
      observer.next(!isOutOfBounds);
      observer.complete();
    });
  }

  takeDamage(damage: number): Observable<{ destroyed: boolean; scoreValue: number }> {
    return new Observable(observer => {
      this.state.health -= damage;
      const destroyed = this.state.health <= 0;
      const scoreValue = destroyed ? this.config.scoreValue : 0;

      this.emitState();
      observer.next({ destroyed, scoreValue });
      observer.complete();
    });
  }

  reset(size: MeteorSize, x: number): void {
    this.config = METEOR_CONFIGS[size];

    const driftAngle = (Math.random() - 0.5) * 20 * (Math.PI / 180);
    const speed = this.config.speed;

    this.state = {
      x,
      y: -this.config.height,
      velocityX: Math.sin(driftAngle) * speed,
      velocityY: Math.cos(driftAngle) * speed,
      rotation: 0,
      health: this.config.hitPoints,
      size
    };
    this.emitState();
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.state.x - this.config.width / 2,
      y: this.state.y - this.config.height / 2,
      width: this.config.width,
      height: this.config.height
    };
  }

  getSize(): MeteorSize {
    return this.state.size;
  }

  getScoreValue(): number {
    return this.config.scoreValue;
  }

  private emitState(): void {
    this.stateSubject.next({ ...this.state });
  }
}