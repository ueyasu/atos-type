import { DIFFICULTY_INFO } from "../data/enemies";
import type { Difficulty } from "../data/words";
import { useAppStore } from "../store/useAppStore";
import { useGameStore } from "../store/useGameStore";
import BigButton from "../components/common/BigButton";

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: "border-green-500 bg-green-50",
  normal: "border-blue-500 bg-blue-50",
  hard: "border-red-500 bg-red-50",
};

/** 難易度選択画面。選択するとタイピング（バトル）画面へ遷移する */
export default function Difficulty() {
  const setScene = useAppStore((s) => s.setScene);
  const bestTimes = useAppStore((s) => s.bestTimes);
  const startBattle = useGameStore((s) => s.startBattle);

  const start = (difficulty: Difficulty) => {
    startBattle(difficulty);
    setScene("battle");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-gradient-to-b from-indigo-900 via-indigo-700 to-sky-600">
      <h1 className="text-4xl font-black text-white">むずかしさを えらんでね</h1>
      <div className="flex gap-6">
        {(Object.keys(DIFFICULTY_INFO) as Difficulty[]).map((key) => {
          const info = DIFFICULTY_INFO[key];
          const best = bestTimes[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => start(key)}
              className={`w-60 rounded-2xl border-b-8 p-6 text-center shadow-lg transition hover:-translate-y-1 active:translate-y-0 ${DIFFICULTY_COLORS[key]}`}
            >
              <div className="text-3xl font-black text-slate-800">{info.label}</div>
              <div className="mt-3 text-sm font-bold text-slate-600">{info.description}</div>
              <div className="mt-4 text-xs text-slate-500">
                {best !== undefined ? `ベストタイム: ${best}びょう` : "まだクリアしていません"}
              </div>
            </button>
          );
        })}
      </div>
      <BigButton color="gray" onClick={() => setScene("menu")}>
        メニューにもどる
      </BigButton>
    </div>
  );
}
