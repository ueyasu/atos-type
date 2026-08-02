# アトス バトルタイピング 実装ドキュメント

小学生向けタイピングゲーム「アトス バトルタイピング」の実装仕様をまとめたドキュメント。
要件定義は [AGENT.md](../AGENT.md) を参照。

## 1. 技術スタック

| 役割 | 採用技術 |
|---|---|
| UI / 全体管理 | React 19 + TypeScript + Vite |
| バトル描画エンジン | PixiJS v8（`pixi.js`、WebGL） |
| アニメーション | GSAP（Tween による移動・回転・拡縮・色調変化） |
| スタイリング | Tailwind CSS v4（`@tailwindcss/vite` プラグイン） |
| 状態管理 | Zustand v5（`persist` ミドルウェアで localStorage と同期） |
| テスト | Node.js 標準機能による TS 直接実行（`node test-engine.ts`） |

## 2. 起動・ビルド・テスト

```bash
npm install      # 依存パッケージのインストール
npm run dev      # 開発サーバ起動
npm run build    # 型チェック（tsc --noEmit）+ 本番ビルド（dist/）
npm run preview  # 本番ビルドのプレビュー
npm test         # タイピングエンジンの単体テスト
```

## 3. ディレクトリ構成

```
src/
├── assets/images/       # 自作SVGアセット（主人公・敵5体・背景3種・斬撃）
├── components/
│   ├── common/BigButton.tsx    # 画面共通の大ボタン
│   └── typing/                 # タイピング画面用UI
│       ├── StatusBars.tsx      # HPバー・敵攻撃タイマーバー
│       └── TypingPanel.tsx     # 出題文字・ローマ字ガイド表示
├── data/
│   ├── words.ts         # 難易度別単語リスト・単語袋（シャッフル出題）
│   └── enemies.ts       # 敵5体の定義・難易度情報・出題ランク解決
├── hooks/
│   ├── useTyping.ts     # タイピングエンジンのReactラッパー
│   └── useBattle.ts     # キー入力判定・敵攻撃タイマー・バトル進行
├── lib/
│   └── typingEngine.ts  # ローマ字タイピング判定エンジン（React非依存）
├── pixi/
│   ├── core.ts          # Pixi.Application初期化と BattleStage 公開API
│   ├── animations.ts    # GSAP Tween アニメーション定義
│   └── entities.ts      # テクスチャ読み込み・スプライト生成
├── scenes/              # 各画面のルートコンポーネント
│   ├── Title.tsx / Menu.tsx / Settings.tsx / Difficulty.tsx
│   ├── Battle.tsx       # タイピング画面（PixiJS + React UI の統合）
│   └── Result.tsx
├── store/
│   ├── useAppStore.ts   # シーン・設定・ベストタイム（localStorage永続化）
│   └── useGameStore.ts  # バトル進行状態
├── App.tsx              # シーンのルーティング
└── main.tsx             # エントリーポイント（StrictMode）
test-engine.ts           # タイピングエンジン単体テスト
```

## 4. シーン遷移

```
タイトル ──スペースキー/クリック──▶ メニュー ──ゲームスタート──▶ 難易度選択 ──難易度選択──▶ バトル
                                   │                                                            │
                                   └──せってい──▶ 設定                                          ▼
                                                                                 スコア表示（クリア/ゲームオーバー）
```

- シーンは `useAppStore.scene` が保持し、`App.tsx` が switch で描画を切り替える。
- シーン状態は永続化せず、起動時は常にタイトルから開始する。
- バトル終了（全5体撃破 = クリア、または主人公HP 0 = ゲームオーバー）の 1.5 秒後にスコア表示へ自動遷移する。

## 5. 状態管理（Zustand）

### useAppStore（アプリ全体・永続化対象）

| 状態 | 内容 |
|---|---|
| `scene` | 現在のシーン（永続化しない） |
| `jaStyle` | 「じゃ・じゅ・じょ」のガイド表記設定（`"ja"` / `"zya"`） |
| `bestTimes` | 難易度ごとのベストクリアタイム（秒） |

- `persist` ミドルウェアで localStorage（キー: `atos-battle-typing`）に保存。`partialize` で `jaStyle` と `bestTimes` のみ永続化する。

### useGameStore（バトル進行）

| 状態 | 内容 |
|---|---|
| `difficulty` / `heroHp` / `enemyIndex` / `enemyHp` | バトル基本状態 |
| `heroAttackSeq` / `enemyAttackSeq` | アニメーション発火用カウンタ（後述） |
| `inputLocked` | 敵交代・終了時の入力ロック |
| `wordKana` / `romajiTyped` / `romajiRemaining` | 出題単語と入力状況 |
| `enemyTimerRatio` | 敵の攻撃タイマー残量（0〜1、100ms毎更新） |
| `typedCount` / `missCount` / `startedAt` / `endedAt` / `cleared` | スコア集計用 |

## 6. タイピングエンジン（`src/lib/typingEngine.ts`）

React 非依存の純粋なクラス `RomajiTypingEngine` として実装。

### 判定アルゴリズム

1. **モーラ分解**: ひらがな文字列をモーラ（音拍）に分解する。小書き仮名（ゃゅょぁぃぅぇぉ）は直前の仮名と結合して拗音とする。「っ」「ん」は特殊単位として扱う。
2. **全パターン生成**: モーラ変換テーブル（`MORA_TABLE`）から、受理するローマ字全文の全組み合わせを生成する（訓令式/ヘボン式・拗音の別表記を含む）。先頭がガイド表示の標準表記。
3. **前置一致判定**: 入力済み文字列が「いずれかのパターンの接頭辞」なら正タイプ、どのパターンにも合致しなければミスタイプ。いずれかのパターンと完全一致した時点で単語完成。
4. **ガイド表示**: 入力済み文字列に合致する先頭パターンを採用し、残りを `remaining` として返す（例: 「し」に `s` と入力すると残りは `hi`）。

### 促音「っ」のルール

- 次のモーラの子音を重ねる表記（例: がっこう → `gakkou`）を生成する。この場合は次のモーラを消費する。
- `xtu` / `xtsu` / `ltu` / `ltsu` による直接入力も受理する（例: `gaxtukou`）。この場合は次のモーラを通常通り入力する。

### 「ん」のルール

- 後続が**母音・や行**の場合は `nn` / `xn` のみ受理（例: かんい → `kanni`。`kani` は「かに」と曖昧なため不可）。
- 後続が**な行**を含む子音の場合は `n` 1回でも受理（例: こんにちは → `konnitiha`。`n`+`ni`=`nni` で曖昧さがないため）。
- 語尾の「ん」は `n` 1回で完成とする（例: ぱん → `pan`）。

### 設定の注入

`jaStyle`（設定画面のローマ字揺れルール）をコンストラクタに注入する。「じゃ・じゅ・じょ」のバリアントの並び順が変わりガイドの標準表記が切り替わる（`jugyou` ↔ `zyugyou`）。**どちらの表記の入力も常に正解**となる（小学生向けのため寛容な判定）。

### テスト

`test-engine.ts` で以下を検証する（`npm test`）。

- 各種表記ゆれ・促音・ん の判定（全38項目）
- 出題単語リストの条件検証（ふつう = 5モーラ以内かつ清音のみ、むずかしい = 濁音/半濁音/拗音を含む、expert = 7モーラ以上、全単語が変換可能）

## 7. バトル進行ロジック（`src/hooks/useBattle.ts`）

バトル画面マウント時に起動するゲームループ。Zustand の `getState()` を介して状態を参照するため、イベントハンドラのクロージャが古い状態を掴む問題を回避している。

### キー入力

- `[a-z]` のみ受理（修飾キー付きは無視）。入力ロック中・終了後は無視。
- **正タイプ**: `heroAttacks` で敵にダメージ（難易度ごとの攻撃力 × 1文字）＋ `heroAttackSeq` 増加。敵HP 0 なら撃破フロー、単語完成なら次の単語を出題。
- **ミスタイプ**: `enemyAttacks` で敵が反撃（主人公が敵の攻撃力分のダメージ）＋タイマーリセット。

### 敵の攻撃タイマー

- 100ms 間隔の `setInterval` で残り時間を監視し、`enemyTimerRatio` を更新（UIのタイムプログレスバーに反映）。
- 時間切れで敵が攻撃し、タイマーをリセットする。入力ロック中は停止。

### 撃破・終了フロー

- 敵HP 0 → 入力ロック → 0.5 秒後に `advanceEnemy`（次の敵 or `cleared=true`）→ タイマーリセット・ロック解除・次単語出題。
- 全5体撃破 → ベストタイム記録 → 1.5 秒後にスコア表示へ。
- 主人公HP 0 → `endBattle(false)` → 1.5 秒後にスコア表示へ。クリアとゲームオーバーが同時に発生した場合はゲームオーバーを優先する。

### 出題ランクの解決（`wordTierFor`）

| 敵 | easy | normal | hard |
|---|---|---|---|
| スライム・ゴブリン・スケルトン | easy | normal | hard |
| ゴーレム・ドラゴン（一段高い問題） | normal | hard | expert（7モーラ以上） |

単語は `createWordBag` が生成する「袋」から重複なく取り出し、空になれば自動補充する。

## 8. バトル描画（PixiJS + GSAP）

### 構成

- **React 側（`scenes/Battle.tsx`）**: `createBattleStage(container)` で PixiJS キャンバスを生成し、Zustand の状態変化を `useEffect` で監視してステージのメソッドを呼ぶ（AGENT.md の「ステートを監視しイベントに応じてアニメーションを発火」方式）。
- **ステージ側（`pixi/core.ts`）**: `BattleStage` インタフェースを公開。

| トリガ（状態変化） | 呼び出し |
|---|---|
| マウント時 | `spawnEnemy`（最初の敵＋背景） |
| `enemyIndex` 変化 | `replaceEnemy`（旧敵の撃破演出＋新敵登場＋背景クロスフェード） |
| `cleared` | `clearCurrentEnemy`（最後の敵の撃破演出） |
| `heroAttackSeq` 増加 | `heroAttack`（主人公の突進＋斬撃エフェクト＋敵赤フラッシュ） |
| `enemyAttackSeq` 増加 | `enemyAttack`（敵の突進＋主人公赤フラッシュ＋振動） |
| `heroHp === 0` | `heroDefeated`（主人公が倒れる） |

### アニメーション（`pixi/animations.ts`）

コマ送り画像を使わず、1枚絵に対する GSAP Tween で表現する（ペーパーマリオ風）。

- **待機（呼吸）**: `scale.y` をゆっくり拡縮（Squash & Stretch、無限 yoyo）。アンカーを足下（0.5, 1）に設定しているため地面に立ったまま伸縮する。
- **攻撃**: X 方向へ素早く移動し少し回転して戻る。主人公攻撃時は斬撃エフェクト（回転・拡大・フェード）を敵に重ねる。連続タイプ時は前の Tween を `killTweensOf` で殺して即座に再再生する。
- **被ダメージ**: `tint` を一瞬赤くして元に戻す（Color Filter）＋左右に振動（Shake）。
- **撃破**: 回転しながら倒れてフェードアウト。登場は右からスライドイン。背景はクロスフェード。

### StrictMode 対策

React StrictMode（開発時）では effect が二重実行されるため、ステージ生成は `cancelled` フラグ付きの非同期処理とし、クリーンアップで `destroy()`（GSAP の全 Tween 停止 + `app.destroy`）を必ず行う。

## 9. マスターデータ

### 敵（`src/data/enemies.ts`）

| 敵 | HP | 攻撃間隔 | 攻撃力 | 背景 | 出題 |
|---|---|---|---|---|---|
| スライム | 60 | 6.0s | 5 | 森 | 選択難易度 |
| ゴブリン | 80 | 5.5s | 6 | 森 | 選択難易度 |
| スケルトン | 100 | 5.0s | 7 | 城内 | 選択難易度 |
| ゴーレム | 130 | 4.5s | 9 | 城内 | 一段高い問題 |
| ドラゴン | 160 | 4.0s | 12 | 城の上 | 一段高い問題 |

- 主人公 HP: 100 固定。
- 難易度パラメータ: 攻撃力（1正タイプあたりの敵へのダメージ） easy 15 / normal 8 / hard 6。攻撃間隔倍率 easy ×1.4 / normal ×1.15 / hard ×1.0。

### 単語（`src/data/words.ts`）

- `easy`: 清音45文字（1文字入力）
- `normal`: 5モーラ以内の日常文言48語（清音のみ）
- `hard`: 濁音・半濁音・拗音を含む単語40語
- `expert`: 7モーラ以上の単語15語（hard 時のゴーレム・ドラゴン専用）

## 10. グラフィックアセット

- `src/assets/images/*.svg`: 全て自作のフラットデザイン SVG（外部素材不使用・ライセンスフリー）。Vite の asset import 経由で PixiJS `Assets.load` に渡す。
- 幅・高さ属性を明示しており、PixiJS が適切な解像度でラスタライズする（キャラクター 240px、背景 960×540）。
- 背景グラデーションにはフォールバック色（`fill="url(#id) #rrggbb"`）を指定。

## 11. スコア集計

スコア表示画面で以下を表示する（`useGameStore` の集計値から算出）。

- **タイプしたもじのかず**: 正タイプのキー数（`typedCount`）
- **せいかくさ**: `typedCount / (typedCount + missCount) × 100`（小数1桁）
- **クリアまでのじかん**: `endedAt - startedAt`（秒。ゲームオーバー時は「たたかったじかん」）
- **ベストタイム**: クリア時のみ。難易度ごとに localStorage へ保存し、新記録時は「しんきろく！」を表示。
