import type { Difficulty, WordTier } from "./words";

export type EnemyId = "slime" | "goblin" | "skeleton" | "golem" | "dragon";
export type BackgroundId = "forest" | "castle" | "sky";

export interface EnemyDef {
  id: EnemyId;
  name: string;
  maxHp: number;
  /** 敵の攻撃間隔（ミリ秒） */
  attackIntervalMs: number;
  /** 敵の攻撃で主人公が受けるダメージ */
  attackDamage: number;
  background: BackgroundId;
  /** 一つ高い難易度の問題を出すか（ゴーレム・ドラゴン） */
  harderWords: boolean;
}

/** スライム → ゴブリン → スケルトン → ゴーレム → ドラゴンの順に出現 */
export const ENEMIES: EnemyDef[] = [
  { id: "slime", name: "スライム", maxHp: 60, attackIntervalMs: 6000, attackDamage: 5, background: "forest", harderWords: false },
  { id: "goblin", name: "ゴブリン", maxHp: 80, attackIntervalMs: 5500, attackDamage: 6, background: "forest", harderWords: false },
  { id: "skeleton", name: "スケルトン", maxHp: 100, attackIntervalMs: 5000, attackDamage: 7, background: "castle", harderWords: false },
  { id: "golem", name: "ゴーレム", maxHp: 130, attackIntervalMs: 4500, attackDamage: 9, background: "castle", harderWords: true },
  { id: "dragon", name: "ドラゴン", maxHp: 160, attackIntervalMs: 4000, attackDamage: 12, background: "sky", harderWords: true },
];

export const HERO_MAX_HP = 100;

interface DifficultyInfo {
  label: string;
  description: string;
  /** 正タイプ1文字あたりの敵へのダメージ */
  attackPower: number;
  /** 敵の攻撃間隔の倍率（かんたんほど長い） */
  intervalScale: number;
}

export const DIFFICULTY_INFO: Record<Difficulty, DifficultyInfo> = {
  easy: { label: "かんたん", description: "1もじの ローマ字にゅうりょく", attackPower: 15, intervalScale: 1.4 },
  normal: { label: "ふつう", description: "5もじいないの ことば", attackPower: 8, intervalScale: 1.15 },
  hard: { label: "むずかしい", description: "だくおん・ようおんの ことば", attackPower: 6, intervalScale: 1.0 },
  infinity: { label: "インフィニティ", description: "たおしても つづく むずかしい", attackPower: 6, intervalScale: 1.0 },
};

/** インフィニティでループするごとの攻撃の成長倍率 */
export const LOOP_SCALE = 1.3;

/**
 * インフィニティのループ数に応じて敵のステータスを強化する。
 * ループするごとに攻撃間隔（ミリ秒）・ダメージ・最大HPが1.3倍になる。
 * インフィニティ以外はループが無いため通常値のまま。
 */
export function enemyStats(
  enemyIndex: number,
  loopCount: number,
  difficulty: Difficulty,
): { intervalMs: number; damage: number; maxHp: number } {
  const enemy = ENEMIES[enemyIndex];
  const factor = difficulty === "infinity" ? Math.pow(LOOP_SCALE, loopCount) : 1;
  return {
    intervalMs: Math.round(enemy.attackIntervalMs * factor * DIFFICULTY_INFO[difficulty].intervalScale),
    damage: Math.round(enemy.attackDamage * factor),
    maxHp: Math.round(enemy.maxHp * factor),
  };
}

/** 指定の敵が出す問題のランクを返す */
export function wordTierFor(enemyIndex: number, difficulty: Difficulty): WordTier {
  const base: WordTier = difficulty === "infinity" ? "hard" : difficulty;
  if (!ENEMIES[enemyIndex].harderWords) return base;
  if (base === "easy") return "normal";
  if (base === "normal") return "hard";
  return "expert";
}
