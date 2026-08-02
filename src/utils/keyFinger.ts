export type HandFinger = "pinky" | "ring" | "middle" | "index" | "thumb";

export interface FingerAssignment {
  hand: "left" | "right";
  finger: HandFinger;
}

/** 標準タッチタイピングのホームポジションに基づく、キーごとの指割り当て */
export function fingerForChar(ch: string): FingerAssignment | null {
  const c = ch.toLowerCase();
  if ("aqz".includes(c)) return { hand: "left", finger: "pinky" };
  if ("swx".includes(c)) return { hand: "left", finger: "ring" };
  if ("dec".includes(c)) return { hand: "left", finger: "middle" };
  if ("frtvgb".includes(c)) return { hand: "left", finger: "index" };
  if ("yuhjnm".includes(c)) return { hand: "right", finger: "index" };
  if ("ik".includes(c)) return { hand: "right", finger: "middle" };
  if ("ol".includes(c)) return { hand: "right", finger: "ring" };
  if ("p".includes(c)) return { hand: "right", finger: "pinky" };
  return null;
}
