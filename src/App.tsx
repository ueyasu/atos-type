import { useAppStore } from "./store/useAppStore";
import Title from "./scenes/Title";
import Menu from "./scenes/Menu";
import Settings from "./scenes/Settings";
import Difficulty from "./scenes/Difficulty";
import Battle from "./scenes/Battle";
import Result from "./scenes/Result";

/** シーンのルーティング（画面遷移の管理） */
export default function App() {
  const scene = useAppStore((s) => s.scene);
  switch (scene) {
    case "title":
      return <Title />;
    case "menu":
      return <Menu />;
    case "settings":
      return <Settings />;
    case "difficulty":
      return <Difficulty />;
    case "battle":
      return <Battle />;
    case "result":
      return <Result />;
  }
}
