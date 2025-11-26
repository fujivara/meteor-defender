import { Scene } from 'phaser';
import { Observable, fromEvent, Subscription } from 'rxjs';
import { SceneKey } from '../enums/scene-key.enum';
import { SoundEffect } from '../enums/sound-effect.enum';
import { GAME_CONFIG, UI_CONFIG } from '../utils/game-constants';
import { StarfieldSystem } from '../systems/starfield.system';

export class MenuScene extends Scene {
  private starfieldSystem!: StarfieldSystem;
  private subscriptions: Subscription[] = [];

  constructor() {
    super({ key: SceneKey.MENU });
  }

  create(): void {
    this.starfieldSystem = new StarfieldSystem();
    this.setupBackground();
    this.createTitle();
    this.createButtons();
    this.startBackgroundAnimation();
  }

  private setupBackground(): void {
    this.cameras.main.setBackgroundColor(UI_CONFIG.backgroundColor);

    this.subscriptions.push(
      this.starfieldSystem.getStars().subscribe(stars => {
        this.renderStars(stars);
      })
    );
  }

  private createTitle(): void {
    const title = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 4, 'METEOR SHTORM', {
      fontSize: '48px',
      color: UI_CONFIG.primaryColor,
      fontFamily: UI_CONFIG.fontFamily,
      align: 'center'
    });
    title.setOrigin(0.5);

    this.tweens.add({
      targets: title,
      alpha: { from: 0.8, to: 1 },
      duration: 2000,
      yoyo: true,
      repeat: -1
    });

    const subtitle = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 4 + 70, 'Survive the Cosmic Storm', {
      fontSize: '20px',
      color: UI_CONFIG.secondaryColor,
      fontFamily: UI_CONFIG.fontFamily,
      align: 'center'
    });
    subtitle.setOrigin(0.5);
  }

  private createButtons(): void {
    this.createButton(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2 + 100,
      'START GAME',
      () => this.startGame()
    );

    this.createButton(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2 + 200,
      'EXIT',
      () => this.exitGame()
    );
  }

  private createButton(x: number, y: number, text: string, onClick: () => void): void {
    const buttonBg = this.add.rectangle(x, y, 300, 60, 0x000066, 0.8);
    buttonBg.setStrokeStyle(2, parseInt(UI_CONFIG.primaryColor.replace('#', ''), 16));

    const buttonText = this.add.text(x, y, text, {
      fontSize: UI_CONFIG.fontSize + 'px',
      color: UI_CONFIG.primaryColor,
      fontFamily: UI_CONFIG.fontFamily
    });
    buttonText.setOrigin(0.5);

    buttonBg.setInteractive();

    buttonBg.on('pointerover', () => {
      buttonBg.setFillStyle(0x001188);
      this.tweens.add({
        targets: [buttonBg, buttonText],
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 150
      });
    });

    buttonBg.on('pointerout', () => {
      buttonBg.setFillStyle(0x000066);
      this.tweens.add({
        targets: [buttonBg, buttonText],
        scaleX: 1,
        scaleY: 1,
        duration: 150
      });
    });

    buttonBg.on('pointerdown', () => {
      try {
        this.sound.play(SoundEffect.BUTTON_CLICK, { volume: 0.5 });
      } catch (e) {
        // Sound not available
      }
      onClick();
    });

    this.input.keyboard?.addKey('SPACE').on('down', () => {
      try {
        this.sound.play(SoundEffect.BUTTON_CLICK, { volume: 0.5 });
      } catch (e) {
        // Sound not available
      }
      this.startGame();
    });
  }

  private startBackgroundAnimation(): void {
    this.subscriptions.push(
      this.starfieldSystem.getStars().subscribe(stars => {
        this.renderStars(stars);
      })
    );

    this.time.addEvent({
      delay: 16,
      callback: () => {
        this.starfieldSystem.update(16).subscribe();
      },
      loop: true
    });
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

  private startGame(): void {
    this.scene.start(SceneKey.GAME);
  }

  private exitGame(): void {
    if (typeof window !== 'undefined' && window.close) {
      window.close();
    }
  }

  shutdown(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}