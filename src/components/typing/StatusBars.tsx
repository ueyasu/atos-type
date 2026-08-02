import { ENEMIES, HERO_MAX_HP, enemyStats } from "../../data/enemies";
import { useGameStore } from "../../store/useGameStore";

/** 中段ステータスエリア: 主人公と敵のHPバー、敵の攻撃タイマー */
export default function StatusBars() {
  const heroHp = useGameStore((s) => s.heroHp);
  const enemyHp = useGameStore((s) => s.enemyHp);
  const enemyIndex = useGameStore((s) => s.enemyIndex);
  const enemyTimerRatio = useGameStore((s) => s.enemyTimerRatio);
  const difficulty = useGameStore((s) => s.difficulty);
  const loopCount = useGameStore((s) => s.loopCount);
  const enemy = ENEMIES[enemyIndex];
  const enemyMaxHp = enemyStats(enemyIndex, loopCount, difficulty).maxHp;

  return (
    <div className="grid grid-cols-2 gap-6 rounded-2xl bg-slate-800/80 p-4">
      <div>
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-lg font-bold text-green-300">ゆうしゃ</span>
          <span className="text-sm text-slate-300">
            HP {heroHp} / {HERO_MAX_HP}
          </span>
        </div>
        <div className="h-6 overflow-hidden rounded-full bg-slate-600">
          <div
            className="h-full rounded-full bg-green-400 transition-all duration-200"
            style={{ width: `${(heroHp / HERO_MAX_HP) * 100}%` }}
          />
        </div>
      </div>
      <div>
        <div className="mb-1 flex items-baseline justify-between">
          <span className="flex items-center gap-2">
            <span className="text-lg font-bold text-red-300">{enemy.name}</span>
            {difficulty === "infinity" && (
              <span className="rounded bg-purple-500 px-1.5 py-0.5 text-xs font-bold text-white">
                ラウンド {loopCount + 1}
              </span>
            )}
          </span>
          <span className="text-sm text-slate-300">
            HP {enemyHp} / {enemyMaxHp}
          </span>
        </div>
        <div className="h-6 overflow-hidden rounded-full bg-slate-600">
          <div
            className="h-full rounded-full bg-red-400 transition-all duration-200"
            style={{ width: `${(enemyHp / enemyMaxHp) * 100}%` }}
          />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-slate-300">てきのこうげきまで</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-600">
            <div
              className={`h-full rounded-full ${enemyTimerRatio < 0.25 ? "bg-red-400" : "bg-yellow-300"}`}
              style={{ width: `${enemyTimerRatio * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
