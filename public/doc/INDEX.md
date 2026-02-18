# Gemini File Search Dify PoC ドキュメント

本ドキュメント群は、AIエージェントおよび開発者が本プロジェクトの構造、機能、実装詳細を迅速に理解するために作成されました。
ソースコードを詳細に読み解く前に、まず本ドキュメントを一読することを推奨します。

## 目次

1.  **[01_STRUCTURE.md](./01_STRUCTURE.md)**
    *   プロジェクトのディレクトリ構造と主要ファイルの役割について解説します。
2.  **[02_FEATURES.md](./02_FEATURES.md)**
    *   チャット、ファイル管理、Inspector、Thinking Processなどの主要機能のロジックを解説します。
3.  **[03_COMPONENTS.md](./03_COMPONENTS.md)**
    *   UIコンポーネントの階層構造とデザインシステム（Liquid Glass, Apple Intelligence colors）について解説します。
4.  **[04_STATE_AND_HOOKS.md](./04_STATE_AND_HOOKS.md)**
    *   Global State (`AppContext`) や Custom Hooks (`useDifyStream` 等) の状態管理について解説します。
5.  **[05_API_AND_SERVICES.md](./05_API_AND_SERVICES.md)**
    *   APIクライアント、Mockシステム、型定義について解説します。
6.  **[06_DEVELOPMENT.md](./06_DEVELOPMENT.md)**
    *   環境構築、開発サーバーの起動、設定変更手順について解説します。

## プロジェクト概要

**Gemini File Search Dify PoC** は、Difyのワークフロー機能を活用したファイル検索・チャットアプリケーションのProof of Concept (PoC) です。
macOS SequoiaやApple Intelligenceのデザイン言語（Liquid Glass, Vibrant Colors）を取り入れたモダンなUIを特徴としています。

### 主な技術スタック
*   **Frontend Framework**: React 18+ (Vite)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS, CSS Variables
*   **Animation**: Framer Motion
*   **API Integration**: Dify API (Server-Sent Events)
