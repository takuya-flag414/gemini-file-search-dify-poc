/**
 * File Conversion Utilities
 * ファイル形式の変換を行うユーティリティ関数
 */

/**
 * MDファイルをTXTファイルに変換する
 * 実体はBlobとして再作成し、MIMEタイプを text/plain に変更する
 * 表示名は別途管理するため、ここで生成されるファイル名はアップロード用の一時的なものとなる可能性があるが、
 * 明示的に .txt を付与する
 */
export async function convertMdToTxt(file: File): Promise<File> {
    // Check extension
    if (!file.name.toLowerCase().endsWith('.md')) {
        return file;
    }

    console.log(`[FileConversion] Converting MD to TXT: ${file.name}`);

    // Create new name (e.g., "myfile.md" -> "myfile.md.txt")
    // Note: Dify might handle extensions differently, but appending .txt ensures it treats it as text
    const newName = `${file.name}.txt`;

    // Create new File object with text/plain type
    // We treat the original content as is, just changing the container
    const newFile = new File([file], newName, {
        type: 'text/plain',
        lastModified: file.lastModified,
    });

    console.log(`[FileConversion] Conversion complete: ${newFile.name} (${newFile.type})`);
    
    return newFile;
}
