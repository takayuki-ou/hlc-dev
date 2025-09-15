#!/usr/bin/env node

import {
  getDeployPreview,
  buildDeployCommand,
  runDeployCommand,
} from "./salesforce.js";
import {
  askForTargetOrg,
  confirmContinueWithConflicts,
  selectMetadata,
  confirmSaveToFile,
  confirmDeploy,
} from "./ui.js";
import { saveCommandToFile } from "./file-system.js";

export async function main() {
  const targetOrg = await askForTargetOrg();

  console.log("\nローカルで変更されたコンポーネントを確認中...");
  const previewResult = getDeployPreview(targetOrg);

  const conflicts = previewResult.result?.conflicts;
  let forceFlag = false;

  if (conflicts && conflicts.length > 0) {
    const continueWithForce = await confirmContinueWithConflicts(conflicts);
    if (continueWithForce) {
      forceFlag = true;
      console.log(
        "\n⚠️  選択されたファイルは--ignore-conflictsフラグを使用してデプロイします。"
      );
    } else {
      console.log(
        "\nコンフリクトを解決してから、再度デプロイを試みてください。"
      );
      process.exit(1);
    }
  }

  const componentsToDeploy =
    previewResult.result?.files || previewResult.result?.toDeploy;

  if (!componentsToDeploy || componentsToDeploy.length === 0) {
    console.log("デプロイ対象のファイルがありません。");
    return;
  }

  const selectedItems = await selectMetadata(componentsToDeploy, conflicts);

  if (!selectedItems || selectedItems.length === 0) {
    console.log("何も選択されませんでした。処理を終了します。");
    return;
  }

  const deployCommand = buildDeployCommand(
    selectedItems,
    targetOrg,
    forceFlag
  );

  const save = await confirmSaveToFile();
  if (save) {
    await saveCommandToFile(deployCommand);
  }

  const doDeploy = await confirmDeploy();
  if (doDeploy) {
    console.log("\nデプロイを実行中...");
    runDeployCommand(deployCommand);
    console.log("\nデプロイが完了しました。");
  } else {
    console.log("デプロイをキャンセルしました。");
  }
}
