import { execSync } from 'child_process';

/**
 * sfコマンドのプレビュー結果を取得します。
 * @param {string} targetOrg - 対象の組織
 * @returns {object} - デプロイプレビューのJSON結果
 */
export function getDeployPreview(targetOrg) {
  const targetOrgFlg = targetOrg ? `-o ${targetOrg}` : '';
  const previewCommand = `sf project deploy preview --json ${targetOrgFlg}`;
  try {
    const previewOutput = execSync(previewCommand, { encoding: 'utf8' });
    return JSON.parse(previewOutput);
  } catch (error) {
    if (error.stdout) {
      try {
        return JSON.parse(error.stdout);
      } catch (parseError) {
        // stdoutがJSONでない場合は、元のエラーをスロー
        console.error("プレビュー結果の解析に失敗しました:", error.stdout);
        throw error;
      }
    }
    // エラーを再スローして、呼び出し元で処理できるようにする
    throw error;
  }
}

/**
 * sf project deploy start コマンドを構築します。
 * @param {string[]} selectedItems - デプロイ対象のメタデータ
 * @param {string} targetOrg - 対象の組織
 * @param {boolean} ignoreConflicts - コンフリクトを無視するかどうか
 * @returns {string} - デプロイコマンド
 */
export function buildDeployCommand(selectedItems, targetOrg, ignoreConflicts) {
  const metadataString = selectedItems.join(' ');
  const flgMetadata = ` --metadata ${metadataString}`;
  const flgTargetOrg = targetOrg ? ` -o ${targetOrg}` : '';
  const flgForce = ignoreConflicts ? ' --ignore-conflicts' : '';
  const deployCommand = 'sf project deploy start'.concat(flgMetadata, flgTargetOrg, flgForce);
  return deployCommand;
}

/**
 * デプロイコマンドを実行します。
 * @param {string} deployCommand - 実行するデプロイコマンド
 */
export function runDeployCommand(deployCommand) {
  console.log(`\n実行するコマンド: ${deployCommand}`);
  execSync(deployCommand, { stdio: 'inherit' });
}
