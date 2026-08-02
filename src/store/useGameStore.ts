import { create } from "zustand";
import type { Difficulty } from "../data/words";
import { ENEMIES, HERO_MAX_HP, enemyStats } from "../data/enemies";

/**
 * バトル進行状態。
 * heroAttackSeq / enemyAttackSeq はアニメーション発火用のカウンタで、
 * PixiJSステージ側が変化を監視してGSAPアニメーションを再生する。
 */
interface GameState {
  difficulty: Difficulty;
  heroHp: number;
  enemyIndex: number;
  enemyHp: number;
  heroAttackSeq: number;
  enemyAttackSeq: number;
  /** 敵交代・バトル終了時の入力ロック */
  inputLocked: boolean;
  /** 出題中の単語と入力状況 */
  wordKana: string;
  romajiTyped: string;
  romajiRemaining: string;
  /** 敵の攻撃タイマーの残り割合（0〜1） */
  enemyTimerRatio: number;
  /** インフィニティ: ドラゴンを倒してループした回数 */
  loopCount: number;
  typedCount: number;
  missCount: number;
  startedAt: number;
  endedAt: number | null;
  cleared: boolean;

  startBattle: (difficulty: Difficulty) => void;
  setWord: (kana: string, remaining: string) => void;
  /** 正タイプ: 主人公が攻撃し敵にダメージ */
  heroAttacks: (damage: number, typed: string, remaining: string) => void;
  /** 敵の攻撃（時間切れ or ミスタイプ） */
  enemyAttacks: (damage: number, isMiss: boolean) => void;
  /** 敵を倒した: 次の敵へ。全員倒したらクリア */
  advanceEnemy: () => void;
  endBattle: (cleared: boolean) => void;
  setInputLocked: (locked: boolean) => void;
  setEnemyTimerRatio: (ratio: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  difficulty: "normal",
  heroHp: HERO_MAX_HP,
  enemyIndex: 0,
  enemyHp: enemyStats(0, 0, "normal").maxHp,
  heroAttackSeq: 0,
  enemyAttackSeq: 0,
  inputLocked: false,
  wordKana: "",
  romajiTyped: "",
  romajiRemaining: "",
  enemyTimerRatio: 1,
  loopCount: 0,
  typedCount: 0,
  missCount: 0,
  startedAt: 0,
  endedAt: null,
  cleared: false,

  startBattle: (difficulty) =>
    set({
      difficulty,
      heroHp: HERO_MAX_HP,
      enemyIndex: 0,
      enemyHp: enemyStats(0, 0, difficulty).maxHp,
      heroAttackSeq: 0,
      enemyAttackSeq: 0,
      inputLocked: false,
      wordKana: "",
      romajiTyped: "",
      romajiRemaining: "",
      enemyTimerRatio: 1,
      loopCount: 0,
      typedCount: 0,
      missCount: 0,
      startedAt: Date.now(),
      endedAt: null,
      cleared: false,
    }),

  setWord: (kana, remaining) =>
    set({ wordKana: kana, romajiTyped: "", romajiRemaining: remaining }),

  heroAttacks: (damage, typed, remaining) =>
    set((s) => ({
      typedCount: s.typedCount + 1,
      heroAttackSeq: s.heroAttackSeq + 1,
      enemyHp: Math.max(0, s.enemyHp - damage),
      romajiTyped: typed,
      romajiRemaining: remaining,
    })),

  enemyAttacks: (damage, isMiss) =>
    set((s) => ({
      enemyAttackSeq: s.enemyAttackSeq + 1,
      heroHp: Math.max(0, s.heroHp - damage),
      missCount: isMiss ? s.missCount + 1 : s.missCount,
    })),

  advanceEnemy: () =>
    set((s) => {
      const next = s.enemyIndex + 1;
      if (next >= ENEMIES.length) {
        // インフィニティ: クリアはなく、ドラゴンを倒すとスライムからやり直す（HPもループごとに1.3倍）
        if (s.difficulty === "infinity") {
          const loopCount = s.loopCount + 1;
          return { enemyIndex: 0, enemyHp: enemyStats(0, loopCount, "infinity").maxHp, enemyTimerRatio: 1, loopCount };
        }
        return { cleared: true, endedAt: Date.now(), inputLocked: true };
      }
      return { enemyIndex: next, enemyHp: enemyStats(next, s.loopCount, s.difficulty).maxHp, enemyTimerRatio: 1 };
    }),

  endBattle: (cleared) => set({ cleared, endedAt: Date.now(), inputLocked: true }),
  setInputLocked: (inputLocked) => set({ inputLocked }),
  setEnemyTimerRatio: (enemyTimerRatio) => set({ enemyTimerRatio }),
}));
