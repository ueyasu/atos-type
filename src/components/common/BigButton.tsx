import type { ButtonHTMLAttributes, ReactNode } from "react";

type Color = "blue" | "green" | "orange" | "gray";

const COLOR_CLASSES: Record<Color, string> = {
  blue: "bg-blue-500 border-blue-700 hover:bg-blue-400",
  green: "bg-green-500 border-green-700 hover:bg-green-400",
  orange: "bg-orange-500 border-orange-700 hover:bg-orange-400",
  gray: "bg-gray-500 border-gray-700 hover:bg-gray-400",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: Color;
  children: ReactNode;
}

/** 画面を問わず使う、小学生向けの大きな押し心地のあるボタン */
export default function BigButton({ color = "blue", children, className = "", ...rest }: Props) {
  return (
    <button
      type="button"
      className={`rounded-2xl border-b-8 px-10 py-4 text-2xl font-bold text-white shadow-lg transition active:translate-y-1 active:border-b-2 ${COLOR_CLASSES[color]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
