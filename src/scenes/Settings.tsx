import { RomajiTypingEngine, type JaStyle } from "../lib/typingEngine";
import { useAppStore, type CaseStyle } from "../store/useAppStore";
import BigButton from "../components/common/BigButton";

const SAMPLE_KANA = "じゅぎょう";

/** 設定画面。ローマ字揺れルール（ガイド表記）と大文字/小文字表示を設定する */
export default function Settings() {
  const jaStyle = useAppStore((s) => s.jaStyle);
  const setJaStyle = useAppStore((s) => s.setJaStyle);
  const caseStyle = useAppStore((s) => s.caseStyle);
  const setCaseStyle = useAppStore((s) => s.setCaseStyle);
  const setScene = useAppStore((s) => s.setScene);

  const options: { value: JaStyle; title: string; example: string }[] = (
    ["ja", "zya"] as const
  ).map((value) => ({
    value,
    title: value === "ja" ? "ja / ju / jo" : "zya / zyu / zyo",
    example: `${SAMPLE_KANA} → ${new RomajiTypingEngine(SAMPLE_KANA, { jaStyle: value }).guide}`,
  }));

  const caseOptions: { value: CaseStyle; title: string; example: string }[] = (
    ["lower", "upper"] as const
  ).map((value) => ({
    value,
    title: value === "lower" ? "こもじ" : "おおもじ",
    example: `jugyou → ${value === "upper" ? "JUGYOU" : "jugyou"}`,
  }));

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-gradient-to-b from-indigo-900 via-indigo-700 to-sky-600">
      <h1 className="text-4xl font-black text-white">せってい</h1>
      <div className="rounded-2xl bg-white/95 p-8 text-slate-800 shadow-xl">
        <h2 className="mb-1 text-xl font-bold">「じゃ・じゅ・じょ」のひょうじ</h2>
        <p className="mb-4 text-sm text-slate-500">※ どちらの うちかたでも せいかいに なります</p>
        <div className="flex gap-4">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setJaStyle(opt.value)}
              className={`w-56 rounded-xl border-4 p-4 text-center transition ${
                jaStyle === opt.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-300 bg-white hover:border-slate-400"
              }`}
            >
              <div className="text-2xl font-bold">{opt.title}</div>
              <div className="mt-2 text-sm text-slate-500">{opt.example}</div>
              {jaStyle === opt.value && (
                <div className="mt-2 text-sm font-bold text-blue-600">えらばれています</div>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-2xl bg-white/95 p-8 text-slate-800 shadow-xl">
        <h2 className="mb-1 text-xl font-bold">ローマ字の ひょうじ</h2>
        <p className="mb-4 text-sm text-slate-500">※ どちらでも うちかたは かわりません</p>
        <div className="flex gap-4">
          {caseOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCaseStyle(opt.value)}
              className={`w-56 rounded-xl border-4 p-4 text-center transition ${
                caseStyle === opt.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-300 bg-white hover:border-slate-400"
              }`}
            >
              <div className="text-2xl font-bold">{opt.title}</div>
              <div className="mt-2 font-mono text-sm text-slate-500">{opt.example}</div>
              {caseStyle === opt.value && (
                <div className="mt-2 text-sm font-bold text-blue-600">えらばれています</div>
              )}
            </button>
          ))}
        </div>
      </div>
      <BigButton color="gray" onClick={() => setScene("menu")}>
        メニューにもどる
      </BigButton>
    </div>
  );
}
