/**
 * ローマ字タイピング判定エンジン。
 *
 * ひらがな → ローマ字のモーラ変換テーブルから、正解となりうる全表記
 * （訓令式/ヘボン式、拗音の別表記、促音の二重子音化・xtu 系、ん の文脈ルール）
 * を生成し、入力文字列の前置一致で正誤判定を行う。
 */

/** 「じゃ・じゅ・じょ・じ」のガイド表記設定 */
export type JaStyle = "ja" | "zya";
/** 「しゃ・しゅ・しょ」のガイド表記設定 */
export type ShStyle = "sha" | "sya";
/** 「し」のガイド表記設定 */
export type ShiStyle = "shi" | "si";
/** 「ち・ちゃ・ちゅ・ちょ」のガイド表記設定 */
export type ChiStyle = "chi" | "ti";
/** 「つ」のガイド表記設定 */
export type TsuStyle = "tsu" | "tu";
/** 「ふ」のガイド表記設定 */
export type FuStyle = "fu" | "hu";

export interface TypingOptions {
  jaStyle?: JaStyle;
  shStyle?: ShStyle;
  shiStyle?: ShiStyle;
  chiStyle?: ChiStyle;
  tsuStyle?: TsuStyle;
  fuStyle?: FuStyle;
}

export interface TypingInputResult {
  accepted: boolean;
  completed: boolean;
}

/** モーラ（1音拍）→ 受理するローマ字表記の配列。先頭がガイド表示の標準表記 */
const MORA_TABLE: Record<string, string[]> = {
  あ: ["a"],
  い: ["i"],
  う: ["u"],
  え: ["e"],
  お: ["o"],
  か: ["ka"],
  き: ["ki"],
  く: ["ku"],
  け: ["ke"],
  こ: ["ko"],
  さ: ["sa"],
  し: ["shi", "si"],
  す: ["su"],
  せ: ["se"],
  そ: ["so"],
  た: ["ta"],
  ち: ["chi", "ti"],
  つ: ["tsu", "tu"],
  て: ["te"],
  と: ["to"],
  な: ["na"],
  に: ["ni"],
  ぬ: ["nu"],
  ね: ["ne"],
  の: ["no"],
  は: ["ha"],
  ひ: ["hi"],
  ふ: ["fu", "hu"],
  へ: ["he"],
  ほ: ["ho"],
  ま: ["ma"],
  み: ["mi"],
  む: ["mu"],
  め: ["me"],
  も: ["mo"],
  や: ["ya"],
  ゆ: ["yu"],
  よ: ["yo"],
  ら: ["ra"],
  り: ["ri"],
  る: ["ru"],
  れ: ["re"],
  ろ: ["ro"],
  わ: ["wa"],
   を: ["wo"],
  が: ["ga"],
  ぎ: ["gi"],
  ぐ: ["gu"],
  げ: ["ge"],
  ご: ["go"],
  ざ: ["za"],
  じ: ["ji", "zi"],
  ず: ["zu"],
  ぜ: ["ze"],
  ぞ: ["zo"],
  だ: ["da"],
  ぢ: ["di"],
  づ: ["du"],
  で: ["de"],
  ど: ["do"],
  ば: ["ba"],
  び: ["bi"],
  ぶ: ["bu"],
  べ: ["be"],
  ぼ: ["bo"],
  ぱ: ["pa"],
  ぴ: ["pi"],
  ぷ: ["pu"],
  ぺ: ["pe"],
  ぽ: ["po"],
  ぁ: ["la", "xa"],
  ぃ: ["li", "xi"],
  ぅ: ["lu", "xu"],
  ぇ: ["le", "xe"],
  ぉ: ["lo", "xo"],
  ゃ: ["lya", "xya"],
  ゅ: ["lyu", "xyu"],
  ょ: ["lyo", "xyo"],
  きゃ: ["kya", "kilya", "kixya"],
  きゅ: ["kyu", "kilyu", "kixyu"],
  きょ: ["kyo", "kilyo", "kixyo"],
  しゃ: ["sha", "sya", "shilya", "silya"],
  しゅ: ["shu", "syu", "shilyu", "silyu"],
  しょ: ["sho", "syo", "shilyo", "silyo"],
  ちゃ: ["cha", "tya", "cya", "chilya", "tiliya"],
  ちゅ: ["chu", "tyu", "cyu", "chilyu", "tiliyu"],
  ちょ: ["cho", "tyo", "cyo", "chilyo", "tiliyo"],
  にゃ: ["nya", "nilya", "nixya"],
  にゅ: ["nyu", "nilyu", "nixyu"],
  にょ: ["nyo", "nilyo", "nixyo"],
  ひゃ: ["hya", "hilya", "hixya"],
  ひゅ: ["hyu", "hilyu", "hixyu"],
  ひょ: ["hyo", "hilyo", "hixyo"],
  みゃ: ["mya", "milya", "mixya"],
  みゅ: ["myu", "milyu", "mixyu"],
  みょ: ["myo", "milyo", "mixyo"],
  りゃ: ["rya", "rilya", "rixya"],
  りゅ: ["ryu", "rilyu", "rixyu"],
  りょ: ["ryo", "rilyo", "rixyo"],
  ぎゃ: ["gya", "gilya", "gixya"],
  ぎゅ: ["gyu", "gilyu", "gixyu"],
  ぎょ: ["gyo", "gilyo", "gixyo"],
  じゃ: ["ja", "zya", "jya", "jilya", "zilya"],
  じゅ: ["ju", "zyu", "jyu", "jilyu", "zilyu"],
  じょ: ["jo", "zyo", "jyo", "jilyo", "zilyo"],
  ぢゃ: ["dya", "dilya", "dixya"],
  ぢゅ: ["dyu", "dilyu", "dixyu"],
  ぢょ: ["dyo", "dilyo", "dixyo"],
  びゃ: ["bya", "bilya", "bixya"],
  びゅ: ["byu", "bilyu", "bixyu"],
  びょ: ["byo", "bilyo", "bixyo"],
  ぴゃ: ["pya", "pilya", "pixya"],
  ぴゅ: ["pyu", "pilyu", "pixyu"],
  ぴょ: ["pyo", "pilyo", "pixyo"],
};

/** 促音「っ」の直接入力バリエーション */
const SOKUON_ALONE = ["xtu", "xtsu", "ltu", "ltsu"];

/** 結合して拗音になる小書き仮名 */
const SMALL_KANA = new Set(["ゃ", "ゅ", "ょ", "ぁ", "ぃ", "ぅ", "ぇ", "ぉ"]);

/** 「ん」の直後に来ると "n" 1回入力を許可できない仮名（母音・や行）。
 *  な行は「に」等が n で始まるため "n" + "ni" = "nni" で曖昧さがなく、許可できる */
const AMBIGUOUS_AFTER_N = new Set([
  "あ", "い", "う", "え", "お",
  "ぁ", "ぃ", "ぅ", "ぇ", "ぉ",
  "や", "ゆ", "よ", "ゃ", "ゅ", "ょ",
]);

type MoraUnit =
  | { kind: "mora"; kana: string; romaji: string[] }
  | { kind: "sokuon" }
  | { kind: "n" };

/** ガイドの標準表記を配列の先頭に持ってくる（既に先頭なら変更しない） */
function preferFirst(romaji: string[], preferred: string): string[] {
  const idx = romaji.indexOf(preferred);
  if (idx <= 0) return romaji;
  return [preferred, ...romaji.filter((r) => r !== preferred)];
}

/** 設定に応じてガイドの標準表記を選ぶ */
function preferredRomaji(key: string, options: TypingOptions): string | null {
  switch (key) {
    case "じゃ": return options.jaStyle === "zya" ? "zya" : "ja";
    case "じゅ": return options.jaStyle === "zya" ? "zyu" : "ju";
    case "じょ": return options.jaStyle === "zya" ? "zyo" : "jo";
    case "じ": return options.jaStyle === "zya" ? "zi" : "ji";
    case "しゃ": return options.shStyle === "sya" ? "sya" : "sha";
    case "しゅ": return options.shStyle === "sya" ? "syu" : "shu";
    case "しょ": return options.shStyle === "sya" ? "syo" : "sho";
    case "し": return options.shiStyle === "si" ? "si" : "shi";
    case "ち": return options.chiStyle === "ti" ? "ti" : "chi";
    case "ちゃ": return options.chiStyle === "ti" ? "tya" : "cha";
    case "ちゅ": return options.chiStyle === "ti" ? "tyu" : "chu";
    case "ちょ": return options.chiStyle === "ti" ? "tyo" : "cho";
    case "つ": return options.tsuStyle === "tu" ? "tu" : "tsu";
    case "ふ": return options.fuStyle === "hu" ? "hu" : "fu";
    default: return null;
  }
}

/** ひらがな文字列をモーラ単位に分解する */
function parseKana(kana: string, options: TypingOptions): MoraUnit[] {
  const units: MoraUnit[] = [];
  for (let i = 0; i < kana.length; i++) {
    const ch = kana[i];
    if (ch === "っ") {
      units.push({ kind: "sokuon" });
      continue;
    }
    if (ch === "ん") {
      units.push({ kind: "n" });
      continue;
    }
    const next = kana[i + 1];
    const key = next !== undefined && SMALL_KANA.has(next) ? ch + next : ch;
    if (key.length === 2) i++;
    const romaji = MORA_TABLE[key];
    if (!romaji) {
      throw new Error(`未対応の仮名です: ${key}`);
    }
    // 設定に応じてガイドの標準表記を入れ替える
    const preferred = preferredRomaji(key, options);
    const reordered = preferred ? preferFirst(romaji, preferred) : romaji;
    units.push({ kind: "mora", kana: key, romaji: reordered });
  }
  return units;
}

/** モーラ列から受理するローマ字全文の全パターンを生成する（重複除去・標準表記順） */
function buildPatterns(units: MoraUnit[]): string[] {
  const rec = (index: number): string[] => {
    if (index >= units.length) return [""];
    const unit = units[index];

    if (unit.kind === "n") {
      const next = units[index + 1];
      const ambiguous =
        next !== undefined && next.kind === "mora" && AMBIGUOUS_AFTER_N.has(next.kana[0]);
      const options = ambiguous ? ["nn", "xn"] : ["n", "nn", "xn"];
      return options.flatMap((o) => rec(index + 1).map((rest) => o + rest));
    }

    if (unit.kind === "sokuon") {
      const next = units[index + 1];
      if (!next || next.kind !== "mora") {
        // 語尾の「っ」は直接入力のみ（出題リストでは使わない想定）
        return SOKUON_ALONE.flatMap((o) => rec(index + 1).map((rest) => o + rest));
      }
      // 子音で始まる表記は先頭子音を重ねる（促音の二重子音化）。この場合は次のモーラを消費する
      const doubled = next.romaji
        .filter((r) => /^[bcdfghjklmnpqrstvwyz]/.test(r))
        .map((r) => r[0] + r);
      const doubledPatterns = doubled.flatMap((o) => rec(index + 2).map((rest) => o + rest));
      // xtu 系は「っ」単独の入力なので、次のモーラは通常通り入力する
      const alonePatterns = SOKUON_ALONE.flatMap((o) => rec(index + 1).map((rest) => o + rest));
      return [...doubledPatterns, ...alonePatterns];
    }

    return unit.romaji.flatMap((o) => rec(index + 1).map((rest) => o + rest));
  };

  return [...new Set(rec(0))];
}

export class RomajiTypingEngine {
  readonly kana: string;
  private readonly patterns: string[];
  private typedText = "";

  constructor(kana: string, options: TypingOptions = {}) {
    this.kana = kana;
    this.patterns = buildPatterns(parseKana(kana, options));
  }

  /** 1文字入力し、正誤と単語完成を返す */
  input(ch: string): TypingInputResult {
    const next = this.typedText + ch.toLowerCase();
    if (!this.patterns.some((p) => p.startsWith(next))) {
      return { accepted: false, completed: false };
    }
    this.typedText = next;
    return { accepted: true, completed: this.patterns.includes(next) };
  }

  /** 入力済みのローマ字 */
  get typed(): string {
    return this.typedText;
  }

  /** ガイド表示用の残りローマ字（標準表記ベース） */
  get remaining(): string {
    const best = this.patterns.find(
      (p) => p.startsWith(this.typedText) && p.length > this.typedText.length,
    );
    return best ? best.slice(this.typedText.length) : "";
  }

  /** ガイド表示用の全文（入力済み + 残り） */
  get guide(): string {
    return this.typedText + this.remaining;
  }
}
