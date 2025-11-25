import { Observable, BehaviorSubject } from 'rxjs';
import { GAME_CONFIG } from '../utils/game-constants';

export interface Star {
  x: number;
  y: number;
  speed: number;
  brightness: number;
  size: number;
}

export class StarfieldSystem {
  private stars: Star[] = [];
  private starsSubject: BehaviorSubject<Star[]> = new BehaviorSubject<Star[]>([]);

  constructor() {
    this.initializeStars();
  }

  getStars(): Observable<Star[]> {
    return this.starsSubject.asObservable();
  }

  private initializeStars(): void {
    const starCount = 200;

    for (let i = 0; i < starCount; i++) {
      this.stars.push(this.createStar());
    }

    this.emitStars();
  }

  private createStar(): Star {
    return {
      x: Math.random() * GAME_CONFIG.width,
      y: Math.random() * GAME_CONFIG.height,
      speed: 0.5 + Math.random() * 2,
      brightness: 0.3 + Math.random() * 0.7,
      size: 1 + Math.random() * 2
    };
  }

  update(deltaTime: number): Observable<void> {
    return new Observable(observer => {
      this.stars.forEach(star => {
        star.y += star.speed;

        if (star.y > GAME_CONFIG.height + 10) {
          star.x = Math.random() * GAME_CONFIG.width;
          star.y = -10;
          star.speed = 0.5 + Math.random() * 2;
          star.brightness = 0.3 + Math.random() * 0.7;
          star.size = 1 + Math.random() * 2;
        }
      });

      this.emitStars();
      observer.next();
      observer.complete();
    });
  }

  private emitStars(): void {
    this.starsSubject.next([...this.stars]);
  }
}