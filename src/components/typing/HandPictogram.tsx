import type { HandFinger } from "../../utils/keyFinger";

const VIEW_W = 240;

interface FingerGeom {
  finger: HandFinger;
  /** 指の中心X */
  cx: number;
  /** 指先（上端）のY */
  top: number;
  w: number;
  h: number;
}

const FINGERS: Record<"left" | "right", FingerGeom[]> = {
  left: [
    { finger: "pinky", cx: 36, top: 70, w: 24, h: 105 },
    { finger: "ring", cx: 71, top: 50, w: 26, h: 125 },
    { finger: "middle", cx: 105, top: 38, w: 26, h: 137 },
    { finger: "index", cx: 139, top: 56, w: 26, h: 119 },
  ],
  right: [
    { finger: "pinky", cx: 204, top: 70, w: 24, h: 105 },
    { finger: "ring", cx: 169, top: 50, w: 26, h: 125 },
    { finger: "middle", cx: 135, top: 38, w: 26, h: 137 },
    { finger: "index", cx: 101, top: 56, w: 26, h: 119 },
  ],
};

const PALM: Record<"left" | "right", { x: number; y: number; w: number; h: number; r: number }> = {
  left: { x: 12, y: 180, w: 150, h: 95, r: 40 },
  right: { x: 78, y: 180, w: 150, h: 95, r: 40 },
};

interface ThumbGeom {
  base: { x: number; y: number };
  tip: { x: number; y: number };
  w: number;
}

const THUMB: Record<"left" | "right", ThumbGeom> = {
  left: { base: { x: 150, y: 195 }, tip: { x: 195, y: 100 }, w: 28 },
  right: { base: { x: 90, y: 195 }, tip: { x: 45, y: 100 }, w: 28 },
};

interface Props {
  hand: "left" | "right";
  activeFinger: HandFinger | null;
}

/** 手のワイヤーピクトグラム。タイプに使う指の指先に赤丸を表示する */
export default function HandPictogram({ hand, activeFinger }: Props) {
  const palm = PALM[hand];
  const thumb = THUMB[hand];
  const thumbMidX = (thumb.base.x + thumb.tip.x) / 2;
  const thumbMidY = (thumb.base.y + thumb.tip.y) / 2;
  const thumbLen = Math.hypot(thumb.tip.x - thumb.base.x, thumb.tip.y - thumb.base.y);
  const thumbAngle =
    (Math.atan2(thumb.tip.y - thumb.base.y, thumb.tip.x - thumb.base.x) * 180) / Math.PI;

  let dot: { x: number; y: number } | null = null;
  if (activeFinger === "thumb") {
    dot = { x: thumb.tip.x, y: thumb.tip.y };
  } else if (activeFinger !== null) {
    const finger = FINGERS[hand].find((f) => f.finger === activeFinger);
    if (finger) dot = { x: finger.cx, y: finger.top };
  }

  return (
    <svg viewBox={`0 0 ${VIEW_W} 300`} className="h-36 w-auto shrink-0" aria-hidden="true">
      <g stroke="#cbd5e1" strokeWidth={6} fill="none">
        <rect x={palm.x} y={palm.y} width={palm.w} height={palm.h} rx={palm.r} />
        {FINGERS[hand].map((f) => (
          <rect
            key={f.finger}
            x={f.cx - f.w / 2}
            y={f.top}
            width={f.w}
            height={f.h}
            rx={f.w / 2}
          />
        ))}
        <rect
          x={thumbMidX - thumbLen / 2}
          y={thumbMidY - thumb.w / 2}
          width={thumbLen}
          height={thumb.w}
          rx={thumb.w / 2}
          transform={`rotate(${thumbAngle} ${thumbMidX} ${thumbMidY})`}
        />
      </g>
      {dot && (
        <g>
          <circle cx={dot.x} cy={dot.y} r={12} fill="none" stroke="#ef4444" strokeWidth={10}>
            <animate attributeName="r" values="12;42" dur="0.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0" dur="0.5s" repeatCount="indefinite" />
          </circle>
          <circle cx={dot.x} cy={dot.y} r={12} fill="#ef4444" stroke="#ffffff" strokeWidth={4} />
        </g>
      )}
    </svg>
  );
}
