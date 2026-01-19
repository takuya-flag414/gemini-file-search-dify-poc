# Gemini File Search PoC 基本設計書 (v1.0)

[cite_start]**Project Code:** Desktop Intelligence / Phase 1-PoC [cite: 1, 2]
[cite_start]**Date:** 2026-01-19 [cite: 3]
[cite_start]**Reference:** Gemini File Search PoC アプリケーション要件定義書(v1.1) [cite: 4]

---

## [cite_start]1. はじめに [cite: 5]

### 1.1 目的
[cite_start]本ドキュメントは、要件定義書に基づき、Difyワークフロー検証用アプリケーションの**外部設計(UI/UX、データ構造、API連携)**を定義する [cite: 7][cite_start]。開発チーム (フロントエンドエンジニア)は本ドキュメントを参照し、実装を行う [cite: 7]。

### [cite_start]1.2 設計方針 [cite: 8]
* [cite_start]**macOS Native Like:** Web技術(React/CSS)を用いつつ、macOS Sequoiaの挙動と質感を徹底的に模倣する [cite: 9]。
* [cite_start]**Client-Side Centric:** サーバーサイド (Backend for Frontend) を持たず、ブラウザから直接Dify APIと通信するアーキテクチャとする [cite: 10]。
* [cite_start]**Type Safety:** TypeScriptを用いた厳格な型定義を行い、保守性を担保する [cite: 11]。

---

## [cite_start]2. システム構成 [cite: 12]

### [cite_start]2.1 技術スタック [cite: 13]

| Category | Technology | Version / Note |
| :--- | :--- | :--- |
| **Framework** | [cite_start]React | v18.3+ (Vite) [cite: 14] |
| **Language** | [cite_start]TypeScript | v5.0+ [cite: 14] |
| **Styling** | [cite_start]Tailwind CSS | v3.4+ [cite: 14] |
| **Animation** | [cite_start]Framer Motion | v11.0+ (Spring Physics) [cite: 14] |
| **Icons** | Lucide React | [cite_start]SF Symbolsの代替として使用 [cite: 14] |
| **Markdown** | [cite_start]React Markdown | remark-gfm 対応 [cite: 14] |
| **Syntax Highlighting** | Prism.js / React Syntax Highlighter | [cite_start]JSON/Code表示用 [cite: 14] |

### [cite_start]2.2 コンポーネント構造 (Atomic Design Base) [cite: 15]

[cite_start]**ディレクトリ: `src/`** [cite: 16]

| Directory | Sub-directory | Components / Description |
| :--- | :--- | :--- |
| **components/** | `atoms/` | [cite_start]Button (Glowing), Input, Badge [cite: 17] |
| | `molecules/` | [cite_start]FormField, LogItem, FileDropZone [cite: 17] |
| | `organisms/` | [cite_start]Sidebar, ChatTimeline, WizardCard, Inspector Panel [cite: 17] |
| | `templates/` | [cite_start]MainWindowLayout (3-Pane) [cite: 17] |
| **hooks/** | [cite_start]| useDifyStream, useFileUpload, useAppConfig [cite: 17] |
| **context/** | | [cite_start]AppContext (Global State) [cite: 17] |
| **services/** | | [cite_start]DifyApiClient, FileMutationService [cite: 17] |
| **types/** | | [cite_start]DifyTypes, ConfigTypes [cite: 17] |

---

## [cite_start]3. 機能設計詳細 [cite: 18]

### [cite_start]3.1 Dify接続設定 (Settings) [cite: 19]
* [cite_start]**概要:** アプリケーション利用に必要な認証情報を管理する [cite: 20]。
* [cite_start]**永続化:** `localStorage` キー: `dify_app_config_v1` [cite: 21]
* [cite_start]**バリデーション:** API Keyは `app-` で始まる文字列であることを簡易チェックする [cite: 22]。

### [cite_start]3.2 動的パラメーター入力ウィザード (Contextual Wizard) [cite: 23]

[cite_start]**状態遷移設計:** [cite: 24]
1.  [cite_start]**Idle:** モード未選択状態 [cite: 25]。
2.  [cite_start]**Mode Selected:** `option` 選択済み。関連フィールドがマウントされる [cite: 26]。
3.  [cite_start]**Uploading (Optional):** ファイルアップロード中 (プログレス表示) [cite: 27]。
4.  [cite_start]**Ready:** 全必須項目入力済み。実行ボタンが Glow 状態になる [cite: 28]。
5.  [cite_start]**Running:** ストリーミング中。入力フォームはロックされる [cite: 29]。

[cite_start]**UIコンポーネント挙動:** [cite: 30]
* [cite_start]`option` の変更をトリガーに、AnimatePresence (Framer Motion) を用いて入力フィールドを入れ替える [cite: 31]。
* [cite_start]フォームの高さ変更は `layout` propを用いて滑らかにアニメーションさせる [cite: 32]。

### [cite_start]3.3 透過的ファイル変異 (Transparent File Mutation) [cite: 33]
[cite_start]**概要:** `.md` ファイルをDify APIが受け入れ可能な形式に変換する [cite: 34]。

[cite_start]**処理フロー:** [cite: 35]
1.  [cite_start]`<input type="file">` またはドロップゾーンで File オブジェクトを取得 [cite: 36]。
2.  [cite_start]**拡張子チェック:** ファイル名がRegex `/\.md$/` にマッチするか確認 [cite: 37]。
3.  [cite_start]**変異処理 (Mutation):** [cite: 38]
    * [cite_start]**マッチする場合:** 新しい Blob を作成し、MIMEタイプを `text/plain` に強制設定。ファイル名の末尾を `.txt` に置換 [cite: 39]。
    * [cite_start]**マッチしない場合:** そのまま通過 [cite: 40]。
4.  [cite_start]**API送信:** 変異後のファイルを FormData に格納して送信 [cite: 41]。

### [cite_start]3.4 チャット & ストリーミング実行 (Execution) [cite: 42]

[cite_start]**SSE (Server-Sent Events) ハンドリング:** [cite: 43]
* [cite_start]`fetch` APIと `ReadableStream` を使用してチャンクを読み込む [cite: 44]。
* [cite_start]**イベントパーサー:** 文字列バッファリングを行い、`event: ... \n data: ...` の形式をパースする [cite: 45]。

[cite_start]**主要イベント処理:** [cite: 46]

| Event Name | Action |
| :--- | :--- |
| `workflow_started` | [cite_start]Inspectorに「Workflow Started」ログを追加 [cite: 46, 47]。 |
| `node_started` | [cite_start]実行中のノード名をチャットUIに「Thinking...」として表示 [cite: 47, 48]。 |
| `message` | [cite_start]AI回答バッファにテキストを追記し、Markdown レンダラーを更新 [cite: 48]。 |
| `message_end` | [cite_start]`retriever_resources` (出典)を解析し、脚注リストを生成 [cite: 48]。 |
| `node_finished` | [cite_start]Inspectorにノード実行結果 (Token usage等) を記録 [cite: 48]。 |

### [cite_start]3.5 デバッグログ & レポート (Inspector) [cite: 49]
* [cite_start]**データ構造:** チャットセッションごとに `LogEntry[]` を保持 [cite: 50]。
* [cite_start]**JSON Viewer:** 受信した生のJSONペイロードは、折りたたみ可能なツリー形式で表示する [cite: 51]。
* [cite_start]**Export:** 現在のセッションの全ログをMarkdown形式に整形し、Blob を生成してダウンロードさせる [cite: 52]。

---

## [cite_start]4. UI/UX デザイン仕様 [cite: 53]

### [cite_start]4.1 カラーシステム (Apple Intelligence Palette) [cite: 54]
[cite_start]`tailwind.config.js` に以下のセマンティックトークンを定義する [cite: 55]。

```javascript
colors: {
  sys: {
    bg: {
      [cite_start]base: 'var(--sys-bg-base)', // #FFFFFF / #1E1E1E [cite: 59, 60]
      [cite_start]alt: 'var(--sys-bg-alt)',   // #F5F5F7 / #000000 [cite: 61, 62]
    },
    glass: {
      [cite_start]sidebar: 'var(--mat-sidebar)', // rgba(245,245,247, 0.6) + blur [cite: 66, 67]
      [cite_start]hud: 'var(--mat-hud)',         // rgba(255,255,255, 0.75) + blur [cite: 66, 68]
    }
  },
  ai: {
    [cite_start]cyan: '#00FFFF',   // [cite: 71]
    [cite_start]magenta: '#FF00FF',// [cite: 72]
    [cite_start]yellow: '#FFD60A', // [cite: 73]
    [cite_start]blue: '#007AFF',   // [cite: 74]
  }
}

```

4.2 レイアウト & 寸法 

* 
**Window Radius:** 20px (macOS Sequoia style) 


* 
**Sidebar Width:** 260px (Fixed) 


* 
**Inspector Width:** 320px (Resizable or Fixed) 


* 
**Traffic Lights:** 左上 padding: 18px の位置に配置 (装飾のみ) 。



4.3 アニメーション (Motion Physics) 

* 
**Spring Config:** `{ stiffness: 250, damping: 25 }` 


* 
**Transitions:** 


* ウィザードのステップ遷移 


* チャットメッセージの出現 


* Inspectorパネルの開閉 





---

5. データ設計 

5.1 型定義 (TypeScript Interfaces) 

```typescript
[cite_start]// アプリ設定 [cite: 90]
export interface AppConfig {
  apiKey: string;
  baseUrl: string;
}

[cite_start]// ログエントリー [cite: 95, 96]
export interface LogEntry {
  id: string;
  timestamp: number;
  type: 'request' | 'response' | 'system' | 'error';
  title: string;
  data: any; // JSON payload
}

[cite_start]// チャットメッセージ [cite: 103, 104]
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  timestamp: number;
  isStreaming?: boolean;
}

[cite_start]// Dify API Request Payload (Inputs) [cite: 112, 113]
export interface WorkflowInputs {
  option: string;
  file_search_store_name?: string;
  display_name?: string;
  document_id?: string;
  file?: {
    type: 'document';
    transfer_method: 'local_file' | 'remote_url';
    upload_file_id?: string;
  };
  metadata_company?: string;
  metadata_department?: string;
  metadata_filetype?: string;
  // ...others
}

```

---

6. API インターフェース仕様 

6.1 POST /files/upload 

* 
**Request:** `Multipart/form-data` 


* 
`file`: File Object (Mutated) 


* 
`user`: User ID (const `poc-verifier`) 




* 
**Response:** 


```json
{ "id": "upload_file_id_xxx", "name": "...", ...}

```



6.2 POST /chat-messages 

* 
**Request:** `application/json` 


* 
`inputs`: WorkflowInputs 


* 
`query`: ユーザー入力クエリ (option によっては固定値) 


* 
`response_mode`: "streaming" 


* 
`user`: User ID 




* 
**Response:** `text/event-stream` 



---

7. セキュリティ & 制約事項 

* 
**CORS:** Dify Cloud版 APIはCORSを許可しているが、ローカル開発環境(localhost)からのアクセスで問題が発生する場合、Viteの `server.proxy` 設定にて回避する 。


* 
**API Key:** ブラウザの `localStorage` 以外の場所には保存・送信しない。ログエクスポート時も、ヘッダー情報はマスク処理を行ってから出力する 。



```

