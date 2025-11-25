import { Observable, combineLatest } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { BulletEntity } from '../entities/bullet.entity';
import { MeteorEntity } from '../entities/meteor.entity';
import { PlayerEntity } from '../entities/player.entity';

export interface CollisionResult {
  type: CollisionType;
  entities: (BulletEntity | MeteorEntity | PlayerEntity)[];
  scoreValue?: number;
}

export enum CollisionType {
  BULLET_METEOR = 'bullet_meteor',
  PLAYER_METEOR = 'player_meteor'
}

export class CollisionSystem {
  checkBulletMeteorCollisions(
    bullets: BulletEntity[],
    meteors: MeteorEntity[]
  ): Observable<CollisionResult[]> {
    return new Observable(observer => {
      const collisions: CollisionResult[] = [];

      bullets.forEach(bullet => {
        const bulletState = bullet.getStateSnapshot();
        if (!bulletState.isActive) return;

        meteors.forEach(meteor => {
          const meteorState = meteor.getStateSnapshot();
          if (this.checkCollision(bullet.getBounds(), meteor.getBounds())) {
            collisions.push({
              type: CollisionType.BULLET_METEOR,
              entities: [bullet, meteor],
              scoreValue: meteor.getScoreValue()
            });
          }
        });
      });

      observer.next(collisions);
      observer.complete();
    });
  }

  checkPlayerMeteorCollisions(
    player: PlayerEntity,
    meteors: MeteorEntity[]
  ): Observable<CollisionResult[]> {
    return new Observable(observer => {
      const collisions: CollisionResult[] = [];
      const playerState = player.getStateSnapshot();

      if (!playerState.isAlive) {
        observer.next(collisions);
        observer.complete();
        return;
      }

      const playerBounds = this.getPlayerBounds(playerState);

      meteors.forEach(meteor => {
        if (this.checkCollision(playerBounds, meteor.getBounds())) {
          collisions.push({
            type: CollisionType.PLAYER_METEOR,
            entities: [player, meteor]
          });
        }
      });

      observer.next(collisions);
      observer.complete();
    });
  }

  private checkCollision(
    bounds1: { x: number; y: number; width: number; height: number },
    bounds2: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      bounds1.x < bounds2.x + bounds2.width &&
      bounds1.x + bounds1.width > bounds2.x &&
      bounds1.y < bounds2.y + bounds2.height &&
      bounds1.y + bounds1.height > bounds2.y
    );
  }

  private getPlayerBounds(playerState: any): { x: number; y: number; width: number; height: number } {
    const width = 60;
    const height = 80;
    return {
      x: playerState.x - width / 2,
      y: playerState.y - height / 2,
      width,
      height
    };
  }
}