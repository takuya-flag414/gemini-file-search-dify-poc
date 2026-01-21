/**
 * Mock Response Templates for File Search Operations
 * Each operation mode has corresponding mock SSE events and responses
 */

import type { OperationMode, Citation } from '../types';

// ============================================
// Delay Helper
// ============================================

export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// ID Generation Helpers
// ============================================

function generateMockId(): string {
    return `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateMockStoreId(): string {
    return `fileSearchStores/${generateMockId()}`;
}

function generateMockDocumentId(): string {
    return `documents/${generateMockId()}`;
}

// ============================================
// Mock Node Definitions by Operation Mode
// ============================================

interface MockNode {
    id: string;
    node_id: string;
    node_type: string;
    title: string;
    index: number;
}

const MOCK_NODES: Record<OperationMode, MockNode[]> = {
    'ファイル内を検索する': [
        { id: 'n1', node_id: '1766730025729', node_type: 'tool', title: 'ファイル検索ストアを指定して検索', index: 2 },
    ],
    'ファイルをアップロードする？': [
        { id: 'n1', node_id: '1768533032079', node_type: 'if-else', title: 'ファイルチェック', index: 2 },
        { id: 'n2', node_id: '1768533280265', node_type: 'tool', title: 'ファイルアップロード', index: 3 },
        { id: 'n3', node_id: '1767931818139', node_type: 'tool', title: '結果表示', index: 4 },
    ],
    'ファイル検索ストアを作成する？': [
        { id: 'n1', node_id: '1766728093931', node_type: 'tool', title: 'ファイル検索ストア作成', index: 2 },
        { id: 'n2', node_id: '1767931792292', node_type: 'tool', title: '結果表示', index: 3 },
    ],
    'ファイルを削除する？': [
        { id: 'n1', node_id: '1767932425633', node_type: 'tool', title: 'ファイル取得', index: 2 },
        { id: 'n2', node_id: '1767932557151', node_type: 'tool', title: 'ファイル削除', index: 3 },
    ],
    'ファイル検索ストアを削除する？': [
        { id: 'n1', node_id: '1767932648362', node_type: 'tool', title: 'ストア取得', index: 2 },
        { id: 'n2', node_id: '1767932663680', node_type: 'tool', title: 'ストア削除', index: 3 },
    ],
    'ファイル検索ストアの一覧を表示する？': [
        { id: 'n1', node_id: '1767933198834', node_type: 'tool', title: 'ストア一覧取得', index: 2 },
    ],
    'ストア内のファイルの一覧を表示する？': [
        { id: 'n1', node_id: '1767933183297', node_type: 'tool', title: 'ファイル一覧取得', index: 2 },
        { id: 'n2', node_id: '1768536588293', node_type: 'code', title: '結果整形', index: 3 },
    ],
};

// ============================================
// Mock Response Templates
// ============================================

interface MockResponseContext {
    storeName?: string;
    displayName?: string;
    documentId?: string;
    query?: string;
}

function getSearchResponse(ctx: MockResponseContext): string {
    return `## 検索結果

ご質問の「${ctx.query || '検索クエリ'}」について、以下の情報が見つかりました。

### 回答

🧪 **[モックモード]** これはテンプレート回答です。

実際のAPIに接続すると、ファイル検索ストア \`${ctx.storeName || 'fileSearchStores/xxx'}\` 内のドキュメントから関連情報を取得し、AI生成による回答が表示されます。

Gemini File Searchは以下の機能を提供します：
- **セマンティック検索**: 意味に基づいた高精度な検索
- **自動チャンキング**: ドキュメントを最適なサイズに分割
- **引用情報**: 回答の根拠となるドキュメントを明示

### 引用元
検索結果に基づく引用情報が以下に表示されます。`;
}

function getUploadResponse(ctx: MockResponseContext): string {
    const mockFileId = generateMockDocumentId();
    return `## ファイルアップロード完了

✅ ファイルのアップロードが正常に完了しました。

🧪 **[モックモード]** これはテンプレート回答です。

### アップロード情報
| 項目 | 値 |
|------|-----|
| ストア名 | \`${ctx.storeName || 'fileSearchStores/xxx'}\` |
| 表示名 | ${ctx.displayName || 'アップロードファイル'} |
| ドキュメントID | \`${mockFileId}\` |
| ステータス | ✅ インデックス作成完了 |

実際のAPIに接続すると、ファイルは自動的にチャンキング・埋め込み生成され、検索可能になります。`;
}

function getCreateStoreResponse(ctx: MockResponseContext): string {
    const mockStoreId = generateMockStoreId();
    return `## ファイル検索ストア作成完了

✅ 新しいファイル検索ストアが正常に作成されました。

🧪 **[モックモード]** これはテンプレート回答です。

### ストア情報
| 項目 | 値 |
|------|-----|
| ストア名 | \`${mockStoreId}\` |
| 表示名 | ${ctx.displayName || '新規ストア'} |
| 作成日時 | ${new Date().toLocaleString('ja-JP')} |

このストア名を使用してファイルをアップロードし、検索を実行できます。`;
}

function getDeleteFileResponse(ctx: MockResponseContext): string {
    return `## ファイル削除完了

✅ ファイルが正常に削除されました。

🧪 **[モックモード]** これはテンプレート回答です。

### 削除情報
| 項目 | 値 |
|------|-----|
| ストア名 | \`${ctx.storeName || 'fileSearchStores/xxx'}\` |
| ドキュメントID | \`${ctx.documentId || 'documents/xxx'}\` |
| ステータス | ✅ 削除完了 |

⚠️ この操作は取り消せません。`;
}

function getDeleteStoreResponse(ctx: MockResponseContext): string {
    return `## ファイル検索ストア削除完了

✅ ファイル検索ストアが正常に削除されました。

🧪 **[モックモード]** これはテンプレート回答です。

### 削除情報
| 項目 | 値 |
|------|-----|
| ストア名 | \`${ctx.storeName || 'fileSearchStores/xxx'}\` |
| ステータス | ✅ 削除完了 |

⚠️ ストア内のすべてのファイルとインデックスが削除されました。この操作は取り消せません。`;
}

function getListStoresResponse(): string {
    return `## ファイル検索ストアの一覧

🧪 **[モックモード]** これはテンプレート回答です。

以下は現在利用可能なファイル検索ストアの一覧です：

| # | ストア名 | 表示名 | 作成日時 |
|---|----------|--------|----------|
| 1 | \`fileSearchStores/abc123def456\` | プロダクトドキュメント | 2026-01-15 10:30 |
| 2 | \`fileSearchStores/ghi789jkl012\` | 社内規程・就業規則 | 2026-01-10 14:00 |
| 3 | \`fileSearchStores/mno345pqr678\` | 議事録アーカイブ | 2026-01-05 09:15 |

**合計: 3件のストア**

実際のAPIに接続すると、あなたのプロジェクトに存在する実際のストア一覧が表示されます。`;
}

function getListFilesResponse(ctx: MockResponseContext): string {
    return `## ストア内のファイル一覧

🧪 **[モックモード]** これはテンプレート回答です。

ストア \`${ctx.storeName || 'fileSearchStores/xxx'}\` 内のファイル一覧：

| # | ドキュメントID | 表示名 | サイズ | 状態 | 更新日時 |
|---|---------------|--------|--------|------|----------|
| 1 | \`documents/doc001\` | 製品マニュアル_v2.0.pdf | 2.4 MB | ✅ ACTIVE | 2026-01-18 15:30 |
| 2 | \`documents/doc002\` | API仕様書.md | 156 KB | ✅ ACTIVE | 2026-01-17 11:20 |
| 3 | \`documents/doc003\` | 会議議事録_2026Q1.docx | 89 KB | ✅ ACTIVE | 2026-01-16 09:45 |
| 4 | \`documents/doc004\` | トラブルシューティングガイド.pdf | 1.1 MB | ✅ ACTIVE | 2026-01-15 14:00 |
| 5 | \`documents/doc005\` | リリースノート.txt | 34 KB | ✅ ACTIVE | 2026-01-14 16:30 |

**合計: 5件のファイル**

実際のAPIに接続すると、指定したストア内の実際のファイル一覧が表示されます。`;
}

// ============================================
// Main Response Generator
// ============================================

export function getMockResponseForOperation(
    operation: OperationMode,
    ctx: MockResponseContext
): string {
    switch (operation) {
        case 'ファイル内を検索する':
            return getSearchResponse(ctx);
        case 'ファイルをアップロードする？':
            return getUploadResponse(ctx);
        case 'ファイル検索ストアを作成する？':
            return getCreateStoreResponse(ctx);
        case 'ファイルを削除する？':
            return getDeleteFileResponse(ctx);
        case 'ファイル検索ストアを削除する？':
            return getDeleteStoreResponse(ctx);
        case 'ファイル検索ストアの一覧を表示する？':
            return getListStoresResponse();
        case 'ストア内のファイルの一覧を表示する？':
            return getListFilesResponse(ctx);
        default:
            return '🧪 [モックモード] 不明な操作モードです。';
    }
}

// ============================================
// Mock Nodes Generator
// ============================================

export function getMockNodesForOperation(operation: OperationMode): MockNode[] {
    return MOCK_NODES[operation] || [];
}

// ============================================
// Mock Citations Generator (for search mode)
// ============================================

export function getMockCitationsIfApplicable(operation: OperationMode): Citation[] | undefined {
    if (operation !== 'ファイル内を検索する') {
        return undefined;
    }

    return [
        {
            position: 1,
            dataset_id: 'mock-dataset-001',
            dataset_name: 'プロダクトドキュメント',
            document_id: 'mock-doc-001',
            document_name: 'サンプルドキュメント1.pdf',
            segment_id: 'mock-segment-001',
            score: 0.95,
            content: '[モックデータ] これはモックモードで生成されたサンプル引用コンテンツです。実際のAPIに接続すると、検索クエリに関連する実際のドキュメント内容が表示されます。',
        },
        {
            position: 2,
            dataset_id: 'mock-dataset-001',
            dataset_name: 'プロダクトドキュメント',
            document_id: 'mock-doc-002',
            document_name: 'サンプルドキュメント2.docx',
            segment_id: 'mock-segment-002',
            score: 0.87,
            content: '[モックデータ] 2番目のサンプル引用です。関連度スコアに基づいてランキングされた複数の引用が表示されます。',
        },
    ];
}

// ============================================
// Text Chunking for Streaming Effect
// ============================================

export function splitIntoChunks(text: string, chunkSize: number = 10): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
}

// ============================================
// Mock Workflow ID
// ============================================

export function generateMockWorkflowRunId(): string {
    return `mock-workflow-${generateMockId()}`;
}

// ============================================
// Mock File Upload Response
// ============================================

export interface MockUploadedFile {
    id: string;
    name: string;
    size: number;
    extension: string;
    mime_type: string;
    created_at: number;
}

export function generateMockUploadResponse(file: File): MockUploadedFile {
    const extension = file.name.split('.').pop() || 'unknown';
    return {
        id: generateMockId(),
        name: file.name,
        size: file.size,
        extension,
        mime_type: file.type || 'application/octet-stream',
        created_at: Math.floor(Date.now() / 1000),
    };
}
