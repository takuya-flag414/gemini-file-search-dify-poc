# 03. コンポーネントとデザイン (Components & Design)

本アプリケーションのUIコンポーネント構造とデザインシステムについて解説します。

## コンポーネント階層 (Architecture)

本アプリは **Atomic Design** をベースにしたディレクトリ構造を採用していますが、厳密なAtomic Designよりも実用性を重視した構成となっています。

### 主要な階層構造

```mermaid
graph TD
    App[App.tsx] --> Providers[Providers]
    Providers --> MainWindowLayout[MainWindowLayout (templates)]
    MainWindowLayout --> Sidebar[Sidebar (organisms)]
    MainWindowLayout --> RightPanel[RightPanelContent (organisms)]
    MainWindowLayout --> MainContent[Main Content Area]
    
    Sidebar --> KnowledgeStores[KnowledgeStoresSection (molecules)]
    Sidebar --> History[HistorySection (molecules)]
    Sidebar --> Settings[SettingsSection (molecules)]
    
    RightPanel --> ChatPanel[ChatPanel]
    RightPanel --> InspectorPanel[InspectorPanel]
    
    ChatPanel --> ChatTimeline[ChatTimeline]
    ChatPanel --> ChatInputArea[ChatInputArea]
    
    MainContent --> KnowledgeFinder[KnowledgeFinder (organisms)]
```

### コンポーネントの役割

*   **templates/MainWindowLayout**:
    *   3ペイン構成（Sidebar, Main, RightPanel）の骨格を提供。
    *   Framer Motion によるパネル開閉アニメーションを管理。
    *   背景（Wallpaper）の設定。

*   **organisms/Sidebar**:
    *   アプリケーションの主要ナビゲーション。
    *   「Sources (Knowledge Stores)」「Verification (History)」「System (Settings)」の3層構造。

*   **organisms/KnowledgeFinder**:
    *   macOS Finder風のファイルブラウザ。
    *   Grid View / List View の切り替え、ファイルのアップロード・削除機能。
    *   メタデータ（Company, Department, Filetype）によるフィルタリング機能。

*   **organisms/InspectorPanel**:
    *   開発・デバッグ用パネル。
    *   Dify APIとの通信ログを階層構造で表示。

## デザインシステム (Design System)

本アプリは **macOS Sequoia** および **Apple Intelligence** のデザイン言語を模倣しています。

### Liquid Glass Material
すりガラスのような質感を再現するために、以下のCSSクラス（`utility`）が定義されています。
*   `.glass-sidebar`: サイドバー用（濃いブラー）
*   `.glass-hud`: HUD/パネル用（明るいブラー、強い反射）
*   `.glass-header`: ヘッダー用（薄いブラー）

### Apple Intelligence Colors
AIの知性を表現するために、以下の4色によるグラデーション（Glowing Gradient）を使用します。
*   `ai-cyan` (#00FFFF)
*   `ai-magenta` (#FF00FF)
*   `ai-yellow` (#FFD60A)
*   `ai-blue` (#007AFF)

### Animation
**Framer Motion** を使用し、物理演算に基づいた「Spring (バネ)」アニメーションを一貫して適用しています。
*   **Stiffness**: 250 (キビキビとした動き)
*   **Damping**: 25 (自然な減衰)

### アイコン
**Lucide React** を使用していますが、線の太さ（Stroke Width）やサイズ感をSF Symbolsに合わせて調整しています。
