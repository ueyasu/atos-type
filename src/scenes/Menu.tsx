import { useAppStore } from "../store/useAppStore";
import BigButton from "../components/common/BigButton";

/** メニュー画面 */
export default function Menu() {
  const setScene = useAppStore((s) => s.setScene);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-12 bg-gradient-to-b from-indigo-900 via-indigo-700 to-sky-600">
      <h1 className="text-5xl font-black text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.4)]">
        アトス バトルタイピング
      </h1>
      <div className="flex flex-col gap-6">
        <BigButton color="green" onClick={() => setScene("difficulty")}>
          ゲームスタート
        </BigButton>
        <BigButton color="orange" onClick={() => setScene("settings")}>
          せってい
        </BigButton>
      </div>
    </div>
  );
}
