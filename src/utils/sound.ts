import heroAttackUrl from "../assets/se/剣で斬る2.mp3";
import enemyAttackUrl from "../assets/se/軽いパンチ1.mp3";
import enemySwitchUrl from "../assets/se/踏み込む.mp3";
import clearUrl from "../assets/se/ラッパのファンファーレ.mp3";
import gameOverUrl from "../assets/se/呪いの旋律.mp3";

/** 効果音を先頭から再生する。再生できない環境では何もしない */
function play(sound: HTMLAudioElement): void {
  sound.currentTime = 0;
  void sound.play().catch(() => {});
}

const heroAttack = new Audio(heroAttackUrl);
const enemyAttack = new Audio(enemyAttackUrl);
const enemySwitch = new Audio(enemySwitchUrl);
const clear = new Audio(clearUrl);
const gameOver = new Audio(gameOverUrl);

/** タイピング成功（主人公の攻撃） */
export function playHeroAttackSound(): void {
  play(heroAttack);
}

/** 敵からの攻撃（ミスタイプ・時間切れ） */
export function playEnemyAttackSound(): void {
  play(enemyAttack);
}

/** 敵の切り替え */
export function playEnemySwitchSound(): void {
  play(enemySwitch);
}

/** ゲームクリア */
export function playClearSound(): void {
  play(clear);
}

/** ゲームオーバー */
export function playGameOverSound(): void {
  play(gameOver);
}
