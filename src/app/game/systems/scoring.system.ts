import { Observable, BehaviorSubject } from 'rxjs';

export interface ScoreState {
  currentScore: number;
  highScore: number;
  meteorsDestroyed: number;
  level: number;
}

export class ScoringSystem {
  private state: ScoreState;
  private stateSubject: BehaviorSubject<ScoreState>;

  constructor() {
    this.state = {
      currentScore: 0,
      highScore: this.loadHighScore(),
      meteorsDestroyed: 0,
      level: 1
    };
    this.stateSubject = new BehaviorSubject(this.state);
  }

  getState(): Observable<ScoreState> {
    return this.stateSubject.asObservable();
  }

  getStateSnapshot(): ScoreState {
    return { ...this.state };
  }

  addScore(points: number): Observable<ScoreState> {
    return new Observable(observer => {
      this.state.currentScore += points;
      this.state.meteorsDestroyed++;

      if (this.state.currentScore > this.state.highScore) {
        this.state.highScore = this.state.currentScore;
        this.saveHighScore(this.state.highScore);
      }

      this.updateLevel();
      this.emitState();

      observer.next({ ...this.state });
      observer.complete();
    });
  }

  resetScore(): Observable<ScoreState> {
    return new Observable(observer => {
      this.state.currentScore = 0;
      this.state.meteorsDestroyed = 0;
      this.state.level = 1;

      this.emitState();
      observer.next({ ...this.state });
      observer.complete();
    });
  }

  private updateLevel(): void {
    const newLevel = Math.floor(this.state.meteorsDestroyed / 10) + 1;
    if (newLevel > this.state.level) {
      this.state.level = newLevel;
    }
  }

  private loadHighScore(): number {
    if (typeof Storage !== 'undefined') {
      const stored = localStorage.getItem('meteor-shtorm-highscore');
      return stored ? parseInt(stored, 10) : 0;
    }
    return 0;
  }

  private saveHighScore(score: number): void {
    if (typeof Storage !== 'undefined') {
      localStorage.setItem('meteor-shtorm-highscore', score.toString());
    }
  }

  private emitState(): void {
    this.stateSubject.next({ ...this.state });
  }
}