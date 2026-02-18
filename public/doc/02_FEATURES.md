# 02. 主要機能とロジック (Features)

本アプリケーションの主要機能の仕組みについて解説します。

## 1. チャット機能

チャット機能は Dify API のストリーミングレスポンス (Server-Sent Events) を利用して実装されています。

### 関連ファイル
*   `src/hooks/useDifyStream.ts`: コアロジック
*   `src/services/DifyApiClient.ts`: APIクライアント
*   `src/components/organisms/ChatPanel.tsx`: UIコンテナー
*   `src/components/organisms/ChatTimeline.tsx`: メッセージ表示

### 処理フロー
1.  ユーザーがメッセージを入力し、送信ボタンを押す。
2.  `useDifyStream` の `sendMessage` 関数が呼び出される。
3.  `DifyApiClient` を通じて API にリクエストを送信。
4.  SSEイベント (`message`, `node_started`, `node_finished`, `message_end`) を受信し、リアルタイムで `messages` および `thinkingSteps` ステートを更新する。
5.  `ChatTimeline` がステートの変更を検知し、メッセージや思考プロセスを描画する。

## 2. ファイル管理システム (Gemini File System)

本アプリは、擬似的なファイルシステムを持ち、Difyのナレッジベース（Knowledge Store）と連携します。

### 関連ファイル
*   `src/hooks/useGeminiFileSystem.ts`: コアロジック
*   `src/components/organisms/KnowledgeFinder.tsx`: ファイルブラウザUI
*   `src/services/MockFileSystem.ts`: モック実装

### 機能概要
*   **Store (Knowledge Store)**: フォルダに相当する概念。Dify上では独立したナレッジベースとして扱われます。
*   **File (StoredFile)**: アップロードされたドキュメント。
*   **Mock Mode**: `config.mockMode` が有効な場合、`MockFileSystem` が使用され、ブラウザのメモリ上で動作します。APIキーなしでもUIの確認が可能です。

## 3. インスペクター (Inspector)

通信ログやデバッグ情報を表示するためのパネルです。

### 関連ファイル
*   `src/components/organisms/InspectorPanel.tsx`: UI実装
*   `src/context/WorkflowLogContext.tsx`: ログデータの集約

### 特徴
*   **階層表示**: ログをバックエンド別（Backend A: Chat, Backend B: Workflow）やワークフロー実行単位でグルーピングして表示します。
*   **JSON Viewer**: 生のJSONペイロードを展開して確認できます。
*   **Copy YAML**: ログ全体をYAML形式でクリップボードにコピー可能です。

## 4. Thinking Process (思考プロセス)

AIが回答を生成するまでの「思考の過程」を可視化します。

### 実装詳細
Dify APIから `node_started` イベントが送られてくると、そのノード名（例：「検索中」「生成中」）が `thinkingSteps` 配列に追加されます。
`ChatTimeline.tsx` はこの配列を参照し、ローディングインジケータと共にステップを表示します。回答が完了すると配列はクリアされます。

```typescript
// src/hooks/useDifyStream.ts (概念コード)
case 'node_started':
    setThinkingSteps(prev => [...prev, event.data.title]);
    break;
```

```tsx
// src/components/organisms/ChatTimeline.tsx (表示ロジック)
{thinkingSteps.length > 0 && (
    <div className="thinking-container">
        <Loader />
        {thinkingSteps.map(step => <div>{step}</div>)}
    </div>
)}
```
