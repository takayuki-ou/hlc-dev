#!/usr/bin/env node

import inquirer from "inquirer";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

async function saveCommandToFile(command) {
  const historyDir = path.join("scripts", "tools", "command_history");
  try {
    if (!fs.existsSync(historyDir)) {
      fs.mkdirSync(historyDir, { recursive: true });
    }

    const now = new Date();
    const timestamp =
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, "0") +
      now.getDate().toString().padStart(2, "0") +
      now.getHours().toString().padStart(2, "0") +
      now.getMinutes().toString().padStart(2, "0") +
      now.getSeconds().toString().padStart(2, "0");

    const fileName = `${timestamp}.sh`;
    const filePath = path.join(historyDir, fileName);
    const fileContent = `#!/bin/bash\n\n${command}`;

    fs.writeFileSync(filePath, fileContent);
    console.log(`\nコマンドが ${filePath} に保存されました。`);
  } catch (error) {
    console.error("\nコマンドのファイルへの保存に失敗しました:", error.message);
  }
}

/**
 * sfコマンドのプレビュー結果を取得します。
 * コマンドが失敗した場合でも、出力をJSONとして解析しようと試みます。
 * @param {string} targetOrg - 対象の組織
 * @returns {object} - デプロイプレビューのJSON結果
 * @throws {Error} - コマンド実行またはJSON解析に失敗した場合
 */
function getDeployPreview(targetOrg) {
  const targetOrgFlg = targetOrg ? `-o ${targetOrg}` : "";
  const previewCommand = `sf project deploy preview --json ${targetOrgFlg}`;
  try {
    const previewOutput = execSync(previewCommand, { encoding: "utf8" });
    return JSON.parse(previewOutput);
  } catch (error) {
    // コマンドが失敗してもJSON出力がある場合があるので、stderrからも取得を試みる
    if (error.stdout) {
      return JSON.parse(error.stdout);
    }
  }
}

export async function main() {
  // 組織の指定を最初に受け取る
  const { targetOrg } = await inquirer.prompt([
    {
      type: "input",
      name: "targetOrg",
      message:
        "デプロイ先の組織を指定してください (空白の場合はデフォルト組織):"
    }
  ]);

  console.log("\nローカルで変更されたコンポーネントを確認中...");
  const previewResult = getDeployPreview(targetOrg);

  // コンフリクトの処理
  const conflicts = previewResult.result?.conflicts;
  let forceFlag = false;

  if (conflicts && conflicts.length > 0) {
    console.warn("以下のコンポーネントでコンフリクトが発生しています:");
    conflicts.forEach((conflict) => {
      console.warn(
        `- ${conflict.type}:${conflict.fullName}\n  ${conflict.path}`
      );
    });

    // ユーザーに続行するかどうか確認
    const { continueWithForce } = await inquirer.prompt([
      {
        type: "confirm",
        name: "continueWithForce",
        message: "デプロイ対象の選択に進みますか？",
        default: false
      }
    ]);

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

  // チェックボックス用の選択肢を作成
  const choices = componentsToDeploy.map((item) => ({
    name: `${item.type}:${item.fullName}`,
    value: `${item.type}:${item.fullName}`,
    checked: false
  }));
  if (conflicts?.length > 0) {
    conflicts.forEach((conflict) => {
      choices.push({
        name: `${conflict.type}:${conflict.fullName} (コンフリクト)`,
        value: `${conflict.type}:${conflict.fullName}`,
        checked: false
      });
    });
  }
  // 対話的に選択
  const { selectedItems } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "selectedItems",
      message: "デプロイするメタデータを選択してください:",
      choices: choices,
      loop: false,
      validate: (answer) => {
        if (answer.length < 1) {
          return "少なくとも1つのアイテムを選択してください";
        }
        return true;
      }
    }
  ]);

  if (!selectedItems || selectedItems.length === 0) {
    console.log("何も選択されませんでした。処理を終了します。");
    return;
  }

  // 選択されたアイテムをスペース区切りで結合
  const metadataString = selectedItems.join(" ");

  // 最終的なデプロイコマンドを構築
  const flgMetadata = ` --metadata ${metadataString}`;
  const flgTargetOrg = targetOrg ? ` -o ${targetOrg}` : "";
  const flgForce = forceFlag ? " --ignore-conflicts" : "";
  const deployCommand = "sf project deploy start".concat(
    flgMetadata,
    flgTargetOrg,
    flgForce
  );

  // ファイルに保存するか確認
  const { saveToFile } = await inquirer.prompt([
    {
      type: "confirm",
      name: "saveToFile",
      message: "このコマンドをファイルに保存しますか?",
      default: false
    }
  ]);

  if (saveToFile) {
    await saveCommandToFile(deployCommand);
  }

  // 実行確認
  const { confirmDeploy } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmDeploy",
      message: "このコマンドを実行しますか?",
      default: true
    }
  ]);

  if (confirmDeploy) {
    console.log("\nデプロイを実行中...");
    // 最終的なデプロイコマンドは、成功・失敗がストリームでわかるようにstdioをinheritする
    execSync(deployCommand, { stdio: "inherit" });
    console.log("\nデプロイが完了しました。");
  } else {
    console.log("デプロイをキャンセルしました。");
  }
}
