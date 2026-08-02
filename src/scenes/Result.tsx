import { DIFFICULTY_INFO } from "../data/enemies";
import { useAppStore } from "../store/useAppStore";
import { useGameStore } from "../store/useGameStore";
import BigButton from "../components/common/BigButton";

/** スコア表示画面 */
export default function Result() {
  const setScene = useAppStore((s) => s.setScene);
  const bestTimes = useAppStore((s) => s.bestTimes);
  const bestInfinityScore = useAppStore((s) => s.bestInfinityScore);
  const startBattle = useGameStore((s) => s.startBattle);
  const difficulty = useGameStore((s) => s.difficulty);
  const typedCount = useGameStore((s) => s.typedCount);
  const missCount = useGameStore((s) => s.missCount);
  const startedAt = useGameStore((s) => s.startedAt);
  const endedAt = useGameStore((s) => s.endedAt);
  const cleared = useGameStore((s) => s.cleared);

  const totalKeys = typedCount + missCount;
  const accuracy = totalKeys === 0 ? 100 : Math.round((typedCount / totalKeys) * 1000) / 10;
  const seconds = endedAt !== null ? Math.round((endedAt - startedAt) / 1000) : 0;
  const isInfinity = difficulty === "infinity";
  const best = bestTimes[difficulty];
  const isNewRecord = cleared && best !== undefined && seconds <= best;
  const isNewBestScore = isInfinity && typedCount === bestInfinityScore;

  const retry = () => {
    startBattle(difficulty);
    setScene("battle");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-to-b from-indigo-900 via-indigo-700 to-sky-600">
      <h1
        className={`text-6xl font-black drop-shadow-[0_4px_0_rgba(0,0,0,0.4)] ${
          cleared ? "text-yellow-300" : "text-slate-300"
        }`}
      >
        {cleared ? "ゲームクリア！" : "ゲームオーバー"}
      </h1>
      <div className="w-96 rounded-2xl bg-white/95 p-6 text-slate-800 shadow-xl">
        <div className="mb-3 text-center text-lg font-bold text-slate-500">
          むずかしさ: {DIFFICULTY_INFO[difficulty].label}
        </div>
        <dl className="space-y-3 text-lg">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <dt>タイプした もじの かず</dt>
            <dd className="font-bold">{typedCount} もじ</dd>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <dt>せいかくさ</dt>
            <dd className="font-bold">{accuracy} %</dd>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <dt>{cleared ? "クリアまでの じかん" : "たたかった じかん"}</dt>
            <dd className="font-bold">{seconds} びょう</dd>
          </div>
        </dl>
        {cleared && best !== undefined && (
          <div className="mt-4 text-center font-bold text-orange-500">
            ベストタイム: {best} びょう{isNewRecord && "（しんきろく！）"}
          </div>
        )}
        {isInfinity && bestInfinityScore !== undefined && (
          <div className="mt-4 text-center font-bold text-orange-500">
            ベストスコア: {bestInfinityScore} もじ{isNewBestScore && "（しんきろく！）"}
          </div>
        )}
      </div>
      <div className="flex gap-4">
        <BigButton color="green" onClick={retry}>
          もういちど
        </BigButton>
        <BigButton color="gray" onClick={() => setScene("menu")}>
          メニューにもどる
        </BigButton>
      </div>
    </div>
  );
}
