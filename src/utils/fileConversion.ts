/**
 * File Conversion Utilities
 * ファイル形式の変換を行うユーティリティ関数
 *
 * NOTE: MDファイルのTXT変換処理は廃止されました。
 * MDファイルはそのままアップロードされます。
 */

/**
 * @deprecated 変換処理は廃止されました。元のファイルをそのまま返します。
 */
export async function convertMdToTxt(file: File): Promise<File> {
    return file;
}
