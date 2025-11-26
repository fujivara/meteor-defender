import { Component, ElementRef, ViewChild, OnInit, OnDestroy, signal } from '@angular/core';
import { Game, Types } from 'phaser';
import { Subscription } from 'rxjs';

import { MenuScene } from './scenes/menu.scene';
import { GameScene } from './scenes/game.scene';
import { GameOverScene } from './scenes/game-over.scene';
import { GAME_CONFIG } from './utils/game-constants';

@Component({
  selector: 'app-game',
  template: `
    <div class="game-container">
      <div #gameCanvas class="game-canvas"></div>
      @if (showControls()) {
        <div class="game-controls">
          <h3>Controls</h3>
          <p>Move: Arrow Keys or A/D</p>
          <p>Shoot: Spacebar</p>
          <p>Menu: Space to start</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .game-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100vw;
      height: 100vh;
      margin: 0;
      padding: 0;
      background: linear-gradient(to bottom, #000033, #000066);
      color: #00ffff;
      font-family: Arial, sans-serif;
      overflow: hidden;
    }

    .game-canvas {
      border: 2px solid #00ffff;
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
    }

    .game-controls {
      position: absolute;
      bottom: 10px;
      right: 10px;
      padding: 10px;
      background: rgba(0, 0, 51, 0.8);
      border: 1px solid #00ffff;
      border-radius: 10px;
      text-align: center;
      font-size: 12px;
    }

    .game-controls h3 {
      margin: 0 0 5px 0;
      color: #00ffff;
      font-size: 14px;
    }

    .game-controls p {
      margin: 2px 0;
      color: #ffffff;
    }
  `],
  standalone: true,
  imports: []
})
export class GameComponent implements OnInit, OnDestroy {
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLDivElement>;

  private game!: Game;
  private gameSubscriptions: Subscription[] = [];
  protected readonly showControls = signal(true);

  ngOnInit(): void {
    this.initializeGame();
  }

  ngOnDestroy(): void {
    this.gameSubscriptions.forEach(sub => sub.unsubscribe());
    if (this.game) {
      this.game.destroy(true);
    }
  }

  private initializeGame(): void {
    // Update game config with current viewport size
    const gameWidth = window.innerWidth * 0.95;
    const gameHeight = window.innerHeight * 0.9;

    // Update the global game config
    (GAME_CONFIG as any).width = gameWidth;
    (GAME_CONFIG as any).height = gameHeight;

    const config: Types.Core.GameConfig = {
      type: Phaser.WEBGL,
      width: gameWidth,
      height: gameHeight,
      parent: this.gameCanvas.nativeElement,
      backgroundColor: '#000033',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: [MenuScene, GameScene, GameOverScene],
      fps: {
        target: GAME_CONFIG.fps,
        forceSetTimeOut: true
      },
      audio: {
        disableWebAudio: false
      },
      input: {
        keyboard: true,
        mouse: true,
        touch: true
      },
      render: {
        antialias: true,
        pixelArt: false,
        roundPixels: false
      }
    };

    this.game = new Game(config);

    // Game is ready - sounds will be handled by individual scenes
  }

  private createDummySounds(): void {
    const soundEffects = [
      'shoot',
      'meteor_hit',
      'meteor_explosion_small',
      'meteor_explosion_medium',
      'meteor_explosion_large',
      'ship_death',
      'button_click'
    ];

    soundEffects.forEach(effect => {
      this.game.scene.scenes.forEach(scene => {
        if (scene && scene.sound && scene.sound.add && scene.cache && scene.cache.audio) {
          if (!scene.cache.audio.exists(effect)) {
            scene.sound.add(effect, { volume: 0.1 });
          }
        }
      });
    });
  }

  private createAudioBuffer(effect: string): ArrayBuffer {
    const audioContext = new AudioContext();
    const sampleRate = audioContext.sampleRate;
    const duration = 0.2;
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);

    const frequency = this.getSoundFrequency(effect);

    for (let i = 0; i < channelData.length; i++) {
      const t = i / sampleRate;
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 5);
    }

    return buffer as any;
  }

  private getSoundFrequency(effect: string): number {
    const frequencies: { [key: string]: number } = {
      'shoot': 800,
      'meteor_hit': 400,
      'meteor_explosion_small': 300,
      'meteor_explosion_medium': 250,
      'meteor_explosion_large': 200,
      'ship_death': 150,
      'button_click': 600
    };

    return frequencies[effect] || 440;
  }
}