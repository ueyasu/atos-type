import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Difficulty } from "../data/words";
import type { ChiStyle, FuStyle, JaStyle, ShStyle, ShiStyle, TsuStyle } from "../lib/typingEngine";

export type Scene = "title" | "menu" | "settings" | "difficulty" | "battle" | "result";

/** ローマ字ガイドの表示（大文字/小文字） */
export type CaseStyle = "lower" | "upper";

interface AppState {
  scene: Scene;
  /** 「じゃ・じゅ・じょ・じ」のガイド表記（どちらの入力も正解になる） */
  jaStyle: JaStyle;
  /** 「しゃ・しゅ・しょ」のガイド表記（どちらの入力も正解になる） */
  shStyle: ShStyle;
  /** 「し」のガイド表記（どちらの入力も正解になる） */
  shiStyle: ShiStyle;
  /** 「ち・ちゃ・ちゅ・ちょ」のガイド表記（どちらの入力も正解になる） */
  chiStyle: ChiStyle;
  /** 「つ」のガイド表記（どちらの入力も正解になる） */
  tsuStyle: TsuStyle;
  /** 「ふ」のガイド表記（どちらの入力も正解になる） */
  fuStyle: FuStyle;
  /** ローマ字ガイドの大文字/小文字表示 */
  caseStyle: CaseStyle;
  /** 難易度ごとのベストクリアタイム（秒） */
  bestTimes: Partial<Record<Difficulty, number>>;
  setScene: (scene: Scene) => void;
  setJaStyle: (jaStyle: JaStyle) => void;
  setShStyle: (shStyle: ShStyle) => void;
  setShiStyle: (shiStyle: ShiStyle) => void;
  setChiStyle: (chiStyle: ChiStyle) => void;
  setTsuStyle: (tsuStyle: TsuStyle) => void;
  setFuStyle: (fuStyle: FuStyle) => void;
  setCaseStyle: (caseStyle: CaseStyle) => void;
  recordClearTime: (difficulty: Difficulty, seconds: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      scene: "title",
      jaStyle: "ja",
      shStyle: "sha",
      shiStyle: "shi",
      chiStyle: "chi",
      tsuStyle: "tsu",
      fuStyle: "fu",
      caseStyle: "lower",
      bestTimes: {},
      setScene: (scene) => set({ scene }),
      setJaStyle: (jaStyle) => set({ jaStyle }),
      setShStyle: (shStyle) => set({ shStyle }),
      setShiStyle: (shiStyle) => set({ shiStyle }),
      setChiStyle: (chiStyle) => set({ chiStyle }),
      setTsuStyle: (tsuStyle) => set({ tsuStyle }),
      setFuStyle: (fuStyle) => set({ fuStyle }),
      setCaseStyle: (caseStyle) => set({ caseStyle }),
      recordClearTime: (difficulty, seconds) => {
        const prev = get().bestTimes[difficulty];
        if (prev === undefined || seconds < prev) {
          set({ bestTimes: { ...get().bestTimes, [difficulty]: seconds } });
        }
      },
    }),
    {
      name: "atos-battle-typing",
      // 画面状態は永続化せず、起動時は常にタイトルから始める
      partialize: (state) => ({
        jaStyle: state.jaStyle,
        shStyle: state.shStyle,
        shiStyle: state.shiStyle,
        chiStyle: state.chiStyle,
        tsuStyle: state.tsuStyle,
        fuStyle: state.fuStyle,
        caseStyle: state.caseStyle,
        bestTimes: state.bestTimes,
      }),
    },
  ),
);
