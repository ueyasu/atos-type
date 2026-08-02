import { Assets, Sprite, Texture } from "pixi.js";
import type { BackgroundId, EnemyId } from "../data/enemies";

import heroUrl from "../assets/images/hero.png";
import slimeUrl from "../assets/images/slime.svg";
import goblinUrl from "../assets/images/goblin.svg";
import skeletonUrl from "../assets/images/skeleton.svg";
import golemUrl from "../assets/images/golem.svg";
import dragonUrl from "../assets/images/dragon.svg";
import slashUrl from "../assets/images/slash.svg";
import bgForestUrl from "../assets/images/bg-forest.svg";
import bgCastleUrl from "../assets/images/bg-castle.svg";
import bgSkyUrl from "../assets/images/bg-sky.svg";

const ENEMY_URLS: Record<EnemyId, string> = {
  slime: slimeUrl,
  goblin: goblinUrl,
  skeleton: skeletonUrl,
  golem: golemUrl,
  dragon: dragonUrl,
};

const BACKGROUND_URLS: Record<BackgroundId, string> = {
  forest: bgForestUrl,
  castle: bgCastleUrl,
  sky: bgSkyUrl,
};

/** キャラクターの表示高さ（px）。フラットデザインの1枚絵をTweenで動かす前提 */
const DISPLAY_HEIGHTS: Record<EnemyId | "hero", number> = {
  hero: 185,
  slime: 125,
  goblin: 160,
  skeleton: 170,
  golem: 195,
  dragon: 205,
};

const SLASH_SIZE = 200;

export async function loadBattleTextures(): Promise<void> {
  await Assets.load([heroUrl, slashUrl, ...Object.values(ENEMY_URLS), ...Object.values(BACKGROUND_URLS)]);
}

function characterSprite(url: string, height: number, flip = false): Sprite {
  const sprite = new Sprite(Texture.from(url));
  const scale = height / sprite.height;
  sprite.scale.set(flip ? -scale : scale, scale);
  sprite.anchor.set(0.5, 1);
  return sprite;
}

export function createHeroSprite(): Sprite {
  return characterSprite(heroUrl, DISPLAY_HEIGHTS.hero);
}

export function createEnemySprite(id: EnemyId): Sprite {
  // ドラゴンの素材だけ右向きなので左右反転して左向きにする
  return characterSprite(ENEMY_URLS[id], DISPLAY_HEIGHTS[id], id === "dragon");
}

export function createSlashSprite(): Sprite {
  const sprite = new Sprite(Texture.from(slashUrl));
  sprite.scale.set(SLASH_SIZE / sprite.height);
  sprite.anchor.set(0.5);
  sprite.visible = false;
  return sprite;
}

export function createBackgroundSprite(id: BackgroundId, width: number, height: number): Sprite {
  const sprite = new Sprite(Texture.from(BACKGROUND_URLS[id]));
  sprite.width = width;
  sprite.height = height;
  return sprite;
}
