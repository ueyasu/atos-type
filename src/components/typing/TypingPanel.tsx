import { useGameStore } from "../../store/useGameStore";
import { useAppStore } from "../../store/useAppStore";
import { fingerForChar } from "../../utils/keyFinger";
import HandPictogram from "./HandPictogram";

/** 下部タイピングエリア: 出題文字列とローマ字入力ガイド */
export default function TypingPanel() {
  const wordKana = useGameStore((s) => s.wordKana);
  const romajiTyped = useGameStore((s) => s.romajiTyped);
  const romajiRemaining = useGameStore((s) => s.romajiRemaining);
  const typedCount = useGameStore((s) => s.typedCount);
  const missCount = useGameStore((s) => s.missCount);
  const caseStyle = useAppStore((s) => s.caseStyle);

  const toDisplay = (text: string) => (caseStyle === "upper" ? text.toUpperCase() : text);
  const nextChar = toDisplay(romajiRemaining.slice(0, 1));
  const restChars = toDisplay(romajiRemaining.slice(1));

  const assignment = fingerForChar(romajiRemaining.slice(0, 1));
  const leftFinger = assignment?.hand === "left" ? assignment.finger : null;
  const rightFinger = assignment?.hand === "right" ? assignment.finger : null;

  return (
    <div className="rounded-2xl bg-slate-800/80 p-6">
      <div className="flex items-center justify-center gap-6">
        <HandPictogram hand="left" activeFinger={leftFinger} />
        <div className="min-w-0 flex-1 text-center">
          <div className="mb-2 text-6xl font-bold tracking-widest text-white">{wordKana}</div>
          <div className="font-mono text-4xl font-bold tracking-wider" aria-label="ローマ字ガイド">
            <span className="text-green-400">{toDisplay(romajiTyped)}</span>
            <span className="rounded bg-yellow-300 px-1 text-slate-900">{nextChar}</span>
            <span className="text-slate-400">{restChars}</span>
          </div>
          <div className="mt-3 text-sm text-slate-300">
            せいかい: <span className="font-bold text-green-300">{typedCount}</span>
            {"　"}ミス: <span className="font-bold text-red-300">{missCount}</span>
          </div>
        </div>
        <HandPictogram hand="right" activeFinger={rightFinger} />
      </div>
    </div>
  );
}
