# 01. プロジェクト構造 (Structure)

本プロジェクトのディレクトリ構造と、重要なファイルの役割について解説します。

## ディレクトリ構造 (`src/`)

```text
src/
├── assets/             # 静的リソース（画像、アイコン等）
├── components/         # UIコンポーネント（Atomic Design準拠）
│   ├── atoms/          # 最小単位のコンポーネント（Button, Badge, Icon等）
│   ├── molecules/      # atomsを組み合わせた要素（FormField, FileCard等）
│   ├── organisms/      # 独立した機能を持つブロック（Sidebar, ChatPanel等）
│   └── templates/      # ページレイアウト（MainWindowLayout）
├── config/             # アプリケーション設定（FeatureFlags等）
├── context/            # React Context（Global State）
│   ├── AppContext.tsx  # アプリ全体の状態（設定、テーマ、パネル開閉）
│   ├── ToastContext.tsx # トースト通知
│   └── WorkflowLogContext.tsx # ログ収集
├── hooks/              # Custom Hooks
│   ├── useDifyStream.ts # Dify APIとのストリーミング通信
│   ├── useGeminiFileSystem.ts # ファイルシステム操作
│   └── ...
├── services/           # APIクライアント・ビジネスロジック
│   ├── DifyApiClient.ts    # Chat APIクライアント
│   ├── DifyWorkflowClient.ts # Workflow APIクライアント
│   ├── MockFileSystem.ts   # Mockモード用ファイルシステム
│   └── ...
├── types/              # TypeScript型定義
│   └── index.ts        # 共通型定義（LogEntry, ChatMessage等）
└── utils/              # ユーティリティ関数
    └── fileConversion.ts # ファイル変換ロジック
```

## エントリーポイント

### `src/main.tsx`
Reactアプリケーションのエントリーポイントです。`ReactDOM.createRoot` を使用して `App` コンポーネントをDOMにマウントします。また、グローバルなスタイルシート（`index.css`）の読み込みもここで行われます。

### `src/App.tsx`
アプリケーションのルートコンポーネントです。主要なプロバイダーの設定と、レイアウトコンポーネントの呼び出しを行います。
*   **Provider**: `AppProvider`, `ToastProvider`, `WorkflowLogProvider`
*   **Hooks**: `useDifyStream` (チャット), `useGeminiFileSystem` (ファイル管理)
*   **Layout**: `MainWindowLayout`

## 設定

### `src/config/featureFlags.ts`
アプリケーションのFeature Flagや定数を定義します。
*   `IS_THINKING_PROCESS_MERGED`: 思考プロセスをチャット内にマージして表示するかどうかのフラグなどを管理。

### `src/config/index.ts` (想定)
環境変数の読み込みやデフォルト設定を行います。

## 特記事項: Thinking Processの実装場所

AIの思考プロセス（Thinking Process）を表示するロジックは、アーキテクチャ上の決定により**独立したコンポーネントとしては存在しません**。
以下のファイルに分散して実装されています。

1.  **データ受信**: `src/hooks/useDifyStream.ts` (`node_started`, `node_finished` イベントのハンドリングと `thinkingSteps` stateの更新)
2.  **表示**: `src/components/organisms/ChatTimeline.tsx` (`thinkingSteps` プロパティを受け取り、`MessageBlock` の前にレンダリング)

この設計は、チャットのタイムラインと密接に連携させるためのものです。
