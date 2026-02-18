# 04. 状態管理とHooks (State & Hooks)

アプリケーションの状態管理と、主要なカスタムフックについて解説します。

## Global State (`src/context/`)

アプリケーション全体で共有すべき状態は React Context で管理されています。

### 1. AppContext (`AppContext.tsx`)
アプリの基盤となる設定やUI状態を管理します。

#### 管理する主なState
*   **Config**: APIキー、Base URL、ユーザー名、Mockモードの有効/無効
*   **Theme**: ダークモード/ライトモード (`isDarkMode`)
*   **UI State**: 右サイドパネルの開閉状態 (`isRightPanelOpen`, `isRightPanelExpanded`)
*   **Session**: 現在の会話ID (`sessionConversationId`)
*   **History**: チャット履歴 (`history`)

#### 提供する主なAction
*   `updateConfig(newConfig)`: 設定の更新（LocalStorageにも保存）
*   `toggleRightPanel()`: パネルの開閉
*   `addHistoryEntry(entry)`: 履歴の追加
*   `clearHistory()`: 履歴の消去

### 2. WorkflowLogContext (`WorkflowLogContext.tsx`)
Dify APIとの通信ログ、およびアプリ内部の動作ログを集約します。
`InspectorPanel` で表示されるデータはここから供給されます。

## Custom Hooks (`src/hooks/`)

ロジックを再利用可能な形で切り出しています。

### 1. `useDifyStream`
チャット機能の核心です。
*   **役割**: Dify APIへのリクエスト送信とSSEレスポンスのハンドリング。
*   **State**: `messages` (チャットログ), `isProcessing` (処理中フラグ), `thinkingSteps` (思考プロセス)。
*   **特徴**: `MockApiClient` と `DifyApiClient` を設定 (`config.mockMode`) に応じて自動的に切り替えるロジックはここにはなく、`config` を参照してどちらのクライアントを生成するか決定します（現状の実装では `DifyApiClient` 内でMock判定を行っている箇所があります）。

### 2. `useGeminiFileSystem`
ファイル操作に関するロジックを集約しています。
*   **役割**: ストア一覧の取得、ファイルのアップロード・削除。
*   **State**: `stores`, `currentStore`, `files`。
*   **特徴**: `MockFileSystem` と `DifyWorkflowClient` の切り替えをこのフック内で吸収しており、コンポーネント側はバックエンドの違いを意識する必要がありません。

### 3. `useUploadGallery` (想定)
ファイルアップロードモーダル (`UploadGallery`) の状態とロジックを管理する可能性があります（現状は `App.tsx` 内で一部管理）。
