import { RomajiTypingEngine, type TypingOptions } from "../lib/typingEngine";
import { useAppStore, type CaseStyle } from "../store/useAppStore";
import BigButton from "../components/common/BigButton";

interface RomajiRow {
  /** エンジンへ渡す設定キー */
  engineKey: keyof TypingOptions;
  label: string;
  sample: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; title: string }[];
}

const caseOptions: { value: CaseStyle; title: string; example: string }[] = (
  ["lower", "upper"] as const
).map((value) => ({
  value,
  title: value === "lower" ? "こもじ" : "おおもじ",
  example: `jugyou → ${value === "upper" ? "JUGYOU" : "jugyou"}`,
}));

/** 設定画面。ローマ字揺れルール（ガイド表記）と大文字/小文字表示を設定する */
export default function Settings() {
  const jaStyle = useAppStore((s) => s.jaStyle);
  const setJaStyle = useAppStore((s) => s.setJaStyle);
  const shStyle = useAppStore((s) => s.shStyle);
  const setShStyle = useAppStore((s) => s.setShStyle);
  const shiStyle = useAppStore((s) => s.shiStyle);
  const setShiStyle = useAppStore((s) => s.setShiStyle);
  const chiStyle = useAppStore((s) => s.chiStyle);
  const setChiStyle = useAppStore((s) => s.setChiStyle);
  const tsuStyle = useAppStore((s) => s.tsuStyle);
  const setTsuStyle = useAppStore((s) => s.setTsuStyle);
  const fuStyle = useAppStore((s) => s.fuStyle);
  const setFuStyle = useAppStore((s) => s.setFuStyle);
  const caseStyle = useAppStore((s) => s.caseStyle);
  const setCaseStyle = useAppStore((s) => s.setCaseStyle);
  const setScene = useAppStore((s) => s.setScene);

  const rows: RomajiRow[] = [
    {
      engineKey: "jaStyle",
      label: "じゃ・じゅ・じょ・じ",
      sample: "じゅぎょう",
      value: jaStyle,
      onChange: (v) => setJaStyle(v as typeof jaStyle),
      options: [
        { value: "ja", title: "ja / ju / jo / ji" },
        { value: "zya", title: "zya / zyu / zyo / zi" },
      ],
    },
    {
      engineKey: "shStyle",
      label: "しゃ・しゅ・しょ",
      sample: "しゃしん",
      value: shStyle,
      onChange: (v) => setShStyle(v as typeof shStyle),
      options: [
        { value: "sha", title: "sha / shu / sho" },
        { value: "sya", title: "sya / syu / syo" },
      ],
    },
    {
      engineKey: "shiStyle",
      label: "し",
      sample: "しんぶん",
      value: shiStyle,
      onChange: (v) => setShiStyle(v as typeof shiStyle),
      options: [
        { value: "shi", title: "shi" },
        { value: "si", title: "si" },
      ],
    },
    {
      engineKey: "chiStyle",
      label: "ち・ちゃ・ちゅ・ちょ",
      sample: "おちゃ",
      value: chiStyle,
      onChange: (v) => setChiStyle(v as typeof chiStyle),
      options: [
        { value: "chi", title: "chi / cha / chu / cho" },
        { value: "ti", title: "ti / tya / tyu / tyo" },
      ],
    },
    {
      engineKey: "tsuStyle",
      label: "つ",
      sample: "つくえ",
      value: tsuStyle,
      onChange: (v) => setTsuStyle(v as typeof tsuStyle),
      options: [
        { value: "tsu", title: "tsu" },
        { value: "tu", title: "tu" },
      ],
    },
    {
      engineKey: "fuStyle",
      label: "ふ",
      sample: "ふじ",
      value: fuStyle,
      onChange: (v) => setFuStyle(v as typeof fuStyle),
      options: [
        { value: "fu", title: "fu" },
        { value: "hu", title: "hu" },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-gradient-to-b from-indigo-900 via-indigo-700 to-sky-600">
      <h1 className="text-4xl font-black text-white">せってい</h1>
      <div className="rounded-2xl bg-white/95 p-8 text-slate-800 shadow-xl">
        <h2 className="mb-1 text-xl font-bold">ローマ字の ひょうじ</h2>
        <p className="mb-2 text-sm text-slate-500">※ どの えらびかたでも どちらの うちかたも せいかいに なります</p>
        <div className="divide-y divide-slate-200">
          {rows.map((row) => (
            <div key={row.engineKey} className="flex items-center justify-between gap-4 py-4">
              <div>
                <div className="font-bold">{row.label}</div>
                <div className="mt-1 font-mono text-sm text-slate-500">
                  {row.sample} →{" "}
                  {new RomajiTypingEngine(row.sample, {
                    [row.engineKey]: row.value,
                  } as TypingOptions).guide}
                </div>
              </div>
              <div className="flex gap-2">
                {row.options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => row.onChange(opt.value)}
                    className={`rounded-xl border-4 px-4 py-3 font-mono text-lg font-bold transition ${
                      row.value === opt.value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    {opt.title}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl bg-white/95 p-8 text-slate-800 shadow-xl">
        <h2 className="mb-1 text-xl font-bold">ローマ字の おおきさ</h2>
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
