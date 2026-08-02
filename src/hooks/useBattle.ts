import { useEffect, useRef } from "react";
import { DIFFICULTY_INFO, ENEMIES, enemyStats, wordTierFor } from "../data/enemies";
import { createWordBag, type WordTier } from "../data/words";
import { useAppStore } from "../store/useAppStore";
import { useGameStore } from "../store/useGameStore";
import { useTyping } from "./useTyping";
import {
  playClearSound,
  playEnemyAttackSound,
  playEnemySwitchSound,
  playGameOverSound,
  playHeroAttackSound,
} from "../utils/sound";

/** 敵撃破後、次の敵が登場するまでの間 */
const ENEMY_SWITCH_DELAY_MS = 500;
/** バトル終了後、スコア表示画面へ遷移するまでの間 */
const RESULT_DELAY_MS = 1500;
/** 敵交代後に新しい単語が出た直後、ミスタイプをペナルティなしで受け流す猶予時間（ミリ秒） */
const GRACE_PERIOD_MS = 1500;

/**
 * バトルのゲームロジック。
 * キーボード入力の判定、敵の攻撃タイマー、敵交代・クリア・ゲームオーバーの進行を管理する。
 */
export function useBattle(): void {
  const { startWord, input } = useTyping();
  const setScene = useAppStore((s) => s.setScene);
  const recordClearTime = useAppStore((s) => s.recordClearTime);
  const recordInfinityScore = useAppStore((s) => s.recordInfinityScore);
  const bagsRef = useRef<Record<WordTier, () => string> | null>(null);
  const deadlineRef = useRef(0);
  const graceUntilRef = useRef(0);
  const timeoutsRef = useRef<number[]>([]);

  const scheduleTimeout = (fn: () => void, ms: number) => {
    timeoutsRef.current.push(window.setTimeout(fn, ms));
  };

  const resetTimer = () => {
    const state = useGameStore.getState();
    deadlineRef.current =
      Date.now() + enemyStats(state.enemyIndex, state.loopCount, state.difficulty).intervalMs;
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
    playGameOverSound();
    state.endBattle(false);
    // インフィニティはクリアが無いため、タイプした文字数をベストスコアとして記録
    if (state.difficulty === "infinity") {
      recordInfinityScore(state.typedCount);
    }
    scheduleTimeout(() => setScene("result"), RESULT_DELAY_MS);
  };

  const defeatEnemyFlow = () => {
    const state = useGameStore.getState();
    state.setInputLocked(true);
    // インフィニティはクリアが無く、ドラゴン撃破後も戦いが続く
    const isLast = state.difficulty !== "infinity" && state.enemyIndex >= ENEMIES.length - 1;
    scheduleTimeout(() => {
      const current = useGameStore.getState();
      if (current.endedAt !== null) return; // 同時にゲームオーバーになった場合はそちらを優先
      current.advanceEnemy();
      if (isLast) {
        playClearSound();
        const seconds = Math.round((Date.now() - current.startedAt) / 1000);
        recordClearTime(current.difficulty, seconds);
        scheduleTimeout(() => setScene("result"), RESULT_DELAY_MS);
      } else {
        playEnemySwitchSound();
        resetTimer();
        current.setInputLocked(false);
        nextWord();
        // 新しい単語が表示されてから猶予時間の間は、ミスタイプをペナルティなしで受け流す
        graceUntilRef.current = Date.now() + GRACE_PERIOD_MS;
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

      if (result.accepted) {
        playHeroAttackSound();
        const power = DIFFICULTY_INFO[state.difficulty].attackPower;
        state.heroAttacks(power, result.typed, result.remaining);
        const after = useGameStore.getState();
        if (after.enemyHp <= 0) {
          defeatEnemyFlow();
        } else if (result.completed) {
          nextWord();
        }
      } else {
        // 敵交代後の猶予時間中は、正当な入力のみ受け付ける（ミスタイプは無視）
        if (Date.now() < graceUntilRef.current) return;
        // ミスタイプ → 敵の攻撃
        playEnemyAttackSound();
        const { damage } = enemyStats(state.enemyIndex, state.loopCount, state.difficulty);
        state.enemyAttacks(damage, true);
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
      const stats = enemyStats(state.enemyIndex, state.loopCount, state.difficulty);
      const remaining = deadlineRef.current - Date.now();
      if (remaining <= 0) {
        playEnemyAttackSound();
        state.enemyAttacks(stats.damage, false);
        resetTimer();
        state.setEnemyTimerRatio(1);
        checkHeroDefeated();
      } else {
        state.setEnemyTimerRatio(remaining / stats.intervalMs);
      }
    }, 100);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
