# 06. 開発ガイド (Development)

開発環境の構築と運用手順について解説します。

## 環境構築

### 必要要件
*   Node.js v18 以上
*   npm 9 以上

### セットアップ
プロジェクトの依存関係をインストールします。

```bash
npm install
```

## 開発サーバーの起動

Viteの開発サーバーを起動します。

```bash
npm run dev
```
起動後、ブラウザで `http://localhost:5173` にアクセスしてください。

## 設定 (Configuration)

### API接続設定
アプリケーション起動後、画面左下の「Settings」パネル（または初回起動時のウィザード）から設定可能です。
*   **API Key**: Difyの「APIアクセス」から取得したAPIキーを入力。
*   **Base URL**: DifyのAPIエンドポイント（例: `https://api.dify.ai/v1`）。

### Mockモード
APIキーを持っていない場合や、UIの動作確認を行いたい場合は「Mock Mode」を使用します。
Settingsパネルの「Mock Mode」トグルをONにすると、内部のモックデータを使用して動作します。

### 環境変数 (.env)
ビルド時の設定などは `.env` ファイルで管理します（必要に応じて作成してください）。

```bash
VITE_APP_TITLE=Gemini File Search PoC
```

## ビルドとデプロイ

プロダクション向けのビルドを行います。

```bash
npm run build
```
`dist/` ディレクトリに静的ファイルが出力されます。これを任意のWebサーバー（Vercel, Netlify, S3等）にデプロイしてください。

## ディレクトリ構成のルール

新規にコンポーネントを作成する場合は、以下のルールに従って配置してください。

*   **atoms**: 状態を持たない最小単位（ボタン、バッジ）
*   **molecules**: atomsを組み合わせた、特定の機能を持つ単位（検索ボックス、カード）
*   **organisms**: 独立して成立するUIブロック（サイドバー、チャットパネル）
*   **templates**: ページ全体のレイアウト
