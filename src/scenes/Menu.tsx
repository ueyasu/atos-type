import titleUrl from "../assets/images/title.png";
import { useAppStore } from "../store/useAppStore";
import BigButton from "../components/common/BigButton";

/** メニュー画面 */
export default function Menu() {
  const setScene = useAppStore((s) => s.setScene);

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center gap-12 bg-cover bg-center"
      style={{ backgroundImage: `url(${titleUrl})` }}
    >
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      <h1 className="relative z-10 text-5xl font-black text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.4)]">
        アトス バトルタイピング
      </h1>
      <div className="relative z-10 flex flex-col gap-6">
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
