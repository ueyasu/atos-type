import { useEffect, useRef } from "react";
import { ENEMIES } from "../data/enemies";
import { useBattle } from "../hooks/useBattle";
import { createBattleStage, type BattleStage } from "../pixi/core";
import { useGameStore } from "../store/useGameStore";
import StatusBars from "../components/typing/StatusBars";
import TypingPanel from "../components/typing/TypingPanel";

/**
 * タイピング（バトル）画面。
 * PixiJSキャンバス（バトルエリア）とReactのUI（ステータス・タイピングエリア）を統合する中核。
 * Zustandの状態変化を監視し、ステージのメソッドを呼んでGSAPアニメーションを発火させる。
 */
export default function Battle() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<BattleStage | null>(null);

  const enemyIndex = useGameStore((s) => s.enemyIndex);
  const heroAttackSeq = useGameStore((s) => s.heroAttackSeq);
  const enemyAttackSeq = useGameStore((s) => s.enemyAttackSeq);
  const heroHp = useGameStore((s) => s.heroHp);
  const cleared = useGameStore((s) => s.cleared);

  // ゲームロジック（キー入力・タイマー・進行）
  useBattle();

  // PixiJSステージの生成・破棄
  useEffect(() => {
    let cancelled = false;
    let stage: BattleStage | null = null;
    void (async () => {
      const created = await createBattleStage(containerRef.current!);
      if (cancelled) {
        created.destroy();
        return;
      }
      stage = created;
      stageRef.current = created;
      const def = ENEMIES[useGameStore.getState().enemyIndex];
      created.spawnEnemy(def.id, def.background);
    })();
    return () => {
      cancelled = true;
      stageRef.current = null;
      stage?.destroy();
    };
  }, []);

  // 敵交代（撃破演出＋次の敵の登場）
  const prevEnemyIndex = useRef(enemyIndex);
  useEffect(() => {
    if (enemyIndex === prevEnemyIndex.current) return;
    prevEnemyIndex.current = enemyIndex;
    const def = ENEMIES[enemyIndex];
    stageRef.current?.replaceEnemy(def.id, def.background);
  }, [enemyIndex]);

  // 主人公の攻撃アニメーション
  const prevHeroAttackSeq = useRef(heroAttackSeq);
  useEffect(() => {
    if (heroAttackSeq === prevHeroAttackSeq.current) return;
    prevHeroAttackSeq.current = heroAttackSeq;
    stageRef.current?.heroAttack();
  }, [heroAttackSeq]);

  // 敵の攻撃アニメーション
  const prevEnemyAttackSeq = useRef(enemyAttackSeq);
  useEffect(() => {
    if (enemyAttackSeq === prevEnemyAttackSeq.current) return;
    prevEnemyAttackSeq.current = enemyAttackSeq;
    stageRef.current?.enemyAttack();
  }, [enemyAttackSeq]);

  // 主人公の敗北
  useEffect(() => {
    if (heroHp === 0) stageRef.current?.heroDefeated();
  }, [heroHp]);

  // 最後の敵の撃破
  useEffect(() => {
    if (cleared) stageRef.current?.clearCurrentEnemy();
  }, [cleared]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <div className="flex w-full max-w-5xl flex-col gap-4">
        <div ref={containerRef} className="overflow-hidden rounded-2xl shadow-2xl" />
        <StatusBars />
        <TypingPanel />
      </div>
    </div>
  );
}
