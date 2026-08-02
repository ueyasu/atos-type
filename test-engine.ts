import { RomajiTypingEngine, type TypingOptions } from "./src/lib/typingEngine.ts";
import { WORDS } from "./src/data/words.ts";

let failures = 0;

function typeWord(kana: string, input: string, options: TypingOptions = {}) {
  const engine = new RomajiTypingEngine(kana, options);
  let acceptedAll = true;
  for (let i = 0; i < input.length; i++) {
    const r = engine.input(input[i]);
    if (!r.accepted) acceptedAll = false;
    if (r.completed) return { acceptedAll, completed: true, early: i < input.length - 1 };
  }
  return { acceptedAll, completed: false, early: false };
}

function expect(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    failures++;
    console.error(`FAIL: ${name}\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`);
  } else {
    console.log(`ok: ${name}`);
  }
}

// 単純な1文字
expect("あ → a", typeWord("あ", "a"), { acceptedAll: true, completed: true, early: false });
expect("あ → i は誤り", typeWord("あ", "i"), { acceptedAll: false, completed: false, early: false });

// し: shi / si 両対応
expect("し → shi", typeWord("し", "shi"), { acceptedAll: true, completed: true, early: false });
expect("し → si", typeWord("し", "si"), { acceptedAll: true, completed: true, early: false });
expect("し のガイドは shi", new RomajiTypingEngine("し").guide, "shi");

// 日常文言
expect("おはよう → ohayou", typeWord("おはよう", "ohayou"), { acceptedAll: true, completed: true, early: false });
expect("さようなら → sayounara", typeWord("さようなら", "sayounara"), { acceptedAll: true, completed: true, early: false });

// 促音: 二重子音化と xtu 系
expect("がっこう → gakkou", typeWord("がっこう", "gakkou"), { acceptedAll: true, completed: true, early: false });
expect("がっこう → gaxtukou", typeWord("がっこう", "gaxtukou"), { acceptedAll: true, completed: true, early: false });
expect("ずっと → zutto", typeWord("ずっと", "zutto"), { acceptedAll: true, completed: true, early: false });
expect("ずっと → zututo は誤り", typeWord("ずっと", "zututo").acceptedAll, false);

// ち の促音: cchi / tti
expect("おちゃ → ocha/otya", typeWord("おちゃ", "ocha"), { acceptedAll: true, completed: true, early: false });
expect("まっちゃ → maccha", typeWord("まっちゃ", "maccha"), { acceptedAll: true, completed: true, early: false });
expect("まっちゃ → mattiya? → mattixya は未対応、mattcha は誤り", typeWord("まっちゃ", "mattcha").acceptedAll, false);

// ん の文脈ルール
expect("こんにちは → konnitiha", typeWord("こんにちは", "konnitiha"), { acceptedAll: true, completed: true, early: false });
expect("こんにちは → konnichiha", typeWord("こんにちは", "konnichiha"), { acceptedAll: true, completed: true, early: false });
expect("こんにちは → konitiha は誤り（「に」は ni 必須のため kn 1回では不足）", typeWord("こんにちは", "konitiha").acceptedAll, false);
expect("しんぶん → shinbun（子音前は n 1回で可）", typeWord("しんぶん", "shinbun"), { acceptedAll: true, completed: true, early: false });
expect("せんせい → sensei", typeWord("せんせい", "sensei"), { acceptedAll: true, completed: true, early: false });
expect("せんせい → sennsei（nn も可）", typeWord("せんせい", "sennsei"), { acceptedAll: true, completed: true, early: false });
expect("かんい → kani は誤り（母音前は nn 必須）", typeWord("かんい", "kani").acceptedAll, false);
expect("かんい → kanni", typeWord("かんい", "kanni"), { acceptedAll: true, completed: true, early: false });
expect("かんな → kanna（な行前は n 1回で可）", typeWord("かんな", "kanna"), { acceptedAll: true, completed: true, early: false });

// 語尾の ん: n 1回で完成
expect("おべんとうばこ → obentoubako", typeWord("おべんとうばこ", "obentoubako"), { acceptedAll: true, completed: true, early: false });
expect("ぱん → pan", typeWord("ぱん", "pan"), { acceptedAll: true, completed: true, early: false });
expect("ぱん → pann", typeWord("ぱん", "pann"), { acceptedAll: true, completed: true, early: true }); // "pan" 時点で完成

// じゃ系: 設定によるガイド切替・両表記受理
expect("じゅぎょう ガイド(ja)", new RomajiTypingEngine("じゅぎょう", { jaStyle: "ja" }).guide, "jugyou");
expect("じゅぎょう ガイド(zya)", new RomajiTypingEngine("じゅぎょう", { jaStyle: "zya" }).guide, "zyugyou");
expect("じゅぎょう → jugyou", typeWord("じゅぎょう", "jugyou", { jaStyle: "zya" }), { acceptedAll: true, completed: true, early: false });
expect("じゅぎょう → zyugyou", typeWord("じゅぎょう", "zyugyou", { jaStyle: "ja" }), { acceptedAll: true, completed: true, early: false });

// しゃ系: 設定によるガイド切替・両表記受理
expect("しゃしん ガイド(sha)", new RomajiTypingEngine("しゃしん", { shStyle: "sha" }).guide, "shashin");
expect("しゃしん ガイド(sya)", new RomajiTypingEngine("しゃしん", { shStyle: "sya" }).guide, "syashin");
expect("しゃしん → shashin", typeWord("しゃしん", "shashin"), { acceptedAll: true, completed: true, early: false });
expect("しゃしん → syasin", typeWord("しゃしん", "syasin"), { acceptedAll: true, completed: true, early: false });
expect("しゃしん → syasin（sya設定）", typeWord("しゃしん", "syasin", { jaStyle: "ja", shStyle: "sya" }), { acceptedAll: true, completed: true, early: false });
expect("しゃしん → shashin（sya設定）", typeWord("しゃしん", "shashin", { shStyle: "sya" }), { acceptedAll: true, completed: true, early: false });

// し: shi / si
expect("し ガイド(shi)", new RomajiTypingEngine("し").guide, "shi");
expect("し ガイド(si)", new RomajiTypingEngine("し", { shiStyle: "si" }).guide, "si");
expect("し → si", typeWord("し", "si", { shiStyle: "si" }), { acceptedAll: true, completed: true, early: false });

// ち・ちゃ系: chi/ti, cha/tya
expect("ち ガイド(chi)", new RomajiTypingEngine("ち").guide, "chi");
expect("ち ガイド(ti)", new RomajiTypingEngine("ち", { chiStyle: "ti" }).guide, "ti");
expect("おちゃ ガイド(cha)", new RomajiTypingEngine("おちゃ").guide, "ocha");
expect("おちゃ ガイド(tya)", new RomajiTypingEngine("おちゃ", { chiStyle: "ti" }).guide, "otya");
expect("おちゃ → tya", typeWord("おちゃ", "otya", { chiStyle: "ti" }), { acceptedAll: true, completed: true, early: false });
expect("おちゃ → cha（ti設定）", typeWord("おちゃ", "ocha", { chiStyle: "ti" }), { acceptedAll: true, completed: true, early: false });

// つ: tsu / tu
expect("つ ガイド(tsu)", new RomajiTypingEngine("つ").guide, "tsu");
expect("つ ガイド(tu)", new RomajiTypingEngine("つ", { tsuStyle: "tu" }).guide, "tu");
expect("つくえ → tuku e → tukue", typeWord("つくえ", "tukue", { tsuStyle: "tu" }), { acceptedAll: true, completed: true, early: false });

// ふ: fu / hu
expect("ふ ガイド(fu)", new RomajiTypingEngine("ふ").guide, "fu");
expect("ふ ガイド(hu)", new RomajiTypingEngine("ふ", { fuStyle: "hu" }).guide, "hu");
expect("ふじ → huji", typeWord("ふじ", "huji", { fuStyle: "hu" }), { acceptedAll: true, completed: true, early: false });

// じ: jaStyle と連動（zya → zi）
expect("じ ガイド(ji)", new RomajiTypingEngine("じ").guide, "ji");
expect("じ ガイド(zi)", new RomajiTypingEngine("じ", { jaStyle: "zya" }).guide, "zi");
expect("ふじ → fuzi（jaStyle=zya）", typeWord("ふじ", "fuzi", { jaStyle: "zya" }), { acceptedAll: true, completed: true, early: false });

// を は固定表記（wo）
expect("を ガイド", new RomajiTypingEngine("を").guide, "wo");

// むずかしい長文
expect("ゆうしゃのつるぎ → yuushanotsurugi", typeWord("ゆうしゃのつるぎ", "yuushanotsurugi"), { acceptedAll: true, completed: true, early: false });
expect("むずかしいもんだい → muzukasiimondai", typeWord("むずかしいもんだい", "muzukasiimondai"), { acceptedAll: true, completed: true, early: false });

// 残りガイドの途中表示
{
  const e = new RomajiTypingEngine("がっこう");
  e.input("g");
  e.input("a");
  expect("がっこう ga 入力後の残り", e.remaining, "kkou");
}
{
  const e = new RomajiTypingEngine("し");
  e.input("s");
  expect("し s 入力後の残りは hi（shi を優先ガイド）", e.remaining, "hi");
}

// --- 出題単語リストの検証 ---
{
  const SMALL = new Set(["ゃ", "ゅ", "ょ", "ぁ", "ぃ", "ぅ", "ぇ", "ぉ"]);
  const DAKUTEN = /[がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ]/;
  const countMorae = (kana: string) => [...kana].filter((c) => !SMALL.has(c)).length;

  for (const [tier, words] of Object.entries(WORDS)) {
    for (const w of words) {
      // エンジンで変換可能（未対応の仮名を含まない）こと
      try {
        new RomajiTypingEngine(w);
      } catch (e) {
        failures++;
        console.error(`FAIL: 単語「${w}」(${tier}) が変換できません: ${e}`);
        continue;
      }
      // 各難易度の出題条件
      if (tier === "easy" && countMorae(w) !== 1) {
        failures++;
        console.error(`FAIL: かんたん「${w}」が1文字ではありません`);
      }
      if (tier === "normal" && (countMorae(w) > 5 || DAKUTEN.test(w))) {
        failures++;
        console.error(`FAIL: ふつう「${w}」が条件違反です（5文字超または濁音・半濁音含有）`);
      }
      if (tier === "hard" && !DAKUTEN.test(w) && !SMALL.has([...w].find((c) => SMALL.has(c)) ?? "")) {
        failures++;
        console.error(`FAIL: むずかしい「${w}」に濁音・半濁音・拗音がありません`);
      }
      if (tier === "expert" && countMorae(w) < 7) {
        failures++;
        console.error(`FAIL: 7文字以上用「${w}」が ${countMorae(w)} 文字しかありません`);
      }
    }
  }
  console.log("ok: 出題単語リストの検証");
}

if (failures > 0) {
  console.error(`\n${failures} 件のテストが失敗しました`);
  process.exit(1);
}
console.log("\nすべてのテストに合格しました");
