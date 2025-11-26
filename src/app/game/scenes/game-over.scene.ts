import { Scene } from 'phaser';
import { Subscription } from 'rxjs';
import { SceneKey } from '../enums/scene-key.enum';
import { SoundEffect } from '../enums/sound-effect.enum';
import { GAME_CONFIG, UI_CONFIG } from '../utils/game-constants';
import { ScoringSystem } from '../systems/scoring.system';
import { StarfieldSystem } from '../systems/starfield.system';

export class GameOverScene extends Scene {
  private starfieldSystem!: StarfieldSystem;
  private scoringSystem!: ScoringSystem;
  private subscriptions: Subscription[] = [];

  constructor() {
    super({ key: SceneKey.GAME_OVER });
  }

  create(): void {
    this.starfieldSystem = new StarfieldSystem();
    this.scoringSystem = new ScoringSystem();

    this.setupBackground();
    this.createGameOverUI();
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

  private createGameOverUI(): void {
    const gameOverText = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 4, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontFamily: UI_CONFIG.fontFamily,
      align: 'center'
    });
    gameOverText.setOrigin(0.5);

    this.tweens.add({
      targets: gameOverText,
      alpha: { from: 0.6, to: 1 },
      duration: 1500,
      yoyo: true,
      repeat: -1
    });

    const scoreState = this.scoringSystem.getStateSnapshot();

    console.log(scoreState);

    const finalScoreText = this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2 - 50,
      `Final Score: ${scoreState.currentScore}`,
      {
        fontSize: '32px',
        color: UI_CONFIG.primaryColor,
        fontFamily: UI_CONFIG.fontFamily,
        align: 'center'
      }
    );
    finalScoreText.setOrigin(0.5);

    const highScoreText = this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2 + 20,
      `High Score: ${scoreState.highScore}`,
      {
        fontSize: '24px',
        color: UI_CONFIG.secondaryColor,
        fontFamily: UI_CONFIG.fontFamily,
        align: 'center'
      }
    );
    highScoreText.setOrigin(0.5);

    if (scoreState.currentScore === scoreState.highScore && scoreState.currentScore > 0) {
      const newHighScoreText = this.add.text(
        GAME_CONFIG.width / 2,
        GAME_CONFIG.height / 2 + 80,
        'NEW HIGH SCORE!',
        {
          fontSize: '24px',
          color: '#ffff00',
          fontFamily: UI_CONFIG.fontFamily,
          align: 'center'
        }
      );
      newHighScoreText.setOrigin(0.5);

      this.tweens.add({
        targets: newHighScoreText,
        scaleX: { from: 1, to: 1.2 },
        scaleY: { from: 1, to: 1.2 },
        duration: 800,
        yoyo: true,
        repeat: -1
      });
    }
  }

  private createButtons(): void {
    this.createButton(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2 + 200,
      'RESTART',
      () => this.restartGame()
    );

    this.createButton(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2 + 300,
      'MAIN MENU',
      () => this.goToMenu()
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

    if (text === 'RESTART') {
      this.input.keyboard?.addKey('SPACE').on('down', () => {
        try {
          this.sound.play(SoundEffect.BUTTON_CLICK, { volume: 0.5 });
        } catch (e) {
          // Sound not available
        }
        this.restartGame();
      });
    }
  }

  private startBackgroundAnimation(): void {
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

  private restartGame(): void {
    this.scoringSystem.resetScore().subscribe(() => {
      this.scene.start(SceneKey.GAME);
    });
  }

  private goToMenu(): void {
    this.scoringSystem.resetScore().subscribe(() => {
      this.scene.start(SceneKey.MENU);
    });
  }

  shutdown(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
