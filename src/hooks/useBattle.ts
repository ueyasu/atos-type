import { useEffect, useRef } from "react";
import { DIFFICULTY_INFO, ENEMIES, wordTierFor } from "../data/enemies";
import { createWordBag, type WordTier } from "../data/words";
import { useAppStore } from "../store/useAppStore";
import { useGameStore } from "../store/useGameStore";
import { useTyping } from "./useTyping";

/** 敵撃破後、次の敵が登場するまでの間 */
const ENEMY_SWITCH_DELAY_MS = 500;
/** バトル終了後、スコア表示画面へ遷移するまでの間 */
const RESULT_DELAY_MS = 1500;

/**
 * バトルのゲームロジック。
 * キーボード入力の判定、敵の攻撃タイマー、敵交代・クリア・ゲームオーバーの進行を管理する。
 */
export function useBattle(): void {
  const { startWord, input } = useTyping();
  const setScene = useAppStore((s) => s.setScene);
  const recordClearTime = useAppStore((s) => s.recordClearTime);
  const bagsRef = useRef<Record<WordTier, () => string> | null>(null);
  const deadlineRef = useRef(0);
  const timeoutsRef = useRef<number[]>([]);

  const scheduleTimeout = (fn: () => void, ms: number) => {
    timeoutsRef.current.push(window.setTimeout(fn, ms));
  };

  const resetTimer = () => {
    const { difficulty, enemyIndex } = useGameStore.getState();
    const enemy = ENEMIES[enemyIndex];
    deadlineRef.current =
      Date.now() + enemy.attackIntervalMs * DIFFICULTY_INFO[difficulty].intervalScale;
  };

  const nextWord = () => {
    const { difficulty, enemyIndex } = useGameStore.getState();
    if (!bagsRef.current) return;
    const kana = bagsRef.current[wordTierFor(enemyIndex, difficulty)]();
    const { remaining } = startWord(kana);
    useGameStore.getState().setWord(kana, remaining);
  };

  const checkHeroDefeated = () => {
    const state = useGameStore.getState();
    if (state.heroHp > 0 || state.endedAt !== null) return;
    state.endBattle(false);
    scheduleTimeout(() => setScene("result"), RESULT_DELAY_MS);
  };

  const defeatEnemyFlow = () => {
    const state = useGameStore.getState();
    state.setInputLocked(true);
    const isLast = state.enemyIndex >= ENEMIES.length - 1;
    scheduleTimeout(() => {
      const current = useGameStore.getState();
      if (current.endedAt !== null) return; // 同時にゲームオーバーになった場合はそちらを優先
      current.advanceEnemy();
      if (isLast) {
        const seconds = Math.round((Date.now() - current.startedAt) / 1000);
        recordClearTime(current.difficulty, seconds);
        scheduleTimeout(() => setScene("result"), RESULT_DELAY_MS);
      } else {
        resetTimer();
        current.setInputLocked(false);
        nextWord();
      }
    }, ENEMY_SWITCH_DELAY_MS);
  };

  // 初期化: 単語袋の用意と最初の出題
  useEffect(() => {
    bagsRef.current = {
      easy: createWordBag("easy"),
      normal: createWordBag("normal"),
      hard: createWordBag("hard"),
      expert: createWordBag("expert"),
    };
    // 難易度選択ボタンにフォーカスが残っているとスペース等で再押下されるため外す
    (document.activeElement as HTMLElement | null)?.blur?.();
    nextWord();
    resetTimer();
    const timeouts = timeoutsRef.current;
    return () => timeouts.forEach((id) => window.clearTimeout(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // キー入力 → タイピング判定
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key.toLowerCase();
      if (!/^[a-z]$/.test(key)) return;
      const state = useGameStore.getState();
      if (state.inputLocked || state.endedAt !== null) return;

      const result = input(key);
      if (!result) return;

      const enemy = ENEMIES[state.enemyIndex];
      if (result.accepted) {
        const power = DIFFICULTY_INFO[state.difficulty].attackPower;
        state.heroAttacks(power, result.typed, result.remaining);
        const after = useGameStore.getState();
        if (after.enemyHp <= 0) {
          defeatEnemyFlow();
        } else if (result.completed) {
          nextWord();
        }
      } else {
        // ミスタイプ → 敵の攻撃
        state.enemyAttacks(enemy.attackDamage, true);
        resetTimer();
        checkHeroDefeated();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  // 敵の攻撃タイマー
  useEffect(() => {
    const id = window.setInterval(() => {
      const state = useGameStore.getState();
      if (state.inputLocked || state.endedAt !== null) return;
      const enemy = ENEMIES[state.enemyIndex];
      const total = enemy.attackIntervalMs * DIFFICULTY_INFO[state.difficulty].intervalScale;
      const remaining = deadlineRef.current - Date.now();
      if (remaining <= 0) {
        state.enemyAttacks(enemy.attackDamage, false);
        resetTimer();
        state.setEnemyTimerRatio(1);
        checkHeroDefeated();
      } else {
        state.setEnemyTimerRatio(remaining / total);
      }
    }, 100);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
