# Gemini File Search PoC アプリケーション要件定義書 (v1.1)

- **Project Code**: Desktop Intelligence / Phase 1-PoC
- **Date**: 2026-01-19
- **Author**: Lead Engineer & PM Partner
- **Target Platform**: Windows PC (Chrome/Edge) with macOS Sequoia Design System

---

## 1. はじめに

### 1.1 背景と目的
本プロジェクトでは、Google Geminiのエコシステムを活用した高度なファイル検索機能 (RAG) の実装を目指している。バックエンドにはDifyを採用し、`r3-yamauchi/gemini_file_search` プラグインを用いたワークフロー (`Alagent_Rag_poc_copy.yml`) を構築済みである。しかし、Dify標準のデバッグインターフェースでは、複雑な変数の組み合わせやファイルアップロードの挙動、およびストリーミング応答の詳細な解析が困難である。

### 1.2 ゴール
Dify APIを通じてGemini File Search ワークフローを検証するための、高機能かつ美しいカスタムフロントエンドアプリを開発する。本アプリは、単なるAPIクライアントにとどまらず、**「macOS Sequoia & Apple Intelligence」のデザインシステムをWindows ブラウザ上で完全再現するためのUI実装検証 (Technical Preview) も兼ねる。**

---

## 2. システム概要

### 2.1 アーキテクチャ
* **Frontend**: React (Vite), TypeScript
* **Styling**: Tailwind CSS (CSS Variablesによるセマンティックトークン管理)
* **Animation**: Framer Motion (Spring Physicsによる物理挙動)
* **State Management**: React Context + LocalStorage (永続化)
* **Backend**: Dify API (Cloud版)

### 2.2 デザインコンセプト
`DESIGN_RULE.md` に準拠し、Windows環境下で以下のmacOS体験を提供する。

* **Liquid Glass**: `backdrop-filter` を駆使した磨りガラスのようなマテリアル。
* **Apple Intelligence Glow**: Cyan, Magenta, Yellow, Blue の4色グラデーションによる動的な発光表現。
* **Immersive Window**: ブラウザの中に 「macOSアプリのウィンドウ」が存在するかのようなレイアウト。

---

## 3. 機能要件

### 3.1 Dify接続設定機能 (Settings)
ユーザーごとに異なる環境でテストできるよう、認証情報をローカルで管理する。

* **API Key管理**: DifyのAPIキーを入力・保存する (localStorage)。
* **Base URL設定**: Dify APIのエンドポイントを設定可能にする (デフォルト: `https://api.dify.ai/v1`)。
* **セキュリティ**: APIキーはブラウザのlocalStorageにのみ保存し、外部サーバーへは送信しない (Dify API リクエスト時を除く)。

### 3.2 動的パラメーター入力ウィザード (Input Wizard)
`Alagent_Rag_poc_copy.yml` の複雑な分岐ロジックを隠蔽し、ユーザーが選択した操作モード (`option`) に応じて必要な入力項目だけを段階的に表示するウィザード形式のUIを提供する。

**ウィザードの挙動:**
1.  **Mode Selection**: 最初に操作モード (`option`) を選択する。
2.  **Parameter Input**: 選択されたモードに必要なフィールドのみが、アニメーション (Framer Motion) と共に展開表示される。不要なフィールドはDOMから除外される。
3.  **Confirmation**: 入力完了後、実行ボタンがアクティブ化 (Glowエフェクト) される。

**モードと入力項目のマッピング:**

| 操作モード (option) | 必須入力項目 (Step 2) | 補足・API挙動 |
| :--- | :--- | :--- |
| **1. ファイル内を検索する** | `file_search_store_name`<br>`query` | ストアを指定して検索を実行。<br>`metadata filter` はAdvancedオプションとして隠す。 |
| **2. ファイルをアップロードする** | `file_search_store_name` | ファイルを選択し、メタデータを付与してアップロード。 |
| **3. ファイル検索ストアを作成する** | `file` (Upload)<br>`display_name`<br>`metadata` (Select) | ※内部で `/files/upload` を先行実行する。<br>新しいストアを作成するための表示名を入力。 |
| **4. ファイルを削除する** | `file_search_store_name`<br>`document_id` | 特定のドキュメントを削除。 |
| **5. ファイル検索ストアを削除する** | `file_search_store_name` | ストアごと削除 (危険な操作のため警告UI表示)。 |
| **6. ファイル検索ストアの一覧を表示する** | (入力不要) | 実行ボタンを押すのみ。 |
| **7. ストア内のファイルの一覧を表示する** | `file_search_store_name` | 特定ストア内の全ファイルリストを取得。 |

**ファイルアップロードウィザード詳細:**
* ドラッグ&ドロップエリアを表示。
* ファイルドロップ後、即座にMIMEタイプ判定ロジック (`.md` → `text/plain` 変換) を実行。
* アップロード成功後、`upload_file_id` が内部ステートに保存され、メタデータ入力フォームへ遷移する。

### 3.3 チャット & ストリーミング実行機能 (Execution)
* **実行ボタン**: Apple Intelligence風の 「Glowing Button」で実装。
* **ストリーミング通信**: SSE (Server-Sent Events) を利用し、AIの回答を逐次表示する。
* **思考ログ表示**: Difyの `workflow_started`, `node_started`, `node_finished` 等のイベントを解析し、処理のステップを表示する (Inspector Panelにて)。

### 3.4 デバッグログ & レポート出力機能 (Inspector & Export)
検証結果をエビデンスとして残すための機能。

**リアルタイムログ (Inspector Panel):**
* **Request**: 送信したJSONボディ (特に `inputs` の内容)。
* **Response**: 受信した生のSSEイベントデータ。
* **Token Usage**: トークン消費量と実行時間。

**Markdownレポート出力:**
* ボタン一つで、一連の対話ログとデバッグ情報をMarkdown形式 (`.md`) でダウンロード可能にする。
* **出力フォーマット例:**

```markdown
# Verification Report: [Timestamp]

## Request Parameters
Option: ファイル内を検索する
Store Name: [Store Name]

## API Log
Status: 200 OK
Latency: 1.2s

## AI Response
(回答内容)

```

---

## 4. UI/UX詳細設計 (DESIGN_RULE.md 準拠)

### 4.1 レイアウト構成 (3-Pane Window)

画面全体を一つの「アプリケーションウィンドウ」としてデザインする。

1. **Sidebar (Left / 260px):**
* **マテリアル**: `mat-sidebar` (Vibrancy効果)。
* **内容**: 設定 (API Key)、履歴リスト (Local History)。


2. **Main Content (Center / Fluid):**
* **マテリアル**: `sys-bg-base` (白/黒)。
* **内容**: パラメータ入力ウィザード、チャットタイムライン。
* ウィザードは「カード」として中央に配置され、実行後は上部へ縮小移動し、下にチャットエリアが広がるレイアウト遷移を行う。


3. **Inspector Panel (Right / 320px):**
* **マテリアル**: `mat-hud` (高い透明度とブラー)。
* **内容**: デバッグログ、JSONビューア。
* **Apple Intelligence Feature**: 解析中はパネルの縁が `conic-gradient` で発光する。



### 4.2 インタラクション (Physics)

* **Framer Motion**: すべてのパネル開閉、リスト表示に `type: "spring", stiffness: 250, damping: 25` を適用。
* **Hover Effects**: ボタンやリストアイテムのホバー時は、即座に反応するのではなく、物理的な「押し込み」や「光の追従」を感じさせる演出を入れる。

---

## 5. データ要件

### 5.1 LocalStorage Schema

アプリの状態をブラウザに保存するためのスキーマ定義。

```typescript
interface AppState {
  config: {
    difyApiKey: string;
    difyBaseUrl: string;
    userName: string; // "poc-user-01" etc.
  };
  history: {
    id: string;
    timestamp: number;
    inputs: Record<string, any>;
    response: string;
    logs: LogEntry[]; // デバッグログ
  }[];
}

```

---

## 6. API連携仕様

### 6.1 ファイルアップロード

* **Endpoint**: `POST /files/upload`
* **Logic**:
1. ユーザーがファイル選択。
2. 拡張子が `.md` の場合、File オブジェクトを再生成し `type: 'text/plain'` に書き換え (Transparent File Mutation)。
3. FormDataで送信。
4. レスポンスの `id` を取得し、チャットリクエストの `inputs.file` にセットする。



### 6.2 ワークフロー実行 (Chat Message)

* **Endpoint**: `POST /chat-messages`
* **Headers**: `Authorization: Bearer <API_KEY>`
* **Body**:

```json
{
  "inputs": {
    "option": "...",
    "file_search_store_name": "...",
    "file": {
      "type": "document",
      "transfer_method": "local_file",
      "upload_file_id": "<UPLOAD_FILE_ID>"
    }
  },
  "query": "...",
  "response_mode": "streaming",
  "user": "poc-verifier",
  "conversation_id": ""
}

```

**Stream Handling:**

* `event: message`: 回答の追記。
* `event: workflow_started`, `node_started`: Inspectorへのログ出力。
* `event: message_end`: メタデータ (Retriever Resources) の解析と表示。

---

## 7. 開発・検証ステップ

1. **Step 1: UI Skeleton Build**
* macOS Window Layoutの実装、Animation設定。


2. **Step 2: API Connector Implementation**
* Dify Clientの実装、API Key保存機能。


3. **Step 3: Logic Implementation**
* ファイルアップロード (MIME偽装含む)、ストリーミング受信。


4. **Step 4: Debugger & Export**
* ログ収集、Markdown出力機能の実装。



```

