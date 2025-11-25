import { Observable, BehaviorSubject, interval } from 'rxjs';
import { takeWhile, map } from 'rxjs/operators';
import { MeteorSize } from '../enums/meteor-size.enum';

export interface Particle {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface ExplosionConfig {
  particleCount: number;
  particleSpeed: number;
  particleLife: number;
  colors: string[];
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private particlesSubject: BehaviorSubject<Particle[]> = new BehaviorSubject<Particle[]>([]);

  private explosionConfigs: Record<MeteorSize, ExplosionConfig> = {
    [MeteorSize.SMALL]: {
      particleCount: 8,
      particleSpeed: 3,
      particleLife: 1000,
      colors: ['#ffaa00', '#ff6600', '#ff0000']
    },
    [MeteorSize.MEDIUM]: {
      particleCount: 12,
      particleSpeed: 4,
      particleLife: 1500,
      colors: ['#ffaa00', '#ff6600', '#ff0000', '#ffffff']
    },
    [MeteorSize.LARGE]: {
      particleCount: 20,
      particleSpeed: 5,
      particleLife: 2000,
      colors: ['#ffaa00', '#ff6600', '#ff0000', '#ffffff', '#ffff00']
    }
  };

  getParticles(): Observable<Particle[]> {
    return this.particlesSubject.asObservable();
  }

  createMeteorExplosion(x: number, y: number, meteorSize: MeteorSize): Observable<void> {
    return new Observable(observer => {
      const config = this.explosionConfigs[meteorSize];

      for (let i = 0; i < config.particleCount; i++) {
        const angle = (Math.PI * 2 * i) / config.particleCount;
        const speed = config.particleSpeed * (0.5 + Math.random() * 0.5);
        const color = config.colors[Math.floor(Math.random() * config.colors.length)];

        const particle: Particle = {
          x,
          y,
          velocityX: Math.cos(angle) * speed,
          velocityY: Math.sin(angle) * speed,
          life: config.particleLife,
          maxLife: config.particleLife,
          color,
          size: 2 + Math.random() * 3
        };

        this.particles.push(particle);
      }

      this.emitParticles();
      observer.next();
      observer.complete();
    });
  }

  createPlayerDeathExplosion(x: number, y: number): Observable<void> {
    return new Observable(observer => {
      const particleCount = 25;
      const speed = 6;
      const life = 2500;
      const colors = ['#00ffff', '#0099ff', '#ffffff', '#ffaa00'];

      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const particleSpeed = speed * (0.3 + Math.random() * 0.7);
        const color = colors[Math.floor(Math.random() * colors.length)];

        const particle: Particle = {
          x,
          y,
          velocityX: Math.cos(angle) * particleSpeed,
          velocityY: Math.sin(angle) * particleSpeed,
          life,
          maxLife: life,
          color,
          size: 3 + Math.random() * 4
        };

        this.particles.push(particle);
      }

      this.emitParticles();
      observer.next();
      observer.complete();
    });
  }

  update(deltaTime: number): Observable<void> {
    return new Observable(observer => {
      this.particles = this.particles.filter(particle => {
        particle.x += particle.velocityX;
        particle.y += particle.velocityY;
        particle.life -= deltaTime;

        particle.velocityY += 0.1;

        return particle.life > 0;
      });

      this.emitParticles();
      observer.next();
      observer.complete();
    });
  }

  clear(): Observable<void> {
    return new Observable(observer => {
      this.particles = [];
      this.emitParticles();
      observer.next();
      observer.complete();
    });
  }

  private emitParticles(): void {
    this.particlesSubject.next([...this.particles]);
  }
}