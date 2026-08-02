import { Application, Sprite } from "pixi.js";
import gsap from "gsap";
import type { BackgroundId, EnemyId } from "../data/enemies";
import {
  createBackgroundSprite,
  createEnemySprite,
  createHeroSprite,
  createSlashSprite,
  loadBattleTextures,
} from "./entities";
import {
  crossfadeBackground,
  playEnemyAttack,
  playEnemyDefeated,
  playEnemyEnter,
  playHeroAttack,
  playHeroDefeated,
  startBreathing,
} from "./animations";

export const STAGE_WIDTH = 960;
export const STAGE_HEIGHT = 540;

const HERO_X = 230;
const ENEMY_X = 700;
const GROUND_Y = 482;

/**
 * バトルステージの公開API。
 * React側はZustandの状態変化を監視し、これらのメソッドを呼んでアニメーションを発火させる。
 */
export interface BattleStage {
  /** 最初の敵を登場させる（背景も設定） */
  spawnEnemy(enemyId: EnemyId, background: BackgroundId): void;
  /** 現在の敵を倒し、次の敵を登場させる */
  replaceEnemy(enemyId: EnemyId, background: BackgroundId): void;
  /** 最後の敵を倒した（撃破演出のみ） */
  clearCurrentEnemy(): void;
  heroAttack(): void;
  enemyAttack(): void;
  heroDefeated(): void;
  destroy(): void;
}

export async function createBattleStage(container: HTMLElement): Promise<BattleStage> {
  await loadBattleTextures();

  const app = new Application();
  await app.init({
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
    antialias: true,
    backgroundAlpha: 0,
  });
  app.canvas.style.width = "100%";
  app.canvas.style.height = "auto";
  app.canvas.style.display = "block";
  container.appendChild(app.canvas);

  let background: Sprite | null = null;
  let enemy: Sprite | null = null;

  const hero = createHeroSprite();
  hero.position.set(HERO_X, GROUND_Y);

  const slash = createSlashSprite();

  app.stage.addChild(hero);
  app.stage.addChild(slash);
  startBreathing(hero);

  function setBackground(id: BackgroundId): void {
    const bg = createBackgroundSprite(id, STAGE_WIDTH, STAGE_HEIGHT);
    // 主人公より手前（インデックス0）に挿入してクロスフェード
    app.stage.addChildAt(bg, 0);
    const old = background;
    background = bg;
    crossfadeBackground(old, bg, () => {});
  }

  function positionSlash(): void {
    if (enemy) {
      slash.position.set(ENEMY_X, GROUND_Y - enemy.height * 0.55);
    }
  }

  function spawnEnemy(enemyId: EnemyId, backgroundId: BackgroundId): void {
    setBackground(backgroundId);
    enemy = createEnemySprite(enemyId);
    enemy.position.set(ENEMY_X, GROUND_Y);
    // 斬撃エフェクトが常に最前面になるよう、敵の後に追加し直す
    app.stage.addChild(enemy);
    app.stage.addChild(slash);
    playEnemyEnter(enemy, ENEMY_X);
    startBreathing(enemy);
    positionSlash();
  }

  function defeatCurrent(): void {
    const old = enemy;
    enemy = null;
    if (old) {
      playEnemyDefeated(old, () => old.destroy());
    }
  }

  return {
    spawnEnemy,

    replaceEnemy(enemyId, backgroundId) {
      defeatCurrent();
      gsap.delayedCall(0.4, () => spawnEnemy(enemyId, backgroundId));
    },

    clearCurrentEnemy() {
      defeatCurrent();
    },

    heroAttack() {
      if (!enemy) return;
      playHeroAttack(hero, HERO_X, slash, enemy);
    },

    enemyAttack() {
      if (!enemy) return;
      playEnemyAttack(enemy, ENEMY_X, hero, HERO_X);
    },

    heroDefeated() {
      playHeroDefeated(hero);
    },

    destroy() {
      gsap.globalTimeline.clear();
      app.destroy({ removeView: true }, { children: true });
    },
  };
}
