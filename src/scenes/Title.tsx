import { useEffect } from "react";
import { useAppStore } from "../store/useAppStore";

/** タイトル画面。スペースキー（またはクリック）でメニュー画面へ */
export default function Title() {
  const setScene = useAppStore((s) => s.setScene);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") setScene("menu");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setScene]);

  return (
    <div
      className="flex min-h-screen cursor-pointer flex-col items-center justify-center gap-10 bg-gradient-to-b from-indigo-900 via-indigo-700 to-sky-600"
      onClick={() => setScene("menu")}
    >
      <div className="text-center">
        <div className="mb-4 text-2xl font-bold text-yellow-200">しょうがくせいむけ タイピングゲーム</div>
        <h1 className="text-7xl font-black tracking-wide text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.4)]">
          アトス
        </h1>
        <h1 className="mt-2 text-6xl font-black tracking-wide text-yellow-300 drop-shadow-[0_4px_0_rgba(0,0,0,0.4)]">
          バトルタイピング
        </h1>
      </div>
      <div className="animate-pulse rounded-full bg-white/20 px-8 py-3 text-2xl font-bold text-white">
        スペースキーを おしてね
      </div>
    </div>
  );
}
