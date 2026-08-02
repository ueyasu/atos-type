import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Difficulty } from "../data/words";
import type { JaStyle } from "../lib/typingEngine";

export type Scene = "title" | "menu" | "settings" | "difficulty" | "battle" | "result";

/** ローマ字ガイドの表示（大文字/小文字） */
export type CaseStyle = "lower" | "upper";

interface AppState {
  scene: Scene;
  /** 「じゃ・じゅ・じょ」のガイド表記（どちらの入力も正解になる） */
  jaStyle: JaStyle;
  /** ローマ字ガイドの大文字/小文字表示 */
  caseStyle: CaseStyle;
  /** 難易度ごとのベストクリアタイム（秒） */
  bestTimes: Partial<Record<Difficulty, number>>;
  setScene: (scene: Scene) => void;
  setJaStyle: (jaStyle: JaStyle) => void;
  setCaseStyle: (caseStyle: CaseStyle) => void;
  recordClearTime: (difficulty: Difficulty, seconds: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      scene: "title",
      jaStyle: "ja",
      caseStyle: "lower",
      bestTimes: {},
      setScene: (scene) => set({ scene }),
      setJaStyle: (jaStyle) => set({ jaStyle }),
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
      partialize: (state) => ({ jaStyle: state.jaStyle, caseStyle: state.caseStyle, bestTimes: state.bestTimes }),
    },
  ),
);
