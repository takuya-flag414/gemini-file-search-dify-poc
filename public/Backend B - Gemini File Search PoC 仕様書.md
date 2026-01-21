# Backend B - Gemini File Search PoC 仕様書

## 1. 概要
本ワークフロー「Backend B」は、社内AIチャットボットプロジェクトにおいて、Google Gemini APIの「File Search」機能（RAG）を操作するためのバックエンドAPIとして機能します。

Difyのワークフローとして実装されており、フロントエンドからのリクエストに応じて、ファイル検索ストアの管理、ファイルのアップロード、一覧取得、削除などの操作を一元的に処理します。

## 2. アーキテクチャ

### 2.1 処理フロー
1. **入力受付**: `action`（操作種別）と `payload`（詳細パラメータJSON）を受け取ります。
2. **Payload解析**: Pythonコード(Parse Payload)により、JSON文字列をパースし、各ツールが必要とする形式（`store_name`, `document_id` 等）に展開します。
    * **Feature**: 不正なJSON（シングルクォート混入）に対する簡易的な修復ロジックを搭載。
3. **条件分岐**: `action` の値に基づき、適切なGeminiツールを実行します。
4. **レスポンス整形**: Pythonコード(Format Response)により、各ツールの異なる出力形式を統一されたJSONフォーマット（リスト型）に変換して返却します。

### 2.2 共通インターフェース

#### 入力変数 (Startノード)

| 変数名 | タイプ | 必須 | 説明 |
| :--- | :--- | :---: | :--- |
| **action** | Select | Yes | 実行する操作 (`list_stores`, `list_files`, `upload_file`, `delete_file`) |
| **payload** | Paragraph | Yes | 操作に必要な詳細パラメータを含むJSON文字列。<br><br>**注意**: ダブルクォート `"` を使用した厳密なJSON形式であること。 |
| **file** | File | Optional | `upload_file` 実行時のみ使用。アップロードするファイル実体。 |

#### 出力変数 (Endノード)

| 変数名 | タイプ | 説明 |
| :--- | :--- | :--- |
| **result** | JSON String | 実行結果を含むJSON配列文字列。 |

## 3. Action別 実行ガイド

### 3.1 ストア一覧取得 (list_stores)
プロジェクト内のすべてのファイル検索ストアを一覧表示します。

- **Action**: `list_stores`
- **Payload**: 空のJSONオブジェクト `{}` で可。

**実行入力例:**
```json
{
  "inputs": {
    "action": "list_stores",
    "payload": "{}"
  }
}

```

**レスポンス例:**

```json
[
  {
    "storeName": "fileSearchStores/xxx-123",
    "displayName": "社内規定ストア",
    "createdAt": "2025-01-01T10:00:00Z"
  }
]

```

### 3.2 ファイル一覧取得 (list_files)

指定されたストア内のファイル一覧を取得します。

* **Action**: `list_files`
* **Payload**:
* `storeName` (必須): 対象のストアリソース名



**実行入力例:**

```json
{
  "inputs": {
    "action": "list_files",
    "payload": "{\n  \"storeName\": \"fileSearchStores/difyapimanual-xynjfcio42k7\"\n}"
  }
}

```

**レスポンス例:**

```json
[
  {
    "documentId": "documents/abc-123",
    "displayName": "要件定義書.pdf",
    "mimeType": "application/pdf",
    "state": "ACTIVE",
    "customMetadata": { "department": "dev" }
  }
]

```

### 3.3 ファイルアップロード (upload_file)

ファイルをアップロードし、ストアに登録します。Difyのファイルアップロード機能と併用します。

* **Action**: `upload_file`
* **Payload**:
* `storeName` (必須): アップロード先のストアリソース名
* `displayName` (必須): ファイルの表示名
* `customMetadata` (任意): 検索フィルタ用のメタデータ（JSON配列）


* **File**: Difyのアップロードフィールドにファイルをセットしてください。

**実行入力例:**

```json
{
  "inputs": {
    "action": "upload_file",
    "payload": "{\n  \"storeName\": \"fileSearchStores/difyapimanual-xynjfcio42k7\",\n  \"displayName\": \"新規設計書.pdf\",\n  \"customMetadata\": [{\"key\": \"category\", \"string_value\": \"design\"}]\n}",
    "file": { ... } // Dify上でファイルを選択
  }
}

```

### 3.4 ファイル削除 (delete_file)

指定されたファイルをストアから削除します。

* **Action**: `delete_file`
* **Payload**:
* `storeName` (必須): ストアのリソース名
* `documentId` (必須): 削除するドキュメントのリソース名（`documents/xxxx`）


* **重要**: `displayName` は含めないか、無視されます（エラー回避のためID指定を優先）。

**実行入力例:**

```json
{
  "inputs": {
    "action": "delete_file",
    "payload": "{\n  \"storeName\": \"fileSearchStores/difyapimanual-xynjfcio42k7\",\n  \"documentId\": \"documents/difyllmpdf-xv7h3mwsvtes\"\n}"
  }
}

```

**レスポンス例:**

```json
[
  {
    "success": true
  }
]

```

## 4. トラブルシューティング & 注意事項

### 4.1 JSONパースエラー

* **症状**: Format Response ノードまで到達せず、途中でエラーになる、または意図しないデフォルト値が使われる。
* **原因**: payload のJSONでシングルクォート `'` が使われている。
* **対策**: 必ずダブルクォート `"` を使用してください。
* ❌ `{'storeName': '...'}`
* ✅ `{"storeName": "..."}`



### 4.2 削除時のエラー (document_name must belong to...)

* **症状**: `delete_file` 実行時にエラーになる。
* **原因**: ツール設定で Document Name パラメータに「ファイルの表示名（例: manual.pdf）」を渡している。APIはここに「リソースパス」を期待するため不整合が起きる。
* **対策**: ワークフロー設定で Document Name 入力欄を空欄にし、Document ID のみで対象を指定するように構成済みです。

### 4.3 レスポンス型エラー (Result must be a dict...)

* **症状**: Format Response ノードで NoneType エラー。
* **原因**: Pythonコードの分岐漏れ。
* **対策**: Format Response ノードは、どの分岐に入っても必ず `{"result": [...]}` を返すように実装されています。

```

