# 05. APIとサービス (API & Services)

外部サービスとの通信層およびデータモデルについて解説します。

## API Clients (`src/services/`)

本アプリケーションは、**Browser-to-Server** (Client-side Centric) アーキテクチャを採用しており、BFF (Backend for Frontend) を介さずにブラウザから直接 Dify API にアクセスします。

### 1. DifyApiClient (`DifyApiClient.ts`)
チャットおよびワークフロー実行のためのクライアントです。

*   **Endpoint**: `/v1/chat-messages` (Chatflow) / `/v1/workflows/run` (Workflow)
*   **Authentication**: Bearer Token (`Authorization: Bearer <API_KEY>`)
*   **Streaming**: `fetch` API と `ReadableStream` を使用して SSE (Server-Sent Events) をパースします。
*   **Mock Support**: `config.mockMode` が true の場合、内部で `MockApiClient` のメソッドを呼び出すように設計されています（※実装状況により異なる場合があります）。

### 2. DifyWorkflowClient (`DifyWorkflowClient.ts`)
ナレッジベース（Knowledge Store）の操作を行うためのクライアントです。
Difyの標準APIにはファイルシステム操作の概念がないため、これはGemini File System PoC独自の拡張（またはDifyのDataset APIのラッパー）として機能します。

### 3. MockFileSystem (`MockFileSystem.ts`)
`useGeminiFileSystem` で使用されるインメモリのファイルシステムです。
*   **データ構造**: `FileSearchStore` (フォルダ) と `StoredFile` (ファイル) のリストをメモリ上に保持。
*   **遅延エミュレーション**: `delay()` 関数により、擬似的なネットワークレイテンシ（500ms〜1500ms）を再現しています。

## Types (`src/types/index.ts`)

アプリケーション全体で使用される主要な型定義です。

### Chat & Log
*   **`ChatMessage`**: チャットメッセージ。`role` ('user' | 'assistant'), `content`, `isStreaming` 等のプロパティを持ちます。
*   **`LogEntry`**: Inspectorで表示するためのログデータ。
    *   `id`: UUID
    *   `timestamp`: ISO文字列
    *   `backendId`: 'backend-a' (Chat) | 'backend-b' (Workflow)
    *   `type`: 'request' | 'response' | 'error' | 'info'
    *   `payload`: 任意のアクションデータ

### File System
*   **`FileSearchStore`**: ナレッジストア（フォルダ）。`id`, `name`, `description`。
*   **`StoredFile`**: 保存されたファイル。`id`, `name`, `size`, `type`, `metadata` (Company, Department等)。

### Configuration
*   **`AppConfig`**: アプリケーション設定。
    *   `apiKey`: Dify Chat API Key
    *   `workflowApiKey`: Dify Workflow API Key (Knowledge用)
    *   `baseUrl`: Dify API Base URL
    *   `mockMode`: Mockモード有効化フラグ
