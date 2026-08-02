import { useCallback, useRef } from "react";
import { RomajiTypingEngine, type TypingInputResult } from "../lib/typingEngine";
import { useAppStore } from "../store/useAppStore";

export interface TypingKeyResult extends TypingInputResult {
  typed: string;
  remaining: string;
}

/**
 * タイピングエンジンをReactで扱いやすくするフック。
 * 設定画面のローマ字揺れルール（jaStyle）をエンジンに注入する。
 */
export function useTyping() {
  const jaStyle = useAppStore((s) => s.jaStyle);
  const shStyle = useAppStore((s) => s.shStyle);
  const shiStyle = useAppStore((s) => s.shiStyle);
  const chiStyle = useAppStore((s) => s.chiStyle);
  const tsuStyle = useAppStore((s) => s.tsuStyle);
  const fuStyle = useAppStore((s) => s.fuStyle);
  const engineRef = useRef<RomajiTypingEngine | null>(null);

  /** 新しい単語を出題する */
  const startWord = useCallback(
    (kana: string): { remaining: string } => {
      const engine = new RomajiTypingEngine(kana, {
        jaStyle,
        shStyle,
        shiStyle,
        chiStyle,
        tsuStyle,
        fuStyle,
      });
      engineRef.current = engine;
      return { remaining: engine.remaining };
    },
    [jaStyle, shStyle, shiStyle, chiStyle, tsuStyle, fuStyle],
  );

  /** 1文字入力する */
  const input = useCallback((ch: string): TypingKeyResult | null => {
    const engine = engineRef.current;
    if (!engine) return null;
    const result = engine.input(ch);
    return { ...result, typed: engine.typed, remaining: engine.remaining };
  }, []);

  return { startWord, input };
}
