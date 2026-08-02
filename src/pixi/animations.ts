import gsap from "gsap";
import type { Sprite } from "pixi.js";

/**
 * GSAPによるTweenアニメーション定義。
 * コマ送りではなく、移動・回転・拡縮・色調変化で表現する（ペーパーマリオ風）。
 */

/** 待機（呼吸）: Y軸方向にゆっくり拡縮 */
export function startBreathing(sprite: Sprite): void {
  gsap.to(sprite.scale, {
    y: sprite.scale.y * 1.05,
    duration: 0.9 + Math.random() * 0.3,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
  });
}

/** 被ダメージ: 赤く染める */
export function flashRed(sprite: Sprite): void {
  sprite.tint = 0xff8080;
  gsap.delayedCall(0.15, () => {
    sprite.tint = 0xffffff;
  });
}

/** 被ダメージ: 左右に激しく振動 */
export function shake(sprite: Sprite, baseX: number): void {
  gsap.fromTo(sprite, { x: baseX - 7 }, {
    x: baseX + 7,
    duration: 0.05,
    repeat: 5,
    yoyo: true,
    overwrite: "auto",
    onComplete: () => {
      sprite.x = baseX;
    },
  });
}

/** 斬撃エフェクトを敵の位置に重ねる */
function playSlash(slash: Sprite): void {
  gsap.killTweensOf(slash);
  gsap.killTweensOf(slash.scale);
  slash.visible = true;
  slash.alpha = 1;
  slash.rotation = -0.5 + Math.random();
  const base = slash.scale.x;
  slash.scale.set(base * 0.6);
  gsap.to(slash.scale, { x: base * 1.25, y: base * 1.25, duration: 0.22, ease: "power1.out" });
  gsap.to(slash, {
    alpha: 0,
    duration: 0.22,
    ease: "power1.in",
    onComplete: () => {
      slash.visible = false;
      slash.scale.set(base);
    },
  });
}

/** 主人公の攻撃: 前方に素早く移動し、少し回転して戻る。斬撃エフェクト＋敵の被弾演出を重ねる */
export function playHeroAttack(hero: Sprite, heroBaseX: number, slash: Sprite, enemy: Sprite): void {
  gsap.killTweensOf(hero);
  hero.x = heroBaseX;
  hero.rotation = 0;
  const tl = gsap.timeline();
  tl.to(hero, { x: heroBaseX + 130, rotation: -0.12, duration: 0.12, ease: "power2.out" });
  tl.call(() => {
    playSlash(slash);
    flashRed(enemy);
  }, [], 0.1);
  tl.to(hero, { x: heroBaseX, rotation: 0, duration: 0.28, ease: "power2.inOut" });
}

/** 敵の攻撃: 主人公に突進して戻る。着弾時に主人公を赤フラッシュ＋振動させる */
export function playEnemyAttack(enemy: Sprite, enemyBaseX: number, hero: Sprite, heroBaseX: number): void {
  gsap.killTweensOf(enemy);
  enemy.x = enemyBaseX;
  const tl = gsap.timeline();
  tl.to(enemy, { x: enemyBaseX - 150, duration: 0.15, ease: "power2.out" });
  tl.call(() => {
    flashRed(hero);
    shake(hero, heroBaseX);
  });
  tl.to(enemy, { x: enemyBaseX, duration: 0.3, ease: "power2.inOut" });
}

/** 敵の撃破: 回転しながら倒れて消える */
export function playEnemyDefeated(enemy: Sprite, onDone: () => void): void {
  gsap.killTweensOf(enemy);
  gsap.killTweensOf(enemy.scale);
  enemy.scale.y = Math.sign(enemy.scale.y || 1) * Math.abs(enemy.scale.x);
  gsap.to(enemy, {
    alpha: 0,
    y: enemy.y + 60,
    rotation: 0.35,
    duration: 0.45,
    ease: "power2.in",
    onComplete: onDone,
  });
}

/** 敵の登場: 右からスライドイン */
export function playEnemyEnter(enemy: Sprite, baseX: number): void {
  enemy.alpha = 0;
  enemy.x = baseX + 140;
  gsap.to(enemy, { alpha: 1, x: baseX, duration: 0.4, ease: "power2.out" });
}

/** 主人公の敗北: 後ろに倒れる */
export function playHeroDefeated(hero: Sprite): void {
  gsap.killTweensOf(hero);
  gsap.killTweensOf(hero.scale);
  gsap.to(hero.scale, { y: hero.scale.x, duration: 0.1 });
  gsap.to(hero, { rotation: -1.35, y: hero.y + 30, alpha: 0.6, duration: 0.7, ease: "power2.in" });
}

/** 背景のクロスフェード */
export function crossfadeBackground(oldBg: Sprite | null, newBg: Sprite, onDone: () => void): void {
  if (!oldBg) {
    onDone();
    return;
  }
  newBg.alpha = 0;
  gsap.to(newBg, {
    alpha: 1,
    duration: 0.5,
    onComplete: () => {
      oldBg.destroy();
      onDone();
    },
  });
}
