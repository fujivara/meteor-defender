import { Scene } from 'phaser';
import { Observable, interval, fromEvent, merge, Subscription } from 'rxjs';
import { map, filter, takeWhile, switchMap } from 'rxjs/operators';

import { PlayerEntity } from '../entities/player.entity';
import { BulletEntity } from '../entities/bullet.entity';
import { MeteorEntity } from '../entities/meteor.entity';
import { ObjectPool } from '../systems/object-pool.system';
import { CollisionSystem, CollisionType } from '../systems/collision.system';
import { ScoringSystem } from '../systems/scoring.system';
import { ParticleSystem } from '../systems/particle.system';
import { StarfieldSystem } from '../systems/starfield.system';

import { SceneKey } from '../enums/scene-key.enum';
import { MeteorSize } from '../enums/meteor-size.enum';
import { SoundEffect } from '../enums/sound-effect.enum';
import { GAME_CONFIG, METEOR_CONFIGS, UI_CONFIG } from '../utils/game-constants';

export class GameScene extends Scene {
  private player!: PlayerEntity;
  private bulletPool!: ObjectPool<BulletEntity>;
  private meteorPool!: ObjectPool<MeteorEntity>;
  private collisionSystem!: CollisionSystem;
  private scoringSystem!: ScoringSystem;
  private particleSystem!: ParticleSystem;
  private starfieldSystem!: StarfieldSystem;

  private gameSubscriptions: Subscription[] = [];
  private gameRunning = false;
  private meteorSpawnTimer = 0;
  private meteorSpawnRate = GAME_CONFIG.initialMeteorSpawnRate * 1000;
  private difficultyTimer = 0;

  private scoreText!: Phaser.GameObjects.Text;
  private highScoreText!: Phaser.GameObjects.Text;
  private playerSprite!: Phaser.GameObjects.Sprite;

  constructor() {
    super({ key: SceneKey.GAME });
  }

  preload(): void {
    this.createSimpleAssets();
  }

  create(): void {
    this.initializeSystems();
    this.initializeEntities();
    this.setupInput();
    this.setupUI();
    this.startGame();
  }

  private createSimpleAssets(): void {
    this.add.graphics()
      .fillStyle(0x00ffff)
      .fillRect(0, 0, 60, 80)
      .generateTexture('player', 60, 80);

    this.add.graphics()
      .fillStyle(0xffffff)
      .fillRect(0, 0, 8, 20)
      .generateTexture('bullet', 8, 20);

    ['small', 'medium', 'large'].forEach(size => {
      const config = METEOR_CONFIGS[size as MeteorSize];
      this.add.graphics()
        .fillStyle(0x8B4513)
        .fillCircle(config.width / 2, config.height / 2, config.width / 2)
        .generateTexture(`meteor-${size}`, config.width, config.height);
    });
  }

  private initializeSystems(): void {
    this.collisionSystem = new CollisionSystem();
    this.scoringSystem = new ScoringSystem();
    this.particleSystem = new ParticleSystem();
    this.starfieldSystem = new StarfieldSystem();

    this.bulletPool = new ObjectPool(
      () => new BulletEntity(0, 0),
      (bullet) => bullet.reset(0, 0),
      20
    );

    this.meteorPool = new ObjectPool(
      () => new MeteorEntity(MeteorSize.SMALL, 0),
      (meteor) => meteor.reset(MeteorSize.SMALL, 0),
      15
    );
  }

  private initializeEntities(): void {
    this.player = new PlayerEntity();

    // Create player sprite
    const playerState = this.player.getStateSnapshot();
    this.playerSprite = this.add.sprite(playerState.x, playerState.y, 'player');
    this.playerSprite.setOrigin(0.5);
  }

  private setupInput(): void {
    const keys = this.input.keyboard?.createCursorKeys();
    if (!keys) return;

    const spaceKey = this.input.keyboard?.addKey('SPACE');
    const wasdKeys = this.input.keyboard?.addKeys('W,S,A,D');

    this.gameSubscriptions.push(
      fromEvent(this.input.keyboard as any, 'keydown').subscribe((event: any) => {
        this.player.setKeyPressed(event.code, true);
        if (event.code === 'Space') {
          this.handlePlayerShoot();
        }
      }),

      fromEvent(this.input.keyboard as any, 'keyup').subscribe((event: any) => {
        this.player.setKeyPressed(event.code, false);
      })
    );
  }

  private setupUI(): void {
    this.scoreText = this.add.text(50, 50, 'Score: 0', {
      fontSize: UI_CONFIG.fontSize + 'px',
      color: UI_CONFIG.primaryColor
    });

    this.highScoreText = this.add.text(GAME_CONFIG.width - 300, 50, 'High: 0', {
      fontSize: UI_CONFIG.fontSize + 'px',
      color: UI_CONFIG.primaryColor
    });

    this.gameSubscriptions.push(
      this.scoringSystem.getState().subscribe(scoreState => {
        this.scoreText.setText(`Score: ${scoreState.currentScore}`);
        this.highScoreText.setText(`High: ${scoreState.highScore}`);
      })
    );
  }

  private startGame(): void {
    this.gameRunning = true;
    this.meteorSpawnTimer = 0;
    this.difficultyTimer = 0;

    this.gameSubscriptions.push(
      this.starfieldSystem.getStars().subscribe(stars => {
        this.renderStars(stars);
      }),

      this.particleSystem.getParticles().subscribe(particles => {
        this.renderParticles(particles);
      })
    );
  }

  private handlePlayerShoot(): void {
    this.player.shoot().subscribe(shootData => {
      const bullet = this.bulletPool.acquire();
      bullet.reset(shootData.x, shootData.y);

      const sprite = this.add.sprite(shootData.x, shootData.y, 'bullet');
      bullet.setSprite(sprite);

      try {
        this.sound.play(SoundEffect.SHOOT, { volume: 0.3 });
      } catch (e) {
        // Sound not available
      }
    });
  }

  private spawnMeteor(): void {
    const sizes = Object.values(MeteorSize);
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    const x = Math.random() * (GAME_CONFIG.width - 100) + 50;

    const meteor = this.meteorPool.acquire();
    meteor.reset(size, x);

    const sprite = this.add.sprite(x, -50, `meteor-${size}`);
    meteor.setSprite(sprite);
  }

  override update(time: number, deltaTime: number): void {
    if (!this.gameRunning) return;

    this.updateDifficulty(deltaTime);
    this.updateMeteorSpawning(deltaTime);
    this.updateEntities(deltaTime);
    this.updateCollisions();
    this.updateVisuals();
  }

  private updateDifficulty(deltaTime: number): void {
    this.difficultyTimer += deltaTime;

    if (this.difficultyTimer >= GAME_CONFIG.difficultyIncreaseInterval * 1000) {
      this.meteorSpawnRate *= (1 - GAME_CONFIG.spawnRateIncrease);
      this.difficultyTimer = 0;
    }
  }

  private updateMeteorSpawning(deltaTime: number): void {
    this.meteorSpawnTimer += deltaTime;

    if (this.meteorSpawnTimer >= this.meteorSpawnRate) {
      this.spawnMeteor();
      this.meteorSpawnTimer = 0;
    }
  }

  private updateEntities(deltaTime: number): void {
    this.player.update(deltaTime);

    this.starfieldSystem.update(deltaTime).subscribe();
    this.particleSystem.update(deltaTime).subscribe();

    this.bulletPool.getActiveObjectsSnapshot().forEach(bullet => {
      bullet.update(deltaTime).subscribe(isActive => {
        if (!isActive) {
          bullet.getSprite()?.destroy();
          this.bulletPool.release(bullet);
        } else {
          const state = bullet.getStateSnapshot();
          bullet.getSprite()?.setPosition(state.x, state.y);
        }
      });
    });

    this.meteorPool.getActiveObjectsSnapshot().forEach(meteor => {
      meteor.update(deltaTime).subscribe(isActive => {
        if (!isActive) {
          meteor.getSprite()?.destroy();
          this.meteorPool.release(meteor);
        } else {
          const state = meteor.getStateSnapshot();
          const sprite = meteor.getSprite();
          if (sprite) {
            sprite.setPosition(state.x, state.y);
            sprite.setRotation(state.rotation);
          }
        }
      });
    });
  }

  private updateCollisions(): void {
    const bullets = this.bulletPool.getActiveObjectsSnapshot();
    const meteors = this.meteorPool.getActiveObjectsSnapshot();

    this.collisionSystem.checkBulletMeteorCollisions(bullets, meteors).subscribe(collisions => {
      collisions.forEach(collision => {
        if (collision.type === CollisionType.BULLET_METEOR) {
          const [bullet, meteor] = collision.entities as [BulletEntity, MeteorEntity];

          meteor.takeDamage(bullet.getDamage()).subscribe(result => {
            if (result.destroyed) {
              this.scoringSystem.addScore(result.scoreValue);
              this.particleSystem.createMeteorExplosion(
                meteor.getStateSnapshot().x,
                meteor.getStateSnapshot().y,
                meteor.getSize()
              ).subscribe();

              const explosionSound = `meteor_explosion_${meteor.getSize()}`;
              try {
                this.sound.play(explosionSound as SoundEffect, { volume: 0.5 });
              } catch (e) {
                // Sound not available
              }

              meteor.getSprite()?.destroy();
              this.meteorPool.release(meteor);
            } else {
              try {
                this.sound.play(SoundEffect.METEOR_HIT, { volume: 0.4 });
              } catch (e) {
                // Sound not available
              }
            }
          });

          bullet.deactivate().subscribe(() => {
            bullet.getSprite()?.destroy();
            this.bulletPool.release(bullet);
          });
        }
      });
    });

    this.collisionSystem.checkPlayerMeteorCollisions(this.player, meteors).subscribe(collisions => {
      if (collisions.length > 0) {
        this.handlePlayerDeath();
      }
    });
  }

  private updateVisuals(): void {
    const playerState = this.player.getStateSnapshot();
    if (playerState.isAlive) {
      // Update player sprite position
      this.playerSprite.setPosition(playerState.x, playerState.y);
      this.playerSprite.setVisible(true);

      // Add subtle glow effect based on shooting capability
      const alpha = playerState.canShoot ? 1 : 0.8;
      this.playerSprite.setAlpha(alpha);

      // Add subtle pulse effect
      const pulseScale = 1 + Math.sin(this.time.now * 0.005) * 0.05;
      this.playerSprite.setScale(pulseScale);
    } else {
      this.playerSprite.setVisible(false);
    }
  }

  private renderStars(stars: any[]): void {
    this.children.list
      .filter((child: any) => child.getData && child.getData('type') === 'star')
      .forEach((star: any) => star.destroy());

    stars.forEach(star => {
      const starSprite = this.add.circle(star.x, star.y, star.size, 0xffffff, star.brightness);
      starSprite.setData('type', 'star');
    });
  }

  private renderParticles(particles: any[]): void {
    this.children.list
      .filter((child: any) => child.getData && child.getData('type') === 'particle')
      .forEach((particle: any) => particle.destroy());

    particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      const particleSprite = this.add.circle(particle.x, particle.y, particle.size, parseInt(particle.color.replace('#', ''), 16), alpha);
      particleSprite.setData('type', 'particle');
    });
  }

  private handlePlayerDeath(): void {
    this.gameRunning = false;

    this.player.takeDamage(1).subscribe(isDead => {
      if (isDead) {
        const playerState = this.player.getStateSnapshot();
        this.particleSystem.createPlayerDeathExplosion(playerState.x, playerState.y).subscribe();
        try {
          this.sound.play(SoundEffect.SHIP_DEATH, { volume: 0.7 });
        } catch (e) {
          // Sound not available
        }

        this.time.delayedCall(2000, () => {
          this.scene.start(SceneKey.GAME_OVER);
        });
      }
    });
  }

  shutdown(): void {
    this.gameSubscriptions.forEach(sub => sub.unsubscribe());
  }
}